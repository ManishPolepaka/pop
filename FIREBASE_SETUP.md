# Firebase Backend Setup Guide

## Files Created

### 1. Firebase Configuration
- **`src/firebase/config.ts`** - Firebase app initialization and exports for auth and Firestore

### 2. Authentication
- **`src/firebase/auth.ts`** - Authentication utility functions:
  - `signUp(email, password)` - Create new account
  - `logIn(email, password)` - Sign in with email
  - `logOut()` - Sign out
  - `signInWithGoogle()` - Sign in with Google
  - `getCurrentUser()` - Get current authenticated user

### 3. Hooks
- **`src/hooks/useFirebaseReminders.ts`** - Firebase-integrated reminder hook (replaces `useReminders.ts`)
- **`src/contexts/AuthContext.tsx`** - Authentication context provider

## Installation

Firebase has been installed via npm. The package is now available in your project.

## Setup Steps to Complete

### 1. Update Your App.tsx to Use AuthProvider

```tsx
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      {/* Your routes here */}
    </AuthProvider>
  );
}
```

### 2. Update useReminders Import

Change imports from:
```tsx
import { useReminders } from "@/hooks/useReminders";
```

To:
```tsx
import { useReminders } from "@/hooks/useFirebaseReminders";
```

### 3. Create Firebase Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project "diverto-12a71"
3. Go to Firestore Database
4. Click "Create Database"
5. Choose "Production mode" for security rules
6. Select region closest to you
7. Create collection named `reminders` with these fields:
   - `userId` (string) - User's ID
   - `time` (string) - Time of reminder (HH:MM)
   - `message` (string) - Reminder message
   - `type` (string) - "one-time" or "recurring"
   - `interval` (number) - Minutes (for recurring)
   - `triggered` (boolean) - Whether reminder was triggered
   - `createdAt` (timestamp) - Creation timestamp

### 4. Update Firestore Security Rules

Go to Firestore → Rules and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write only their own reminders
    match /reminders/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 5. Enable Email/Password Authentication

1. Go to Firebase Console → Authentication
2. Enable "Email/Password" provider
3. Optionally enable "Google" provider

## Hook Return Values

The `useFirebaseReminders` hook returns:

```typescript
{
  reminders: Reminder[]          // List of pending reminders
  activeNotification: Reminder | null  // Current notification
  addReminder: (time) => void    // Add new reminder
  deleteReminder: (id) => void   // Delete reminder
  dismissNotification: () => void // Dismiss notification
  user: User | null              // Current authenticated user
  loading: boolean               // Loading state
}
```

## Usage Example

```tsx
import { useReminders } from "@/hooks/useFirebaseReminders";
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, loading } = useAuth();
  const { reminders, addReminder, deleteReminder } = useReminders();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return (
    <div>
      {reminders.map(reminder => (
        <div key={reminder.id}>
          {reminder.time}
          <button onClick={() => deleteReminder(reminder.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## Next Steps

1. Create login/signup pages using the auth functions
2. Wrap your app with AuthProvider
3. Update Reminders.tsx to use `useFirebaseReminders`
4. Test authentication and reminder creation
5. Deploy to Firebase Hosting

## Troubleshooting

**"Firebase is not initialized"**: Make sure AuthProvider wraps your entire app
**"Permission denied"**: Check Firestore rules and user authentication
**"Reminders not appearing"**: Verify userId in Firestore matches auth user UID
