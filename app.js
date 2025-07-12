const ws = require("ws");
const ip = require("ip");
const clipboard = require("copy-paste");
const startBroadcasting = require("./broadcaster");
const startListening = require("./listener");
require("dotenv").config();

const PORT = process.env.TCP_PORT; // this is connection port transferring data and establishing connection with peers

let discoveredDevices = new Set();
const connectedClients = new Set(); // Tracks devices already connected via WebSocket

const SELF_IP = ip.address("public", "ipv4");
console.log("SELF_IP: ", SELF_IP);

let lastClipboard = "";

startBroadcasting((socket) => {
	startListening(socket, (discoveredDevice, rinfo) => {
		discoveredDevices.add(discoveredDevice);
		discoveredDevices.forEach(async (device) => {
			if (device.split(":")[0] !== SELF_IP) {
				// do nothing if device is already connected
				if (connectedClients.has(device)) return;

				// Initiate connection to newly discovered {device}'s websocket server
				const wsClient = new ws(`ws://${device}`);
				wsClient.on("open", () => {
					console.log("Connected to: ", device);
					connectedClients.add(device);
					console.table(connectedClients);
				});

				wsClient.on("message", (data) => {
					console.log("new message arrived: ");
					clipboard.copy(data, (err) => {
						if (err) {
							console.log("Error: ", err);
						}
						console.log("wsClient::NEW CLIP: You can Press ctrl+v now.");
					});
				});

				wsClient.on("close", (code, reason) => {
					console.log(`closing the connection with ${device} due to  ${code}: ${reason}`);
					connectedClients.delete(device);
					console.table(connectedClients);
					discoveredDevices.delete(device);
				});

				let intervalId = setInterval(() => {
					clipboard.paste((err, data) => {
						if (err) {
							console.log("Error in copy paste: ", err);
						}
						if (!err && data) {
							let currentClip = data;
							if (lastClipboard !== currentClip) {
								lastClipboard = currentClip;
								if (wsClient.readyState === wsClient.OPEN) {
									wsClient.send(Buffer.from(currentClip), (err) => {
										if (err) {
											console.log("Error in sending CLIP: ", err);
										}
									});
								}
							}
						}
					});
					if (wsClient.readyState === wsClient.CLOSED) {
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
	const server = new ws.WebSocket.Server({ port: PORT });
	server.on("connection", (socket, req) => {
		socket.on("message", (data, isBinary) => {
			console.log("new data");
			if (isBinary) {
				data = Buffer.from(data);
				data = data.toString("utf-8");
			}
			clipboard.copy(data, (err) => {
				if (err) {
					console.log("Error: ", err);
				}
				console.log("wss::NEW CLIP: You can Press ctrl+v now.");
			});
		});
	});
}
