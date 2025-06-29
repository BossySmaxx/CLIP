const dgram = require("dgram");
const getBroadcastAddress = require("./utils/broadcasting-address");
// const startListening = require("./listener");

const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
const PORT = 41234;
const BROADCAST_ADDR = getBroadcastAddress();

function startBroadcasting(callback) {
	console.log(`broadcastign on ${BROADCAST_ADDR}:${PORT}`);
	socket.bind(PORT, "0.0.0.0", () => {
		socket.setBroadcast(true);
		setInterval(() => {
			const msg = Buffer.from("DISCOVER_PEER");
			socket.send(msg, PORT, BROADCAST_ADDR, (err) => {
				if (err) {
					console.log("error: ");
				}
			});
		}, 5000);
		callback(socket);
	});
}

module.exports = startBroadcasting;
