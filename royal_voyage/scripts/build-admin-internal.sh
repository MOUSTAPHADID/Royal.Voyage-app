#!/usr/bin/env bash
set -euo pipefail
pnpm install
pnpm check
npx expo-doctor
eas build --platform android --profile admin-internal
