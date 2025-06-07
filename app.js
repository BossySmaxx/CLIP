const startPeerServer = require("./peer");

startPeerServer((socket, ip) => {
	socket.on("message", (msg) => {
		console.log("msg--->: ", msg.toString());
	});
});
