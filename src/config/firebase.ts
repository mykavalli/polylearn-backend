import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '../../service-account-key.json');

// Check if running in test mode or missing credentials
const useMockFirebase = !fs.existsSync(serviceAccountPath) || process.env.FIREBASE_MOCK === 'true';

if (useMockFirebase) {
  console.warn('⚠️  Running with mock Firebase (no service account found)');
  // Export mock Firebase for testing
  const mockFirebase = require('./firebase.mock');
  module.exports = mockFirebase;
} else {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log('✅ Firebase Admin initialized');
  
  module.exports = {
    auth: admin.auth(),
    firestore: admin.firestore(),
    default: admin,
  };
}

// TypeScript exports (will be replaced by module.exports at runtime)
export const auth = admin.auth();
export const firestore = admin.firestore();
export default admin;
