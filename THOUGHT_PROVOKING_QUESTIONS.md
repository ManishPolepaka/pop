# Pop Questions - Comprehensive Library

## All Questions Organized by Category

### 🧠 CURIOSITY TRAPS (Thought-Provoking - Difficulty 4-5)

1. "Why do you check your phone when nothing new is there?"
2. "What are you actually waiting for?"
3. "If scrolling worked, wouldn't you be satisfied by now?"
4. "What problem are you avoiding right now?"
5. "What thought keeps returning when things go quiet?"

### 🪞 SELF-AWARENESS QUESTIONS (Thought-Provoking - Difficulty 4)

6. "What does your phone usage say about your life right now?"
7. "Are you bored… or afraid to be alone with your thoughts?"
8. "What feeling made you pick up the phone this time?"
9. "If someone copied your daily habits, would you admire them?"
10. "When did you last choose focus over comfort?"

### ⏳ TIME & LIFE MIRROR QUESTIONS (Thought-Provoking - Difficulty 4)

11. "Where is your attention going — and where is your life going?"
12. "If today repeated for 5 years, would you be okay with that?"
13. "What did you do last week that actually mattered?"
14. "Are you spending time… or losing it?"
15. "What will you wish you had focused on more?"

### 🪪 IDENTITY & SELF-IMAGE QUESTIONS (Thought-Provoking - Difficulty 4)

16. "Is this how the person you respect lives?"
17. "Are you a consumer… or a creator?"
18. "What kind of life requires less distraction?"
19. "What version of yourself are you feeding right now?"
20. "Who are you becoming, one scroll at a time?"

### 🤯 PARADOX & CONTRADICTION QUESTIONS (Thought-Provoking - Difficulty 5)

21. "Why does more information make you feel more confused?"
22. "Why does rest with a phone feel exhausting?"
23. "If distraction made you happy, wouldn't you feel fulfilled?"
24. "Why do you escape when nothing is chasing you?"
25. "What if comfort is the real problem?"

### 😶 SILENCE-BASED QUESTIONS (Thought-Provoking - Difficulty 3-4)

26. "What are you avoiding?"
27. "What matters right now?"
28. "Why not focus?"
29. "What are you trading your attention for?"
30. "What are you becoming?"

### 🔥 EXISTENTIAL / MEANING QUESTIONS (Thought-Provoking - Difficulty 5)

31. "What problem are you here to solve?"
32. "If your life had a theme, what would it be?"
33. "What would make today feel meaningful?"
34. "What would you do if you weren't afraid?"
35. "What deserves your full attention?"

---

## Firebase Import Format

### Method 1: Copy-Paste Individual Documents

Go to Firebase Console → Firestore → pops collection → Add Document

**Document 1:**
```json
{
  "content": "Why do you check your phone when nothing new is there?",
  "category": "thought",
  "difficulty": 4,
  "tags": ["curiosity", "habit", "awareness"],
  "isActive": true,
  "createdAt": "2024-02-09",
  "updatedAt": "2024-02-09"
}
```

**Document 2:**
```json
{
  "content": "What are you actually waiting for?",
  "category": "thought",
  "difficulty": 4,
  "tags": ["curiosity", "intention"],
  "isActive": true,
  "createdAt": "2024-02-09",
  "updatedAt": "2024-02-09"
}
```

[And so on for all 35...]

### Method 2: Bulk JSON Import (Best)

Create a file `pops.json` with this content, then import to Firebase:

