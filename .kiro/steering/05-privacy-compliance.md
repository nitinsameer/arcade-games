# Arcade Games: Privacy & Compliance Framework

## Google Play Families Policy (COPPA Compliance)

### Age Targeting: Kids 4–8
- **Intended Audience:** Primary school children
- **Content Rating:** All Ages (Green/Approved)
- **Special Handling:** COPPA-compliant (no personal data beyond username)

### Prohibited Features
**Never add without explicit compliance review:**
- ❌ Third-party tracking (Google Analytics, Firebase Analytics with ID tracking)
- ❌ Social features (chat, multiplayer with player IDs, leaderboards with names)
- ❌ Exiting to external web (no web links, no YouTube embeds)
- ❌ Personal data collection (email, phone, address, location)
- ❌ Persistent user IDs shared outside app
- ❌ Behavioral advertising (targeted ads based on activity)
- ❌ User-generated content (comments, profiles, custom avatars from camera)
- ❌ In-app purchases without explicit parent consent
- ❌ Selling or sharing user data
- ❌ Microphone/camera access

### Permitted Features
- ✅ Local app state (name, progress, highscores in localStorage)
- ✅ First-party ads (Google Test AdMob IDs only, no personalization)
- ✅ Theme customization
- ✅ Sound/music control
- ✅ Offline gameplay (all content pre-loaded)
- ✅ Basic error reporting (non-personalized crash logs)

## Parental Consent & Age Gating

### Current Implementation
- **Age selection:** Part of onboarding flow
- **Consent model:** Silent feature flag (automatic consent during age selection)
- **No UI:** Parent/guardian consent is implied by age selection
- **Documentation:** Built-in privacy notice (non-persistent)

### When Adding Features
1. **Check:** Does feature collect/use personal data?
   - If YES → Requires explicit parental consent UI
   - If NO → Proceed with development
2. **Store:** Parental consent flag in state: `S.parentConsent = true`
3. **Verify:** Consent stored before feature activates
4. **Audit:** Code review must verify compliance

### Example: Hypothetical Cloud Save Feature
```javascript
// ❌ Bad: Saves data without consent
const saveToCloud = (data) => {
  fetch('https://backend.nishaan.com/save', { method: 'POST', body: JSON.stringify(data) });
};

// ✅ Good: Checks consent, persists locally only
const saveState = (data) => {
  if (S.parentConsent !== true) {
    console.warn('Parental consent required for cloud sync');
    return;
  }
  // Proceed with sync (but keep local copy as fallback)
};
```

## Data Handling & Storage

### Local Storage (Current)
- **Data:** `localStorage.claylearn` (JSON)
- **Contains:** Name, theme, sound settings, progress, scores
- **Lifetime:** Until app uninstall or "Reset Profile" button
- **Security:** Stored in app sandbox (Android), encrypted at rest by OS
- **No PII:** No email, phone, address, device ID, or IDFA

### What NOT to Store
- Email addresses or contact info
- Device identifiers (IMEI, Android ID, GAID)
- IP addresses
- Device model/OS version (for fingerprinting)
- Behavior analytics (session duration, feature usage)
- External user IDs or tokens

### Future Cloud Storage (If Implemented)
1. **Require parental consent UI** (visible, confirmed)
2. **Encrypt data in transit** (HTTPS only)
3. **Encrypt data at rest** (server-side encryption)
4. **Implement data deletion** (user-initiated, 30-day purge)
5. **Document retention policy** (explicit timeline)
6. **No data sharing** (internal use only)
7. **Audit logging** (track all access)

## Ad Management

### Current Implementation
- **AdMob Test IDs:** `ca-app-pub-3940256099942544~3347511713` (app) and rewarded unit
- **Ad Format:** Rewarded video only (no banner, interstitial, or native ads)
- **Behavior:** Opt-in; player initiates ad watch for coins
- **Personalization:** OFF (Google policy requires G-rated + child-directed flags)
- **Frequency Cap:** 8 ads max per day, 20-second cooldown

### Before Publishing to Play Store
1. **Create AdMob Account** → https://admob.google.com
2. **Add App** → Mark as "Kids" category
3. **Create Rewarded Unit** → Get production unit ID
4. **Update Build:**
   ```javascript
   // In www/index.html, find: const ADS={...}
   const ADS = {
     rewardedId: 'ca-app-pub-XXXX/YYYY',  // Your rewarded unit ID
     testing: false,  // Set to false for production
   };
   ```
5. **Update CI/CD** → Set `ADMOB_APP_ID` in GitHub Actions secrets
6. **Configure AdMob:**
   - Mark app as child-directed in AdMob settings
   - Enable "Content rating" → All Ages
   - Ensure G-rated ad requests only

### Ad Request Headers (Automatic)
App sends Google required headers:
```javascript
// Pseudo-code; Web Audio context includes:
// "is_tagged_for_kids": true
// "content_rating": "G"
// "keywords": "educational"
```

## Permissions (Android Manifest)

