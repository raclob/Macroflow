# Privacy and backups

Personal logs live in the app's WebView local storage. There are no accounts, subscriptions, cloud synchronization, or app-owned servers. Android automatic backup and device-transfer backup are disabled so logs are not implicitly uploaded.

Meal logging works offline. Barcode lookup sends the entered barcode to Open Food Facts; the diary and weight history are not sent with it.

Export a JSON backup through Settings before reinstalling, clearing app data, or changing phones. Android export uses the system share sheet, so the destination you choose receives the backup. Imported data is validated before restoration. The clearly labeled sample diary is kept separate from personal logs.

## Moving from Fuel

MacroFlow's Android application ID is `com.raclob.macroflow`. Export your diary from the original Fuel app, install MacroFlow, and restore the JSON file through Settings. The backup format remains compatible. Browser users retain data through migration from the previous storage keys.
