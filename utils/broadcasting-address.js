const os = require("os");

function getBroadcastAddress() {
	const interfaces = os.networkInterfaces();

	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name]) {
			if (iface.family !== "IPv4" || iface.internal) continue;

			const ipParts = iface.address.split(".").map(Number);
			const maskParts = iface.netmask.split(".").map(Number);
			const broadcastParts = ipParts.map(
				(ip, i) => (ip & maskParts[i]) | (~maskParts[i] & 255)
			);

			return broadcastParts.join(".");
		}
	}
	return null;
}

module.exports = getBroadcastAddress;
