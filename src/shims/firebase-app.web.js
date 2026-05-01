import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyCTwUsk1fyu5PPxzyf_hC3i4x2qq0o9I6A',
  projectId: 'aptly-care',
  storageBucket: 'aptly-care.firebasestorage.app',
  messagingSenderId: '857737363787',
  appId: '1:857737363787:ios:e69bc8cbfc068e4777e8ce',
};

if (!getApps().length) initializeApp(firebaseConfig);

export default { app: () => {} };
