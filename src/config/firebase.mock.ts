// Mock Firebase for testing without credentials
export const auth = {
  verifyIdToken: async (token: string) => {
    // Mock verification - returns decoded token
    return {
      uid: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
    };
  },
};

export const firestore = () => ({
  collection: (name: string) => ({
    doc: (id: string) => ({
      get: async () => ({ exists: false }),
      set: async () => {},
    }),
  }),
});

export default {
  auth: () => auth,
  firestore,
};
