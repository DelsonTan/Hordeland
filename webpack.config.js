const path = require('path');

var config = {
    mode: "development",
    entry: './client/scripts/index.jsx',
    output: {
        path: path.resolve(__dirname, 'client/scripts'),
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'client/scripts')
                ],
                loader: 'babel-loader',
                query: {
                    presets: ['env', 'react']
                }
            },
            {
                test: /\.js?$/,
                include: [
                    path.resolve(__dirname, 'client/scripts')
                ],
                loader: 'babel-loader',
                query: {
                    presets: ['env']
                }
            },
            {
                test: /\.css$/, 
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    }
}
module.exports = config;