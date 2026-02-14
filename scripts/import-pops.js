#!/usr/bin/env node

/**
 * Import script to add 35 thought-provoking questions to Firestore
 * Usage: node scripts/import-pops.js
 * 
 * This script reads the pops-questions.json and uploads all questions to the 'pops' collection
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if service account file exists
const serviceAccountPath = path.join(__dirname, "../firebase-service-account.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error(
    "❌ ERROR: firebase-service-account.json not found at:",
    serviceAccountPath
  );
  console.error("\n📋 To set up Firebase Admin SDK:");
  console.error("1. Go to https://console.firebase.google.com");
  console.error("2. Select your 'pop' project");
  console.error("3. Go to Project Settings → Service Accounts");
  console.error("4. Click 'Generate New Private Key'");
  console.error("5. Save the downloaded JSON as firebase-service-account.json in project root");
  console.error("6. Run this script again\n");
  process.exit(1);
}

try {
  // Initialize Firebase Admin
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const db = admin.firestore();

  // Read the questions file
  const questionsPath = path.join(__dirname, "../public/pops-questions.json");

  if (!fs.existsSync(questionsPath)) {
    console.error("❌ ERROR: public/pops-questions.json not found");
    process.exit(1);
  }

  const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

  console.log(`📚 Found ${questions.length} questions to import\n`);

  // Upload to Firestore
  async function importQuestions() {
    const batch = db.batch();
    let count = 0;

    for (const question of questions) {
      const popRef = db.collection("pops").doc();

      // Add timestamps
      const popData = {
        ...question,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(popRef, popData);
      count++;

      // Firestore has a limit of 500 writes per batch
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`✅ Uploaded ${count} questions...`);
      }
    }

    // Commit remaining documents
    if (count % 500 !== 0) {
      await batch.commit();
    }

    console.log(`\n🎉 Successfully imported ${count} questions to Firestore!\n`);
    console.log("📊 Collection: 'pops'");
    console.log("📝 Documents: " + count);
    console.log(
      "\n✅ You can now:"
    );
    console.log("1. Refresh your browser");
    console.log("2. Create a reminder");
    console.log("3. When it triggers, you'll see one of the 35 questions\n");

    process.exit(0);
  }

  importQuestions().catch((error) => {
    console.error("❌ Import failed:", error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error("- Check your firebase-service-account.json is valid");
    console.error("- Verify your Firestore rules allow writes");
    console.error("- Check your internet connection");
    process.exit(1);
  });
} catch (error) {
  console.error("❌ Setup error:", error.message);
  process.exit(1);
}

