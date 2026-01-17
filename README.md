# Android Debug Bridge MCP

MCP plugin to control Android devices via ADB for automation, testing, and agent integration.

## Features

This MCP server provides tools to:

- **Test Management**: Create test folders for organizing automation tests
- **App Control**: List installed apps by name pattern and open apps by package name
- **Screen Capture**: Take screenshots and save them to organized test folders
- **UI Analysis**: Capture UI hierarchy dumps for element inspection
- **Input Simulation**:
  - Send key events (BACK, HOME, ENTER, DELETE)
  - Tap at specific coordinates
  - Input text into active fields
  - Scroll in any direction (up, down, left, right)
- **Multi-Device Support**: Automatically handles device selection when multiple devices are connected

## Installation

Install the package globally via npm:

```bash
npm install -g android-debug-bridge-mcp
```

## Setup for Different AI Clients

### Claude Code (CLI)

Add to your MCP configuration in `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "android-debug-bridge": {
      "command": "npx",
      "args": ["android-debug-bridge-mcp"]
    }
  }
}
```

or

```bash
claude mcp add --scope project android-debug-bridge-mcp -- npx android-debug-bridge-mcp
```

### Cursor

Add to your MCP configuration in Cursor settings:

1. Open Cursor Settings
2. Navigate to Extensions → MCP
3. Add a new server with:
   - **Name**: `android-debug-bridge`
   - **Command**: `npx`
   - **Args**: `["android-debug-bridge-mcp"]`

### Claude Desktop

Add to your MCP configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "android-debug-bridge": {
      "command": "npx",
      "args": ["android-debug-bridge-mcp"]
    }
  }
}
```

## Prerequisites

- Android Debug Bridge (ADB) must be installed and available in your PATH
- Android device with USB debugging enabled, or Android emulator running
- Device must be connected and authorized for debugging

## Environment Variables

The following environment variables can be used to configure device selection:

| Variable | Description | Example |
|----------|-------------|---------|
| `ANDROID_SERIAL` | Specify device serial number when multiple devices are connected | `emulator-5554` |
| `ADB_PATH` | Custom path to ADB executable (useful for WSL or non-standard installations) | `/mnt/c/Users/user/Android/Sdk/platform-tools/adb.exe` |

### Multi-Device Support

When multiple Android devices/emulators are connected, the MCP server handles device selection as follows:

1. **Single device**: Automatically detected and used (no configuration needed)
2. **Multiple devices**: Set `ANDROID_SERIAL` environment variable to specify which device to use
3. **Custom ADB path**: Set `ADB_PATH` for non-standard ADB installations (e.g., WSL accessing Windows SDK)

Example configuration with environment variables:

```json
{
  "mcpServers": {
    "android-debug-bridge": {
      "command": "npx",
      "args": ["android-debug-bridge-mcp"],
      "env": {
        "ANDROID_SERIAL": "emulator-5554",
        "ADB_PATH": "/mnt/c/Users/david/AppData/Local/Android/Sdk/platform-tools/adb.exe"
      }
    }
  }
}
```

## Usage

Once configured, you can interact with Android devices through your AI client by asking questions like:

- "Create a test folder called 'login_test'"
- "List all apps with 'chrome' in the name"
- "Open the app com.android.chrome"
- "Take a screenshot and save it as step '001_homepage'"
- "Capture the current UI hierarchy in my app"
- ...

## Troubleshooting

### "error: more than one device/emulator"

This error occurs when multiple devices are connected. Solutions:

1. Set `ANDROID_SERIAL` environment variable to specify the device
2. Disconnect other devices
3. Stop other emulators

To find your device serial:
```bash
adb devices -l
```

### ADB not found

If ADB is not in your PATH, set the `ADB_PATH` environment variable to the full path of your ADB executable.

## License

MIT
