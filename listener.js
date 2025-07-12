const PORT = process.env.UDP_PORT;

function startListening(socket, callback) {
	socket.on("connect", () => {
		const address = socket.address();
		console.log(`UDP socket listening on ${address.address}:${address.port}`);
	});

	socket.on("message", (msg, rinfo) => {
		if (msg.toString() === "DISCOVER_PEER") {
			callback(`${rinfo.address}:${process.env.TCP_PORT}`, rinfo);
		}
	});
}

module.exports = startListening;
