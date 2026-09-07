#!/usr/bin/env node
/**
 * patch-expo-notifications.js — postinstall patch untuk expo-notifications.
 *
 * Latar: Expo Go Android (SDK 53+) menghapus remote push. Dua crash yang
 * muncul di splash screen SEBELUM kode aplikasi jalan:
 *
 * 1. warnOfExpoGoPushUsage() melempar Error di Expo Go Android. Module
 *    side-effect DevicePushTokenAutoRegistration.fx.js memanggil
 *    addPushTokenListener() saat import -> throw -> crash.
 *    FIX: throw -> console.warn.
 *
 * 2. TopicSubscriptionModule.android.js memanggil requireNativeModule(
 *    'ExpoTopicSubscriptionModule') saat IMPORT (index -> topicSubscription),
 *    tapi Expo Go tidak membawa module native itu ->
 *    "Cannot find native module 'ExpoTopicSubscriptionModule'".
 *    FIX: redirect ke stub no-op (identik .web.js).
 *
 * Kedua fungsi tetap berfungsi penuh di development/production build (EAS).
 * Kode aplikasi kita juga guard remote push via isRunningInExpoGo().
 *
 * Dipanggil otomatis via "postinstall" di package.json.
 */
const fs = require('fs');
const path = require('path');

const pkgRoot = path.join(__dirname, '..');
const buildDir = path.join(pkgRoot, 'node_modules', 'expo-notifications', 'build');
const MARKER = 'PATCHED by scripts/patch-expo-notifications.js';

if (!fs.existsSync(buildDir)) {
  console.log('[patch-expo-notifications] expo-notifications not installed, skipping');
  process.exit(0);
}

// ---------- PATCH 1: warnOfExpoGoPushUsage: throw -> console.warn ----------
const warnTarget = path.join(buildDir, 'warnOfExpoGoPushUsage.js');
if (!fs.existsSync(warnTarget)) {
  console.log('[patch-expo-notifications] warnOfExpoGoPushUsage.js not found, skipping patch 1');
} else {
  const original = fs.readFileSync(warnTarget, 'utf8');
  if (original.includes(MARKER)) {
    console.log('[patch-expo-notifications] patch 1 (warnOfExpoGoPushUsage) already applied');
  } else {
    const throwBlock = `        if (Platform.OS === 'android') {\n            throw new Error(message);\n        }`;
    const warnBlock = `        // ${MARKER}:
        // do NOT throw in Expo Go Android — the side-effect module
        // (DevicePushTokenAutoRegistration.fx.js) calls addPushTokenListener
        // at import time, and throwing here crashes the app on the splash
        // screen before app code runs. Remote push stays unavailable in
        // Expo Go (guarded in app code); local notifications keep working.
        if (Platform.OS === 'android') {\n            console.warn(message);\n        }`;
    if (!original.includes(throwBlock)) {
      console.error('[patch-expo-notifications] patch 1: expected throw block not found — expo-notifications version may have changed. Review manually.');
      process.exit(1);
    }
    fs.writeFileSync(warnTarget, original.replace(throwBlock, warnBlock));
    console.log('[patch-expo-notifications] patch 1 applied: warnOfExpoGoPushUsage throw -> console.warn');
  }
}

// ---------- PATCH 2: TopicSubscriptionModule.android.js -> no-op stub ----------
const topicTarget = path.join(buildDir, 'TopicSubscriptionModule.android.js');
if (!fs.existsSync(topicTarget)) {
  console.log('[patch-expo-notifications] TopicSubscriptionModule.android.js not found, skipping patch 2');
} else {
  const topicOriginal = fs.readFileSync(topicTarget, 'utf8');
  if (topicOriginal.includes(MARKER)) {
    console.log('[patch-expo-notifications] patch 2 (TopicSubscriptionModule) already applied');
  } else {
    // Simpan file asli agar implementasi nyata tetap ada untuk build EAS.
    fs.writeFileSync(topicTarget.replace('.android.js', '.android.original.js'), topicOriginal);
    const noopStub = `// ${MARKER}:
// Expo Go does not include the native ExpoTopicSubscriptionModule, and this
// file is evaluated at import time (index -> topicSubscription), crashing the
// app with "Cannot find native module". Use the no-op stub (identical to
// .web.js) instead. The original implementation is preserved in
// TopicSubscriptionModule.android.original.js for dev/production builds.
const module = {
    addListener: () => { },
    removeListeners: () => { },
    subscribeToTopicAsync: () => {
        return Promise.resolve(null);
    },
    unsubscribeFromTopicAsync: () => {
        return Promise.resolve(null);
    },
};
export default module;
`;
    fs.writeFileSync(topicTarget, noopStub);
    console.log('[patch-expo-notifications] patch 2 applied: TopicSubscriptionModule.android.js -> no-op stub');
  }
}