### Current Permissions
```xml
<!-- Required by Capacitor & AdMob -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Never Request
- ❌ `RECORD_AUDIO` (even if "no microphone used")
- ❌ `CAMERA` (even if "no camera used")
- ❌ `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`
- ❌ `READ_CONTACTS` / `GET_ACCOUNTS`
- ❌ `READ_CALENDAR`
- ❌ `READ_SMS` / `SEND_SMS`
- ❌ `CHANGE_WIFI_STATE` / `MODIFY_PHONE_STATE`

**Note:** Declaring unused permissions violates Google Play policy and increases rejection risk.

## Content Policy Compliance

### Allowed Content
- ✅ Educational subjects (math, science, reading, etc.)
- ✅ Cartoon/emoji art style
- ✅ Sound effects and background music
- ✅ Themes/visual customization
- ✅ Highscores and progress tracking
- ✅ Age-appropriate difficulty levels

### Prohibited Content
- ❌ Profanity or offensive language (any language)
- ❌ Violence or weapons
- ❌ Alcohol, tobacco, drugs
- ❌ Sexual or suggestive content
- ❌ Gambling or loot boxes (randomized paid items)
- ❌ Misleading health/medical claims
- ❌ Hate speech or discrimination

### Content Audit Before Submission
1. **Quiz questions:** Verify all text is age-appropriate
2. **Game assets:** Check emoji/images for hidden meanings
3. **Story content:** Ensure no disturbing themes
4. **Audio:** Listen to all sound effects for appropriateness

## Crash & Error Reporting

### Current Implementation
- **No remote reporting** (no crashes sent to servers)
- **Local logs only** (browser console in dev, silent on device)

### If Adding Crash Reporting (Future)
```javascript
// ✅ Good: Non-personalized crash report
window.addEventListener('error', (event) => {
  const report = {
    message: event.message,
    stack: event.error?.stack,
    timestamp: new Date().toISOString(),
    // NO: user ID, device ID, location, or behavior data
  };
  
  // Send to Crash Analytics (Firebase Crashlytics has COPPA settings)
  // Requires: S.parentConsent === true
});
```

## Code Review Checklist for Privacy

- [ ] No personal data collection without explicit consent
- [ ] All user input sanitized (no PII in error messages)
- [ ] Ad requests include Google-required headers
- [ ] No third-party tracking libraries integrated
- [ ] No social sharing features (Twitter, Facebook links)
- [ ] No external web navigation (all links, if any, go to policy page)
- [ ] No persistent user IDs shared outside app
- [ ] Sound/notifications respect parental controls
- [ ] No forced data sharing (opt-in only)
- [ ] Permissions only match declared functionality

## Documentation & Policies

### App Store Description (Play Store)
```
Style Lab: Fun learning games for kids 4-8.

Master 12 subjects through interactive games and lessons.
Earn coins, unlock themes, and build your skills.

- No ads (except optional rewarded videos)
- No personal data collection
- No social features
- 100% offline-capable
- COPPA-compliant
```

### Privacy Policy (Required for Play Store)
Create a simple one-page policy covering:
1. **Data we collect:** App state only (name, progress, scores)
2. **How we use it:** To save progress locally
3. **Third parties:** Google Play, AdMob (test IDs)
4. **Parental rights:** Easy reset button, data deletion on uninstall
5. **Contact:** Your contact email

**Hosted at:** GitHub Pages or similar (link in Play Store listing)

### Terms of Service (Optional but Recommended)
Simple terms covering:
- App is provided "as-is"
- No warranty for data loss (user responsible for backups)
- Reserves right to add features or monetization
- COPPA compliance statement

## Compliance Checklist for Launch

Before uploading to Play Store:

**Content & Features:**
- [ ] All quiz questions reviewed (no inappropriate content)
- [ ] All emoji/images age-appropriate
- [ ] No exit buttons to external web (unless policy link)
- [ ] No social sharing (no Twitter/Facebook/email buttons)
- [ ] Sound effects appropriate for kids

**Data & Privacy:**
- [ ] No personal data collected beyond username & progress
- [ ] No tracking libraries (Google Analytics, Facebook SDK)
- [ ] No remote data transmission (except optional ads)
- [ ] ParentCare reset button functional
- [ ] Privacy policy written and linked

**Ads & Monetization:**
- [ ] AdMob test IDs replaced with production IDs
- [ ] Rewarded ad only (no banners/interstitials)
- [ ] Ads marked as child-directed in AdMob
- [ ] Max 8 ads per day enforced

**Permissions:**
- [ ] No unused permissions declared
- [ ] No camera/microphone permissions
- [ ] Only INTERNET + ACCESS_NETWORK_STATE

**Technical:**
- [ ] Min SDK = 23
- [ ] Target SDK = 34 (or latest)
- [ ] No console errors
- [ ] All games playable end-to-end
- [ ] Tested on Android 6.0+ devices

## Reporting Compliance Issues

If you discover a potential compliance violation:
1. **Stop deployment** (do not release APK)
2. **Document issue** (screenshot, user flow, code location)
3. **Review with lead** (arcade-lead agent)
4. **Fix before resubmission** (do not force through)
5. **Re-audit** (full compliance checklist)

**Rejection reasons to avoid:**
- Contains or requests unrequired permissions
- Collects personal information without notice
- Not listed as Kids category
- Exiting to external website
- Gambling, loot boxes, or randomized purchases
- Using prohibited SDKs (Google Analytics with user ID)
