# Style Lab – Android app (Capacitor)

Kids learning app: 12 subjects, 15 games (6 two-player), 19 unlockable UI themes.
Earn coins by learning and playing, spend them in the Theme Shop, or watch rewarded ads for coins.
The whole app lives in `www/index.html`.

## Build the APK (no Android Studio needed)
1. Push this repo to GitHub.
2. Actions tab -> "Build Android APK" (runs on every push to main, about 5-8 minutes).
3. Download **style-lab-apk** from the run's Artifacts, unzip, install `app-debug.apk`.

## Ads (Google AdMob, rewarded video)
Currently uses Google TEST ids, so you will see "Test Ad" labels. Before publishing:
1. Create an AdMob account, add the app, create a **Rewarded** ad unit.
2. In `.github/workflows/build-apk.yml` set `ADMOB_APP_ID` to your AdMob App ID (ca-app-pub-XXXX~YYYY).
3. In `www/index.html` find `const ADS={...}` and set `rewardedId` to your Rewarded ad unit id (ca-app-pub-XXXX/ZZZZ) and `testing:false`.
4. In AdMob mark the app as child-directed. The code already sends child-directed + G-rated ad requests.
In a normal browser (no Android) a demo ad screen is shown instead of a real ad.

## Economy (edit in www/index.html)
- Earn: lesson +15, correct quiz answer +5, perfect quiz +10, games up to +30, daily gift 10-30.
- Ads: +50 coins per rewarded ad, max 8 per day, 20 s cooldown (`ADS` and `PRICE` constants).
- Free themes: Claymorphism, Clay Dark, Minimal Flat. Other 16 cost 150-500 coins (`PRICE`).
