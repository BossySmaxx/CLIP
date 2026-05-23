const safeParser = require("./utils/safeParser");

function startListening(socket, callback) {
	socket.on("listening", () => {
		const address = socket.address();
		console.log(`UDP socket listening on ${address.address}:${address.port}`);
	});

	socket.on("message", (msg, rinfo) => {
		// console.log("---->: ", msg.toString());
		msg = safeParser(msg.toString());
		if (msg && msg.type === "DISCOVER_PEER" && isValidPort(msg.PORT)) {
			callback(`${rinfo.address}:${msg.PORT}`, rinfo);
		}
	});
}

module.exports = startListening;

function isValidPort(port) {
	const normalizedPort = Number(port);
	return Number.isInteger(normalizedPort) && normalizedPort > 0 && normalizedPort <= 65535;
}
