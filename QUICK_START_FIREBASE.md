# Firebase Integration - Quick Start Guide

## What's Been Created

Your Diverto app now has a complete Firebase backend with:

✅ **Authentication** - Email/Password & Google Sign-In  
✅ **Cloud Database** - Firestore for storing reminders  
✅ **Real-time Sync** - Reminders sync across devices  
✅ **User Privacy** - Each user's data is secure  
✅ **Pre-built Pages** - Login and Sign-Up ready to use  

## 5-Minute Setup

### Step 1: Firebase Console Setup (2 minutes)
1. Open [Firebase Console](https://console.firebase.google.com)
2. Your project `diverto-12a71` exists
3. Go to **Firestore Database** → Click **Create Database**
   - Select **Production mode**
   - Choose your region
   - Click **Create**
4. Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password**
   - (Optional) Enable **Google**

### Step 2: Update Your App (2 minutes)

**File: `src/main.tsx` or `src/App.tsx`**

Add AuthProvider around your app:

```tsx
import { AuthProvider } from "@/contexts/AuthContext"

function App() {
  return (
    <AuthProvider>
      {/* Your Routes */}
    </AuthProvider>
  )
}

export default App
```

### Step 3: Add Routes (1 minute)

Add these routes to your router:

```tsx
{
  path: "/login",
  element: <Login />
},
{
  path: "/signup",
  element: <SignUp />
},
{
  path: "/reminders",
  element: <Reminders />
}
```

## Test It Now

1. Run your app: `npm run dev`
2. Visit `http://localhost:5173/signup`
3. Create an account
4. You're in! Create reminders

## Files Added

| File | Purpose |
|------|---------|
| `src/firebase/config.ts` | Firebase initialization |
| `src/firebase/auth.ts` | Auth functions |
| `src/contexts/AuthContext.tsx` | User state management |
| `src/hooks/useFirebaseReminders.ts` | Reminder operations |
| `src/pages/Login.tsx` | Sign-in page |
| `src/pages/SignUp.tsx` | Register page |

## Update Existing Pages

### In `src/pages/Reminders.tsx`:

Change this:
```tsx
import { useReminders } from "@/hooks/useReminders"
```

To this:
```tsx
import { useReminders } from "@/hooks/useFirebaseReminders"
import { useAuth } from "@/contexts/AuthContext"
```

Add auth check at the start:
```tsx
const { user, loading } = useAuth()

if (loading) return <div>Loading...</div>
if (!user) return <Navigate to="/login" />
```

## Common Tasks

### Get Current User
```tsx
import { useAuth } from "@/contexts/AuthContext"

const { user, loading } = useAuth()
```

### Add Reminder
```tsx
import { useReminders } from "@/hooks/useFirebaseReminders"

const { addReminder } = useReminders()
addReminder({ type: "one-time", value: "14:30" })
```

### Sign Out User
```tsx
import { logOut } from "@/firebase/auth"

<button onClick={() => logOut()}>Sign Out</button>
```

## Firebase Rules

Paste in **Firestore → Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reminders/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Click Publish!

## Done! 🎉

Your Firebase backend is ready. Users can now:
- Create accounts
- Sign in securely
- Create/edit/delete reminders
- Get notifications at reminder times
- Access from any device

For detailed info, see `FIREBASE_BACKEND_COMPLETE.md`
