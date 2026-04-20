# Claude Mastery Portal for 2Base Technologies

**Production-ready training portal with Google authentication and cloud progress tracking.**

## 🎯 What This Is

A hosted learning platform where your leadership team can:
- Sign in with company Google accounts (@2base.tech)
- Complete the 10-day Claude mastery program
- Track progress automatically (syncs across devices)
- View team progress in real-time admin dashboard

## 📦 Two Versions Available

### Version 1: Standalone (Original)
- Local progress tracking (browser localStorage)
- No login required
- Perfect for individual use
- Files: `2base-claude-leadership-training.jsx` + `main.jsx`

### Version 2: Firebase Portal (This Version)
- ✅ Google SSO authentication
- ✅ Cloud progress sync
- ✅ Admin dashboard for team tracking
- ✅ Multi-device support
- ✅ Real-time progress updates
- Files: `firebase-app.jsx` + Firebase config

---

## 🚀 Quick Start (Firebase Version)

### Prerequisites
- Node.js 18+ installed
- Google account (for Firebase setup)
- 20-30 minutes for initial setup

### 1. Firebase Setup
Follow **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for detailed step-by-step instructions.

**Quick summary:**
1. Create Firebase project
2. Enable Google authentication
3. Create Firestore database
4. Get Firebase config
5. Update `firebase-app.jsx` with your config

### 2. Install & Run Locally

```bash
# Use Firebase package.json
cp package-firebase.json package.json

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` and test sign-in.

### 3. Deploy to Production

**Netlify (recommended):**
```bash
npm run build
# Deploy dist/ folder to Netlify
```

**Or follow full deployment guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**

---

## 👥 Team Usage

**For team members:**
1. Go to portal URL (provided by admin)
2. Click "Sign in with Google"
3. Use @2base.tech email
4. Start training!

**For admin (you):**
1. Sign in to portal
2. Click "Admin" button
3. View real-time team progress
4. Export data as needed

---

## 📚 10-Day Curriculum

| Day | Focus | Sessions |
|-----|-------|----------|
| 1 | Claude Foundations & Migration | ChatGPT comparison, Prompt engineering |
| 2 | Projects & Knowledge Management | Claude Projects, Document analysis |
| 3 | Advanced Features | Artifacts, Computer use |
| 4 | Domain Applications | BA requirements, QA/Delivery workflows |
| 5 | People Management | 1:1 prep, Hiring kits |
| 6 | Communication | Executive updates, Meeting productivity |
| 7 | Process Improvement | SOPs, Automation |
| 8 | Data Analysis | Data upload, Report generation |
| 9 | Advanced Techniques | Prompt chains, API (optional) |
| 10 | Team Adoption | Governance, ROI measurement |

**Total:** 20 sessions, 80+ learning items, 20 hands-on projects

---

## 🔐 Security & Privacy

- ✅ Google OAuth authentication (no passwords to manage)
- ✅ Domain restriction (only @2base.tech emails, configurable)
- ✅ Firestore security rules (users can only edit their own data)
- ✅ HTTPS encryption (enforced by hosting platform)
- ✅ No sensitive data storage (only learning progress)

**What's stored:**
- User email and name (from Google)
- Training progress (checkboxes, notes)
- Last active timestamp