```json
[
  {
    "content": "Why do you check your phone when nothing new is there?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["curiosity", "habit", "awareness"],
    "isActive": true
  },
  {
    "content": "What are you actually waiting for?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["curiosity", "intention"],
    "isActive": true
  },
  {
    "content": "If scrolling worked, wouldn't you be satisfied by now?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["curiosity", "satisfaction"],
    "isActive": true
  },
  {
    "content": "What problem are you avoiding right now?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["avoidance", "self-awareness"],
    "isActive": true
  },
  {
    "content": "What thought keeps returning when things go quiet?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["silence", "introspection"],
    "isActive": true
  },
  {
    "content": "What does your phone usage say about your life right now?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["self-awareness", "reflection"],
    "isActive": true
  },
  {
    "content": "Are you bored… or afraid to be alone with your thoughts?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["fear", "emotions"],
    "isActive": true
  },
  {
    "content": "What feeling made you pick up the phone this time?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["emotions", "triggers"],
    "isActive": true
  },
  {
    "content": "If someone copied your daily habits, would you admire them?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["identity", "values"],
    "isActive": true
  },
  {
    "content": "When did you last choose focus over comfort?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["discipline", "choice"],
    "isActive": true
  },
  {
    "content": "Where is your attention going — and where is your life going?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["attention", "life-direction"],
    "isActive": true
  },
  {
    "content": "If today repeated for 5 years, would you be okay with that?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["time", "meaning"],
    "isActive": true
  },
  {
    "content": "What did you do last week that actually mattered?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["reflection", "meaning"],
    "isActive": true
  },
  {
    "content": "Are you spending time… or losing it?",
    "category": "thought",
    "difficulty": 3,
    "tags": ["time", "awareness"],
    "isActive": true
  },
  {
    "content": "What will you wish you had focused on more?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["future", "regret-prevention"],
    "isActive": true
  },
  {
    "content": "Is this how the person you respect lives?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["identity", "values"],
    "isActive": true
  },
  {
    "content": "Are you a consumer… or a creator?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["identity", "purpose"],
    "isActive": true
  },
  {
    "content": "What kind of life requires less distraction?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["life-design", "focus"],
    "isActive": true
  },
  {
    "content": "What version of yourself are you feeding right now?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["self-development", "habits"],
    "isActive": true
  },
  {
    "content": "Who are you becoming, one scroll at a time?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["identity", "consequences"],
    "isActive": true
  },
  {
    "content": "Why does more information make you feel more confused?",
    "category": "thought",
    "difficulty": 5,
    "tags": ["paradox", "clarity"],
    "isActive": true
  },
  {
    "content": "Why does rest with a phone feel exhausting?",
    "category": "thought",
    "difficulty": 5,
    "tags": ["paradox", "rest"],
    "isActive": true
  },
  {
    "content": "If distraction made you happy, wouldn't you feel fulfilled?",
    "category": "thought",
    "difficulty": 5,
    "tags": ["paradox", "happiness"],
    "isActive": true
  },
  {
    "content": "Why do you escape when nothing is chasing you?",
    "category": "thought",
    "difficulty": 5,
    "tags": ["paradox", "escape"],
    "isActive": true
  },
  {
    "content": "What if comfort is the real problem?",
    "category": "thought",
    "difficulty": 5,
    "tags": ["paradox", "comfort"],
    "isActive": true
  },
  {
    "content": "What are you avoiding?",
    "category": "thought",
    "difficulty": 3,
    "tags": ["silence", "avoidance"],
    "isActive": true
  },
  {
    "content": "What matters right now?",
    "category": "thought",
    "difficulty": 3,
    "tags": ["silence", "priorities"],
    "isActive": true
  },
  {
    "content": "Why not focus?",
    "category": "thought",
    "difficulty": 3,
    "tags": ["silence", "focus"],
    "isActive": true
  },
  {
    "content": "What are you trading your attention for?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["silence", "trade-offs"],
    "isActive": true
  },
  {
    "content": "What are you becoming?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["silence", "identity"],
    "isActive": true
  },
  {
    "content": "What problem are you here to solve?",
    "category": "thought",
    "difficulty": 5,
    "tags": ["existential", "purpose"],
    "isActive": true
  },
  {
    "content": "If your life had a theme, what would it be?",
    "category": "thought",
    "difficulty": 5,
    "tags": ["existential", "meaning"],
    "isActive": true
  },
  {
    "content": "What would make today feel meaningful?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["existential", "meaning"],
    "isActive": true
  },
  {
    "content": "What would you do if you weren't afraid?",
    "category": "thought",
    "difficulty": 5,
    "tags": ["existential", "fear"],
    "isActive": true
  },
  {
    "content": "What deserves your full attention?",
    "category": "thought",
    "difficulty": 4,
    "tags": ["existential", "priorities"],
    "isActive": true
  }
]
```

---

## How to Import to Firebase

### Option A: Firebase Console (Manual)
1. Go to Firestore Database
2. Go to `pops` collection
3. Click **+ Add document** for each question
4. Copy the JSON from above

### Option B: Firebase CLI (Batch Upload)
```bash
# Install Firebase CLI if not already
npm install -g firebase-tools

# Login
firebase login

# Create import script and run
firebase firestore:delete pops --recursive  # Optional: clear existing
# Then use console import feature or custom script
```

### Option C: Code Import
Create a temp script in your app:
```typescript
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase/config";

const SAMPLE_POPS = [
  // ... paste the array from above
];

export const importPOPs = async () => {
  const popsRef = collection(db, "pops");
  for (const pop of SAMPLE_POPS) {
    await addDoc(popsRef, {
      ...pop,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log("✅ All POPs imported!");
};

// Call once: importPOPs();
```

---

## Summary

- **Total Questions:** 35
- **Category:** All "thought-provoking"
- **Difficulty:** Mix of 3-5 (deep introspection)
- **Purpose:** Combat phone addiction with meaningful reflection
- **Design:** Questions that make the user THINK instead of scroll

---

## Next Steps

1. **Choose your import method** (Console is easiest)
2. **Add all 35 POPs** to your Firebase `pops` collection
3. **Test locally:**
   ```bash
   npm run dev
   # Create reminder
   # You'll now see one of these powerful questions!
   ```

Your app just became a **mindfulness tool** instead of just another reminder app! 🎯
