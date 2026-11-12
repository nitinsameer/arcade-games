# Arcade Games: Android Build Requirements & Process

## Build Environment

### Required Tools
- **Node.js** 20.x (LTS)
- **Java** 17 (OpenJDK via Temurin)
- **Gradle** 8.x (bundled with Capacitor Android project)
- **Android SDK** (installed via Capacitor, no manual setup)
- **Git** (for repository access)

### GitHub Actions Workflow
- Runs on **ubuntu-latest**
- Auto-triggered on push to `main` branch
- Can be manually triggered via workflow_dispatch
- Builds APK in ~5–8 minutes

## Build Steps (Automated in CI)

### 1. Checkout Repository
```bash
actions/checkout@v4
```
Clones the repository and checks out the pushed commit.

### 2. Setup Node
```bash
actions/setup-node@v4
node-version: 20
```
Installs Node.js 20 runtime.

### 3. Setup Java
```bash
actions/setup-java@v4
distribution: temurin
java-version: 17
```
Installs OpenJDK 17.

### 4. Setup Gradle Cache
```bash
gradle/actions/setup-gradle@v4
```
Caches Gradle dependencies to speed up builds.

### 5. Install Dependencies
```bash
npm install
```
Installs Node packages from `package.json`:
- @capacitor/core
- @capacitor/cli
- @capacitor/android
- @capacitor-community/admob

### 6. Add Android Platform
```bash
npx cap add android
```
Creates `android/` directory with Gradle project structure.
- Idempotent; safe to run multiple times
- Generates `android/variables.gradle`, `android/build.gradle`, etc.

### 7. Configure Android Manifest & SDK
```bash
# Add AdMob metadata
sed -i "s#</application>#<meta-data android:name=\"com.google.android.gms.ads.APPLICATION_ID\" android:value=\"${ADMOB_APP_ID}\"/></application>#" android/app/src/main/AndroidManifest.xml

# Set min SDK to 23
sed -i 's/minSdkVersion = 22/minSdkVersion = 23/' android/variables.gradle

# Verify changes
grep -n "APPLICATION_ID" android/app/src/main/AndroidManifest.xml
grep -n "minSdkVersion" android/variables.gradle
```

**Why min SDK 23?**
- Google Play requires SDK 23 or higher as of 2024
- API 23 = Android 6.0 (90%+ device coverage)
- Required for modern Android features and Play Store compliance

### 8. Sync Web Files
```bash
npx cap sync android
```
Copies:
- `www/` → `android/app/src/main/assets/public/`
- Plugins metadata into Android manifest
- Ensures web app and native wrapper are in sync

### 9. Build Debug APK
```bash
chmod +x android/gradlew
cd android
./gradlew assembleDebug
```
Outputs: `android/app/build/outputs/apk/debug/app-debug.apk`

**assembleDebug vs. build:**
- `assembleDebug`: Builds APK only (faster, no testing)
- `build`: Builds APK + runs unit tests (if configured)

### 10. Upload Artifact
```bash
actions/upload-artifact@v4
name: style-lab-apk
path: android/app/build/outputs/apk/debug/app-debug.apk
if-no-files-found: error
```
Makes APK available for download from Actions tab (expires in 90 days).

## Local Build (Without GitHub Actions)

### Prerequisites
```bash
# Install Java 17 (on Windows)
# Download from https://adoptium.net/ or use choco
choco install openjdk17

# Verify
java -version
```

### Build Steps
```bash
# Clone and navigate to repo
git clone https://github.com/nitinsameer/arcade-games.git
cd arcade-games

# Install dependencies
npm install

# Add Android platform
npx cap add android

# Configure (manual)
# 1. Edit android/app/src/main/AndroidManifest.xml manually
# 2. Edit android/variables.gradle (minSdkVersion = 23)

# Sync
npx cap sync android

# Build
cd android
./gradlew assembleDebug
# or (with tests)
./gradlew build

# Find APK
ls android/app/build/outputs/apk/debug/app-debug.apk
```

## Installation on Android Device

### Prerequisites
- Android device with USB debugging enabled
- Android Debug Bridge (adb) installed
- Device connected via USB

### Install APK
```bash
# List connected devices
adb devices

# Install APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.nishaan.stylelab/.MainActivity
```

### Verify Installation
```bash
# Check app package
adb shell pm list packages | grep stylelab

# Check app info
adb shell pm dump com.nishaan.stylelab | grep versionName
```

## Build Troubleshooting

