require('babel-polyfill');

/* eslint default-case:0 */
const path = require('path');
const unipath = require('unipath');
const glob = require('glob');
const webpack = require('webpack');

const DEVELOPMENT = 'development';
const PRODUCTION = 'production';

module.exports = (env = 'development', overrides = {}) => {
  const PATH = getPath();
  const { ENV, ENV_IS, DEBUG } = getEnv(env);
  const config = {};

  config.entry = getEntry({ PATH });
  config.output = getOutput({ PATH });
  config.module = {
    preLoaders: getPreLoaders(),
    loaders: getLoaders(),
  };
  config.plugins = getPlugins({ ENV });

  config.devtool = ENV_IS.PRODUCTION ? 'source-map' : 'inline-source-map';
  config.cache = DEBUG;
  config.debug = DEBUG;
  config.target = 'web';
  config.progress = 'true';

  return Object.assign({}, config, overrides);
};

function getEntry({ PATH }) {
  return glob.sync('*.js', { matchBase: true, cwd: PATH.babel() })
    .reduce((files, file) =>
      Object.assign({}, files, {
        [path.basename(file, '.js')]: PATH.babel(file),
      }), {});
}

function getOutput({ PATH }) {
  const output = {};

  output.path = PATH.scripts();
  output.pathinfo = true;
  output.filename = '[name].js';
  output.sourceMapFilename = '[name].map';
  output.sourcePrefix = '    ';

  return output;
}
function getPreLoaders() {
  const preLoaders = [];

  preLoaders.push({
    test: /\.js$/,
    exclude: /\node_modules/,
    loader: 'eslint',
  });
}

function getLoaders() {
  const loaders = [];

  loaders.push({
    test: /\.js$/,
    exclude: /\node_modules/,
    loader: 'babel?cacheDirectory',
  });

  return loaders;
}

function getPlugins({ ENV, DEBUG }) {
  const plugins = [];

  plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(ENV),
  }));

  switch (ENV) {
    case DEVELOPMENT:
      break;

    case PRODUCTION:
      if (!DEBUG) plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }));

      plugins.push(new webpack.optimize.AggressiveMergingPlugin());
      plugins.push(new webpack.optimize.DedupePlugin());
      break;
  }

  return plugins;
}

function getPath() {
  return {
    base: unipath(__dirname),
    app: unipath(__dirname, 'app'),
    dist: unipath(__dirname, 'dist'),
    babel: unipath(__dirname, 'app', 'scripts.babel'),
    scripts: unipath(__dirname, 'app', 'scripts'),
  };
}

function getEnv(env) {
  const ENV = env;
  const ENV_IS = {
    PRODUCTION: ENV === PRODUCTION,
    DEVELOPMENT: ENV === DEVELOPMENT,
  };
  const DEBUG = process.argv.includes('--debug');
  const VERBOSE = process.argv.includes('--verbose');
  return { ENV, ENV_IS, DEBUG, VERBOSE };
}
