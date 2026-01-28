const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
    entry: slsw.lib.entries,
    target: 'node',

    // Generate sourcemaps for proper error messages
    devtool: 'source-map',

    // Resolve extensions
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },

    // Output configuration
    output: {
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js',
    },

    // Externals - don't bundle node_modules
    externals: [
        nodeExternals({
            allowlist: [
                // Add any packages that need to be bundled
            ],
        }),
    ],

    // Module rules
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    transpileOnly: true,
                    experimentalWatchApi: true,
                },
            },
        ],
    },

    // Optimization
    optimization: {
        minimize: false, // Lambda doesn't benefit much from minification
    },

    // Performance hints
    performance: {
        hints: false,
    },

    // Plugins
    plugins: [],
};
