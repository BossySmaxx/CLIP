const startBroadcasting = require("./broadcaster");
const startListening = require("./listener");
let discoveredDevices = new Set();

startBroadcasting((socket) => {
	startListening(socket, (msg, rinfo) => {
		discoveredDevices.add(rinfo.address);
		discoveredDevices.forEach((device) => {
			console.log("discovered device: ", device);
		});
	});
});
