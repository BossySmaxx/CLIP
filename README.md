<p align="center">
  <img src="./assets/CLIP.ico" alt="CLIP Logo" width="200" />
</p>

<h1 align="center">CLIP</h1>
<h3 align="center">Cross-device LAN Interlinked Paste</h3>

<p align="center">
  Seamlessly sync your clipboard across multiple devices on the same network.
</p>

---

## ✨ Features

-   🔁 Real-time clipboard syncing over LAN
-   ⚡ Lightning-fast peer-to-peer communication
-   🧠 Smart updates (no duplicates)
-   🔐 Local-only — no data leaves your network
-   💻 Cross-device: works across all your Windows devices (Support for other OS/System will be added soon)

---

## 🚀 How It Works

CLIP uses local network broadcasting to discover nearby devices and establish WebSocket connections between them. Once connected, clipboard data is shared instantly but <b>not securely (data encryption will added soon.)</b> — without using the internet.

---

## 📦 Installation

### 1. Install Node.js

CLIP requires Node.js (v16+ recommended).

🔗 Download from: [https://nodejs.org/](https://nodejs.org/)

---

### 2. Download the Source Code

-   Clone the repository:

    ```bash
    git clone https://github.com/your-username/clip.git
    cd clip
    ```

-   Install Dependencies

    ```bash
    npm install

    ```

-   Run the App

    ```bash
    npm app.js

    ```

---

### 3. Auto-Start on Windows (Optional)

To make CLIP launch automatically on system startup:

1. Press `Win + R`, type `shell:startup`, and hit **Enter**.
2. In the opened **Startup** folder, right-click and select **New > Shortcut**.
3. Browse to your `app.js` file (or create a `.bat` file to run it).
4. Confirm and close the folder.

Your app will now run automatically when Windows starts.

## 🖥️ Usage

1. Start CLIP on all devices.
2. Devices will auto-discover each other.
3. Copy anything on one device...
4. ...and paste it on another. Like magic. ✨

---

## 🛠 Tech Stack

-   Node.js
-   WebSockets
-   UDP Broadcasting
