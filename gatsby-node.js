const report = require('gatsby-cli/lib/reporter');
const admin = require('firebase-admin');
const crypto = require('crypto');

const getDigest = id =>
  crypto
    .createHash('md5')
    .update(id)
    .digest('hex');

exports.sourceNodes = async (
  { actions: { createNode } },
  { credential, types }
) => {
  if (!credential) {
    report.error('credential is required');
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert(credential),
  });
  const db = admin.firestore();

  for (const { type, collection, map } of types) {
    const snapshot = await db.collection(collection).get();
    for (const doc of snapshot.docs) {
      createNode({
        id: doc.id,
        internal: {
          type,
          contentDigest: getDigest(doc.id),
        },
        ...map(doc.data()),
      });
    }
  }

  return;
};
