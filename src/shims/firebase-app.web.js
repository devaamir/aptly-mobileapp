import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyDZ8qOcGtjnbYD8THO2yuv85CaGqxklKpw',
  authDomain: 'aptly-care.firebaseapp.com',
  projectId: 'aptly-care',
  storageBucket: 'aptly-care.firebasestorage.app',
  messagingSenderId: '857737363787',
  appId: '1:857737363787:web:6006b03db29a1e0377e8ce',
  measurementId: 'G-TLJPJQXQJK',
};

if (!getApps().length) initializeApp(firebaseConfig);

export default { app: () => {} };
