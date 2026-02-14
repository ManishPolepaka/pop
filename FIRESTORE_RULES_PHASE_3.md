rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read from pops collection (questions library)
    match /pops/{document=**} {
      allow read: if true;
    }

    // Users collection - read own profile, write own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      // Allow reading basic public info for friend operations
      allow read: if request.auth != null;
    }

    // Friend Requests collection
    match /friendRequests/{requestId} {
      allow read: if request.auth.uid == resource.data.fromUserId || request.auth.uid == resource.data.toUserId;
      allow create: if request.auth.uid == request.resource.data.fromUserId;
      allow update: if request.auth.uid == resource.data.toUserId;
      allow delete: if request.auth.uid == resource.data.fromUserId || request.auth.uid == resource.data.toUserId;
    }

    // Reminders collection - read own reminders, write own reminders
    match /reminders/{reminderId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
