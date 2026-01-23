export const toolDefinitions = [
  {
    name: 'list_devices',
    description: 'List all connected Android devices and emulators',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_test_folder',
    description: 'Create a test folder with the specified name',
    inputSchema: {
      type: 'object',
      properties: {
        test_name: {
          type: 'string',
          description: 'Name of the test folder to create',
        },
      },
      required: ['test_name'],
    },
  },
  {
    name: 'list_apps',
    description: 'List installed apps matching a name pattern',
    inputSchema: {
      type: 'object',
      properties: {
        app_name: {
          type: 'string',
          description: 'Name pattern to search for in app packages',
        },
        device: {
          type: 'string',
          description: 'Target device serial (e.g., emulator-5554). Use list_devices to see available devices.',
        },
      },
      required: ['app_name'],
    },
  },
  {
    name: 'open_app',
    description: 'Open an app using its package name and activity',
    inputSchema: {
      type: 'object',
      properties: {
        package_name: {
          type: 'string',
          description: 'Full package name of the app (e.g., com.example.app)',
        },
        device: {
          type: 'string',
          description: 'Target device serial (e.g., emulator-5554). Use list_devices to see available devices.',
        },
      },
      required: ['package_name'],
    },
  },
  {
    name: 'capture_screenshot',
    description: 'Capture a screenshot and save it to the test folder',
    inputSchema: {
      type: 'object',
      properties: {
        test_name: {
          type: 'string',
          description: 'Name of the test folder where to save the screenshot',
        },
        step_name: {
          type: 'string',
          description: 'Name of the step for the screenshot file (e.g., "001_login")',
        },
        device: {
          type: 'string',
          description: 'Target device serial (e.g., emulator-5554). Use list_devices to see available devices.',
        },
      },
      required: ['test_name', 'step_name'],
    },
  },
  {
    name: 'capture_ui_dump',
    description: 'Capture UI hierarchy dump from the device',
    inputSchema: {
      type: 'object',
      properties: {
        device: {
          type: 'string',
          description: 'Target device serial (e.g., emulator-5554). Use list_devices to see available devices.',
        },
      },
    },
  },
  {
    name: 'input_keyevent',
    description: 'Send key events (BACK, HOME, ENTER, DELETE)',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          enum: ['BACK', 'HOME', 'ENTER', 'DELETE'],
          description: 'Key event to send',
        },
        device: {
          type: 'string',
          description: 'Target device serial (e.g., emulator-5554). Use list_devices to see available devices.',
        },
      },
      required: ['key'],
    },
  },
  {
    name: 'input_tap',
    description: 'Tap at specific coordinates',
    inputSchema: {
      type: 'object',
      properties: {
        x: {
          type: 'number',
          description: 'X coordinate for tap',
        },
        y: {
          type: 'number',
          description: 'Y coordinate for tap',
        },
        device: {
          type: 'string',
          description: 'Target device serial (e.g., emulator-5554). Use list_devices to see available devices.',
        },
      },
      required: ['x', 'y'],
    },
  },
  {
    name: 'input_text',
    description: 'Input text into the current field',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to input',
        },
        device: {
          type: 'string',
          description: 'Target device serial (e.g., emulator-5554). Use list_devices to see available devices.',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'input_scroll',
    description: 'Perform scroll action',
    inputSchema: {
      type: 'object',
      properties: {
        direction: {
          type: 'string',
          enum: ['up', 'down', 'left', 'right'],
          description: 'Direction to scroll',
        },
        device: {
          type: 'string',
          description: 'Target device serial (e.g., emulator-5554). Use list_devices to see available devices.',
        },
      },
      required: ['direction'],
    },
  },
];