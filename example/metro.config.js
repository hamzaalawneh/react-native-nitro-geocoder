const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const root = path.resolve(__dirname, '..');
const packagePath = path.resolve(root);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [root],
  resolver: {
    extraNodeModules: new Proxy(
      {
        'react-native-nitro-geocoder': packagePath,
      },
      {
        get: (target, name) => {
          if (target[name]) {
            return target[name];
          }
          return path.join(__dirname, 'node_modules', name);
        },
      }
    ),
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(root, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
