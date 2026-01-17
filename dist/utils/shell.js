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
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDeviceCache = clearDeviceCache;
exports.getConnectedDevices = getConnectedDevices;
exports.executeCommand = executeCommand;
exports.createDirectory = createDirectory;
exports.getBaseTestPath = getBaseTestPath;
const child_process_1 = require("child_process");
const os = __importStar(require("os"));
const sleep_1 = require("./sleep");
// Cache for detected device serial
let cachedDeviceSerial = null;
let lastDeviceCheck = 0;
const DEVICE_CACHE_TTL = 30000; // 30 seconds
/**
 * Get the ADB executable path
 * Checks ADB_PATH environment variable, falls back to 'adb'
 */
function getAdbPath() {
    return process.env.ADB_PATH || 'adb';
}
/**
 * Get the device serial to use for ADB commands
 * Priority:
 * 1. ANDROID_SERIAL environment variable
 * 2. Auto-detect if only one device connected
 * 3. null (let ADB fail with helpful error)
 */
function getDeviceSerial() {
    // Check environment variable first
    if (process.env.ANDROID_SERIAL) {
        return process.env.ANDROID_SERIAL;
    }
    // Check cache
    const now = Date.now();
    if (cachedDeviceSerial && (now - lastDeviceCheck) < DEVICE_CACHE_TTL) {
        return cachedDeviceSerial;
    }
    // Auto-detect devices
    try {
        const adbPath = getAdbPath();
        const output = (0, child_process_1.execSync)(`${adbPath} devices`, { encoding: 'utf8', timeout: 5000 });
        const devices = output
            .split('\n')
            .filter(line => line.includes('\tdevice'))
            .map(line => line.split('\t')[0].trim())
            .filter(serial => serial.length > 0);
        if (devices.length === 1) {
            cachedDeviceSerial = devices[0];
            lastDeviceCheck = now;
            return cachedDeviceSerial;
        }
        else if (devices.length > 1) {
            // Multiple devices - log warning but don't fail yet
            console.error(`Warning: Multiple devices connected (${devices.join(', ')}). Set ANDROID_SERIAL to specify device.`);
        }
    }
    catch (error) {
        // ADB not available or failed - will fail later with better error
    }
    return null;
}
/**
 * Build the ADB command prefix with device selection
 */
function getAdbCommand() {
    const adbPath = getAdbPath();
    const serial = getDeviceSerial();
    if (serial) {
        return `${adbPath} -s ${serial}`;
    }
    return adbPath;
}
/**
 * Clear the device cache (useful after device connect/disconnect)
 */
function clearDeviceCache() {
    cachedDeviceSerial = null;
    lastDeviceCheck = 0;
}
/**
 * Get list of connected devices
 */
async function getConnectedDevices() {
    const adbPath = getAdbPath();
    try {
        const output = (0, child_process_1.execSync)(`${adbPath} devices`, { encoding: 'utf8', timeout: 5000 });
        return output
            .split('\n')
            .filter(line => line.includes('\tdevice'))
            .map(line => line.split('\t')[0].trim())
            .filter(serial => serial.length > 0);
    }
    catch {
        return [];
    }
}
async function executeCommand(command) {
    const platform = os.platform();
    let adjustedCommand = command;
    // Replace 'adb ' with full ADB command including device flag
    if (adjustedCommand.startsWith('adb ')) {
        adjustedCommand = adjustedCommand.replace(/^adb /, `${getAdbCommand()} `);
    }
    if (platform === 'win32') {
        // For Windows, handle specific commands that might differ
        if (adjustedCommand.includes('mkdir -p')) {
            adjustedCommand = adjustedCommand.replace(/mkdir -p/g, 'mkdir');
        }
    }
    else {
        // For Unix-like systems (Linux, macOS)
        if (adjustedCommand.includes('findstr')) {
            adjustedCommand = adjustedCommand.replace(/findstr/g, 'grep');
        }
    }
    await (0, sleep_1.sleep)(200);
    try {
        const result = (0, child_process_1.execSync)(adjustedCommand, { encoding: 'utf8' });
        await (0, sleep_1.sleep)(200);
        return result;
    }
    catch (error) {
        // Provide more helpful error messages
        if (error.message?.includes('more than one device')) {
            const devices = await getConnectedDevices();
            throw new Error(`Multiple devices connected: ${devices.join(', ')}. ` +
                `Set ANDROID_SERIAL environment variable to specify which device to use.`);
        }
        if (error.message?.includes('no devices')) {
            throw new Error('No Android devices connected. Start an emulator or connect a device via USB.');
        }
        throw error;
    }
}
async function createDirectory(dirPath) {
    const platform = os.platform();
    if (platform === 'win32') {
        (0, child_process_1.execSync)(`mkdir "${dirPath}"`, { encoding: 'utf8' });
    }
    else {
        (0, child_process_1.execSync)(`mkdir -p "${dirPath}"`, { encoding: 'utf8' });
    }
}
function getBaseTestPath() {
    return process.cwd();
}
//# sourceMappingURL=shell.js.map