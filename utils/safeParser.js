module.exports = function (s) {
	try {
		return JSON.parse(s);
	} catch (error) {
		return null;
	}
};
