const dgram = require("dgram");
const getBroadcastAddress = require("./utils/broadcasting-address");
require("dotenv").config();

const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
const PORT = normalizePort(process.env.UDP_PORT, "UDP_PORT"); // this is broadcasting port different from connection PORT
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
		}, 5000);
	});
}

module.exports = startBroadcasting;

function normalizePort(port, name) {
	const normalizedPort = Number(port);
	if (!Number.isInteger(normalizedPort) || normalizedPort < 1 || normalizedPort > 65535) {
		throw new Error(`${name} must be a valid port between 1 and 65535.`);
	}

	return normalizedPort;
}
