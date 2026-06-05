import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = join(__dirname, '../firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://diverto-c7d9c.firebaseio.com'
});

const db = admin.firestore();

async function deleteOldReminders() {
  console.log('🗑️  Deleting old global reminders collection...');
  
  try {
    const remindersRef = db.collection('reminders');
    const snapshot = await remindersRef.get();
    
    if (snapshot.empty) {
      console.log('✅ No reminders found to delete');
      return;
    }
    
    console.log(`Found ${snapshot.size} old reminders to delete`);
    
    const batch = db.batch();
    let count = 0;
    
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
      if (count % 10 === 0) {
        console.log(`   Queued ${count}/${snapshot.size}...`);
      }
    });
    
    await batch.commit();
    console.log(`✅ Successfully deleted ${snapshot.size} old reminders`);
    console.log('📝 New reminders will be created in users/{userId}/reminders/');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting old reminders:', error);
    process.exit(1);
  }
}

deleteOldReminders();
