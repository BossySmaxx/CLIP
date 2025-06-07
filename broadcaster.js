const dgram = require("dgram");
const startListening = require("./listener");

const socket = dgram.createSocket("udp4");
const PORT = 41234;
const BROADCAST_ADDR = "255.255.255.255";

function startBroadcasting(callback) {
	console.log(`broadcastign on ${BROADCAST_ADDR}:${PORT}`);
	socket.bind(PORT, () => {
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
