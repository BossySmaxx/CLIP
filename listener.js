const PORT = 41234;

function startListening(socket, callback) {
	socket.on("listening", () => {
		const address = socket.address();
		console.log(
			`UDP socket listening on ${address.address}:${address.port}`
		);
	});

	socket.on("message", (msg, rinfo) => {
		if (msg.toString() === "DISCOVER_PEER") {
			callback(msg, rinfo);
		}
	});

	// socket.bind(PORT, "0.0.0.0");
}

module.exports = startListening;
