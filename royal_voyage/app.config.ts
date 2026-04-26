import type { ExpoConfig } from "expo/config";

// ─── APP_VARIANT Configuration ───────────────────────────────────────────────
// Support for public and admin app variants
const appVariant = process.env.APP_VARIANT || "public";

// ─── Variant-specific Configuration ──────────────────────────────────────────
const variantConfig = {
  public: {
    appName: "Royal Voyage",
    appSlug: "royal_voyage",
    bundleId: "com.royalvoyage.app",
    scheme: "royalvoyage",
    description: "Travel booking app for customers and agencies",
  },
  admin: {
    appName: "Royal Voyage Admin",
    appSlug: "royal_voyage_admin",
    bundleId: "com.royalvoyage.admin",
    scheme: "royalvoyageadmin",
    description: "Internal admin app for staff and management",
  },
};

const selectedVariant = variantConfig[appVariant as keyof typeof variantConfig] || variantConfig.public;

const env = {
  // App branding
  appName: selectedVariant.appName,
  appSlug: selectedVariant.appSlug,
  bundleId: selectedVariant.bundleId,
  scheme: selectedVariant.scheme,
  logoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663457917822/dCSeDyLMxwR8uDkjtk8yd3/icon_37ebad54.png",
  iosBundleId: selectedVariant.bundleId,
  androidPackage: selectedVariant.bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.1.23",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSMicrophoneUsageDescription:
        "Royal Voyage uses the microphone for voice search only. No audio is stored or transmitted.",
      NSPhotoLibraryUsageDescription:
        "Royal Voyage needs access to your photo library to upload payment receipts and partner logos.",
      NSCameraUsageDescription:
        "Royal Voyage needs camera access to capture payment receipts.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.RECORD_AUDIO",
      "android.permission.CAMERA",
      "android.permission.READ_MEDIA_IMAGES",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-local-authentication",
      {
        faceIDPermission: "Allow $(PRODUCT_NAME) to use Face ID for admin access.",
      },
    ],
    [
      "expo-audio",
      {
        microphonePermission:
          "Allow $(PRODUCT_NAME) to access your microphone for voice search.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-notifications",
      {
        sounds: ["./assets/sounds/new_booking.wav"],
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
        },
      },
    ],
    "./plugins/with-android-no-backup.js",
    "./plugins/with-android-remove-permissions.js",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "bf60c4dc-0160-45ce-904a-3279fbbfa3bd",
    },
    appVariant,
  },
};

export default config;
