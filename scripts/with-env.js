#!/usr/bin/env node
/**
 * with-env.js — memuat file .env pilihan lalu menjalankan command berikutnya.
 * Pemakaian: node scripts/with-env.js .env.dev <command...>
 *
 * Expo CLI otomatis membaca variabel EXPO_PUBLIC_* dari process env
 * (https://docs.expo.dev/guides/environment-variables/), jadi cukup
 * inject ke process.env sebelum spawn.
 *
 * Prioritas: variabel yang SUDAH ada di shell menang (tidak dioverride).
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const [envFile, ...command] = process.argv.slice(2);

if (!envFile || command.length === 0) {
  console.error('Usage: node scripts/with-env.js <.env-file> <command...>');
  process.exit(1);
}

const envPath = path.resolve(__dirname, '..', envFile);
if (!fs.existsSync(envPath)) {
  console.error(`Env file not found: ${envPath}`);
  process.exit(1);
}

for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim();
  if (!(key in process.env)) {
    process.env[key] = value;
  }
}

const child = spawn(command[0], command.slice(1), {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});
child.on('exit', (code) => process.exit(code ?? 1));
