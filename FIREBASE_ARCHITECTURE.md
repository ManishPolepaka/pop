# Firebase Architecture Diagram

## Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        DIVERTO APP                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              <AuthProvider>                              │   │
│  │         (Manages user authentication state)              │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │         Router / Pages                             │ │   │
│  │  ├────────────────────────────────────────────────────┤ │   │
│  │  │ • Login.tsx      (useAuth + logIn)                │ │   │
│  │  │ • SignUp.tsx     (useAuth + signUp)               │ │   │
│  │  │ • Home.tsx       (useAuth + logOut button)        │ │   │
│  │  │ • Reminders.tsx  (useReminders + useAuth)         │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │      Hooks (Data Management)                       │ │   │
│  │  ├────────────────────────────────────────────────────┤ │   │
│  │  │ • useAuth()          → { user, loading }          │ │   │
│  │  │ • useReminders()     → { reminders, add, delete } │ │   │
│  │  │ • useFirebaseReminders() [syncs with Firestore]   │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ (HTTP/WebSocket)
                       │
         ┌─────────────▼────────────────┐
         │    FIREBASE / GOOGLE         │
         ├──────────────────────────────┤
         │                              │
         │  ┌────────────────────────┐  │
         │  │   Authentication       │  │
         │  ├────────────────────────┤  │
         │  │ • Sign Up              │  │
         │  │ • Sign In              │  │
         │  │ • Google OAuth         │  │
         │  │ • Session Management   │  │
         │  └────────────────────────┘  │
         │                              │
         │  ┌────────────────────────┐  │
         │  │   Firestore Database   │  │
         │  ├────────────────────────┤  │
         │  │ Collection: reminders  │  │
         │  │  • id                  │  │
         │  │  • userId (secure)     │  │
         │  │  • time                │  │
         │  │  • message             │  │
         │  │  • type                │  │
         │  │  • triggered           │  │
         │  │  • createdAt           │  │
         │  └────────────────────────┘  │
         │                              │
         └──────────────────────────────┘
```

## Data Flow - Sign Up

```
User fills form
       ↓
SignUp.tsx → signUp(email, password)
       ↓
firebase/auth.ts → createUserWithEmailAndPassword()
       ↓
Firebase Authentication ✓
       ↓
User created + session started
       ↓
Navigate to home page
```

## Data Flow - Create Reminder

```
Reminders.tsx (useReminders)
       ↓
addReminder({ type: "one-time", value: "14:30" })
       ↓
useFirebaseReminders.ts
       ↓
Add document to Firestore
       ↓
Firestore "reminders" collection
       ↓
Real-time listener updates UI
       ↓
Reminder appears in list
```

## Data Flow - Fetch Reminders

```
App loads
       ↓
AuthProvider checks auth state
       ↓
useReminders() hook mounted
       ↓
onSnapshot listener to Firestore
       ↓
Query: WHERE userId == currentUser.uid
       ↓
Receive matching reminders
       ↓
Update local state
       ↓
UI renders reminders
       ↓
Listener continues watching for changes
```

## Security Layers

```
┌─────────────────────────────────────┐
│   User wants to read reminders     │
├─────────────────────────────────────┤
│ Layer 1: Is user authenticated?     │
│          (Firebase Auth)            │
│          YES → Continue            │
│          NO  → Redirect to login   │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│ Layer 2: Can user access this data? │
│          (Firestore Rules)          │
│          request.auth.uid ==        │
│          resource.data.userId       │
│          YES → Return data         │
│          NO  → Permission denied   │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│       User sees their reminders     │
│        (No other user's data)       │
└─────────────────────────────────────┘
```

## File Dependencies

```
src/
│
├── main.tsx
│   └─> App.tsx
│       └─> <AuthProvider>
│           │
│           ├─> src/contexts/AuthContext.tsx
│           │   └─> src/firebase/config.ts
│           │   └─> src/firebase/auth.ts
│           │
│           └─> Pages:
│               │
│               ├─> Login.tsx
│               │   └─> src/firebase/auth.ts
│               │
│               ├─> SignUp.tsx
│               │   └─> src/firebase/auth.ts
│               │
│               └─> Reminders.tsx
│                   ├─> useAuth (from AuthContext)
│                   └─> useReminders (from hooks)
│                       └─> src/hooks/useFirebaseReminders.ts
│                           └─> src/firebase/config.ts
```

## Component Communication

```
┌──────────────────────────────────────────┐
│        AuthProvider (Context)            │
│  Provides: useAuth() hook to all children│
└──────────┬───────────────────────────────┘
           │
    ┌──────┴──────────────────────────────┐
    │                                       │
┌───▼───────────────┐          ┌──────────▼──────┐
│ Login Component   │          │ Reminders Cpt   │
│ useAuth()         │          │ useAuth()        │
│ logIn()           │          │ useReminders()   │
└───────────────────┘          └──────────────────┘
         │                             │
         └──────────────┬──────────────┘
                        │
                   Firebase
                   (Shared state)
```

## Authentication State Machine

```
                   ┌──────────────────┐
                   │   App Starts     │
                   │  loading = true  │
                   └────────┬─────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │  onAuthStateChanged() checks session  │
        └───────────────────────────────────────┘
           │                       │
           │                       │
      Session           No active session
      found              (new user)
      ┌────┘ └─────────────────┐
      │                         │
      ▼                         ▼
  ┌─────────┐          ┌──────────────────┐
  │ user ≠  │          │  user = null     │
  │  null   │          │  loading = false │
  │  loading │          └──────────────────┘
  │ = false │                 │
  └────┬────┘                 │
       │                  User sees:
   User sees:             - Login page
   - Home page            - SignUp page
   - Reminders
   - User features

       │                      │
       └──────────────────────┘
              │
         User clicks "Sign Out"
              │
              ▼
      ┌───────────────┐
      │  user = null  │
      │ loading=false │
      │ Back to login │
      └───────────────┘
```

## Real-time Sync Flow

```
User A on Device 1          User A on Device 2          User B
    │                              │                        │
    │ Add reminder                 │                        │
    ├──→ Firestore                 │                        │
    │    (reminders collection)    │                        │
    │       ↓                       │                        │
    │    Rules check:              │                        │
    │    userId matches? ✓         │                        │
    │       ↓                       │                        │
    │    Document added            │                        │
    │       ↓                       │                        │
    │ ← Update via listener         ← Listener triggers     (Can't see
    │   (real-time)               (real-time)             reminder
    │       ↓                       ↓                      - different
    │   UI refreshes            UI refreshes              userId)
    │                               │
    │ Both devices show same reminder instantly
    │ No need to refresh page
    └────────────────────────────────┘
```

---

This architecture ensures:
✅ **Security** - Users can only access their own data  
✅ **Real-time** - Changes sync instantly across devices  
✅ **Scalability** - Firebase handles all infrastructure  
✅ **Reliability** - Built-in backup and redundancy  
✅ **User Experience** - No manual refresh needed  
