const { exec } = require("child_process");
const setClipboard = require("./setClipboard");

function getClipboard() {
	return new Promise((resolve, reject) => {
		exec('powershell -command "Get-Clipboard"', (error, stdout, stderr) => {
			if (error) {
				reject(error);
				return;
			}
			if (stderr) {
				reject(new Error(stderr));
				return;
			}
			resolve(stdout.trim());
		});
	});
}

// setInterval(() => {
// 	getClipboard()
// 		.then((text) => {
// 			console.log("Clipboard content:", text);
// 			setClipboard(text);
// 		})
// 		.catch((err) => {
// 			console.error("Error reading clipboard:", err);
// 		});
// }, 3000);

module.exports = getClipboard;
