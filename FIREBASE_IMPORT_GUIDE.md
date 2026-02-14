# Firebase Import Guide

You have **35 thought-provoking questions** ready to import. Here are your options:

## Option A: Manual Copy-Paste (Fastest - 2 minutes)

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your "pop" project
3. Go to **Firestore Database** → Click **Create Database**
   - Location: Choose closest to you
   - Security rules: Select "Start in test mode"
4. Click **Collections** → **Start a collection**
   - Collection ID: `pops`
5. Copy & paste one question object from `public/pops-questions.json`:
   ```json
   {
     "content": "What if your phone broke right now? What would be your first genuine thought?",
     "category": "thought",
     "difficulty": 4,
     "tags": ["immediacy", "dependency", "authenticity"],
     "isActive": true
   }
   ```
6. Click **Save**
7. Repeat step 5 for all 35 questions (or at least 5-10 to start)

**⚠️ Note:** Manual entry is tedious but works fine. For full import, use Option B or C.

---

## Option B: Firebase Bulk Import (Recommended - 5 minutes)

1. Get your **Firebase Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your "pop" project
   - Click **⚙️ Settings** (top left) → **Service Accounts**
   - Click **Generate New Private Key**
   - Save the JSON file as `firebase-service-account.json` in your project root

2. Make sure dependencies are installed:
   ```bash
   npm install firebase-admin
   ```

3. Run the import script:
   ```bash
   node scripts/import-pops.js
   ```

4. **Output:** 
   ```
   ✅ Successfully imported 35 questions to Firestore!
   📊 Collection: 'pops'
   📝 Documents: 35
   ```

---

## Option C: Firestore REST API (No Local Setup)

1. Get your **Firebase API Key:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your "pop" project
   - Click **Build** → **App settings** (top left)
   - Copy your **Web API Key**

2. Get your **Project ID:**
   - Same location as API Key (just above it)

3. Run this PowerShell script (Windows):
   ```powershell
   # Set these values
   $API_KEY = "YOUR_API_KEY_HERE"
   $PROJECT_ID = "your-project-id"
   
   # Read questions from JSON
   $questions = Get-Content "public/pops-questions.json" | ConvertFrom-Json
   
   # Upload to Firestore
   foreach ($q in $questions) {
     $body = @{
       fields = @{
         content = @{ stringValue = $q.content }
         category = @{ stringValue = $q.category }
         difficulty = @{ integerValue = $q.difficulty }
         isActive = @{ booleanValue = $true }
       }
     } | ConvertTo-Json
     
     $uri = "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/pops?key=$API_KEY"
     Invoke-WebRequest -Uri $uri -Method Post -Body $body -ContentType "application/json"
   }
   ```

---

## Verify Import Works

After importing, test locally:

```bash
# Start dev server
npm run dev

# Visit http://localhost:5173/reminders
# Login with your test account
# Create a new reminder for 1 minute from now
# Wait and you should see a POP notification with a question!
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Service account not found" | Make sure `firebase-service-account.json` is in project root |
| "Permission denied" | Update Firestore rules: Allow read/write in test mode |
| No questions appearing | Check Firestore console, verify collection "pops" exists |
| Build errors | Run `npm install` then `npm run build` |

---

## Next Steps

Once questions are imported and tested:
1. **Phase 2:** Add recurring reminders (daily, weekly, custom)
2. **Phase 3:** Build friend system
3. **Phase 4:** Send POPs to friends
4. **Phase 5:** Push notifications
5. **Phase 6:** Polish & offline support
6. **Phase 7:** App Store/Play Store launch

**Estimated:** 50+ more hours to full app
