const os = require("os");

function getBroadcastAddress() {
	const interfaces = os.networkInterfaces();
	const virtualInterfacePatterns = [
		/^docker/i,
		/^vmware/i,
		/^vboxnet/i,
		/^virbr/i,
		/^tun/i,
		/^tap/i,
		/^br-/i,
		/^veth/i,
		/^virtual/i,
	];
	for (const name of Object.keys(interfaces)) {
		if (virtualInterfacePatterns.some((pattern) => pattern.test(name))) {
			continue;
		}
		for (const iface of interfaces[name]) {
			if (
				iface.family !== "IPv4" ||
				iface.internal ||
				iface.address.startsWith("127.")
			)
				continue;

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
