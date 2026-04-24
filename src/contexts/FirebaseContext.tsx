import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile as updateFirebaseProfile,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL?: string | null;
  partnerId?: string;
  partnerName?: string;
  partnerEmail?: string;
  coupleId?: string;
  loveLanguage?: string;
  partnerLoveLanguage?: string;
  coupleTitle?: string;
  preferences?: any;
  missionDueDates?: Record<string, string>;
  progress?: {
    cookedCount: number;
    watchedMoviesCount: number;
    solvedRiddlesCount: number;
    totalPoints: number;
    missionsCompleted?: string[];
  };
  points?: number;
  goldPoints?: number;
  missionsCompleted?: string[];
  completedSparks?: string[];
  completedModuleTasks?: string[];
  unlockedRewards?: string[];
  medals?: any[];
  role?: string;
  timezone?: string;
  location?: { lat: number; lng: number } | string;
  experienceLevel?: string;
  anniversary?: string;
  intimacyPin?: string;
  fantasies?: string[];
  journalEntries?: any[];
  name?: string;
  address?: string;
  createdAt?: any;
  updatedAt?: any;
  notificationsEnabled?: boolean;
  language?: string;
  theme?: 'light' | 'dark' | 'romantic';
  fontSize?: 'small' | 'medium' | 'large';
  defaultMissionDuration?: number;
  favoriteProducts?: string[];
  favoriteRecipes?: string[];
}

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInApple: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signInAnonymous: () => Promise<void>;
  signUpEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  connectPartner: (partnerId: string) => Promise<boolean>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [mockUser, setMockUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const user = firebaseUser || mockUser;

  useEffect(() => {
    // Check for existing guest session
    const savedGuest = localStorage.getItem('beyond_guest_user');
    if (savedGuest) {
      try {
        const guestData = JSON.parse(savedGuest);
        setMockUser(guestData);
      } catch (e) {
        localStorage.removeItem('beyond_guest_user');
      }
    }

    // Set persistence to local to ensure session survives refreshes
    setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence error:", err));

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      // Clean up previous profile listener if it exists
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (fbUser) {
        const userDocRef = doc(db, 'users', fbUser.uid);
        
        // Listen to profile changes
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          console.log('Profile Snapshot received:', { exists: docSnap.exists(), uid: fbUser.uid });
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // For testing phase: ensure coupleId is set to user.uid if missing
            if (!data.coupleId) {
              setDoc(userDocRef, { coupleId: fbUser.uid }, { merge: true });
              data.coupleId = fbUser.uid;
            }
            setProfile(data);
            setLoading(false);
          } else {
            console.log('Profile does not exist, creating initial profile...');
            // Create initial profile if it doesn't exist
            const initialProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || '',
              coupleId: fbUser.uid, // Set coupleId to user.uid for testing
              progress: {
                cookedCount: 0,
                watchedMoviesCount: 0,
                solvedRiddlesCount: 0,
                totalPoints: 0
              },
              role: 'user'
            };
            
            setDoc(userDocRef, {
              ...initialProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            })
            .then(() => {
              console.log('Initial profile created successfully');
            })
            .catch(err => {
              console.error('Error creating initial profile:', err);
              handleFirestoreError(err, OperationType.CREATE, `users/${fbUser.uid}`);
              setLoading(false);
            });
          }
        }, (err) => {
          console.error('Profile snapshot error:', err);
          if (auth.currentUser) {
            handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
          }
          setLoading(false);
        });
      } else if (mockUser) {
        // Handle guest profile
        const userDocRef = doc(db, 'users', mockUser.uid);
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create initial guest profile
            const guestProfile: UserProfile = {
              uid: mockUser.uid,
              email: mockUser.email,
              displayName: mockUser.displayName,
              role: 'user',
              coupleId: mockUser.uid,
              progress: {
                totalPoints: 0,
                cookedCount: 0,
                watchedMoviesCount: 0,
                solvedRiddlesCount: 0
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setDoc(userDocRef, guestProfile).then(() => setProfile(guestProfile));
          }
          setLoading(false);
        }, (err) => {
          console.warn('Guest profile snapshot failed, using local state:', err);
          setProfile({
            uid: mockUser.uid,
            displayName: mockUser.displayName,
            email: mockUser.email,
            role: 'user',
            coupleId: mockUser.uid,
            progress: { totalPoints: 0, cookedCount: 0, watchedMoviesCount: 0, solvedRiddlesCount: 0 }
          } as any);
          setLoading(false);
        });
      } else {
        console.log('No firebase user or guest, setting loading to false');
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const signIn = async () => {
    // Disabled as per user request
    throw new Error('התחברות עם Google הופסקה זמנית.');
  };

  const signInApple = async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Apple sign in error:", error);
      throw error;
    }
  };

  const signInEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Email sign in error:", error);
      throw error;
    }
  };

  const signInAnonymous = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error("Anonymous sign in error, falling back to Guest Mode:", error);
      
      // Fallback to local guest mode if Firebase Anonymous Auth is disabled
      const guestId = 'guest-' + Math.random().toString(36).substr(2, 9);
      const guestData = {
        uid: guestId,
        displayName: 'אורח/ת',
        isAnonymous: true,
        email: 'guest@beyond.com'
      };
      localStorage.setItem('beyond_guest_user', JSON.stringify(guestData));
      setMockUser(guestData);
    }
  };

  const signUpEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateFirebaseProfile(userCredential.user, { displayName: name });
      await sendEmailVerification(userCredential.user);
      
      // Initial profile creation is handled by the useEffect onAuthStateChanged
    } catch (error) {
      console.error("Email sign up error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (mockUser) {
        localStorage.removeItem('beyond_guest_user');
        setMockUser(null);
        setProfile(null);
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const connectPartner = async (partnerId: string) => {
    if (!user || !profile) return false;
    try {
      // 1. Fetch partner profile
      const partnerRef = doc(db, 'users', partnerId);
      const partnerSnap = await getDoc(partnerRef);
      
      if (!partnerSnap.exists()) {
        throw new Error('בן/בת הזוג לא נמצאו. ודאו שהקוד נכון.');
      }

      const partnerData = partnerSnap.data() as UserProfile;
      
      if (partnerData.coupleId) {
        throw new Error('בן/בת הזוג כבר מחוברים למישהו אחר.');
      }

      // 2. Generate coupleId (sorted UIDs to ensure consistency)
      const coupleId = [user.uid, partnerId].sort().join('_');

      // 3. Update both profiles
      const userRef = doc(db, 'users', user.uid);
      
      await setDoc(userRef, {
        coupleId,
        partnerId,
        partnerName: partnerData.displayName || 'בן/בת זוג',
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await setDoc(partnerRef, {
        coupleId,
        partnerId: user.uid,
        partnerName: profile.displayName || 'בן/בת זוג',
        updatedAt: serverTimestamp(),
      }, { merge: true });

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${partnerId}`);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    }
  };

  const contextValue = React.useMemo(() => ({ 
    user, 
    profile, 
    loading, 
    signIn, 
    signInApple,
    signInEmail, 
    signInAnonymous,
    signUpEmail, 
    logout, 
    updateProfile,
    refreshProfile,
    connectPartner
  }), [user, profile, loading]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