### Problem: `minSdkVersion` too low
**Error:** `App targets Android API 23, but Google Play requires minimum 23`
**Fix:** Update `android/variables.gradle` to `minSdkVersion = 23`

### Problem: AdMob metadata missing
**Error:** `ERROR: Application doesn't declare the required Google Play Services module`
**Fix:** Ensure `sed` command adds `<meta-data>` to AndroidManifest.xml before `</application>`

### Problem: Java version mismatch
**Error:** `Failed to apply plugin 'com.android.application'`
**Fix:** Ensure Java 17 is installed and `JAVA_HOME` is set:
```bash
# Windows
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x

# macOS/Linux
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Problem: Gradle daemon issues
**Error:** `Daemon vm is locked`
**Fix:** Kill Gradle processes:
```bash
./gradlew --stop
# or
pkill -f gradle
```

### Problem: Out of memory during build
**Error:** `java.lang.OutOfMemoryError: GC overhead limit exceeded`
**Fix:** Increase Gradle heap size in `gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m
```

## Capacitor Sync Process

### What `npx cap sync android` Does
1. **Cleans** previous build artifacts
2. **Copies** `www/` directory to Android assets
3. **Updates** native plugins (if any)
4. **Injects** plugin code into AndroidManifest.xml
5. **Regenerates** Gradle files

### When to Sync
- After editing `www/index.html`
- After changing `capacitor.config.json`
- After installing a new Capacitor plugin
- Before every build

### Safe Re-sync
```bash
npx cap sync android
npx cap copy android  # If only copying files
```

## APK Signing (Production Only)

### During Development (Debug Signing)
- Built with default debug key
- Unique per development environment
- Cannot be installed alongside release APK
- OK for internal testing

### Before Production Release
```bash
# Generate keystore (one-time)
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias

# Build signed APK (CI/CD only)
./gradlew assembleRelease -Pandroid.injected.signing.store.file=my-release-key.jks -Pandroid.injected.signing.store.password=... -Pandroid.injected.signing.key.alias=my-key-alias -Pandroid.injected.signing.key.password=...
```

**⚠️ Never commit signing keys to Git**

## Build Configuration Files

### `capacitor.config.json`
Capacitor bridge configuration:
```json
{
  "appId": "com.nishaan.stylelab",
  "appName": "Style Lab",
  "webDir": "www",
  "backgroundColor": "#ece8fb"
}
```
- `appId`: Android package name (reverse domain notation)
- `appName`: Display name in launcher
- `webDir`: Location of web assets
- `backgroundColor`: Splash screen color

### `android/variables.gradle`
Gradle build variables:
```gradle
minSdkVersion = 23          // Min Android API
targetSdkVersion = 34       // Target API (update yearly)
compileSdkVersion = 34      // Compile against API
gradlePluginVersion = 8.2.0
```

### `android/app/src/main/AndroidManifest.xml`
Android permissions and metadata:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<application>
  <activity android:name=".MainActivity" ... />
  <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-3940256099942544~3347511713" />
</application>
```

## Performance & File Size

### APK Size Breakdown (Typical)
- **Capacitor runtime:** ~2 MB
- **WebView assets (www/):** ~50 KB
- **Android framework:** ~1 MB
- **AdMob library:** ~3 MB
- **Total:** ~6–7 MB (unoptimized)

### Optimization Options (Not Currently Applied)
- **ProGuard/R8:** Minify Java code
- **Asset compression:** Reduce image/media size
- **Code splitting:** Not possible with monolithic HTML
- **WebView features:** Disable unused APIs

## Continuous Integration (CI) Pipeline

### Current Workflow
- **Trigger:** Push to `main` or manual dispatch
- **Duration:** 5–8 minutes
- **Artifact:** APK expires in 90 days
- **Logs:** Available in GitHub Actions tab

### Recommended Enhancements (Future)
- Add `develop` branch test builds
- Create signed APK for release
- Add Firebase Crashlytics integration
- Automated Play Store upload

## Testing Before Build

### Pre-Build Validation
```bash
# Check for syntax errors
npm run lint  # (Not configured; could add ESLint)

# Check file structure
ls www/index.html
grep -c "const GAMES" www/index.html  # Should be 1

# Verify dependencies
npm list @capacitor/core  # Should be 6.2.0
```

### Post-Build Verification
```bash
# Check APK exists
ls -lh android/app/build/outputs/apk/debug/app-debug.apk

# Inspect APK contents (zip archive)
unzip -l app-debug.apk | head -20

# Check for assets
unzip -l app-debug.apk | grep "index.html"
```
