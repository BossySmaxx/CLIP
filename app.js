const ws = require("ws");
const ip = require("ip");
const clipboard = require("copy-paste");
const startBroadcasting = require("./broadcaster");
const startListening = require("./listener");

let discoveredDevices = new Set();
const connectedClients = new Set(); // Tracks devices already connected via WebSocket

const SELF_IP = ip.address("public", "ipv4");
console.log("SELF_IP: ", SELF_IP);

let lastClipboard = "";

startBroadcasting((socket) => {
	startListening(socket, (msg, rinfo) => {
		discoveredDevices.add(rinfo.address);
		// console.clear();
		// console.log("Discovered Devices: ");
		// console.table(discoveredDevices);
		// console.log("----------------------------------\nConnected Devices: ");
		// console.table(connectedClients);

		discoveredDevices.forEach(async (device) => {
			if (device !== SELF_IP) {
				if (connectedClients.has(device)) return;

				// Initiate connection to discovered {device}'s websocket server
				const wsClient = new ws(`ws://${device}:8080`);
				wsClient.on("open", () => {
					console.log("Connected to: ", device);
					connectedClients.add(device);
					console.table(connectedClients);
				});

				setInterval(() => {
					clipboard.paste((err, data) => {
						if (err) {
							console.log("Error in copy paste: ", err);
						}
						let currentClip = data;
						// console.log(
						// 	"Clipped data: ",
						// 	currentClip,
						// 	lastClipboard
						// );
						if (lastClipboard !== currentClip) {
							lastClipboard = currentClip;
							wsClient.send(Buffer.from(currentClip), (err) => {
								if (err) {
									console.log("Error in sending CLIP: ", err);
								}
								// console.log("CLIP sent: ", currentClip);
							});
						}
					});
				}, 1000);

				// wsClient.on("message", (data) => {
				// 	console.log("New CLIP: ", data.toString("utf-8"));
				// 	// clipboard.copy(data, (err) => {
				// 	// 	if (err) {
				// 	// 		console.log("Error: ", err);
				// 	// 	}
				// 	// 	console.log("Press ctrl+v now:", data);
				// 	// });
				// });

				wsClient.on("close", (code, reason) => {
					console.log(
						`closing the connection with ${device} due to  ${code}: ${reason}`
					);
					connectedClients.delete(device);
					console.table(connectedClients);
					discoveredDevices.delete(device);
				});
			}
		});
	});
	// Start websocket Server
	websocketServer(() => {});
});

function websocketServer(callback) {
	const server = new ws.WebSocket.Server({ port: 8080 });

	server.on("connection", (socket, req) => {
		socket.on("message", (data) => {
			console.log("Message from client: ", data.toString("utf-8"));
			console.log("New CLIP: ", data.toString("utf-8"));
			clipboard.copy(data, (err) => {
				if (err) {
					console.log("Error: ", err);
				}
				console.log("Press ctrl+v now:", data);
			});
		});
	});
}
