import { app, BrowserWindow, dialog } from 'electron';
import installExtension, {
    REDUX_DEVTOOLS,
    REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';
import fs from 'fs/promises';
import ElectronStore from 'electron-store';
import MainIPC from './main-ipc';
import { start } from './webserver';
import path from 'path';

// Magic strings set by webpack
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const STARTUP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let electronStore: ElectronStore;
let currentWindow: BrowserWindow;
let ipc: MainIPC;

const createStartupWindow = (): void => {
    currentWindow = new BrowserWindow({
        autoHideMenuBar: true,
        frame: false,
        transparent: true,
        resizable: false,
        webPreferences: {
            webSecurity: false,
            allowRunningInsecureContent: true,
            nativeWindowOpen: true,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: STARTUP_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        show: false,
    });

    ipc.setWindow(currentWindow);
    currentWindow.loadURL('http://localhost:3090/startup_window/index.html');
    currentWindow.on('ready-to-show', () => {
        currentWindow.show();
    });
};

const createMainWindow = (): void => {
    currentWindow = new BrowserWindow({
        autoHideMenuBar: true,
        transparent: false,
        frame: false,
        resizable: true,
        webPreferences: {
            nativeWindowOpen: true,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        show: false,
    });

    ipc.setWindow(currentWindow);
    currentWindow.loadURL('http://localhost:3090/main_window/index.html');
    currentWindow.on('ready-to-show', () => {
        currentWindow.show();
    });
};

const setupIPC = () => {
    ipc = new MainIPC(currentWindow);
    ipc.on('APP_CONFIGURE', (args) => {
        if (args.movable !== undefined) currentWindow.setMovable(args.movable);
        if (args.resizable !== undefined)
            currentWindow.setResizable(args.resizable);
        if (args.minSize !== undefined) {
            currentWindow.setMinimumSize(
                args.minSize.minWidth,
                args.minSize.minHeight
            );
        }
        if (args.maxSize !== undefined) {
            currentWindow.setMaximumSize(
                args.maxSize.maxWidth,
                args.maxSize.maxHeight
            );
        }
    });
    ipc.on('APP_MOVE', (args) => {
        if (args.center) {
            currentWindow.center();
        } else if (args.x && args.y) {
            currentWindow.setPosition(args.x, args.y, args.animate);
        }
    });
    ipc.on('APP_RESIZE', (args) => {
        if (args.overrideMinimumSize) {
            currentWindow.setMinimumSize(args.width, args.height);
        }
        currentWindow.setSize(args.width, args.height);
    });
    ipc.on('APP_QUIT', () => {
        app.quit();
    });
    ipc.on('APP_SHOW_STARTUP_WINDOW', () => {
        const oldWindow = currentWindow;
        createStartupWindow();
        oldWindow.close();
    });
    ipc.on('APP_SHOW_MAIN_WINDOW', () => {
        const oldWindow = currentWindow;
        createMainWindow();
        oldWindow.close();
    });
    ipc.handle('APP_GET_ITEM', (args) => {
        return electronStore.get(args.key);
    });
    ipc.on('APP_SET_ITEM', ({ key, item }) => {
        electronStore.set(key, item);
    });
    ipc.on('APP_REMOVE_ITEM', ({ key }) => {
        electronStore.delete(key);
    });
    ipc.on('APP_LOG', ({ message, optionalParams }) => {
        log(message, true, ...optionalParams);
    });
    ipc.on('APP_ERROR', ({ message, optionalParams }) => {
        error(message, true, ...optionalParams);
    });
    ipc.handle('APP_GET_FILE', async (args) => {
        const dialogResult = await dialog.showOpenDialog(currentWindow, {
            properties: ['openFile'],
            filters: args.filters,
        });
        if (dialogResult.filePaths.length <= 0) {
            log('No files selected');
            return undefined;
        }
        const filePath = dialogResult.filePaths[0];

        try {
            const buffer = await fs.readFile(filePath);
            const b64Data = buffer.toString('base64');
            return {
                buffer: b64Data,
                ext: path.extname(filePath).substr(1),
            };
        } catch (e) {
            error('An error occurred while reading a file: ', false, e);
            return undefined;
        }
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    if (process.env.INIT_CWD) {
        installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS], {
            forceDownload: false,
        })
            .then((name) => {
                log(`Installed Extension: ${name}`);
            })
            .catch((err) => {
                log('An error occurred: ', false, err);
            });
    }

    start();

    setupIPC();

    electronStore = new ElectronStore();

    createStartupWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createStartupWindow();
    }
});

const log = (
    message: unknown,
    renderer?: boolean,
    ...optionalParams: unknown[]
) => {
    if (process.env.INIT_CWD) {
        // eslint-disable-next-line no-console
        console.log(
            `[${renderer ? 'RENDERER' : 'MAIN'}] ${message}`,
            ...optionalParams
        );
    }
};

const error = (
    message: unknown,
    renderer?: boolean,
    ...optionalParams: unknown[]
) => {
    if (process.env.INIT_CWD) {
        // eslint-disable-next-line no-console
        console.error(
            `[${renderer ? 'RENDERER' : 'MAIN'}] ${message}`,
            ...optionalParams
        );
    }
};
