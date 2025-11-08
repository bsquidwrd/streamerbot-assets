# 🎮 Streamer.bot Custom Overlay

A powerful and flexible overlay system for OBS that connects to Streamer.bot via WebSocket. Display images, videos, GIFs, and HTML content with customizable text overlay.

## 🚀 Quick Setup (Hosted Version - Recommended)

**Use the hosted version for easy setup without downloading files!**

### Adding Overlay to OBS:
1. In OBS Studio, click the "+" button in Sources
2. Select "Browser Source"
3. Name it "Streamer.bot Custom Overlay" (or whatever helps you identify it)
4. In the Browser Source settings:
   - **UNCHECK** "Local File" (we're using a web URL)
   - **URL:** `https://bsquidwrd.github.io/streamerbot-assets/overlay/`
   - **Width:** 1920 (or your canvas width)
   - **Height:** 1080 (or your canvas height)
   - **Custom CSS:** Leave blank
5. Click OK

### 🔧 Connection Configuration

The overlay will try to connect to Streamer.bot at `127.0.0.1:8080` by default. If your setup is different, you can customize the connection using URL parameters:

**Basic URL:** `https://bsquidwrd.github.io/streamerbot-assets/overlay/`

**Custom connection URL examples:**
```
https://bsquidwrd.github.io/streamerbot-assets/overlay/?host=192.168.1.100&port=8080
https://bsquidwrd.github.io/streamerbot-assets/overlay/?host=localhost&port=9090&password=mypassword
https://bsquidwrd.github.io/streamerbot-assets/overlay/?eventName=MyCustomEvent
```

**Available URL Parameters:**
- `host` - IP address of Streamer.bot (default: 127.0.0.1)
- `port` - WebSocket port (default: 8080)
- `path` - WebSocket path (default: /)
- `password` - WebSocket password if required (default: none)
- `eventName` - Custom event name to listen for (default: SquidCustomOverlay)

## 📁 Local Setup (Advanced Users)

If you prefer to use local files:

1. Download the overlay files to your computer
2. In OBS Studio, click the "+" button in Sources
3. Select "Browser Source"
4. In the Browser Source settings:
   - **CHECK** "Local File" checkbox
   - Click "Browse" and select: `index.html`
   - Set Width: 1920 (or your canvas width)
   - Set Height: 1080 (or your canvas height)
5. Click OK

## ⚙️ Streamer.bot Setup

1. Open Streamer.bot application
2. Go to **"Servers/Clients"** tab
3. Make sure **"Websocket Server"** is enabled 
   - Should be running on port 8080 by default
   - If using a different port, update your OBS URL accordingly
4. The overlay will automatically connect when loaded (you'll see "Connected" in green)

## 🎯 Sending Events to Overlay

Create actions in Streamer.bot that display content on your overlay:

### Step 1: Set Arguments
Add **"Core > Arguments > Set Argument"** sub-actions with these values:

**📝 Available Arguments:**

| Argument Name | Required | Description | Example |
|---------------|----------|-------------|---------|
| `overlay_source` | ✅ **YES** | Path to image/video/gif/html file | `C:\stream\gifs\poggers.gif` |
| `overlay_text` | ❌ No | Text to display with media | `"Thanks for the follow!"` |
| `source_width` | ❌ No | Custom width in pixels | `500` |
| `source_height` | ❌ No | Custom height in pixels | `300` |
| `source_duration` | ❌ No | Display time in milliseconds | `5000` (5 seconds) |
| `source_muted` | ❌ No | Mute video audio | `true` or `false` |

**💡 Pro Tips:**
- Use full file paths for local files: `C:\Users\YourName\stream\assets\image.png`
- Use URLs for online content: `https://example.com/image.gif`
- Duration is optional - videos play to completion, images show for 5 seconds by default
- GIF duration is auto-detected when possible

### Step 2: Trigger the Event
Add **"Core > Triggers > Custom Event Trigger"** sub-action:
- **Event Name:** `SquidCustomOverlay` (or your custom eventName from URL parameters)
- **Turn on "Use Args"** ✅

### 📋 Example Action Setup:
```
1. Set Argument: overlay_source = "C:\stream\gifs\celebration.gif"
2. Set Argument: overlay_text = "New Follower: %user%!"
3. Set Argument: source_duration = "3000"
4. Custom Event Trigger: SquidCustomOverlay (Use Args: ON)
```

## ✅ Testing Your Setup

1. **Load the overlay in OBS** - You should see "Connected" appear in green text
2. **Create a test action in Streamer.bot:**
   - Set Argument: `overlay_source` = `https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif`
   - Set Argument: `overlay_text` = `Test overlay working!`
   - Custom Event Trigger: `SquidCustomOverlay` (Use Args: ON)
3. **Trigger the action** - The overlay should display the GIF with text
4. **Success!** 🎉 Your overlay is working

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Shows "Disconnected" | • Check Streamer.bot WebSocket server is running<br>• Verify host/port in URL parameters<br>• Check firewall settings |
| No events received | • Verify Event Name matches (default: `SquidCustomOverlay`)<br>• Make sure "Use Args" is enabled<br>• Check argument names are spelled correctly |
| Overlay not visible | • Check OBS source is enabled and on active scene<br>• Verify browser source URL is correct<br>• Check browser source dimensions |
| Files not loading | • Use full file paths for local files<br>• Test file URLs in regular browser first<br>• Check file permissions |
| Connection issues | • Try the URL parameters for custom host/port<br>• Check Windows Firewall<br>• Ensure Streamer.bot WebSocket is enabled |

## 🎨 Supported Media Types

- **Images:** PNG, JPG, JPEG, GIF, WebP
- **Videos:** MP4, WebM, OGG, AVI, MOV
- **Web Content:** HTML files, web pages

## 🔧 Advanced Customization

For developers who want to customize the overlay:
- Download the source files from this repository
- Edit `style.css` for appearance changes
- Modify `script.js` for functionality changes
- Update `index.html` for structure changes

**Configuration options** are available at the top of `script.js` including timing, display settings, and queue management.

---

**Need help?** Open an issue on the GitHub repository or check the Streamer.bot Discord community!
