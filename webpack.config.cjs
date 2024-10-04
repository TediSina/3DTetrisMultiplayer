const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/client/App.ts', // Entry TypeScript file for the client
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            "@babylonjs": path.resolve(__dirname, "node_modules/@babylonjs/"),
            "socket.io-client": path.resolve(__dirname, "node_modules/socket.io-client/")
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    target: 'web', // Set target for browser environment
};
