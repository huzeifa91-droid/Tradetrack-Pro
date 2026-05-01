import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebase';

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const loginWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await sendEmailVerification(userCredential.user);
  }
  return userCredential;
};

export const resendVerificationEmail = async () => {
  if (auth.currentUser) {
    return sendEmailVerification(auth.currentUser);
  }
  throw new Error("No user logged in");
};

export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const checkEmailExists = async (email: string) => {
  const methods = await fetchSignInMethodsForEmail(auth, email);
  return methods.length > 0;
};

export const logout = async () => {
  return signOut(auth);
};
