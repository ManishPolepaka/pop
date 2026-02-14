# Firebase API Reference

## Authentication Functions

### `src/firebase/auth.ts`

#### `signUp(email: string, password: string): Promise<User>`
Create a new user account.

```tsx
import { signUp } from "@/firebase/auth"

try {
  const user = await signUp("user@example.com", "password123")
  console.log("Account created:", user.uid)
} catch (error) {
  console.error("Sign up failed:", error)
}
```

#### `logIn(email: string, password: string): Promise<User>`
Sign in with email and password.

```tsx
import { logIn } from "@/firebase/auth"

try {
  const user = await logIn("user@example.com", "password123")
  console.log("Logged in as:", user.email)
} catch (error) {
  console.error("Login failed:", error)
}
```

#### `logOut(): Promise<void>`
Sign out the current user.

```tsx
import { logOut } from "@/firebase/auth"

await logOut()
// User is now signed out
```

#### `signInWithGoogle(): Promise<User>`
Sign in using Google account.

```tsx
import { signInWithGoogle } from "@/firebase/auth"

try {
  const user = await signInWithGoogle()
  console.log("Signed in with Google:", user.email)
} catch (error) {
  console.error("Google sign-in failed:", error)
}
```

#### `getCurrentUser(): User | null`
Get the currently authenticated user.

```tsx
import { getCurrentUser } from "@/firebase/auth"

const user = getCurrentUser()
if (user) {
  console.log("Current user:", user.email)
} else {
  console.log("No user signed in")
}
```

---

## Auth Context

### `src/contexts/AuthContext.tsx`

#### `useAuth(): { user: User | null; loading: boolean }`
Hook to access authentication state anywhere in your app.

```tsx
import { useAuth } from "@/contexts/AuthContext"

function MyComponent() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>

  return <div>Welcome, {user.email}</div>
}
```

**Return Values:**
- `user` - Current authenticated user or null
- `loading` - True while checking auth status

---

## Reminders Hook

### `src/hooks/useFirebaseReminders.ts`

#### `useReminders(): ReminderState`

Get access to reminder operations and state.

```tsx
import { useReminders } from "@/hooks/useFirebaseReminders"

function MyReminders() {
  const {
    reminders,
    activeNotification,
    addReminder,
    deleteReminder,
    dismissNotification,
    user,
    loading
  } = useReminders()

  // Use these in your component
}
```

**Return Value Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `reminders` | `Reminder[]` | Array of pending reminders |
| `activeNotification` | `Reminder \| null` | Currently active notification |
| `addReminder` | `(time) => Promise<void>` | Add new reminder |
| `deleteReminder` | `(id) => Promise<void>` | Delete reminder |
| `dismissNotification` | `() => Promise<void>` | Dismiss active notification |
| `user` | `User \| null` | Current user |
| `loading` | `boolean` | Loading state |

#### `addReminder(time: ReminderInput): Promise<void>`

Add a new reminder. Two formats:

**One-time Reminder:**
```tsx
await addReminder({
  type: "one-time",
  value: "14:30"  // HH:MM format
})
```

**Recurring Reminder:**
```tsx
await addReminder({
  type: "recurring",
  value: "09:00",  // Starting time
  interval: 15     // Every 15 minutes
})
```

#### `deleteReminder(id: string): Promise<void>`

Delete a reminder by ID.

```tsx
const reminder = reminders[0]
await deleteReminder(reminder.id)
```

#### `dismissNotification(): Promise<void>`

Close and delete the active notification.

```tsx
await dismissNotification()
```

---

## Reminder Data Model

```typescript
interface Reminder {
  id: string                           // Unique ID
  time: string                         // Time in HH:MM format
  message: string                      // Reminder message
  triggered: boolean                   // Was it triggered?
  type: "one-time" | "recurring"      // Reminder type
  interval?: number                    // Minutes (for recurring)
  userId: string                       // Owner's user ID
  createdAt: Timestamp                 // Creation timestamp
}
```

---

## Common Patterns

### Protected Component (Auth Required)

```tsx
import { useAuth } from "@/contexts/AuthContext"
import { Navigate } from "react-router-dom"

function ProtectedPage() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />

  return <div>This page is private</div>
}
```

### Display User Info

```tsx
import { useAuth } from "@/contexts/AuthContext"

function UserCard() {
  const { user } = useAuth()

  if (!user) return <div>Not signed in</div>

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>UID: {user.uid}</p>
      <p>Verified: {user.emailVerified}</p>
    </div>
  )
}
```

### List All Reminders

```tsx
import { useReminders } from "@/hooks/useFirebaseReminders"

function RemindersList() {
  const { reminders, deleteReminder } = useReminders()

  return (
    <div>
      {reminders.map(reminder => (
        <div key={reminder.id}>
          <span>{reminder.time}</span>
          <button onClick={() => deleteReminder(reminder.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Create a Reminder

```tsx
import { useReminders } from "@/hooks/useFirebaseReminders"
import { useState } from "react"

function AddReminder() {
  const [time, setTime] = useState("09:00")
  const { addReminder } = useReminders()

  const handleAdd = async () => {
    await addReminder({
      type: "one-time",
      value: time
    })
    setTime("09:00")
  }

  return (
    <div>
      <input 
        type="time" 
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <button onClick={handleAdd}>Add Reminder</button>
    </div>
  )
}
```

### Sign Out Button

```tsx
import { logOut } from "@/firebase/auth"

function SignOutButton() {
  const handleSignOut = async () => {
    await logOut()
    // User is signed out, redirect as needed
  }

  return <button onClick={handleSignOut}>Sign Out</button>
}
```

---

## Error Handling

### Common Error Codes

```tsx
try {
  await logIn(email, password)
} catch (error) {
  const err = error as any
  
  if (err.code === "auth/user-not-found") {
    console.log("No account with this email")
  } else if (err.code === "auth/wrong-password") {
    console.log("Incorrect password")
  } else if (err.code === "auth/email-already-in-use") {
    console.log("Email already registered")
  } else if (err.code === "auth/weak-password") {
    console.log("Password must be at least 6 characters")
  }
}
```

### Error Best Practices

```tsx
import { useReminders } from "@/hooks/useFirebaseReminders"

function SafeReminder() {
  const { addReminder } = useReminders()
  const [error, setError] = useState("")

  const handleAdd = async () => {
    setError("")
    try {
      await addReminder({ type: "one-time", value: "14:30" })
    } catch (err) {
      setError("Failed to add reminder")
      console.error(err)
    }
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleAdd}>Add</button>
    </div>
  )
}
```

---

## TypeScript Types

```typescript
import { User } from "firebase/auth"
import { Timestamp } from "firebase/firestore"

interface Reminder {
  id: string
  time: string
  message: string
  triggered: boolean
  type: "one-time" | "recurring"
  interval?: number
  userId: string
  createdAt: Timestamp
}

interface ReminderInput {
  type: "one-time" | "recurring"
  value: string
  interval?: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
}

interface ReminderState {
  reminders: Reminder[]
  activeNotification: Reminder | null
  addReminder: (time: ReminderInput | string) => Promise<void>
  deleteReminder: (id: string) => Promise<void>
  dismissNotification: () => Promise<void>
  user: User | null
  loading: boolean
}
```

---

## Firebase Console Links

- [Firestore Database](https://console.firebase.google.com/u/0/project/diverto-12a71/firestore)
- [Authentication](https://console.firebase.google.com/u/0/project/diverto-12a71/authentication)
- [Project Settings](https://console.firebase.google.com/u/0/project/diverto-12a71/settings)
