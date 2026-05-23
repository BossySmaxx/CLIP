const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const port = 3063;
const clipsStoragePath = path.join(__dirname, "../clipsStorage.json");

// Serve static files (including our HTML)
app.use(express.static(__dirname));

// SSE endpoint
app.get("/events", (req, res) => {
	// Set SSE headers
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins

	// Send a message every second
	const interval = setInterval(() => {
		let data = "[]";
		try {
			data = fs.readFileSync(clipsStoragePath, { encoding: "utf-8" });
		} catch (err) {
			console.log("Could not read clips storage:", err.message);
		}
		res.write(`data: ${data}\n\n`);
	}, 5000);

	// Clean up on client disconnect
	req.on("close", () => {
		clearInterval(interval);
		res.end();
	});
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
