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
				const wsClients = [];
				wsClients.push(new ws(`ws://${device}`));
				wsClients.forEach((wsClient, i) => {
					wsClient.on("open", () => {
						console.log("Connected to: ", device);
						connectedClients.add(device);
						console.table(connectedClients);
					});

					wsClient.on("message", (data) => {
						clipboard.copy(data, (err) => {
							if (err) {
								console.log("Error: ", err);
							}
							console.log("NEW CLIP: You can Press ctrl+v now.");
						});
					});

					wsClient.on("close", (code, reason) => {
						console.log(`closing the connection with ${device} due to  ${code}: ${reason}`);
						connectedClients.delete(device);
						console.table(connectedClients);
						discoveredDevices.delete(device);
					});
				});

				if (wsClients && wsClients.length > 0) {
					setInterval(() => {
						clipboard.paste((err, data) => {
							if (err) {
								console.log("Error in copy paste: ", Buffer.from(err).toString("utf-8"));
							}
							if (!err && data) {
								let currentClip = data;
								if (lastClipboard !== currentClip) {
									lastClipboard = currentClip;
									// if (wsClient.readyState === wsClient.CLOSED) {
									// 	clearInterval(intervalId);
									// }
									wsClients.forEach((wsClient, i) => {
										if (wsClient.readyState === wsClient.OPEN) {
											wsClient.send(Buffer.from(currentClip), (err) => {
												if (err) {
													console.log("Error in sending CLIP: ", err);
												}
												// console.log("CLIP sent: ", currentClip);
											});
										}
									});
								}
							}
						});
					}, 1000);
				}
			}
		});
	});
	// Start websocket Server
	websocketServer(() => {});
});

function websocketServer(callback) {
	const server = new ws.WebSocket.Server({ port: PORT });
	server.on("connection", (socket, req) => {
		socket.on("message", (data) => {
			clipboard.copy(data, (err) => {
				if (err) {
					console.log("Error: ", err);
				}
				console.log("NEW CLIP: You can Press ctrl+v now.");
			});
		});
	});
}
