import { IPCArgs, IPC_ARG_TEMPLATES } from '../../common/ipc-types';

declare global {
    interface Window {
        api: API;
    }
}

export interface API {
    invoke<T extends keyof IPCArgs, R extends typeof IPC_ARG_TEMPLATES[T]>(
        channel: T,
        args: R
    ): Promise<never>;
    send<T extends keyof IPCArgs, R extends typeof IPC_ARG_TEMPLATES[T]>(
        channel: T,
        args: R
    ): void;
    /** @return A function that removes this listener. */
    on<T extends keyof IPCArgs, R extends typeof IPC_ARG_TEMPLATES[T]>(
        channel: T,
        listener: (args: R) => void
    ): () => void;
}
