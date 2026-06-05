// This script imports Insight KB principles + questions + answer choices into Firebase
// Run with: node scripts/import-insights-kb.js

import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import ts from "typescript";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_CATEGORY = "insights KB";
const PRINCIPLES_COLLECTION = "insight_kb_principles";
const QUESTIONS_COLLECTION = "insight_kb_questions";
const CHOICES_COLLECTION = "insight_kb_choices";

const serviceAccountPath = path.join(__dirname, "../firebase-service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://diverto-cf689.firebaseio.com",
});

const db = admin.firestore();

const isLiteralNode = (node) =>
  ts.isObjectLiteralExpression(node) ||
  ts.isArrayLiteralExpression(node) ||
  ts.isStringLiteral(node) ||
  ts.isNoSubstitutionTemplateLiteral(node) ||
  ts.isNumericLiteral(node) ||
  ts.isIdentifier(node) ||
  ts.isParenthesizedExpression(node) ||
  node.kind === ts.SyntaxKind.TrueKeyword ||
  node.kind === ts.SyntaxKind.FalseKeyword ||
  node.kind === ts.SyntaxKind.NullKeyword ||
  ts.isPrefixUnaryExpression(node);

const literalToValue = (node, context = {}, seen = new Set()) => {
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isIdentifier(node)) {
    if (node.text === "undefined") return undefined;
    const target = context[node.text];
    if (!target) {
      throw new Error(`Identifier ${node.text} not found in literal context`);
    }
    if (seen.has(node.text)) {
      throw new Error(`Circular identifier reference detected: ${node.text}`);
    }
    const nextSeen = new Set(seen);
    nextSeen.add(node.text);
    return literalToValue(target, context, nextSeen);
  }
  if (ts.isParenthesizedExpression(node)) {
    return literalToValue(node.expression, context, seen);
  }

  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) {
    const value = Number(node.operand.text);
    if (node.operator === ts.SyntaxKind.MinusToken) return -value;
    if (node.operator === ts.SyntaxKind.PlusToken) return value;
  }

  if (ts.isArrayLiteralExpression(node)) {
    const out = [];
    for (const element of node.elements) {
      if (ts.isSpreadElement(element)) {
        const spreadValue = literalToValue(element.expression, context, seen);
        if (!Array.isArray(spreadValue)) {
          throw new Error("Spread element must resolve to an array");
        }
        out.push(...spreadValue);
      } else {
        out.push(literalToValue(element, context, seen));
      }
    }
    return out;
  }

  if (ts.isObjectLiteralExpression(node)) {
    const out = {};
    for (const prop of node.properties) {
      if (ts.isSpreadAssignment(prop)) {
        const spreadValue = literalToValue(prop.expression, context, seen);
        if (!spreadValue || typeof spreadValue !== "object" || Array.isArray(spreadValue)) {
          throw new Error("Object spread must resolve to an object");
        }
        Object.assign(out, spreadValue);
        continue;
      }
      if (!ts.isPropertyAssignment(prop)) {
        continue;
      }
      const nameNode = prop.name;
      let key;
      if (ts.isIdentifier(nameNode) || ts.isStringLiteral(nameNode)) {
        key = nameNode.text;
      } else {
        continue;
      }

      const init = prop.initializer;
      if (!isLiteralNode(init)) {
        continue;
      }
      out[key] = literalToValue(init, context, seen);
    }
    return out;
  }

  throw new Error(`Unsupported literal node kind: ${node.kind}`);
};

const getConstLiteral = (sourceFilePath, constName) => {
  const sourceText = fs.readFileSync(sourceFilePath, "utf8");
  const sourceFile = ts.createSourceFile(
    sourceFilePath,
    sourceText,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  );

  const constInitializers = {};
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      constInitializers[declaration.name.text] = declaration.initializer;
    }
  }

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== constName) {
        continue;
      }
      if (!declaration.initializer || !isLiteralNode(declaration.initializer)) {
        throw new Error(`Const ${constName} was found but is not a plain literal structure`);
      }
      return literalToValue(declaration.initializer, constInitializers);
    }
  }

  throw new Error(`Const ${constName} not found in ${sourceFilePath}`);
};

