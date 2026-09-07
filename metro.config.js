// Metro config — tambahkan CSS support untuk NativeWind (pola resmi
// docs.expo.dev/guides/tailwind + nativewind.dev).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, {
  // Jangan disable CSS — dibutuhkan NativeWind/Tailwind.
  isCSSEnabled: true,
});

module.exports = config;
