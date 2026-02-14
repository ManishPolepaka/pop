# POP System Setup Guide

## Overview

The POP system is a content library that provides engaging messages to users. POPs are stored in Firebase Firestore.

## Adding Sample POPs to Firebase

### Method 1: Firebase Console (Easiest)

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Create a new collection called **`pops`**
5. Add these sample documents:

#### Copy-Paste Sample POPs

Use the +Add Document button and paste these as new documents (set custom ID field to auto):

```json
{
  "category": "motivation",
  "content": "What would you attempt if you knew you couldn't fail?",
  "difficulty": 3,
  "tags": ["inspiration", "dreams"],
  "isActive": true,
  "createdAt": "2024-1-1",
  "updatedAt": "2024-1-1"
}
```

**Copy all samples from POP_SAMPLES.json in the repo or use the bulk import below:**

### Method 2: Bulk Import (Recommended)

1. Create a new collection: **`pops`**
2. Use Firebase bulk import:
   - Click ... (three dots) on the collection
   - Select **Export collection**
   - Or import from a JSON file

### Sample POPs to Add

Place these 50+ POPs in your Firestore `pops` collection:

#### Motivation (10)
```
1. "What's one small win you had today?"
2. "You're stronger than you think!"
3. "What would you attempt if you knew you couldn't fail?"
4. "Every expert was once a beginner"
5. "What can you learn from today?"
6. "How are you growing?"
7. "You've overcome challenges before, you can again"
8. "What brings you joy?"
9. "Small progress is still progress"
10. "What are you proud of right now?"
```

#### Funny (10)
```
1. "Why did the scarecrow win an award? He was outstanding in his field!"
2. "What do you call a bear with no teeth? A gummy bear!"
3. "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!"
4. "Why don't scientists trust atoms? Because they make up everything!"
5. "What did the ocean say to the beach? Nothing, it just waved!"
6. "Why did coffee file a police report? It got mugged!"
7. "How do you organize a space party? You planet!"
8. "What's the best thing about Switzerland? I don't know, but their flag is a big plus!"
9. "Why don't eggs tell jokes? They'd crack each other up!"
10. "What do you call a fake noodle? An impasta!"
```

#### Wellness (10)
```
1. "When was the last time you took a break?"
2. "Drink water! Your brain needs it 💧"
3. "Take 5 deep breaths right now"
4. "Stretch for 2 minutes - your body will thank you"
5. "Step outside for fresh air if you can"
6. "How are you feeling right now?"
7. "Try a 1-minute meditation"
8. "Move around a bit - sitting too long isn't ideal"
9. "What's one healthy habit you can start today?"
10. "Self-care isn't selfish - what do you need right now?"
```

#### Thought-Provoking (10)
```
1. "What would your 10-year-old self think of you now?"
2. "What are you avoiding?"
3. "If money wasn't a factor, what would you do?"
4. "What does success mean to you?"
5. "Who has influenced you most and why?"
6. "What belief do you hold that might be wrong?"
7. "How do you define happiness?"
8. "What's something you've been meaning to do?"
9. "What would change if you weren't afraid?"
10. "What does a good day look like for you?"
```

#### Facts (10)
```
1. "Did you know? Octopuses have 3 hearts!"
2. "Fun fact: Honey never spoils - archaeologists found 3000-year-old honey that was still edible"
3. "Bananas are berries, but strawberries aren't!"
4. "A group of flamingos is called a 'flamboyance'"
5. "Did you know? Bumblebees can recognize human faces"
6. "Honey bees can see ultraviolet light that humans cannot"
7. "A day on Venus is longer than its year"
8. "Butterflies taste with their feet"
9. "Your nose can remember 50,000 different scents"
10. "Did you know? Cats have over 230 bones in their body"
```

#### Gratitude (10)
```
1. "Name 3 things you're grateful for"
2. "Who made you smile recently?"
3. "What's a simple pleasure you enjoyed today?"
4. "What's something you often take for granted?"
5. "Who do you appreciate in your life?"
6. "What's something your body lets you do that you're grateful for?"
7. "What's a privilege you have that not everyone has?"
8. "What made you laugh recently?"
9. "Who has supported you recently?"
10. "What small thing brightened your day?"
```

## Adding POPs Programmatically

### Using the Reminders Page

Once you've added the sample data above, the app will:
1. Automatically pick random POPs from your library
2. Display them when reminders trigger
3. Show them in the notification popup

### Checking if POPs are Working

1. Open the app in browser: `npm run dev`
2. Create a reminder
3. When the reminder triggers, you should see a random POP message
4. Check the browser console for any errors

## Database Structure

Each POP document has:
- `content` (string): The actual message
- `category` (enum): one of [motivation, funny, wellness, thought, fact, gratitude]
- `difficulty` (number): 1-5 (1=light, 5=deep)
- `tags` (array): Keywords for searching/filtering
- `isActive` (boolean): Whether this POP should be used
- `createdAt` (timestamp): When created
- `updatedAt` (timestamp): Last updated

## Updating POPs Later

To add more POPs:
1. Open Firebase Console
2. Go to Firestore → pops collection
3. Click **Add document**
4. Fill in the fields
5. Click **Save**

The app will automatically use the new POPs!

## Troubleshooting

**Q: I added POPs but reminders still show empty messages**
A: Make sure `isActive` is set to `true` for your POPs

**Q: My POPs aren't showing up**
A: 
- Check Firestore Rules - they should allow reads
- Verify POPs are in the `pops` collection
- Check browser console for errors

**Q: How do I disable a POP?**
A: Set `isActive` to `false` in that document

## Next: User POP Preferences

Later, we'll add:
- User-specific category preferences
- Favorite POPs
- User-submitted POPs
- POP scheduling

## API Reference

See `src/firebase/pops.ts` for backend functions:
- `getRandomPOP()` - Get any random POP
- `getRandomPOPByCategory()` - Get from specific category
- `getPOPsByCategory()` - Get all in a category
- `getPOPById(id)` - Get specific POP
- `getAllPOPCategories()` - List all categories

See `src/hooks/usePops.ts` for React hook with these methods.
