const { isValidPort } = require("./utils/normalizePort");
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
			// this callback binds the info of discoevered peer so a socket connection can be established for data transmission line
			callback(`${rinfo.address}:${msg.PORT}`, rinfo);
		}
	});
}

module.exports = startListening;
