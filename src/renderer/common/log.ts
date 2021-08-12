/* eslint-disable no-console */
export const log = (message: unknown, ...optionalParams: unknown[]): void => {
    console.log(message, ...optionalParams);
    window.api.send('APP_LOG', { message, optionalParams });
};

export const error = (message: unknown, ...optionalParams: unknown[]): void => {
    console.error(message, ...optionalParams);
    window.api.send('APP_ERROR', { message, optionalParams });
};
