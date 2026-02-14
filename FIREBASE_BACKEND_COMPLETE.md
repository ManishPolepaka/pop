# Firebase Backend Integration - Complete Setup

## ✅ Completed Setup

### 1. **Firebase Configuration**
- ✅ Created `src/firebase/config.ts` with your Firebase credentials
- ✅ Initialized Firebase app with authentication and Firestore
- ✅ Installed Firebase SDK (`npm install firebase`)

### 2. **Authentication System**
- ✅ Created `src/firebase/auth.ts` with auth utilities:
  - Email/Password signup and login
  - Google Sign-In support
  - Sign out functionality
  - User session management

### 3. **Database Integration**
- ✅ Created `src/hooks/useFirebaseReminders.ts` - Firebase-integrated reminder hook that:
  - Syncs reminders from Firestore in real-time
  - Supports user authentication
  - Stores reminders per user (secure)
  - Handles reminder creation, deletion, and notifications
  - Automatically triggers reminders at scheduled times

### 4. **Authentication Context**
- ✅ Created `src/contexts/AuthContext.tsx` for app-wide user state management

### 5. **Pre-built Pages**
- ✅ Created `src/pages/Login.tsx` - Beautiful login page with:
  - Email/password login
  - Google Sign-In button
  - Link to signup page
  - Error handling with user feedback

- ✅ Created `src/pages/SignUp.tsx` - Registration page with:
  - Email, password, and confirm password fields
  - Password validation
  - Link to login page
  - Error handling with user feedback

## 📋 Next Steps Required

### 1. **Setup Firebase Console**
Visit [Firebase Console](https://console.firebase.google.com):
- Project: `diverto-12a71` should already be there
- Go to **Authentication** → **Sign-in method**
  - ✅ Enable **Email/Password**
  - ✅ Enable **Google** (optional but recommended)

### 2. **Create Firestore Database**
- Go to **Firestore Database** → **Create Database**
- Choose **Production mode**
- Select region closest to your location
- Create collection: `reminders`

**Firestore Security Rules** (replace in Firestore):
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

### 3. **Update Your App.tsx**

Wrap your entire app with `AuthProvider`:

```tsx
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <YourRoutes />
    </AuthProvider>
  );
}
```

### 4. **Update Routes in your router file**

Add these routes:

```tsx
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";

// Add to your router configuration
{
  path: "/login",
  element: <Login />
},
{
  path: "/signup",
  element: <SignUp />
}
```

### 5. **Protect Reminders Page**

Update your `Reminders.tsx` to check authentication:

```tsx
import { useAuth } from "@/contexts/AuthContext";
import { useReminders } from "@/hooks/useFirebaseReminders";

export default function Reminders() {
  const { user, loading } = useAuth();
  const { reminders, ...rest } = useReminders();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // Rest of your component...
}
```

### 6. **Update Home Page Navigation**

Add sign-out button and user info to your home page or header:

```tsx
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/firebase/auth";

function Header() {
  const { user } = useAuth();

  return (
    <header>
      {user ? (
        <div>
          <span>Welcome, {user.email}</span>
          <button onClick={() => logOut()}>Sign Out</button>
        </div>
      ) : (
        <NavLink to="/login">Sign In</NavLink>
      )}
    </header>
  );
}
```

## 📁 File Structure

```
src/
├── firebase/
│   ├── config.ts          # Firebase initialization
│   └── auth.ts            # Authentication functions
├── contexts/
│   └── AuthContext.tsx    # Auth provider & hook
├── hooks/
│   └── useFirebaseReminders.ts  # Reminder management with Firebase
└── pages/
    ├── Login.tsx          # Sign in page
    ├── SignUp.tsx         # Registration page
    ├── Reminders.tsx      # Your reminders page (needs update)
    └── ...
```

## 🔑 Key Features

### Real-time Sync
Reminders automatically sync across all devices when the user is signed in.

### User Isolation
Each user's reminders are private and only accessible to them via Firestore security rules.

### Offline Support (Ready)
Firebase automatically caches data and syncs when online.

### Automatic Notifications
Reminders trigger notifications at scheduled times.

### Google Sign-In
Users can quickly sign in with their Google account.

## 🚀 Testing Checklist

- [ ] Firebase project is properly configured
- [ ] Firestore database created with `reminders` collection
- [ ] Security rules are set correctly
- [ ] App wrapped with AuthProvider
- [ ] Can sign up with new email
- [ ] Can sign in with existing account
- [ ] Can sign in with Google
- [ ] Can create reminders (saves to Firestore)
- [ ] Can delete reminders
- [ ] Reminders trigger notifications at scheduled time
- [ ] Sign out removes user session

## 💡 Usage Example

```typescript
// In any component within AuthProvider:
import { useAuth } from "@/contexts/AuthContext";
import { useReminders } from "@/hooks/useFirebaseReminders";

function MyReminders() {
  const { user } = useAuth();
  const { reminders, addReminder, deleteReminder } = useReminders();

  if (!user) return <div>Please sign in</div>;

  return (
    <div>
      <h1>My Reminders</h1>
      {reminders.map(reminder => (
        <div key={reminder.id}>
          <p>{reminder.time} - {reminder.message}</p>
          <button onClick={() => deleteReminder(reminder.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module 'firebase'" | Run `npm install firebase` |
| "useAuth must be used within AuthProvider" | Wrap your app with `<AuthProvider>` in App.tsx |
| Reminders not saving | Check Firestore is created and rules are correct |
| Google Sign-In fails | Enable Google provider in Firebase Console |
| Users can access others' reminders | Verify Firestore security rules are set correctly |

## 📞 Support

Refer to the `FIREBASE_SETUP.md` file for detailed Firebase configuration instructions.
