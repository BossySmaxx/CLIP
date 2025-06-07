const startBroadcasting = require("./broadcaster");
const startListening = require("./listener");
const WebSocket = require("ws");

const WS_PORT = 8080;

function startPeerServer(onWsConnection) {
	startBroadcasting((socket) => {
		startListening(socket, (msg, rinfo) => {
			console.log("available device: ", msg.toString(), rinfo);
			connectToPeer(rinfo.address);
		});
	});

	const wss = new WebSocket.Server({ port: WS_PORT });
	wss.on("connection", (ws, req) => {
		const ip = req.socket.remoteAddress.replace("::ffff:", "");
		console.log("Incoming WebSocket connection from", ip);
		ws.send(`Hello from ${ip}`);
		ws.on("message", (msg) => console.log(`Message from ${ip}:`, msg));
		onWsConnection && onWsConnection(ws, ip);
	});
}

// WebSocket client
function connectToPeer(ip) {
	const ws = new WebSocket(`ws://${ip}:8080`);
	ws.on("open", () => {
		console.log(`Connected to peer WebSocket at ${ip}`);
		ws.send(`Hello from ${ip}`);
	});
	ws.on("message", (msg) => {
		console.log(`Message from ${ip}:`, msg.toString());
	});
	ws.on("error", (err) => {
		console.log(`Failed to connect to ${ip}:`, err.message);
	});
}

module.exports = startPeerServer;
