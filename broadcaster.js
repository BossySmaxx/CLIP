const dgram = require("dgram");
const getBroadcastAddress = require("./utils/broadcasting-address");
const { normalizePort } = require("./utils/normalizePort");
require("dotenv").config();

const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
const PORT = normalizePort(process.env.UDP_PORT, "UDP_PORT"); // this is broadcasting port
const TCP_PORT = normalizePort(process.env.TCP_PORT, "TCP_PORT");
const BROADCAST_ADDR = getBroadcastAddress();

if (BROADCAST_ADDR === null) {
	console.log("You are not connected to any network!");
	process.exit(-1);
}

function startBroadcasting(callback) {
	console.log(`Broadcasting on ${BROADCAST_ADDR}:${PORT}`);

	callback(socket);

	socket.bind(PORT, "0.0.0.0", () => {
		socket.setBroadcast(true);
		setInterval(() => {
			const msg = Buffer.from(JSON.stringify({ type: "DISCOVER_PEER", PORT: TCP_PORT }));
			socket.send(msg, PORT, BROADCAST_ADDR, (err) => {
				if (err) {
					console.log("error in broadcasting: ");
				}
			});
		}, 5000); // broadcasts itself every 5 second to be discovered by other peers
	});
}

module.exports = startBroadcasting;
