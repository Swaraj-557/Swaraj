import admin from 'firebase-admin';

export class FirestoreService {
  private db: admin.firestore.Firestore;
  private initialized: boolean = false;

  constructor() {
    this.initializeFirebase();
    this.db = admin.firestore();
  }

  private initializeFirebase(): void {
    if (this.initialized) return;

    try {
      const projectId = process.env.FIREBASE_PROJECT_ID || 'swaraj-digital-version';

      admin.initializeApp({
        projectId: projectId,
      });

      this.initialized = true;
      console.log('✅ Firebase Admin initialized');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }

  // Session Management
  async createSession(sessionId: string, data: any): Promise<void> {
    await this.db.collection('sessions').doc(sessionId).set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
  }

  async getSession(sessionId: string): Promise<any | null> {
    const doc = await this.db.collection('sessions').doc(sessionId).get();
    if (!doc.exists) return null;
    
    const data = doc.data();
    // Check if expired
    if (data?.expiresAt && data.expiresAt.toDate() < new Date()) {
      await this.deleteSession(sessionId);
      return null;
    }
    
    return data;
  }

  async updateSession(sessionId: string, data: any): Promise<void> {
    await this.db.collection('sessions').doc(sessionId).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db.collection('sessions').doc(sessionId).delete();
  }

  // Conversation Management
  async saveMessage(sessionId: string, message: any): Promise<void> {
    await this.db.collection('sessions').doc(sessionId).collection('messages').add({
      ...message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async getMessages(sessionId: string, limit: number = 50): Promise<any[]> {
    const snapshot = await this.db
      .collection('sessions')
      .doc(sessionId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
  }

  // User Preferences
  async savePreferences(userId: string, preferences: any): Promise<void> {
    await this.db.collection('users').doc(userId).set({
      preferences,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  async getPreferences(userId: string): Promise<any | null> {
    const doc = await this.db.collection('users').doc(userId).get();
    return doc.exists ? doc.data()?.preferences : null;
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    const snapshot = await this.db
      .collection('sessions')
      .where('expiresAt', '<', now)
      .get();

    const batch = this.db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    return snapshot.size;
  }
}
