var path = require("path");

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist/js/'),
        filename: 'SimpleSlider.js',
        library: 'SimpleSlider'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)|(dist)/,
                loader: "babel-loader",
                options: {
                    presets: ['env']
                }
            }
        ]
    }
};
