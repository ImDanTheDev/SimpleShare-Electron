import { BrowserWindow, ipcMain } from 'electron';
import { IPCArgs, IPC_ARG_TEMPLATES } from '../shared/types/ipc';

export default class IPC {
    readonly window: BrowserWindow;

    constructor(window: BrowserWindow) {
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
        listener: (args: R) => never
    ): void {
        ipcMain.handle(channel, (_event, args) => listener(args));
    }

    clearListeners(): void {
        ipcMain.eventNames().forEach((channel) => {
            ipcMain.removeAllListeners(channel as string);
        });
    }
}
