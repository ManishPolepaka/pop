#!/usr/bin/env node

/**
 * Normalize users collection documents.
 *
 * What this script does:
 * - Adds role: "user" when role is missing.
 * - Removes deprecated fields: friends, sentRequests, receivedRequests.
 * - Optionally sets one user as admin.
 *
 * Usage:
 *   node scripts/normalize-users.js
 *   node scripts/normalize-users.js --apply
 *   node scripts/normalize-users.js --apply --admin-uid <UID>
 *   node scripts/normalize-users.js --apply --admin-email <EMAIL>
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, "../firebase-service-account.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("firebase-service-account.json was not found at project root.");
  process.exit(1);
}

const args = process.argv.slice(2);
const shouldApply = args.includes("--apply");

const adminUidIndex = args.indexOf("--admin-uid");
const adminEmailIndex = args.indexOf("--admin-email");
const adminUid = adminUidIndex >= 0 ? args[adminUidIndex + 1] : null;
const adminEmail = adminEmailIndex >= 0 ? args[adminEmailIndex + 1] : null;

if (adminUidIndex >= 0 && !adminUid) {
  console.error("Missing value for --admin-uid");
  process.exit(1);
}

if (adminEmailIndex >= 0 && !adminEmail) {
  console.error("Missing value for --admin-email");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const deprecatedFields = ["friends", "sentRequests", "receivedRequests"];

async function resolveAdminUid() {
  if (adminUid) return adminUid;
  if (!adminEmail) return null;

  const snapshot = await db
    .collection("users")
    .where("email", "==", adminEmail)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error(`No user found with email ${adminEmail}`);
  }

  return snapshot.docs[0].id;
}

async function normalizeUsers() {
  const targetAdminUid = await resolveAdminUid();
  const snapshot = await db.collection("users").get();

  console.log(`Found ${snapshot.size} user documents.`);
  console.log(shouldApply ? "Mode: APPLY" : "Mode: DRY RUN");

  let changedCount = 0;
  let roleAddedCount = 0;
  let deprecatedRemovedCount = 0;
  let adminAssignedCount = 0;

  const batch = db.batch();

  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    const updates = {};

    if (typeof data.role !== "string" || data.role.trim() === "") {
      updates.role = "user";
      roleAddedCount += 1;
    }

    for (const field of deprecatedFields) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        updates[field] = admin.firestore.FieldValue.delete();
        deprecatedRemovedCount += 1;
      }
    }

    if (targetAdminUid && userDoc.id === targetAdminUid) {
      updates.role = "admin";
      adminAssignedCount = 1;
    }

    if (Object.keys(updates).length === 0) {
      continue;
    }

    changedCount += 1;

    if (shouldApply) {
      batch.update(userDoc.ref, updates);
    }

    console.log(`- ${userDoc.id}: ${JSON.stringify(updates)}`);
  }

  if (shouldApply && changedCount > 0) {
    await batch.commit();
  }

  console.log("\nSummary:");
  console.log(`Changed documents: ${changedCount}`);
  console.log(`Missing role fixed: ${roleAddedCount}`);
  console.log(`Deprecated fields removed: ${deprecatedRemovedCount}`);
  console.log(`Admin assignments: ${adminAssignedCount}`);

  if (!shouldApply) {
    console.log("\nDry run complete. Re-run with --apply to write changes.");
  }
}

normalizeUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Normalization failed:", error.message);
    process.exit(1);
  });
