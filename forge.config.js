module.exports = {
    packagerConfig: {
        executableName: 'SimpleShare',
        name: 'Simple Share',
        icon: 'src/assets/images/icons/app_icon',
        ignore: [
            '/.git',
            '/.vscode',
            '/node_modules', // Leaves an empty folder. TODO: Remove empty folder?
            '/out',
            '/src',
            /^\/\.(?!webpack)[^(\n)]*$/, // Ignore top-level dot files and folders except for .webpack
            /^\/webpack[^(\n)]*$/, // Ignores top-level files that start with .webpack
            '/forge.config.js',
            '/package-lock.json',
            '/tsconfig.json',
        ],
    },
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'SimpleShare',
                title: 'Simple Share',
                exe: 'SimpleShare.exe',
                setupExe: 'SimpleShareSetup.exe',
                setupMsi: 'SimpleShareSetup.msi',
                iconUrl: 'https://simpleshare-428bb.web.app/favicon.ico',
                setupIcon: 'src/assets/images/icons/app_icon.ico',
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
    plugins: [
        [
            '@electron-forge/plugin-webpack',
            {
                mainConfig: './webpack.main.config.js',
                renderer: {
                    config: './webpack.renderer.config.js',
                    entryPoints: [
                        {
                            html: './src/renderer/common/index.html',
                            js: './src/renderer/mainwindow/renderer.tsx',
                            name: 'main_window',
                            preload: {
                                js: './src/renderer/common/preload.ts',
                            },
                        },
                        {
                            html: './src/renderer/common/index.html',
                            js: './src/renderer/startupwindow/renderer.tsx',
                            name: 'startup_window',
                            preload: {
                                js: './src/renderer/common/preload.ts',
                            },
                        },
                        {
                            html: './src/renderer/common/index.html',
                            js: './src/renderer/updatewindow/renderer.tsx',
                            name: 'update_window',
                            preload: {
                                js: './src/renderer/common/preload.ts',
                            },
                        },
                    ],
                },
            },
        ],
    ],
    hooks: {
        postPackage: async (forgeConfig, options) => {
            if (options.spinner) {
                options.spinner.info(
                    `Completed packaging for ${options.platform} / ${options.arch} at ${options.outputPaths[0]}`
                );
            }
        },
    },
};