const clearCollectionByKbCategory = async (collectionName) => {
  const snapshot = await db
    .collection(collectionName)
    .where("kbCategory", "==", KB_CATEGORY)
    .get();

  let deleted = 0;
  for (const docRef of snapshot.docs) {
    await docRef.ref.delete();
    deleted += 1;
  }
  return deleted;
};

async function importInsightsKb() {
  try {
    const kbPath = path.join(__dirname, "../src/lib/wisdom-knowledge-base.ts");
    const questionsPath = path.join(__dirname, "../src/lib/mirror-insight-questions.ts");
    const choicesPath = path.join(__dirname, "../src/lib/insight-question-choices.ts");

    console.log("📖 Reading insights KB + questions from source files...");
    const principles = getConstLiteral(kbPath, "wisdomKnowledgeBase");
    const categories = getConstLiteral(questionsPath, "categories");
    const insightChoices = getConstLiteral(choicesPath, "INSIGHT_CHOICES");

    console.log(`✅ Loaded ${principles.length} principles`);
    console.log(`✅ Loaded ${categories.length} categories`);

    const questionRows = [];
    const choiceRows = [];

    for (const category of categories) {
      const categoryChoices = insightChoices[category.id] || {};
      const questions = Array.isArray(category.questions) ? category.questions : [];
      for (const question of questions) {
        questionRows.push({
          kbCategory: KB_CATEGORY,
          categoryId: category.id,
          categoryTitle: category.title,
          categoryDescription: category.description,
          questionId: question.id,
          order: question.order,
          question: question.question,
          placeholder: question.placeholder || "",
          minLength: question.minLength || 0,
          source: "mirror-insight-questions.ts",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const choices = Array.isArray(categoryChoices[question.id]) ? categoryChoices[question.id] : [];
        for (const choice of choices) {
          choiceRows.push({
            kbCategory: KB_CATEGORY,
            categoryId: category.id,
            questionId: question.id,
            choiceId: choice.id,
            label: choice.label,
            source: "insight-question-choices.ts",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }

    console.log("🗑️ Clearing previous insights KB documents...");
    const [deletedPrinciples, deletedQuestions, deletedChoices] = await Promise.all([
      clearCollectionByKbCategory(PRINCIPLES_COLLECTION),
      clearCollectionByKbCategory(QUESTIONS_COLLECTION),
      clearCollectionByKbCategory(CHOICES_COLLECTION),
    ]);
    console.log(
      `✅ Deleted existing docs: principles=${deletedPrinciples}, questions=${deletedQuestions}, choices=${deletedChoices}`
    );

    let importedPrinciples = 0;
    for (const principle of principles) {
      await db.collection(PRINCIPLES_COLLECTION).add({
        ...principle,
        kbCategory: KB_CATEGORY,
        source: "wisdom-knowledge-base.ts",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      importedPrinciples += 1;
      if (importedPrinciples % 50 === 0) {
        console.log(`   Principles imported ${importedPrinciples}/${principles.length}...`);
      }
    }

    let importedQuestions = 0;
    for (const question of questionRows) {
      await db.collection(QUESTIONS_COLLECTION).add(question);
      importedQuestions += 1;
    }

    let importedChoices = 0;
    for (const choice of choiceRows) {
      await db.collection(CHOICES_COLLECTION).add(choice);
      importedChoices += 1;
      if (importedChoices % 100 === 0) {
        console.log(`   Choices imported ${importedChoices}/${choiceRows.length}...`);
      }
    }

    console.log("\n✅ Insights KB import completed");
    console.log(`   Collection ${PRINCIPLES_COLLECTION}: ${importedPrinciples}`);
    console.log(`   Collection ${QUESTIONS_COLLECTION}: ${importedQuestions}`);
    console.log(`   Collection ${CHOICES_COLLECTION}: ${importedChoices}`);
    console.log(`   Category tag: ${KB_CATEGORY}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing insights KB:", error);
    process.exit(1);
  }
}

importInsightsKb();
