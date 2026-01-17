"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolHandlers = void 0;
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const shell_js_1 = require("../utils/shell.js");
const sleep_js_1 = require("../utils/sleep.js");
const xmlParser_js_1 = require("../utils/xmlParser.js");
// Screenshot compression settings
const SCREENSHOT_MAX_WIDTH = 540;
const SCREENSHOT_JPEG_QUALITY = 60;
const captureUIContent = async (includeRawXML = true) => {
    await (0, shell_js_1.executeCommand)('adb shell uiautomator dump /sdcard/window_dump.xml');
    const xmlContent = await (0, shell_js_1.executeCommand)('adb shell "cat /sdcard/window_dump.xml"');
    try {
        const processedUI = await (0, xmlParser_js_1.parseUIAutomatorXML)(xmlContent);
        const formattedOutput = (0, xmlParser_js_1.formatElementsForDisplay)(processedUI);
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
    }
    catch (error) {
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
exports.toolHandlers = {
    create_test_folder: async (args) => {
        const { test_name } = args;
        const testPath = path.join((0, shell_js_1.getBaseTestPath)(), test_name);
        await (0, shell_js_1.createDirectory)(testPath);
        return {
            content: [
                {
                    type: 'text',
                    text: `Test folder created: ${testPath}`,
                },
            ],
        };
    },
    list_apps: async (args) => {
        const { app_name } = args;
        // Run grep inside adb shell to avoid host-side pipe issues
        const result = await (0, shell_js_1.executeCommand)(`adb shell "pm list packages | grep -i '${app_name}'"`);
        return {
            content: [
                {
                    type: 'text',
                    text: result || 'No apps found matching the pattern',
                },
            ],
        };
    },
    open_app: async (args) => {
        const { package_name } = args;
        await (0, shell_js_1.executeCommand)(`adb shell monkey -p ${package_name} 1`);
        await (0, sleep_js_1.sleep)(5000);
        return {
            content: [
                {
                    type: 'text',
                    text: `App opened: ${package_name}`,
                },
            ],
        };
    },
    capture_screenshot: async (args) => {
        const { test_name, step_name } = args;
        const testPath = path.join((0, shell_js_1.getBaseTestPath)(), test_name);
        const screenshotPath = path.join(testPath, `${step_name}_step.png`);
        const compressedPath = path.join(testPath, `${step_name}_step.jpg`);
        if (!fs.existsSync(testPath)) {
            fs.mkdirSync(testPath, { recursive: true });
        }
        await (0, shell_js_1.executeCommand)(`adb exec-out screencap -p > "${screenshotPath}"`);
        // Compress the screenshot using sharp
        // Resize to max width while maintaining aspect ratio, convert to JPEG
        const originalSize = fs.statSync(screenshotPath).size;
        const compressedBuffer = await (0, sharp_1.default)(screenshotPath)
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
                    text: `Screenshot captured: ${screenshotPath}\nCompressed: ${originalSize.toLocaleString()} → ${compressedSize.toLocaleString()} bytes (${reduction}% reduction)`,
                },
                {
                    type: 'image',
                    data: base64Image,
                    mimeType: 'image/jpeg',
                },
            ],
        };
    },
    capture_ui_dump: async (args) => {
        const content = await captureUIContent(true);
        return {
            content: content,
        };
    },
    input_keyevent: async (args) => {
        const { key } = args;
        const keyCodeMap = {
            BACK: '4',
            HOME: '3',
            ENTER: '66',
            DELETE: '67',
        };
        const keyCode = keyCodeMap[key];
        if (!keyCode) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, `Invalid key: ${key}`);
        }
        await (0, shell_js_1.executeCommand)(`adb shell input keyevent ${keyCode}`);
        const uiContent = await captureUIContent(false);
        return {
            content: [
                {
                    type: 'text',
                    text: `Key event sent: ${key} (${keyCode})`,
                },
                ...uiContent,
            ],
        };
    },
    input_tap: async (args) => {
        const { x, y } = args;
        await (0, shell_js_1.executeCommand)(`adb shell input tap ${x} ${y}`);
        const uiContent = await captureUIContent(false);
        return {
            content: [
                {
                    type: 'text',
                    text: `Tap executed at coordinates: (${x}, ${y})`,
                },
                ...uiContent,
            ],
        };
    },
    input_text: async (args) => {
        const { text } = args;
        const escapedText = text.replace(/"/g, '\\"');
        await (0, shell_js_1.executeCommand)(`adb shell input text "${escapedText}"`);
        await (0, shell_js_1.executeCommand)(`adb shell input keyevent 66`);
        const uiContent = await captureUIContent(false);
        return {
            content: [
                {
                    type: 'text',
                    text: `Text input: ${text}`,
                },
                ...uiContent,
            ],
        };
    },
    input_scroll: async (args) => {
        const { direction } = args;
        const scrollCommands = {
            up: 'adb shell input swipe 500 800 500 400',
            down: 'adb shell input swipe 500 400 500 800',
            left: 'adb shell input swipe 800 500 400 500',
            right: 'adb shell input swipe 400 500 800 500',
        };
        const command = scrollCommands[direction];
        if (!command) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, `Invalid direction: ${direction}`);
        }
        await (0, shell_js_1.executeCommand)(command);
        const uiContent = await captureUIContent(false);
        return {
            content: [
                {
                    type: 'text',
                    text: `Scroll executed: ${direction}`,
                },
                ...uiContent,
            ],
        };
    },
};
//# sourceMappingURL=handlers.js.map