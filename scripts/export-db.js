// Вивантажує колекцію "app" з Firestore у data/state.json
// Запускається тільки з GitHub Actions (див. .github/workflows/export-db.yml)
const admin = require('firebase-admin');
const fs = require('fs');

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('Немає секрету FIREBASE_SERVICE_ACCOUNT');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
});

(async () => {
  const snap = await admin.firestore().collection('app').get();
  const state = {};
  snap.forEach(d => { state[d.id] = (d.data() || {}).data; });
  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/state.json', JSON.stringify({
    exportedAt: new Date().toISOString(),
    state,
  }, null, 2));
  console.log('OK, вивантажено документів:', snap.size);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
