const safeParser = require("./utils/safeParser");

require("dotenv").config();
const PORT = process.env.UDP_PORT;

function startListening(socket, callback) {
	socket.on("connect", () => {
		const address = socket.address();
		console.log(`UDP socket listening on ${address.address}:${address.port}`);
	});

	socket.on("message", (msg, rinfo) => {
		// console.log("---->: ", msg.toString());
		msg = safeParser(msg.toString());
		if (msg) {
			if (msg.type === "DISCOVER_PEER") {
				callback(`${rinfo.address}:${msg.PORT}`, rinfo);
			}
		}
	});
}

module.exports = startListening;
