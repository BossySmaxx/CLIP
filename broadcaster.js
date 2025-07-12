const dgram = require("dgram");
const getBroadcastAddress = require("./utils/broadcasting-address");
require("dotenv").config();

// const startListening = require("./listener");

const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
const PORT = process.env.UDP_PORT; // this is broadcasting port different from connection PORT
const BROADCAST_ADDR = getBroadcastAddress();

if (BROADCAST_ADDR === null) {
	console.log("You are not connected to any network!");
	process.exit(-1);
}

function startBroadcasting(callback) {
	console.log(`Broadcasting on ${BROADCAST_ADDR}:${PORT}`);
	socket.bind(PORT, "0.0.0.0", () => {
		socket.setBroadcast(true);
		setInterval(() => {
			const msg = Buffer.from(JSON.stringify({ type: "DISCOVER_PEER", PORT: process.env.TCP_PORT }));
			socket.send(msg, PORT, BROADCAST_ADDR, (err) => {
				if (err) {
					console.log("error in broadcasting: ");
				}
			});
		}, 5000);
		callback(socket);
	});
}

module.exports = startBroadcasting;
