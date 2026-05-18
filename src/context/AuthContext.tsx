import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface UserData {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name: string;
  phone: string;
  address: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userId: string | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  ensureUserRecord: () => Promise<UserData | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userId: null,
  userData: null,
  loading: true,
  isAdmin: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
  ensureUserRecord: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = user?.uid || null;

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("লগইন করতে সমস্যা হয়েছে: " + error.message);
    }
  }

  const fetchUserData = async (uid: string, email: string, name: string): Promise<UserData | null> => {
    const userRef = doc(db, 'users', uid);
    try {
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const fullData = { ...data, id: uid } as UserData;
        setUserData(fullData);
        return fullData;
      }

      // Create initial profile if it doesn't exist
      const newUser: UserData = {
        id: uid,
        email: email,
        name: name || 'User',
        role: email === 'abirmohsin02@gmail.com' ? 'admin' : 'customer',
        phone: '',
        address: ''
      };

      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp()
      });

      setUserData(newUser);
      return newUser;
    } catch (error) {
      console.error("Error fetching user data:", error);
      // We don't use handleFirestoreError here to avoid crashing the whole auth flow if it's a simple permission error on first load
      // But we should at least try to provide a fallback
      const fallback: UserData = {
        id: uid,
        email: email,
        name: name || 'User',
        role: email === 'abirmohsin02@gmail.com' ? 'admin' : 'customer',
        phone: '',
        address: ''
      };
      setUserData(fallback);
      return fallback;
    }
  };

  const ensureUserRecord = async (): Promise<UserData | null> => {
    if (userData) return userData;
    if (!user) return null;
    return await fetchUserData(user.uid, user.email || '', user.displayName || '');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserData(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || '');
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userId,
    userData,
    loading,
    isAdmin: user?.email === 'abirmohsin02@gmail.com' || userData?.role === 'admin',
    loginWithGoogle,
    logout,
    ensureUserRecord,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
