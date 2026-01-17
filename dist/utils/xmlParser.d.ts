export interface UIElement {
    type: string;
    text: string;
    contentDesc: string;
    resourceId: string;
    className: string;
    package: string;
    bounds: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    center: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    clickable: boolean;
    enabled: boolean;
    focusable: boolean;
    scrollable: boolean;
    selected: boolean;
    checked: boolean;
}
export interface ProcessedUIData {
    texts: UIElement[];
    buttons: UIElement[];
    inputs: UIElement[];
    switches: UIElement[];
    clickables: UIElement[];
    scrollables: UIElement[];
    all: UIElement[];
}
export declare function parseUIAutomatorXML(xmlContent: string): Promise<ProcessedUIData>;
export declare function formatElementsForDisplay(data: ProcessedUIData): string;
//# sourceMappingURL=xmlParser.d.ts.map