# Firestore Security Rules - UPDATE REQUIRED

Go to Firebase Console → Firestore Database → Rules and replace the existing rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own user profile
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // Allow users to read all users for search/friend features
    match /users/{document=**} {
      allow read: if request.auth != null;
    }

    // Allow users to read/write only their own reminders
    match /reminders/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## What Changed:
1. **Added `/users/{userId}` rules** - Allows reading and writing to user profiles
2. **Added read-all-users rule** - Allows users to search for other users
3. **Kept reminder rules** - Unchanged for security

This is essential for the app to:
- Read usernames from Firestore
- Search for users by username
- Send invitations to friends
