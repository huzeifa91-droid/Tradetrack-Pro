import { UserProfile } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { toast } from 'sonner';

declare const PaystackPop: any;

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_0922c60630de03c598404939cbd0268bfcb04231';
const SUBSCRIPTION_AMOUNT_GHS = 109.9899;

export const initializePayment = (user: UserProfile, onComplete: () => void, onSuccess: () => void) => {
  console.log('Initializing payment for user:', user.email);
  
  if (typeof PaystackPop === 'undefined') {
    toast.error('Payment system is still loading. Please wait a moment and try again.');
    onComplete();
    return;
  }

  if (!user || !user.email || !user.uid) {
    toast.error('User information is incomplete. Please try logging in again.');
    onComplete();
    return;
  }

  try {
    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: Math.round(SUBSCRIPTION_AMOUNT_GHS * 100), // Amount in pesewas (GHS * 100)
      currency: 'GHS',
      callback: (response: any) => {
        console.log('Payment successful:', response);
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, {
          plan: 'premium',
          subscriptionStartDate: new Date().toISOString()
        }).then(() => {
          toast.success('Payment successful! You are now a Premium user.');
          onSuccess();
          onComplete();
        }).catch((error) => {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
          toast.error('Payment successful, but failed to update your account. Please contact support.');
          onComplete();
        });
      },
      onClose: () => {
        console.log('Payment window closed');
        toast.info('Payment was not completed. Try again.');
        onComplete();
      }
    });

    handler.openIframe();
  } catch (error) {
    console.error('Paystack initialization error:', error);
    toast.error('Failed to initialize payment system. Please try again.');
    onComplete();
  }
};
