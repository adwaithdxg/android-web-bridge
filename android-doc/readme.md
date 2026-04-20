# 📱 Android Web Bridge Integration (React + Android)

## 📌 Overview

This project enables seamless communication between a **React Web App (running inside Android WebView)** and **Android Native modules**.

It supports:

* 📸 Live Photo Capture
* 🎥 Video Recording
* 📍 Geo Location Fetch
* 🔐 JWT Token Retrieval
* 🔁 Native → Web Callback Communication

This document defines the **contract between React and Android**, ensuring both teams implement compatible interfaces.

---

## 🧱 Architecture

```
React (WebView)
     ↓
window.AndroidApp.<method>()
     ↓
AndroidBridge (Java/Kotlin)
     ↓
Native Modules (Camera / Video / Location / Auth)
     ↓
WebView.evaluateJavascript()
     ↓
window.recieve...() (React)
```

---

## 📁 Android Project Structure

```
/bridge/AndroidBridge.java
/camera/CameraActivity.java
/camera/VideoActivity.java
/location/LocationHelper.java
/auth/TokenProvider.java
MainActivity.java
```

---

## 🔌 WebView Setup

### `MainActivity.java`

```java
webView.getSettings().setJavaScriptEnabled(true);

webView.addJavascriptInterface(
    new AndroidBridge(this, webView),
    "AndroidApp"
);

webView.loadUrl("YOUR_WEB_APP_URL");
```

---

## 🔗 JavaScript Interface

### Global Object

```js
window.AndroidApp
```

---

# 📸 1. Capture Live Photo

## 🔹 React Call

```js
window.AndroidApp.captureLivePhoto(JSON.stringify(config));
```

## 🔹 Config Structure

```json
{
  "returnKey": "worker_1",
  "lens": "both",
  "waterMark": {
    "geoLocation": true,
    "accuracy": true,
    "accuracyLimit": 50,
    "staticDatas": [
      { "key": "type", "value": "worker_1" },
      { "key": "date", "value": "ISO_DATE" }
    ]
  }
}
```

---

## 🔹 Android Responsibility

* Parse config
* Open camera
* Capture image
* Upload (S3 / API)
* Return public image URL
* Attach location (if enabled)

---

## 🔹 Callback to React (MANDATORY)

```java
webView.evaluateJavascript(
  "window.recievePhotoFromAndroid('" +
    returnKey + "','" +
    imageUrl + "'," +
    locationJson +
  ")",
  null
);
```

---

## 🔹 React Callback Signature

```js
window.recievePhotoFromAndroid(
  returnKey,
  photoUrl,
  location
);
```

---

# 🎥 2. Capture Video

## 🔹 React Call

```js
window.AndroidApp.captureLiveVideo()
```

## 🔹 Expected Response

```js
videoUrl (string)
```

---

## 🔹 Android Responsibility

* Open video recorder
* Save video locally
* Upload to server
* Return public video URL

---

# 📍 3. Get Geo Location

## 🔹 React Call

```js
window.AndroidApp.getGeoLocation()
```

## 🔹 Expected Response

```json
{
  "latitude": number,
  "longitude": number,
  "accuracy": number
}
```

---

## 🔹 Optional Callback

```java
webView.evaluateJavascript(
  "window.recieveLiveLocationFromAndroid(" + locationJson + ")",
  null
);
```

---

## 🔹 React Callback

```js
window.recieveLiveLocationFromAndroid(location)
```

---

# 🔐 4. Get JWT Token (Authentication Bridge)

## 🔹 React Call

```js
window.AndroidApp.getJwtToken()
```

---

## 🔹 Expected Response

```js
jwtToken (string)
```

---

## 🔹 Android Responsibility

* Fetch token from:

  * Secure storage (SharedPreferences / Keystore)
  * Native login session
* Return token securely

---

## 🔹 Example Implementation

```java
@JavascriptInterface
public String getJwtToken() {
    return TokenProvider.getToken();
}
```

---

# ⚠️ Critical Rules

## 1. Interface Name MUST Match

```js
window.AndroidApp   // ✅ Correct
window.Android      // ❌ Do NOT use
```

---

## 2. Callback Names MUST Match EXACTLY

```js
window.recievePhotoFromAndroid
window.recieveLiveLocationFromAndroid
```

⚠️ Spelling matters (`recieve` is intentional and must match)

---

## 3. `returnKey` is Mandatory

Used for mapping UI state:

```js
worker_1 → Worker photo
premises → Premises photo
```

---

## 4. JSON Must Be Valid

❌ Incorrect:

```java
"{ latitude: 9.9 }"
```

✅ Correct:

```java
"{ \"latitude\": 9.9 }"
```

---

## 5. WebView Only Execution

This system works **ONLY inside Android WebView**
Browser testing will not support native features.

---

# 🔐 Required Permissions

```xml
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

---

# 📦 Production Recommendations

## 📸 Camera

* Use **CameraX**
* Add watermark (location + metadata)
* Compress images
* Upload to S3 / API

## 🎥 Video

* Use **CameraX VideoCapture / MediaRecorder**
* Compress before upload

## 📍 Location

* Use **FusedLocationProviderClient**
* Handle runtime permissions properly

## 🔐 Token Handling

* Store token in **EncryptedSharedPreferences / Keystore**
* Avoid exposing sensitive data in logs

---

# ❌ Common Mistakes

| Issue                      | Impact            |
| -------------------------- | ----------------- |
| Using wrong interface name | No communication  |
| Missing callback execution | UI won’t update   |
| Invalid JSON format        | Parsing failure   |
| Missing returnKey          | Incorrect mapping |
| Running outside WebView    | Features fail     |
| Not handling permissions   | Crashes           |

---

# ✅ Testing Checklist

* [ ] Camera opens on click
* [ ] Photo returns with correct returnKey
* [ ] Location attaches to photo
* [ ] Video records and plays
* [ ] Location fetch works
* [ ] JWT token fetch works
* [ ] No console / log errors

---

# 🚀 Summary

Android must implement:

```js
captureLivePhoto(config)
captureLiveVideo()
getGeoLocation()
getJwtToken()
```

And must call back:

```js
recievePhotoFromAndroid()
recieveLiveLocationFromAndroid()
```

---

## 📌 Final Notes

* Strict contract-based integration
* JSON-driven communication
* Keep naming consistent across platforms
* Always test inside WebView

---

## 📞 Debugging Guide

If something fails:

1. Check WebView logs (`Logcat`)
2. Verify `addJavascriptInterface` is injected
3. Confirm `evaluateJavascript()` is triggered
4. Validate JSON format
5. Ensure permissions are granted

---

**End of Document**
