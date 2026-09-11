const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const keepAwakeStub = path.resolve(__dirname, 'stubs/expo-keep-awake.js');

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-keep-awake') {
    return { type: 'sourceFile', filePath: keepAwakeStub };
  }

  // markdown-it (via react-native-markdown-display) requires Node's "punycode".
  // RN has no Node stdlib — resolve the npm polyfill instead.
  if (moduleName === 'punycode') {
    return {
      type: 'sourceFile',
      filePath: require.resolve('punycode/'),
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
