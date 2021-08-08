import { BrowserWindow, ipcMain } from 'electron';
import { IPCArgs, IPC_ARG_TEMPLATES } from '../common/ipc-types';

export default class MainIPC {
    private window: BrowserWindow;

    constructor(window: BrowserWindow) {
        this.window = window;
    }

    setWindow(window: BrowserWindow): void {
        this.window = window;
    }

    send<T extends keyof IPCArgs, R extends typeof IPC_ARG_TEMPLATES[T]>(
        channel: T,
        args: R
    ): void {
        this.window.webContents.send(channel, args);
    }

    on<T extends keyof IPCArgs, R extends typeof IPC_ARG_TEMPLATES[T]>(
        channel: T,
        listener: (args: R) => void
    ): void {
        ipcMain.on(channel, (_event, args) => listener(args));
    }

    handle<T extends keyof IPCArgs, R extends typeof IPC_ARG_TEMPLATES[T]>(
        channel: T,
        listener: (args: R) => unknown
    ): void {
        ipcMain.handle(channel, (_event, args) => listener(args));
    }
}
