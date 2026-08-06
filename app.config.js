/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';

module.exports = {
  expo: {
    ...appJson.expo,
    version: '1.0.1',
    android: {
      ...appJson.expo.android,
      config: {
        ...(appJson.expo.android?.config ?? {}),
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    plugins: [
      ...(appJson.expo.plugins ?? []),
      ...(googleMapsApiKey
        ? [
            [
              'react-native-maps',
              {
                googleMapsApiKey,
              },
            ],
          ]
        : []),
    ],
  },
};
