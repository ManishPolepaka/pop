# Deployment Guide

## Deploy to Firebase Hosting

Firebase Hosting is the perfect place to deploy your Diverto app - it integrates seamlessly with your Firestore backend!

### Prerequisites
- Google account (same as Firebase project)
- Firebase CLI installed: `npm install -g firebase-tools`

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

This opens your browser to authenticate with Google.

### Step 3: Initialize Firebase Hosting

```bash
cd i:\Diverto
firebase init hosting
```

When prompted:
- **Project**: Select "diverto-12a71"
- **Public directory**: Enter `dist`
- **Single-page app**: Reply `y` (yes)
- **GitHub deploy**: Reply `n` (no)

This creates:
- `.firebaserc` - Firebase project config
- `firebase.json` - Hosting config

### Step 4: Build Your App

```bash
npm run build
```

Creates optimized files in the `dist/` folder.

### Step 5: Deploy!

```bash
firebase deploy
```

You'll see:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/diverto-12a71/overview
Hosting URL: https://diverto-12a71.web.app
```

Your app is live! 🚀

---

## Deployment Checklist

### Before Deploying
- [ ] All pages tested locally (`npm run dev`)
- [ ] Login/signup working
- [ ] Can create/delete reminders
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)
- [ ] Firestore rules are published
- [ ] Authentication providers enabled

### Deploy
- [ ] Run `npm run build`
- [ ] Run `firebase deploy`
- [ ] Visit your live URL
- [ ] Test all features on live site

### After Deploying
- [ ] Test sign-up on live site
- [ ] Test login on live site
- [ ] Create a reminder on live site
- [ ] Check Firestore console for new data
- [ ] Test on mobile device
- [ ] Share URL with others to test

---

## Firebase Hosting Features

### Automatic HTTPS
- Your app is automatically served over HTTPS
- Firebase handles all SSL certificates

### Global CDN
- Your app is served from servers worldwide
- Fast loading anywhere

### Custom Domain (Optional)
In Firebase Console → Hosting:
1. Click "Connect domain"
2. Follow steps to verify domain
3. Your app available at custom.com

### Environment Configuration

Create `.env.production`:
```
VITE_FIREBASE_API_KEY=AIzaSyDCWgX8hbsfFccykM6IRDmgXgBoXb_YCxI
VITE_FIREBASE_AUTH_DOMAIN=diverto-12a71.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=diverto-12a71
```

Update `src/firebase/config.ts` to use:
```tsx
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... rest
}
```

---

## Troubleshooting Deployment

### "Cannot find module 'firebase'"
```bash
npm install firebase
npm run build
firebase deploy
```

### Blank page on deployed site
1. Check browser console for errors
2. Verify Firestore rules are published
3. Check Firebase Console → Hosting → Usage

### Reminders not working on live site
1. Check Firestore rules in Firebase Console
2. Verify authentication is enabled
3. Check data in Firestore Console

### Slow loading on live site
- Firebase hosting is very fast by default
- Check if assets are optimized in build
- Clear browser cache and reload

---

## Updates & Redeployment

After making changes:

```bash
# Test locally
npm run dev

# Build
npm run build

# Deploy
firebase deploy
```

Your changes go live in seconds!

---

## Monitoring Your Deployment

### Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project "diverto-12a71"
3. Go to **Hosting** tab to see:
   - Traffic usage
   - Deployment history
   - Performance metrics

### View Logs
```bash
firebase hosting:channel:list
firebase hosting:channel:delete [channel-name]
```

---

## Performance Tips

### Optimize Bundle Size
```bash
npm run build
# Check size with: npm install -g vite-plugin-visualizer
```

### Cache Control
Firebase Hosting automatically handles caching for your app.

### Environment Variables
Keep sensitive data in environment files, not in code.

---

## Security Checklist

Before production:
- [ ] Firestore security rules are strict
- [ ] No sensitive data in client code
- [ ] Authentication is properly configured
- [ ] HTTPS is enforced (automatic)
- [ ] Users can only see their own data

---

## Scaling Your App

Your deployment automatically scales:
- ✅ Firestore handles any number of users
- ✅ Firebase Hosting handles traffic spikes
- ✅ Real-time sync works at any scale
- ✅ No servers to maintain

---

## Version Control

Keep these files in git:
```
✓ src/
✓ package.json
✓ vite.config.ts
✓ README.md
✓ .firebaserc (optional - Firebase project reference)

✗ dist/ (build output - add to .gitignore)
✗ node_modules/ (add to .gitignore)
✗ .env.local (if using env vars - add to .gitignore)
```

### .gitignore additions
```
dist/
node_modules/
.env.local
.env.*.local
```

---

## Continuous Deployment (Optional)

### GitHub Actions
Push to GitHub and Firebase deploys automatically:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: diverto-12a71
```

---

## Going Live Checklist

### Week Before
- [ ] Test all features thoroughly
- [ ] Check mobile experience
- [ ] Verify Firestore rules
- [ ] Test with real users (friends/family)

### Day Before
- [ ] Final build test
- [ ] Check environment variables
- [ ] Verify Firebase is responding

### Deploy Day
- [ ] Build: `npm run build`
- [ ] Deploy: `firebase deploy`
- [ ] Test live site thoroughly
- [ ] Monitor for errors

### After Launch
- [ ] Monitor Firebase Console
- [ ] Check user feedback
- [ ] Watch for errors in console
- [ ] Be ready to roll back if needed

### Roll Back (if needed)
```bash
firebase hosting:channel:list
firebase hosting:channel:deploy [previous-version]
```

---

## Your Live App URL

After deploying:
```
https://diverto-12a71.web.app
```

Share this with users!

---

## Support Resources

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firebase Console](https://console.firebase.google.com)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**Congratulations! Your Diverto app is live! 🎉**
