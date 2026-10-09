# Build and run

## Requirements

- Node.js 20+; CI uses Node 22.
- JDK 21.
- Android SDK platform 35 and build tools 35.0.0.

Run npm commands from `app/`:

```sh
cd app
npm ci
npm run dev
```

## App verification

```sh
npm run format:check
npm test
npx playwright install chromium
npm run test:e2e
```

The browser command builds the production app and starts a temporary preview server. Set `CHROMIUM_PATH` to use a system browser or `E2E_PORT` to choose another port. Use `npm run format` before committing edits.

## Android APK

Set `ANDROID_HOME` to your SDK directory, or put `sdk.dir=/absolute/path/to/sdk` in `app/android/local.properties`. Set `JAVA_HOME` to your JDK 21 installation.

From `app/`:

```sh
npm run android:sync
cd android
./gradlew assembleDebug lintDebug
```

On Windows, use `gradlew.bat`. The generated APK is `app/android/app/build/outputs/apk/debug/app-debug.apk`, relative to the repository root.

Open `app/android/` in Android Studio for emulator/device acceptance testing and release signing. Store distribution requires your own release signing key. Do not commit signing keys or local SDK configuration.

## Continuous integration and downloads

GitHub Actions runs formatting, unit tests, production browser flows, Android compilation, and Android lint on pushes and pull requests. Successful Android runs provide an APK in the **MacroFlow-debug** artifact.

The `downloads/` folder contains the signed preview APK so a source ZIP also includes an installable app. The public `downloads` branch preserves the stable direct download URL for this preview. The preview release links to that APK because release-asset uploads were unavailable in the build environment.
