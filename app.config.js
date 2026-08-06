/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    version: '1.0.2',
    plugins: [...(appJson.expo.plugins ?? [])],
  },
};
