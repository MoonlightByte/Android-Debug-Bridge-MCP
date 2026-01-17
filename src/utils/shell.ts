import { execSync } from 'child_process';
import * as os from 'os';
import { sleep } from './sleep';

// Cache for detected device serial
let cachedDeviceSerial: string | null = null;
let lastDeviceCheck: number = 0;
const DEVICE_CACHE_TTL = 30000; // 30 seconds

/**
 * Get the ADB executable path
 * Checks ADB_PATH environment variable, falls back to 'adb'
 */
function getAdbPath(): string {
  return process.env.ADB_PATH || 'adb';
}

/**
 * Get the device serial to use for ADB commands
 * Priority:
 * 1. ANDROID_SERIAL environment variable
 * 2. Auto-detect if only one device connected
 * 3. null (let ADB fail with helpful error)
 */
function getDeviceSerial(): string | null {
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
    const output = execSync(`${adbPath} devices`, { encoding: 'utf8', timeout: 5000 });
    const devices = output
      .split('\n')
      .filter(line => line.includes('\tdevice'))
      .map(line => line.split('\t')[0].trim())
      .filter(serial => serial.length > 0);

    if (devices.length === 1) {
      cachedDeviceSerial = devices[0];
      lastDeviceCheck = now;
      return cachedDeviceSerial;
    } else if (devices.length > 1) {
      // Multiple devices - log warning but don't fail yet
      console.error(`Warning: Multiple devices connected (${devices.join(', ')}). Set ANDROID_SERIAL to specify device.`);
    }
  } catch (error) {
    // ADB not available or failed - will fail later with better error
  }

  return null;
}

/**
 * Build the ADB command prefix with device selection
 */
function getAdbCommand(): string {
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
export function clearDeviceCache(): void {
  cachedDeviceSerial = null;
  lastDeviceCheck = 0;
}

/**
 * Get list of connected devices
 */
export async function getConnectedDevices(): Promise<string[]> {
  const adbPath = getAdbPath();
  try {
    const output = execSync(`${adbPath} devices`, { encoding: 'utf8', timeout: 5000 });
    return output
      .split('\n')
      .filter(line => line.includes('\tdevice'))
      .map(line => line.split('\t')[0].trim())
      .filter(serial => serial.length > 0);
  } catch {
    return [];
  }
}

export async function executeCommand(command: string): Promise<string> {
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
  } else {
    // For Unix-like systems (Linux, macOS)
    if (adjustedCommand.includes('findstr')) {
      adjustedCommand = adjustedCommand.replace(/findstr/g, 'grep');
    }
  }

  await sleep(200);

  try {
    const result = execSync(adjustedCommand, { encoding: 'utf8' });
    await sleep(200);
    return result;
  } catch (error: any) {
    // Provide more helpful error messages
    if (error.message?.includes('more than one device')) {
      const devices = await getConnectedDevices();
      throw new Error(
        `Multiple devices connected: ${devices.join(', ')}. ` +
        `Set ANDROID_SERIAL environment variable to specify which device to use.`
      );
    }
    if (error.message?.includes('no devices')) {
      throw new Error(
        'No Android devices connected. Start an emulator or connect a device via USB.'
      );
    }
    throw error;
  }
}

export async function createDirectory(dirPath: string): Promise<void> {
  const platform = os.platform();

  if (platform === 'win32') {
    execSync(`mkdir "${dirPath}"`, { encoding: 'utf8' });
  } else {
    execSync(`mkdir -p "${dirPath}"`, { encoding: 'utf8' });
  }
}

export function getBaseTestPath(): string {
  return process.cwd();
}
