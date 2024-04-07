import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { auth, firestore } from "./firebase-setup";

// Assuming `auth` is your Firebase auth instance imported from your Firebase config
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Tracks whether we're still waiting on the auth state
  const [refreshTrigger, setRefreshTrigger] = useState(false); // Add a trigger for refresh

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // Attempt to sign in anonymously if no user is detected
        signInAnonymously(auth).catch((error) => {
          setError(error.message);
          setUser({ firebaseUser: currentUser });
          setLoading(false); // Authentication state is resolved
        });
      } else {
        const userDocRef = doc(firestore, "customers", currentUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            // Combine Firestore user data with Firebase auth user
            setUser({
              firebaseUser: currentUser,
              firestoreUser: docSnap.data(),
            });
          } else {
            // No Firestore document found for the user, set only firebaseUser
            setUser({ firebaseUser: currentUser, firestoreUser: {} });
          }
        } catch (fetchError) {
          setError(fetchError.message);
        }
        setLoading(false); // Authentication state is resolved
      }
    });

    return () => unsubscribe();
  }, [auth, refreshTrigger]);

  const refreshAuth = () => setRefreshTrigger((prev) => !prev);

  return { user, error, loading, refreshAuth };
};

export default useAuth;
