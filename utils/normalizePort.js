function normalizePort(port, name) {
	const normalizedPort = Number(port);
	if (!Number.isInteger(normalizedPort) || normalizedPort < 1 || normalizedPort > 65535) {
		throw new Error(`${name} must be a valid port between 1 and 65535.`);
	}

	return normalizedPort;
}

function isValidPort(port) {
	const normalizedPort = Number(port);
	return Number.isInteger(normalizedPort) && normalizedPort > 0 && normalizedPort <= 65535;
}

module.exports = { normalizePort, isValidPort };
