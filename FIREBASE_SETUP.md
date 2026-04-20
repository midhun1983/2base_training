# Firebase Setup Guide — 2Base Claude Leadership Training Portal

This guide walks you through setting up the Firebase-enabled version with Google authentication and cloud progress tracking.

---

## Why Firebase?

✅ **Google SSO** — Team signs in with @2base.tech emails  
✅ **Cloud sync** — Progress saves automatically, works on any device  
✅ **Real-time** — Admin dashboard shows live team progress  
✅ **Scalable** — Free tier supports 50+ users  
✅ **Secure** — Enterprise-grade authentication and data protection  

---

## Step 1: Create Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. **Project name:** `2base-claude-training` (or your choice)
4. **Google Analytics:** Optional (recommended to disable for this use case)
5. Click **"Create project"**

---

## Step 2: Enable Google Authentication (2 minutes)

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Toggle **"Enable"** switch
4. **Support email:** Enter your email (e.g., midhun@2base.tech)
5. Click **"Save"**

---

## Step 3: Create Firestore Database (3 minutes)

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. **Start mode:** Select **"Production mode"** (we'll add security rules next)
4. **Location:** Choose closest to your team (e.g., `asia-south1` for India, `us-central1` for US)
5. Click **"Enable"**

---

## Step 4: Configure Security Rules (2 minutes)

1. In Firestore Database, go to **Rules** tab
2. Replace the default rules with these:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

**What this does:**
- Any authenticated user can read all users' data (for admin dashboard)
- Users can only write to their own document
- Prevents unauthorized access

---

## Step 5: Get Firebase Configuration (2 minutes)

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Click **Web** icon (`</>`)
4. **App nickname:** `2base-claude-training-web`
5. **Also set up Firebase Hosting:** Leave unchecked (we'll use Netlify/Vercel)
6. Click **"Register app"**
7. Copy the `firebaseConfig` object — you'll need this!

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 6: Update the App Code (3 minutes)

1. Open `firebase-app.jsx` in your code editor
2. Find this section near the top (around line 7):

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Replace with your actual config from Step 5
4. **Optional:** Update the `ALLOWED_DOMAIN` constant (line 27):

```javascript
const ALLOWED_DOMAIN = "2base.tech"; // Change to your company domain
```

This restricts sign-in to only your company emails. Set to `null` to allow any Google account.

5. Save the file

---

## Step 7: Update Main Entry Point (1 minute)

1. Open `main.jsx`
2. Replace the entire content with:

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import ClaudeLearningPlan2BaseFirebase from "./firebase-app.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClaudeLearningPlan2BaseFirebase />
  </React.StrictMode>
);
```

3. Save the file

---

## Step 8: Install Dependencies (1 minute)

```bash
# Use the Firebase-enabled package.json
cp package-firebase.json package.json

# Install dependencies
npm install
```

This adds Firebase SDK to your project.

---

## Step 9: Test Locally (2 minutes)

```bash
npm run dev
```

1. Open `http://localhost:5173`
2. You should see the login screen
3. Click **"Sign in with Google"**
4. Sign in with your @2base.tech email
5. You should see the training dashboard
6. Check a few items → they should save automatically
7. Refresh the page → progress should persist

**If it works locally, you're ready to deploy!**

---

## Step 10: Deploy to Production

### Option A: Netlify (Recommended — Easiest)

1. Push your code to GitHub (private repo recommended)
2. Go to [Netlify](https://netlify.com)
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect your GitHub repo
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **"Deploy site"**
7. Wait 2-3 minutes for build
8. Your site is live! Share the URL with your team

**Custom domain (optional):**
- In Netlify dashboard → Domain settings
- Add custom domain (e.g., `claude-training.2base.tech`)
- Follow DNS setup instructions

### Option B: Vercel (Also Easy)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click **"Add New"** → **"Project"**
4. Import your GitHub repo
5. Framework preset: **Vite**
6. Click **"Deploy"**
7. Site is live!

### Option C: Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login and initialize:
```bash
firebase login
firebase init hosting
```

3. Select your project and these options:
   - Public directory: `dist`
   - Single-page app: `Yes`
   - GitHub deploys: `No`

4. Build and deploy:
```bash
npm run build
firebase deploy
```

5. Your site is live at `https://your-project.firebaseapp.com`

---

## Admin Access

The admin dashboard shows real-time team progress.

**To access:**
1. Sign in to the portal
2. Click **"Admin"** button in the top-right
3. You'll see:
   - Active participants count
   - Average team progress
   - Individual progress table with percentages
   - Last active timestamps

**Who can access admin:**
- Currently: Anyone signed in can see the admin dashboard
- To restrict: Add admin user list in firebase-app.jsx (see below)

**Optional: Restrict admin access to specific emails:**

In `firebase-app.jsx`, add this constant near the top:

```javascript
const ADMIN_EMAILS = [
  "midhun@2base.tech",
  "another-admin@2base.tech"
];
```

Then update the AdminDashboard component to check:

```javascript
function AdminDashboard({ onBack, currentUser }) {
  if (!ADMIN_EMAILS.includes(currentUser.email)) {
    return <div>Access denied</div>;
  }
  // ... rest of component
}
```

---

## Team Onboarding

**Share these instructions with your team:**

1. Go to [your-portal-url]
2. Click "Sign in with Google"
3. Use your @2base.tech email
4. Start with Day 1!
5. Progress saves automatically — you can switch devices anytime

**Troubleshooting for team members:**

**"Only @2base.tech addresses allowed"**
- Make sure you're using your company Google account
- Sign out of personal Google accounts first

**"Can't see my progress after refreshing"**
- Make sure you're signed in (check top-right corner)
- Try signing out and back in
- Clear browser cache if needed

**"Progress not saving"**
- Check internet connection
- Try refreshing the page
- Contact admin if issue persists

---

## Cost Estimate

Firebase free tier includes:
- **Firestore:** 50K reads/day, 20K writes/day
- **Authentication:** Unlimited sign-ins

**For 10 users over 10 days:**
- ~500 reads/day (well under limit)
- ~200 writes/day (well under limit)
- **Total cost: $0**

**For 50 users ongoing:**
- Still within free tier limits
- Estimated cost: $0/month

**If you exceed free tier:**
- Firestore: $0.06 per 100K reads
- Example: 100 users = ~$2-5/month

---

## Data Management

**Export team progress:**

In Firebase Console:
1. Go to Firestore Database
2. Click on `users` collection
3. Use the export feature to download JSON/CSV

**Delete user data:**

1. Go to Firestore Database
2. Find user's document in `users` collection
3. Click delete

**Backup database:**

```bash
gcloud firestore export gs://[BUCKET_NAME]
```

(Requires Google Cloud SDK)

---

## Security Best Practices

✅ **Firestore security rules in place** — Users can only modify their own data  
✅ **Google authentication** — No password management needed  
✅ **Domain restriction** — Only company emails allowed (if configured)  
✅ **HTTPS only** — All hosting platforms use SSL by default  

**Additional hardening (optional):**

1. **Enable App Check** (prevents API abuse):
   - Firebase Console → App Check
   - Add your web app
   - Use reCAPTCHA v3

2. **Enable audit logging**:
   - Firebase Console → Project Settings → Usage and billing
   - Enable logging

3. **Set up monitoring**:
   - Firebase Console → Performance Monitoring
   - Track errors and performance

---

## Troubleshooting

**"Firebase: Error (auth/unauthorized-domain)"**
- Solution: In Firebase Console → Authentication → Settings → Authorized domains
- Add your deployment domain (e.g., `your-app.netlify.app`)

**"Firestore permission denied"**
- Check security rules (Step 4)
- Make sure user is signed in
- Verify user is writing to their own document

**"Can't sign in with Google"**
- Clear browser cookies/cache
- Try incognito mode
- Check Firebase Authentication is enabled (Step 2)

**Admin dashboard not loading**
- Check browser console for errors
- Verify Firestore rules allow read access
- Make sure at least one user has progress data

---

## Support

**Firebase Documentation:**
- [Firebase Auth Guide](https://firebase.google.com/docs/auth)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

**For 2Base-specific issues:**
- Contact your admin/facilitator
- Check the GitHub repo for updates
- Submit issues for bugs or feature requests

---

## Next Steps

Once deployed:

1. ✅ Test with 2-3 team members first
2. ✅ Verify progress saves correctly
3. ✅ Check admin dashboard shows accurate data
4. ✅ Share URL with full team
5. ✅ Monitor usage in Firebase Console
6. ✅ Set up weekly check-ins to review team progress

**Your portal is ready!** 🚀
