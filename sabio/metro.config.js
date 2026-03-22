const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const nativeOnlyPackages = [
  '@livekit/react-native',
  '@livekit/react-native-webrtc',
  'react-native-webrtc',
];

const stubPath = path.resolve(__dirname, 'web-stubs/empty.js');
const elevenlabsStubPath = path.resolve(__dirname, 'web-stubs/elevenlabs.js');

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && (moduleName === '@elevenlabs/react-native' || moduleName.startsWith('@elevenlabs/react-native/'))) {
    return { type: 'sourceFile', filePath: elevenlabsStubPath };
  }
  if (platform === 'web' && nativeOnlyPackages.some((pkg) => moduleName === pkg || moduleName.startsWith(pkg + '/'))) {
    return { type: 'sourceFile', filePath: stubPath };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