**What's NOT stored:**
- Passwords (handled by Google)
- Any project deliverables (stored locally on user's device)
- Sensitive company data

---

## 💰 Cost

**Firebase (Free Tier):**
- Up to 50K database reads/day
- Up to 20K database writes/day
- Unlimited authentication

**For 10-20 users:** $0/month (well within free tier)

**For 50-100 users:** ~$2-5/month

**Hosting:**
- Netlify/Vercel: Free tier (plenty for this use case)
- Firebase Hosting: Free tier or $0.15/GB

**Total estimated cost: $0-10/month** (even for 50+ users)

---

## 🛠️ Project Structure

```
2base-claude-training-firebase/
├── firebase-app.jsx              # Main React app with Firebase
├── index.html                    # HTML entry point
├── main.jsx                      # React mount (update to use firebase-app.jsx)
├── package-firebase.json         # Dependencies with Firebase
├── vite.config.js                # Vite configuration
├── storage-shim.js               # Legacy localStorage shim (not used in Firebase version)
├── FIREBASE_SETUP.md             # Complete Firebase setup guide
├── README.md                     # This file
└── LICENSE                       # MIT License
```

---

## 📊 Admin Dashboard Features

**Team Overview:**
- Active participants count
- Average team progress (%)
- Number of users who completed program

**Individual Tracking:**
- User name and email
- Progress percentage (0-100%)
- Sessions completed (out of 20)
- Last active date

**Real-time Updates:**
- Dashboard refreshes automatically
- See team progress as it happens
- Export data for reporting

---

## 🔄 Migration Path

**Currently using standalone version?**

1. Team members complete training in standalone version
2. Export their progress (manual notes/artifacts)
3. Deploy Firebase version
4. Team signs in with Google
5. They can reference old notes while using new portal

**Firebase version doesn't import old progress** — it's a fresh start. If you need migration, contact support.

---

## 🆘 Troubleshooting

**Can't sign in:**
- Check Firebase Authentication is enabled
- Verify email domain matches ALLOWED_DOMAIN
- Clear browser cookies/cache

**Progress not saving:**
- Check internet connection
- Verify Firestore security rules are set
- Check browser console for errors

**Admin dashboard empty:**
- Make sure at least one user has progress
- Check Firestore rules allow read access
- Verify user is signed in

**Full troubleshooting guide:** See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#troubleshooting)

---

## 📈 Success Metrics

Track these in your admin dashboard:

**Engagement:**
- % of team who started (signed in)
- % of team who completed at least Day 1
- % of team who completed full program

**Velocity:**
- Average days to completion
- Sessions completed per week
- Drop-off points (which days lose engagement)

**Impact:**
- Time saved on common tasks (measure pre/post)
- Quality improvement (team surveys)
- Team confidence with Claude (1-5 rating)

---

## 🤝 Support

**Setup help:**
- Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) step-by-step
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Contact your Firebase admin

**Training content questions:**
- Refer to [Anthropic Documentation](https://docs.anthropic.com)
- Use Claude to get unstuck (meta!)

**Technical issues:**
- Check browser console for errors
- Try incognito mode
- Contact admin for portal-specific issues

---

## 📝 License

MIT License — See [LICENSE](./LICENSE) file.

Based on [IT Support Manager Claude Training](https://github.com/itssujeeth/it-manager-claude-training) by @itssujeeth.

Adapted for 2Base Technologies by Claude (Anthropic), April 2026.

---

## ✅ Deployment Checklist

Before sharing with your team:

- [ ] Firebase project created and configured
- [ ] firebaseConfig added to firebase-app.jsx
- [ ] ALLOWED_DOMAIN set to your company domain
- [ ] Firestore security rules deployed
- [ ] Tested locally (sign in, save progress, admin dashboard)
- [ ] Built and deployed to production
- [ ] Tested on production URL
- [ ] Admin can access dashboard
- [ ] Custom domain configured (optional)
- [ ] Team onboarding instructions ready
- [ ] First 2-3 team members tested successfully

**Ready to launch!** Share the portal URL and watch your team become Claude power users. 🚀

---

## 🎯 What's Next

After deployment:

1. **Week 1:** Monitor daily — check for sign-in issues, answer questions
2. **Week 2:** Mid-program check-in — how's progress? Any blockers?
3. **Week 3:** Post-program — review admin dashboard, collect feedback
4. **Month 2:** Measure impact — time saved, quality improved, ROI calculated
5. **Ongoing:** Use for new hire onboarding, run refresher cohorts

Your investment in Claude training pays dividends for months/years to come.
