const startBroadcasting = require("./broadcaster");
const startListening = require("./listener");
const ws = require("ws");

let discoveredDevices = new Set();
const connectedClients = new Set(); // Tracks devices already connected via WebSocket

startBroadcasting((socket) => {
	startListening(socket, (msg, rinfo) => {
		discoveredDevices.add(rinfo.address);
		discoveredDevices.forEach((device) => {
			console.log("discovered device: ", device);
			if (connectedClients.has(device)) return;

			// Initiate connection to discovered {device}'s websocket server
			const wsClient = new ws(`ws://${device}:8080`);
			wsClient.on("open", () => {
				console.log("Connected to: ", device);
				connectedClients.add(device);
				console.table(connectedClients);
			});

			wsClient.on("message", (data) => {
				console.log("data from server: ", data.toString("utf-8"));
				wsClient.send(
					Buffer.from("I am client, ready to recieve clips"),
					(err) => {
						if (err) {
							console.log("Error: ", err);
						}
					}
				);
			});

			wsClient.on("close", (code, reason) => {
				console.log(
					`closing the connection with ${device} due to  ${code}: ${reason}`
				);
			});
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
		});
	});
}
