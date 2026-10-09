# Android preview status

## Verified

- Production TypeScript and Vite build.
- 14 unit tests for accounting, adaptive thresholds and bounds, smoothing, and backup validation.
- Production browser flows covering onboarding, portions, favorites, custom foods, deletion, diary completion, water, weight, persistence, backup export/import, demo isolation, and applying a weekly check-in.
- All four app views checked at 360, 393, 768, and 1,440 px without horizontal overflow or runtime errors.
- Barcode UI checks for successful and unknown-product responses; live Open Food Facts response verified.
- Android debug APK compilation, lint, and signature inspection.

No physical Android device or emulator was available in the build environment. Native sharing, keyboard interaction, and device behavior still need acceptance testing.

## Current scope

The preview uses kg, kcal, manual initial targets, 20 starter foods, and barcode-number entry. Health Connect, exercise imports, camera scanning, recipe composition, cloud accounts, and a commercial branded-food database are outside this preview.

The app bundles DM Sans under the SIL Open Font License in `app/public/fonts/OFL.txt`. Open Food Facts attribution is shown in the barcode lookup flow.
