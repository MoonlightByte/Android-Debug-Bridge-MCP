export declare const toolDefinitions: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            test_name: {
                type: string;
                description: string;
            };
            app_name?: undefined;
            package_name?: undefined;
            step_name?: undefined;
            key?: undefined;
            x?: undefined;
            y?: undefined;
            text?: undefined;
            direction?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            app_name: {
                type: string;
                description: string;
            };
            test_name?: undefined;
            package_name?: undefined;
            step_name?: undefined;
            key?: undefined;
            x?: undefined;
            y?: undefined;
            text?: undefined;
            direction?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            package_name: {
                type: string;
                description: string;
            };
            test_name?: undefined;
            app_name?: undefined;
            step_name?: undefined;
            key?: undefined;
            x?: undefined;
            y?: undefined;
            text?: undefined;
            direction?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            test_name: {
                type: string;
                description: string;
            };
            step_name: {
                type: string;
                description: string;
            };
            app_name?: undefined;
            package_name?: undefined;
            key?: undefined;
            x?: undefined;
            y?: undefined;
            text?: undefined;
            direction?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            test_name?: undefined;
            app_name?: undefined;
            package_name?: undefined;
            step_name?: undefined;
            key?: undefined;
            x?: undefined;
            y?: undefined;
            text?: undefined;
            direction?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            key: {
                type: string;
                enum: string[];
                description: string;
            };
            test_name?: undefined;
            app_name?: undefined;
            package_name?: undefined;
            step_name?: undefined;
            x?: undefined;
            y?: undefined;
            text?: undefined;
            direction?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            x: {
                type: string;
                description: string;
            };
            y: {
                type: string;
                description: string;
            };
            test_name?: undefined;
            app_name?: undefined;
            package_name?: undefined;
            step_name?: undefined;
            key?: undefined;
            text?: undefined;
            direction?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            text: {
                type: string;
                description: string;
            };
            test_name?: undefined;
            app_name?: undefined;
            package_name?: undefined;
            step_name?: undefined;
            key?: undefined;
            x?: undefined;
            y?: undefined;
            direction?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            direction: {
                type: string;
                enum: string[];
                description: string;
            };
            test_name?: undefined;
            app_name?: undefined;
            package_name?: undefined;
            step_name?: undefined;
            key?: undefined;
            x?: undefined;
            y?: undefined;
            text?: undefined;
        };
        required: string[];
    };
})[];
//# sourceMappingURL=definitions.d.ts.map