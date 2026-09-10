import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

class AuthService {
  constructor() {
    // Placeholder configuration - will need real values from user
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
  }

  signUp(email, password) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logIn(email, password) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logOut() {
    return signOut(this.auth);
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(this.auth, callback);
  }
}

const authService = new AuthService();
export default authService;
