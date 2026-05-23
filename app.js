const ws = require("ws");
const ip = require("ip");
const crypto = require("crypto");
const path = require("path");
const startBroadcasting = require("./broadcaster");
const startListening = require("./listener");
const safeParser = require("./utils/safeParser");
const getClipboard = require("./utils/getClipboard");
const setClipboard = require("./utils/setClipboard");
require("dotenv").config();
const fs = require("fs");
const { normalizePort } = require("./utils/normalizePort");

const PORT = normalizePort(process.env.TCP_PORT, "TCP_PORT"); // this is connection port transferring data and establishing connection with peers
const CLIPS_STORAGE_PATH = path.join(__dirname, "clipsStorage.json");
const MAX_STORED_CLIPS = 5;

let discoveredDevices = new Set(); // discovered devices
const connectedClients = new Set(); // Tracks devices already connected via WebSocket
const seenMessages = new Set(); // basically the clips

const SELF_IP = ip.address("public", "ipv4");
const SELF_DEVICE = `${SELF_IP}:${PORT}`;
console.log("SELF_IP: ", SELF_IP);

let lastClipboard = "";

startBroadcasting((socket) => {
	startListening(socket, (discoveredDevice, rinfo) => {
		discoveredDevices.add(discoveredDevice);
		discoveredDevices.forEach((device) => {
			if (device !== SELF_DEVICE) {
				// do nothing if device is already connected
				if (connectedClients.has(device)) return;

				// Initiate connection to newly discovered {device}'s websocket server
				const wsClient = new ws(`ws://${device}`);
				wsClient.on("open", () => {
					console.log("Connected to: ", device);
					connectedClients.add(device);
					console.table(connectedClients);
				});

				wsClient.on("message", (data, isBinary) => {
					console.log("new message arrived: ");
					handleIncomingClip(data, isBinary).catch((err) => {
						console.log("Error handling incoming clip:", err.message);
					});
				});

				wsClient.on("close", (code, reason) => {
					console.log(`closing the connection with ${device} due to ${code}: ${reason}`);
					connectedClients.delete(device);
					console.table(connectedClients);
					discoveredDevices.delete(device);
				});

				wsClient.on("error", (err) => {
					console.log(`WebSocket error with ${device}:`, err.message);
				});

				// so every second get the clipboard and check whether there's something new if so send the new clip to all the peers otherwise do nothing
				let intervalId = setInterval(() => {
					if (wsClient.readyState === wsClient.OPEN) {
						getClipboard()
							.then((text) => {
								if (!text || text === lastClipboard) return; //

								lastClipboard = text;
								const msg = {
									msgId: crypto.randomUUID(),
									ttl: 5,
									data: text,
								};

								rememberMessage(msg.msgId);
								wsClient.send(Buffer.from(JSON.stringify(msg)), (err) => {
									if (err) {
										console.log("Error in sending new CLIP: ", err);
									}
								});
							})
							.catch((err) => {
								console.log("error occurred during getting clipboard");
							});
					}

					// if ws connection is closed  then clear interval
					if (wsClient.readyState === wsClient.CLOSED) {
						console.log("CLOSING WS Connection");
						clearInterval(intervalId);
					}
				}, 1000);
			}
		});
	});
});

// Start websocket Server
websocketServer(() => {});

function websocketServer(callback) {
	let clips = [];
	const server = new ws.WebSocket.Server({ port: PORT });
	server.on("connection", (socket, req) => {
		socket.on("message", (data, isBinary) => {
			handleIncomingClip(data, isBinary, clips)
				.then((updatedClips) => {
					clips = updatedClips;
				})
				.catch((err) => {
					console.log("Error handling incoming clip:", err.message);
				});
		});

		socket.on("error", (err) => {
			console.log("WebSocket server socket error:", err.message);
		});
	});

	server.on("listening", () => {
		console.log(`WebSocket server listening on port ${PORT}`);
		callback();
	});

	server.on("error", (err) => {
		console.log("WebSocket server error:", err.message);
	});
}

async function handleIncomingClip(data, isBinary = true, clips = null) {
	if (isBinary || Buffer.isBuffer(data)) {
		data = Buffer.from(data).toString("utf-8");
	}

	const msg = safeParser(data);
	if (!isValidClipMessage(msg) || seenMessages.has(msg.msgId)) {
		return clips ?? [];
	}

	rememberMessage(msg.msgId);
	console.log("New data:: ", msg);

	if (msg.data !== lastClipboard) {
		try {
			await setClipboard(msg.data);
			lastClipboard = msg.data;
			console.log("NEW CLIP: You can press Ctrl+V now.");
		} catch (err) {
			console.log("Error setting clipboard:", err.message);
		}
	}

	if (!clips) return [];

	const updatedClips = [...clips, msg].slice(-MAX_STORED_CLIPS);
	fs.writeFile(CLIPS_STORAGE_PATH, JSON.stringify(updatedClips, null, 2), (err) => {
		if (err) {
			console.log("Error writing clips storage: ", err);
		}
	});

	return updatedClips;
}

function isValidClipMessage(msg) {
	return msg && typeof msg.msgId === "string" && typeof msg.data === "string" && (msg.ttl === undefined || Number.isInteger(msg.ttl));
}

function rememberMessage(msgId) {
	seenMessages.add(msgId);
	if (seenMessages.size > 100) {
		const oldestMsgId = seenMessages.values().next().value;
		seenMessages.delete(oldestMsgId);
	}
}
