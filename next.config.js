const path = require('path');
const merge = require('webpack-merge');
const SRC = path.resolve(__dirname, 'src');

module.exports = {
    devIndicators: {
        autoPrerender: false,
    },
    webpack: (nextWebpackConfig) => merge(nextWebpackConfig, {
        module: {
            rules: [
                {
                    test: /\.(glsl|vs|fs|vert|frag)$/,
                    exclude: /node_modules/,
                    use: ['raw-loader', 'glslify-loader']
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.json'],
            alias: {
                vendor: path.resolve(SRC, 'vendor'),
                data: path.resolve(SRC, 'data'),
                components: path.resolve(SRC, 'components'),
                modules: path.resolve(SRC, 'modules'),
                views: path.resolve(SRC, 'views'),
                utils: path.resolve(SRC, 'utils'),
                styles: path.resolve(SRC, 'styles'),
                stores: path.resolve(SRC, 'stores'),
                assets: path.resolve(__dirname, 'public', 'assets')
            }
        }
    })
};