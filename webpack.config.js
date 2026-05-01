const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const babelConfig = {
  presets: [
    ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] }, modules: 'commonjs' }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: ['react-native-web', '@babel/plugin-transform-runtime'],
};


module.exports = {
  entry: './index.web.js',
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  experiments: {
    topLevelAwait: true,
  },
  resolve: {
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx'],
    alias: {
      'react-native$': 'react-native-web',
      '@react-native-community/geolocation': path.resolve(__dirname, 'src/shims/geolocation.web.js'),
      '@react-native-community/datetimepicker': path.resolve(__dirname, 'src/shims/datetimepicker.web.js'),
      'react-native-svg': path.resolve(__dirname, 'src/shims/svg.web.js'),
      '@react-native-firebase/app': path.resolve(__dirname, 'src/shims/firebase-app.web.js'),
      '@react-native-firebase/auth': path.resolve(__dirname, 'src/shims/firebase-auth.web.js'),
      'react-native-video': path.resolve(__dirname, 'src/shims/video.web.js'),
      'react-native-reanimated': path.resolve(__dirname, 'src/shims/reanimated.web.js'),
      'react-native-gesture-handler': path.resolve(__dirname, 'src/shims/gesture-handler.web.js'),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'node_modules/@react-native-async-storage/async-storage/lib/commonjs/index.js'),
    },
  },
  module: {
    rules: [
      // Force webpack to treat react-navigation ESM files as regular JS (not native ESM)
      {
        test: /\.js$/,
        include: /node_modules\/@react-navigation/,
        type: 'javascript/auto',
        use: { loader: 'babel-loader', options: babelConfig },
      },
      {
        test: /\.(js|mjs|ts|tsx)$/,
        use: { loader: 'babel-loader', options: babelConfig },
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'index.web.js'),
          path.resolve(__dirname, 'App.tsx'),
          path.resolve(__dirname, 'node_modules/react-native'),
          path.resolve(__dirname, 'node_modules/react-native-web'),
          path.resolve(__dirname, 'node_modules/@react-native'),
          path.resolve(__dirname, 'node_modules/@react-navigation'),
          path.resolve(__dirname, 'node_modules/react-native-screens'),
          path.resolve(__dirname, 'node_modules/react-native-safe-area-context'),
          path.resolve(__dirname, 'node_modules/react-native-reanimated'),
          path.resolve(__dirname, 'node_modules/react-native-gesture-handler'),
          path.resolve(__dirname, 'node_modules/react-native-worklets'),
          path.resolve(__dirname, 'node_modules/react-native-svg'),
          path.resolve(__dirname, 'node_modules/react-native-element-dropdown'),
          path.resolve(__dirname, 'node_modules/react-native-responsive-screen'),
          path.resolve(__dirname, 'node_modules/react-native-sse'),
        ],
      },
      {
        test: /\.(png|jpg|gif|ttf|otf|mp4)$/,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/,
        use: [{
          loader: '@svgr/webpack',
          options: {
            dimensions: false,
            svgoConfig: { plugins: [{ name: 'removeViewBox', active: false }] },
          },
        }],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    static: { directory: path.resolve(__dirname, 'public') },
  },
  ignoreWarnings: [/export .* was not found in/],
};
