import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { executeCommand, createDirectory, getBaseTestPath, getConnectedDevices } from '../utils/shell.js';
import { sleep } from '../utils/sleep.js';
import { parseUIAutomatorXML, formatElementsForDisplay } from '../utils/xmlParser.js';

// Screenshot compression settings
const SCREENSHOT_MAX_WIDTH = 540;
const SCREENSHOT_JPEG_QUALITY = 60;

const captureUIContent = async (includeRawXML: boolean = true, device?: string) => {
  await executeCommand('adb shell uiautomator dump /sdcard/window_dump.xml', device);
  const xmlContent = await executeCommand('adb shell "cat /sdcard/window_dump.xml"', device);
  
  try {
    const processedUI = await parseUIAutomatorXML(xmlContent);
    const formattedOutput = formatElementsForDisplay(processedUI);
    
    const result = [
      {
        type: 'text',
        text: formattedOutput,
      },
    ];
    
    if (includeRawXML) {
      result.push({
        type: 'text',
        text: `\n=== RAW XML UI Automator ===\n${xmlContent}`,
      });
    }
    
    return result;
  } catch (error) {
    const result = [
      {
        type: 'text',
        text: `Error processing UI dump: ${error}`,
      },
      {
        type: 'text',
        text: `\n=== RAW XML DATA ===\n${xmlContent}`,
      }
    ];
  
    
    return result;
  }
};

export const toolHandlers = {
  list_devices: async (args: any) => {
    const devices = await getConnectedDevices();

    if (devices.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No Android devices connected. Start an emulator or connect a device via USB.',
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Connected devices:\n${devices.map(d => `  - ${d}`).join('\n')}\n\nUse the 'device' parameter with any tool to target a specific device.`,
        },
      ],
    };
  },

  create_test_folder: async (args: any) => {
    const { test_name } = args as { test_name: string };
    const testPath = path.join(getBaseTestPath(), test_name);
    
    await createDirectory(testPath);
    
    return {
      content: [
        {
          type: 'text',
          text: `Test folder created: ${testPath}`,
        },
      ],
    };
  },

  list_apps: async (args: any) => {
    const { app_name, device } = args as { app_name: string; device?: string };
    // Run grep inside adb shell to avoid host-side pipe issues
    const result = await executeCommand(`adb shell "pm list packages | grep -i '${app_name}'"`, device);

    return {
      content: [
        {
          type: 'text',
          text: result || 'No apps found matching the pattern',
        },
      ],
    };
  },

  open_app: async (args: any) => {
    const { package_name, device } = args as {
      package_name: string;
      device?: string;
    };

    await executeCommand(`adb shell monkey -p ${package_name} 1`, device);
    await sleep(5000);

    return {
      content: [
        {
          type: 'text',
          text: `App opened: ${package_name}${device ? ` on ${device}` : ''}`,
        },
      ],
    };
  },

  capture_screenshot: async (args: any) => {
    const { test_name, step_name, device } = args as {
      test_name: string;
      step_name: string;
      device?: string;
    };

    const testPath = path.join(getBaseTestPath(), test_name);
    const screenshotPath = path.join(testPath, `${step_name}_step.png`);
    const compressedPath = path.join(testPath, `${step_name}_step.jpg`);

    if (!fs.existsSync(testPath)) {
      fs.mkdirSync(testPath, { recursive: true });
    }

    await executeCommand(`adb exec-out screencap -p > "${screenshotPath}"`, device);

    // Compress the screenshot using sharp
    // Resize to max width while maintaining aspect ratio, convert to JPEG
    const originalSize = fs.statSync(screenshotPath).size;

    const compressedBuffer = await sharp(screenshotPath)
      .resize(SCREENSHOT_MAX_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: SCREENSHOT_JPEG_QUALITY })
      .toBuffer();

    // Save compressed version for reference
    fs.writeFileSync(compressedPath, compressedBuffer);

    const compressedSize = compressedBuffer.length;
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    const base64Image = compressedBuffer.toString('base64');

    return {
      content: [
        {
          type: 'text',
          text: `Screenshot captured${device ? ` on ${device}` : ''}: ${screenshotPath}\nCompressed: ${originalSize.toLocaleString()} → ${compressedSize.toLocaleString()} bytes (${reduction}% reduction)`,
        },
        {
          type: 'image',
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      ],
    };
  },

  capture_ui_dump: async (args: any) => {
    const { device } = args as { device?: string };
    const content = await captureUIContent(true, device);
    return {
      content: content,
    };
  },

  input_keyevent: async (args: any) => {
    const { key, device } = args as { key: string; device?: string };

    const keyCodeMap = {
      BACK: '4',
      HOME: '3',
      ENTER: '66',
      DELETE: '67',
    };

    const keyCode = keyCodeMap[key as keyof typeof keyCodeMap];
    if (!keyCode) {
      throw new McpError(ErrorCode.InvalidParams, `Invalid key: ${key}`);
    }

    await executeCommand(`adb shell input keyevent ${keyCode}`, device);

    const uiContent = await captureUIContent(false, device);

    return {
      content: [
        {
          type: 'text',
          text: `Key event sent: ${key} (${keyCode})${device ? ` on ${device}` : ''}`,
        },
        ...uiContent,
      ],
    };
  },

  input_tap: async (args: any) => {
    const { x, y, device } = args as { x: number; y: number; device?: string };

    await executeCommand(`adb shell input tap ${x} ${y}`, device);

    const uiContent = await captureUIContent(false, device);

    return {
      content: [
        {
          type: 'text',
          text: `Tap executed at coordinates: (${x}, ${y})${device ? ` on ${device}` : ''}`,
        },
        ...uiContent,
      ],
    };
  },

  input_text: async (args: any) => {
    const { text, device } = args as { text: string; device?: string };
    const escapedText = text.replace(/"/g, '\\"');

    await executeCommand(`adb shell input text "${escapedText}"`, device);

    await executeCommand(`adb shell input keyevent 66`, device);

    const uiContent = await captureUIContent(false, device);

    return {
      content: [
        {
          type: 'text',
          text: `Text input: ${text}${device ? ` on ${device}` : ''}`,
        },
        ...uiContent,
      ],
    };
  },

  input_scroll: async (args: any) => {
    const { direction, device } = args as { direction: string; device?: string };

    const scrollCommands = {
      up: 'adb shell input swipe 500 800 500 400',
      down: 'adb shell input swipe 500 400 500 800',
      left: 'adb shell input swipe 800 500 400 500',
      right: 'adb shell input swipe 400 500 800 500',
    };

    const command = scrollCommands[direction as keyof typeof scrollCommands];
    if (!command) {
      throw new McpError(ErrorCode.InvalidParams, `Invalid direction: ${direction}`);
    }

    await executeCommand(command, device);

    const uiContent = await captureUIContent(false, device);

    return {
      content: [
        {
          type: 'text',
          text: `Scroll executed: ${direction}${device ? ` on ${device}` : ''}`,
        },
        ...uiContent,
      ],
    };
  },
};