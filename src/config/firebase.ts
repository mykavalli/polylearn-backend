import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '../../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

export const auth = admin.auth();
export const firestore = admin.firestore();

console.log('✅ Firebase Admin initialized');

export default admin;
