// Metro config — NativeWind v4 (pola resmi nativewind.dev/get-started + docs.expo.dev/guides/tailwind).
// withNativeWind WAJIB: tanpa ini global.css tidak dikompilasi Tailwind dan
// semua className styling di-no-op secara diam-diam (bug yang membuat UI
// tampil tanpa warna/warna teks default hitam).
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname, {
  // Jangan disable CSS — dibutuhkan NativeWind/Tailwind.
  isCSSEnabled: true,
});

module.exports = withNativeWind(config, { input: './global.css' });
