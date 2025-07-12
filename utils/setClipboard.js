const { exec } = require("child_process");

/**
 * Copies text to clipboard *exactly* (preserves \n, \t, spaces, etc.).
 * @param {string} text - The text to copy.
 */
function setClipboard(text) {
	return new Promise((resolve, reject) => {
		const child = exec('powershell -command "$input | Set-Clipboard"', (error) => (error ? reject(error) : resolve()));
		child.stdin.write(text);
		child.stdin.end();
	});
}

// Example: Copy text with newlines, tabs, and spaces
// (async () => {
// 	const formattedText = `
//         This text has:
//         - New lines (\n)
//         - Tabs (\t→)
//         - Multiple    spaces
//     `;

// 	try {
// 		await setClipboard(formattedText);
// 		console.log("Copied to clipboard with exact formatting!");
// 	} catch (err) {
// 		console.error("Failed to copy:", err);
// 	}
// })();
module.exports = setClipboard;
