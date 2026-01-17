export declare const toolHandlers: {
    create_test_folder: (args: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    list_apps: (args: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    open_app: (args: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    capture_screenshot: (args: any) => Promise<{
        content: ({
            type: string;
            text: string;
            data?: undefined;
            mimeType?: undefined;
        } | {
            type: string;
            data: string;
            mimeType: string;
            text?: undefined;
        })[];
    }>;
    capture_ui_dump: (args: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    input_keyevent: (args: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    input_tap: (args: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    input_text: (args: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    input_scroll: (args: any) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=handlers.d.ts.map