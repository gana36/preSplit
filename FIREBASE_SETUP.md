# Firebase Setup Guide for BillBeam

This guide walks you through setting up Firebase Authentication and Firestore for the BillBeam application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** (or select an existing project if you prefer)
3. Enter a project name (e.g., "BillBeam" or "preSplit")
4. Optional: Enable Google Analytics (recommended for tracking usage)
5. Click **Create project** and wait for it to be created

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "BillBeam Web App")
3. **Do NOT** check "Firebase Hosting" (unless you want to use it)
4. Click **Register app**
5. You'll see your Firebase configuration object - **keep this tab open**, you'll need these values

## Step 3: Enable Google Sign-In

1. In the Firebase Console, go to **Authentication** in the left sidebar
2. Click **Get started** (if this is your first time)
3. Go to the **Sign-in method** tab
4. Click on **Google** in the providers list
5. Toggle **Enable**
6. Enter a **Project support email** (your email)
7. Click **Save**

## Step 4: Set Up Firestore Database

1. In the Firebase Console, go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in production mode** (we'll set up rules next)
4. Select a Firestore location (choose one close to your users, e.g., `us-central` for US)
5. Click **Enable**

## Step 5: Configure Firestore Security Rules

1. Once Firestore is created, go to the **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own receipts
    match /users/{userId}/receipts/{receiptId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish** to save the rules

## Step 6: Add Firebase Config to Your App

1. Copy your Firebase configuration from Step 2 (or find it in Project Settings > General > Your apps)
2. Open the `.env` file in your project root
3. Add the following environment variables with your Firebase config values:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Example:**
```bash
VITE_FIREBASE_API_KEY=AIzaSyAbc123def456GHI789jkl012MNO345pqr
VITE_FIREBASE_AUTH_DOMAIN=billbeam-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=billbeam-app
VITE_FIREBASE_STORAGE_BUCKET=billbeam-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
```

4. Save the `.env` file

## Step 7: Test Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your app in a browser
3. Click the **Sign in** button in the header
4. You should see a Google Sign-in popup
5. Complete the sign-in process
6. Your profile picture/avatar should appear in the header

## Step 8: Test Receipt Saving

1. Complete a bill split workflow:
   - Upload/scan a receipt
   - Add people
   - Assign items
   - Navigate to Settlement

2. Click the **Save** button (should appear when signed in)
3. You should see a success toast message
4. Click your avatar → **View Receipt History**
5. Your saved receipt should appear in the history

## Troubleshooting

### Firebase Configuration Not Working

- Make sure all environment variables start with `VITE_`
- Restart your development server after updating `.env`
- Check that there are no extra spaces or quotes in your `.env` file

### Google Sign-In Popup Blocked

- Make sure popups are not blocked by your browser
- Try using a different browser
- Check that your Firebase domain is authorized (should be automatic)

### Firestore Permission Denied

- Verify your Firestore security rules are set correctly (Step 5)
- Make sure you're signed in when trying to save receipts
- Check the browser console for detailed error messages

### Can't See Saved Receipts

- Make sure you're signed in with the same Google account
- Check the Firestore console to see if documents are being created
- Open browser DevTools → Console to check for errors

## Next Steps

### Optional: Set Up Firebase Hosting

If you want to deploy your app to Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Optional: Enable Additional Features

- **Email/Password Authentication**: Enable in Firebase Console → Authentication
- **Analytics**: View user metrics in Firebase Console → Analytics
- **Performance Monitoring**: Track app performance
- **Remote Config**: Update app behavior without deploying

## Support

If you encounter issues:
1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review the [Firebase Auth Docs](https://firebase.google.com/docs/auth)
3. Check the [Firestore Docs](https://firebase.google.com/docs/firestore)
