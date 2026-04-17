# Part Time — Mobile App (React Native + Expo)

A dark-themed mobile app for students to browse part-time jobs and show their attendance QR code.

## 📱 How to Run

### Requirements
- Node.js 18+
- [Expo Go](https://expo.dev/go) app installed on your Android or iOS phone

### Steps

```bash
# From the repo root
cd mobile
npx expo start
```

Scan the QR code that appears in the terminal with:
- **Android:** Expo Go app → Scan QR
- **iOS:** Native Camera app → tap the Expo link

---

## 🗂️ Project Structure

```
mobile/
├── App.js                        ← Root entry point
├── app.json                      ← Expo config (name, icons, colours)
└── src/
    ├── firebase/
    │   └── firebaseConfig.js     ← Firebase init (shared credentials)
    ├── context/
    │   └── AuthContext.jsx       ← Auth state (login/register/logout)
    ├── theme/
    │   └── tokens.js             ← Colours, radius, shadows
    ├── navigation/
    │   └── AppNavigator.jsx      ← Stack + Tab navigation
    └── screens/
        ├── LoginScreen.jsx       ← Firebase Auth sign-in
        ├── RegisterScreen.jsx    ← Role selector + Firestore user doc
        ├── StudentFeedScreen.jsx ← Job list with search
        ├── JobDetailScreen.jsx   ← Full job info + Apply button
        └── MyQRScreen.jsx        ← Applications list + QR display
```

---

## 🔥 Firebase

Uses the same project as the web app (`part-time-app-24777`).
Auth state is persisted on device via AsyncStorage — users stay logged in.

---

## ✨ Screens

| Screen | Description |
|---|---|
| Login | Email/password sign-in |
| Register | Role choice (Student / Poster), university dropdown |
| Student Feed | All open jobs, searchable by title / university / location |
| Job Detail | Full job info, sticky Apply button |
| My QR | All applications with status + large QR for approved ones |
