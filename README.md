# MacroFlow for Android

**Your nutrition. Your rhythm.**

An Android nutrition tracker combining easy meal logging with data-guided nutrition planning. Built with React, TypeScript, and Capacitor.

## Download on your phone

**[Download MacroFlow for Android](https://github.com/raclob/Macroflow/raw/refs/heads/downloads/macroflow-debug.apk)**

The public download works without a GitHub account. You can also use the [APK file page](downloads/macroflow-v1.0.0-preview.1.apk) or the [Android Preview release page](https://github.com/raclob/Macroflow/releases/tag/v1.0.0-preview.1). GitHub's **Code → Download ZIP** includes the versioned APK in `downloads/` on the default branch.

1. Download the APK on your Android phone.
2. Open it and allow installation from your browser or file manager if Android asks.
3. Launch **MacroFlow**, then tap **Make it yours** to set up your own diary and targets.

Requires Android 6.0 or newer and a current Android System WebView. This signed development preview still needs physical-device acceptance testing and release signing before store publication.

## What you can do

- Log meals with fractional portions, favorites, recent foods, and custom foods.
- Look up foods by entering a barcode number through Open Food Facts.
- Track calories, macros, water, and body weight.
- Explore weight trends and intake charts.
- Review weekly calorie suggestions based on completed diary days and weigh-ins.
- Export and restore JSON backups, including the original Fuel prototype's backups.

The app starts with a clearly labeled demo. Your personal diary stays on your device. Meal logging works offline; barcode lookup uses the internet.

## Source and documentation

| Folder                     | Contents                                                         |
| -------------------------- | ---------------------------------------------------------------- |
| [`app/`](app/)             | Application source, Android project, assets, and tests           |
| [`docs/`](docs/)           | Build instructions, nutrition model, privacy, and preview status |
| [`downloads/`](downloads/) | Installable versioned Android preview APK                        |
| [`.github/`](.github/)     | Automated app checks and Android builds                          |

Read the [build guide](docs/BUILD.md), [nutrition model](docs/NUTRITION.md), [privacy notes](docs/PRIVACY.md), and [preview status](docs/STATUS.md).

For local development:

```sh
cd app
npm ci
npm run dev
```

Successful [GitHub Actions builds](https://github.com/raclob/Macroflow/actions) also provide a **MacroFlow-debug** artifact. Extract its ZIP to find `app-debug.apk`.
