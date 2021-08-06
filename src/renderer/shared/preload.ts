/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron';
import { IPCArgs, IPC_ARG_TEMPLATES } from '../../shared/types/ipc';

const callIpcRenderer = (method: string, channel: string, ...args: any[]) => {
    if (!channel.startsWith('APP_')) {
        throw 'Error: IPC channel name not allowed';
    }
    if (['invoke', 'send'].includes(method)) {
        return (ipcRenderer as any)[method](channel, ...args);
    }

    if ('on' === method) {
        const listener = args[0];
        if (!listener) throw 'Listener must be provided';

        const wrappedListener = (
            _event: Electron.IpcRendererEvent,
            ...a: any[]
        ) => listener(...a);
        ipcRenderer.on(channel, wrappedListener);

        return () => {
            ipcRenderer.removeListener(channel, wrappedListener);
        };
    }
};

contextBridge.exposeInMainWorld('api', {
    invoke: <T extends keyof IPCArgs, R extends typeof IPC_ARG_TEMPLATES[T]>(
        channel: T,
        args: R
    ) => callIpcRenderer('invoke', channel, args),
    send: <T extends keyof IPCArgs, R extends typeof IPC_ARG_TEMPLATES[T]>(
        channel: T,
        args: R
    ) => callIpcRenderer('send', channel, args),
    on: <T extends keyof IPCArgs, R extends typeof IPC_ARG_TEMPLATES[T]>(
        channel: T,
        listener: (args: R) => void
    ) => callIpcRenderer('on', channel, listener),
});
