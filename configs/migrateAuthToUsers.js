import mongoose from 'mongoose';

const transferAuthToUsers = async () => {
  const db = mongoose.connection?.db;
  if (!db) {
    return;
  }

  const authCollection = db.collection('auths');
  const usersCollection = db.collection('users');

  const authDocs = await authCollection.find({}).toArray();
  if (!authDocs.length) {
    return;
  }

  for (const authDoc of authDocs) {
    if (!authDoc.email) {
      continue;
    }

    const existingUser = await usersCollection.findOne({ email: authDoc.email });

    const mergedDoc = {
      name: authDoc.name,
      email: authDoc.email,
      password: authDoc.password,
      role: authDoc.role || 'auth',
      refreshTokenHash: authDoc.refreshTokenHash || null,
      refreshTokenExpiresAt: authDoc.refreshTokenExpiresAt || null,
      tagline: existingUser?.tagline ?? null,
      bio: existingUser?.bio ?? null,
      avatar: existingUser?.avatar ?? null,
      location: existingUser?.location ?? null,
      website: existingUser?.website ?? null,
      createdAt: existingUser?.createdAt || authDoc.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.updateOne(
      { email: authDoc.email },
      { $set: mergedDoc },
      { upsert: true }
    );
  }
};

export default transferAuthToUsers;
