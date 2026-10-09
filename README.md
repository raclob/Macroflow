# MacroFlow for Android

**Your nutrition. Your rhythm.**

An original, local-first nutrition app combining easy meal logging with data-guided nutrition planning. Built with React, TypeScript, and Capacitor; packaged as an Android app with bundled assets and fonts.

## Install

Download `macroflow-debug.apk` from the build shared with this project, or download the **MacroFlow-debug** artifact from a successful [GitHub Actions run](https://github.com/raclob/Macroflow/actions). Extract the artifact ZIP to find `app-debug.apk`. Transfer the APK to an Android phone (Android 6.0 or newer), open it, and allow installation from your file browser when Android asks. This is a signed development APK for trying the app; Play Store publication requires a release build signed with your own key.

The app opens a clearly labeled sample diary. Tap **Make it yours** to enter your name, goals, and initial calorie/macronutrient targets. Sample logs never become personal logs. You can explore the demo again through Settings and return to your own diary.

## Features

- Daily calorie ring, macro targets, and remaining nutrients.
- Date-based meal diary with fractional portions, favorites, recent foods, and custom foods.
- Twenty starter foods with estimated serving nutrition.
- Manual barcode-number lookup through Open Food Facts, including nutrition completeness checks. No camera scanner is included.
- Water logging in 250 ml increments and weight entries in kg.
- Weight charts for 7, 28, and 90 days, smoothed trend, and daily intake charts.
- Weekly check-in with estimated expenditure and a reviewable calorie suggestion.
- Local persistence, JSON backup export through Android's share sheet, and validated backup restore.
- Native Android back behavior, branded icon and splash screen, phone/tablet layouts, keyboard focus handling, and reduced-motion support.

## How the plan works

A check-in needs 14 completed intake days and at least 4 weigh-ins spanning 14 days during the previous 28 days. Today's intake is excluded. Complete a day in the diary when all meals are logged.

The estimator fits a linear trend to recorded weights. It computes expenditure as mean completed-day calories minus the daily weight slope multiplied by 7,700 kcal/kg. It then uses a modest goal adjustment: minus 300 kcal for loss, plus 200 for gain, zero for maintenance. Changes are capped at 100 kcal per weekly check-in; calorie targets stay within 1,200–5,000 and must accommodate the protein target. Protein stays steady and fat is reduced if necessary. This is a transparent prototype estimator, not MacroFactor's proprietary algorithm or a measured metabolic rate.

## Upgrading the original Fuel prototype

MacroFlow uses the Android application ID `com.raclob.macroflow`. If you installed the original Fuel APK, export your diary from Fuel, install MacroFlow, then restore the JSON backup through Settings. The existing backup format is compatible. Browser users keep their existing data through a migration from the previous storage keys.

## Continuous integration

GitHub Actions runs formatting checks, unit tests, production browser flows, Android compilation, and Android lint on pushes and pull requests. Successful Android runs provide a signed development APK as the **MacroFlow-debug** artifact. No publishing credentials are needed. Store releases require your own signing key.

## Privacy and scope

Logs live in the app's WebView local storage. Export before reinstalling or clearing app data. Android automatic backup is disabled so logs are not implicitly uploaded. There is no account, subscription, server, or synchronization. Barcode lookup sends the barcode to Open Food Facts. No other network access is needed after installation.

This MVP uses kg and kcal and manual initial targets. It does not include Health Connect, exercise imports, camera scanning, recipe composition, cloud accounts, or a commercial branded-food database. Adaptive estimates can be affected by incomplete logging and short-term weight changes. Starter food and community barcode values should be checked against packaging.

## Development

Requirements: Node 20+, JDK 21, Android SDK platform 35 and build tools 35.0.0.

```sh
npm ci
npm run dev
npm test
npm run android:sync
cd android
./gradlew assembleDebug
```

Set `ANDROID_HOME` to your SDK or add `sdk.dir=/absolute/path/to/sdk` to `android/local.properties`. For browser checks, install a browser with `npx playwright install chromium`, then run `npm run test:e2e`. The command builds the app and starts a temporary production preview server automatically. Set `CHROMIUM_PATH` if you prefer a system browser. Use `npm run format:check` to check formatting, and `npm run format` before committing edits.

The generated APK is in `android/app/build/outputs/apk/debug/app-debug.apk`. Open `android/` in Android Studio for emulator/device testing and release signing. This workspace's SDK and JDK caches are excluded from source archives.

## Verification

- Production TypeScript and Vite build.
- 14 unit tests for accounting, adaptive baseline thresholds and bounds, smoothing, and backup validation.
- Browser end-to-end checks: onboarding, portions, favorites, custom foods, deletion, completion, water, weight, persistence, export/import, demo isolation, and applying a weekly check-in.
- Layout checks for all four views at 360, 393, 768, and 1,440 px with no horizontal overflow or runtime errors.
- Barcode lookup UI checks with successful and unknown-product responses; live Open Food Facts API response verified.
- Android debug APK compilation, lint, and signature inspection. No physical Android device or emulator was available in this environment; native share, keyboard, and device behavior still need device acceptance testing.

DM Sans is bundled under the SIL Open Font License (`public/fonts/OFL.txt`). Starter food values are approximate. Open Food Facts attribution and source are identified in the barcode lookup flow.
