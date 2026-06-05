// This script imports the updated categorized POP questions into Firebase
// Run with: node scripts/import-updated-pops.js

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK (make sure your service account exists)
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://diverto-cf689.firebaseio.com',
});

const db = admin.firestore();

async function importUpdatedPOPs() {
  try {
    console.log('📖 Reading updated POP questions from JSON...');
    
    // Read the updated questions from public/pops-questions.json
    const questionsPath = path.join(__dirname, '../public/pops-questions.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsData);

    console.log(`✅ Found ${questions.length} questions`);

    // Clear old questions (optional - comment out if you want to keep old data)
    console.log('🗑️  Clearing old questions from Firebase...');
    const snapshot = await db.collection('pops').get();
    let deletedCount = 0;
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
      deletedCount++;
    }
    console.log(`✅ Deleted ${deletedCount} old questions`);

    // Add new questions
    console.log('📝 Importing updated questions...');
    let importedCount = 0;
    
    for (const question of questions) {
      await db.collection('pops').add({
        ...question,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      importedCount++;
      if (importedCount % 10 === 0) {
        console.log(`   Imported ${importedCount}/${questions.length}...`);
      }
    }

    console.log(`\n✅ Successfully imported ${importedCount} questions!`);
    console.log('\n📊 Categories added:');
    const categories = [...new Set(questions.map(q => q.category))];
    categories.forEach((cat, i) => {
      const count = questions.filter(q => q.category === cat).length;
      console.log(`   ${i + 1}. ${cat} (${count} questions)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing questions:', error);
    process.exit(1);
  }
}

importUpdatedPOPs();
