import express from 'express';
import path from 'path';

export const start = (): Promise<express.Express> => {
    return new Promise<express.Express>(() => {
        const appServer = express();
        appServer.use(express.json());
        appServer.use(express.urlencoded({ extended: true }));

        appServer.use((_req, _res, next) => {
            // TODO: set csp.
            next();
        });

        const folderOptions = {
            index: false,
            maxAge: 0,
            redirect: false,
        };

        const rendererFolder = path.join(
            path.resolve(__dirname, '..'),
            'renderer'
        );

        appServer.use(express.static(rendererFolder, folderOptions));
        appServer.listen(3090);
        // TODO: Serve over https?
    });
};
