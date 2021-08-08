import { Storage } from 'redux-persist';

export default (): Storage => {
    return {
        getItem: (key: string): Promise<string> => {
            return new Promise((resolve, reject) => {
                resolve(
                    window.api.invoke('APP_GET_ITEM', {
                        key,
                    })
                );
            });
        },
        setItem: (key: string, item: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                window.api.send('APP_SET_ITEM', {
                    key,
                    item,
                });
                resolve();
            });
        },
        removeItem: (key: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                window.api.send('APP_REMOVE_ITEM', {
                    key,
                });
                resolve();
            });
        },
    };
};
