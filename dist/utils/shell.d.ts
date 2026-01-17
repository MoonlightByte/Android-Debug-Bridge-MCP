/**
 * Clear the device cache (useful after device connect/disconnect)
 */
export declare function clearDeviceCache(): void;
/**
 * Get list of connected devices
 */
export declare function getConnectedDevices(): Promise<string[]>;
export declare function executeCommand(command: string): Promise<string>;
export declare function createDirectory(dirPath: string): Promise<void>;
export declare function getBaseTestPath(): string;
//# sourceMappingURL=shell.d.ts.map