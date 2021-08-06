export interface IPCArgs {
    APP_CONFIGURE: {
        resizable?: boolean;
        movable?: boolean;
        minSize?: {
            minWidth: number;
            minHeight: number;
        };
        maxSize?: {
            maxWidth: number;
            maxHeight: number;
        };
    };
    APP_MOVE: {
        x?: number;
        y?: number;
        center?: boolean;
        animate?: boolean;
    };
    APP_RESIZE: {
        width: number;
        height: number;
        animate?: boolean;
        aroundCenter?: boolean;
        overrideMinimumSize?: boolean;
    };
    APP_SHOW_MAIN_WINDOW: Record<string, unknown>;
    APP_SHOW_STARTUP_WINDOW: Record<string, unknown>;
    APP_QUIT: Record<string, unknown>;
}

export const IPC_ARG_TEMPLATES: IPCArgs = {
    APP_CONFIGURE: {
        resizable: false,
        movable: false,
        minSize: {
            minWidth: 0,
            minHeight: 0,
        },
        maxSize: {
            maxHeight: 0,
            maxWidth: 0,
        },
    },
    APP_MOVE: {
        x: 0,
        y: 0,
        center: false,
        animate: false,
    },
    APP_RESIZE: {
        width: 0,
        height: 0,
        animate: false,
        aroundCenter: false,
        //resizable: false,
    },
    APP_SHOW_MAIN_WINDOW: {},
    APP_SHOW_STARTUP_WINDOW: {},
    APP_QUIT: {},
};
