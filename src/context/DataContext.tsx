import { createContext, useContext, useState, useEffect, type FC, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, writeBatch, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Job, Shift, User } from '../types';
import { getStoredJobs, getStoredShifts, getStoredUser } from '../data/mock-data';

interface DataContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  jobs: Job[];
  shifts: Shift[];
  loading: boolean;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  addJob: (job: Omit<Job, 'userId'>) => Promise<void>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  addShift: (shift: Shift) => Promise<void>;
  updateShift: (shift: Shift) => Promise<void>;
  deleteShift: (shiftId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (!fUser) {
        setUser(null);
        setJobs([]);
        setShifts([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // 1. Sync / Create User Profile
        const userRef = doc(db, 'users', fUser.uid);
        const userSnap = await getDoc(userRef);
        let userData: User;

        if (!userSnap.exists()) {
          // If the profile document doesn't exist, create it with auth details
          const localUser = getStoredUser();
          userData = {
            id: fUser.uid,
            name: fUser.displayName || localUser.name || 'משתמש חדש',
            email: fUser.email || localUser.email || '',
            defaultHourlyWage: localUser.defaultHourlyWage || 45,
            defaultOvertimePercentage: localUser.defaultOvertimePercentage || 125,
          };
          await setDoc(userRef, userData);
        } else {
          const data = userSnap.data();
          userData = {
            id: fUser.uid,
            name: data.username || data.name || fUser.displayName || 'משתמש',
            email: data.email || fUser.email || '',
            profilePictureUrl: data.profilePictureUrl,
            defaultHourlyWage: data.defaultHourlyWage || 45,
            defaultOvertimePercentage: data.defaultOvertimePercentage || 125,
          };
        }
        setUser(userData);

        // 2. Set up real-time listener for user details doc
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              id: fUser.uid,
              name: data.username || data.name || 'משתמש',
              email: data.email || '',
              profilePictureUrl: data.profilePictureUrl,
              defaultHourlyWage: data.defaultHourlyWage || 45,
              defaultOvertimePercentage: data.defaultOvertimePercentage || 125,
            });
          }
        });

        // 3. Set up real-time listener for Jobs
        const jobsRef = collection(db, 'users', fUser.uid, 'jobs');
        const unsubJobs = onSnapshot(jobsRef, async (querySnap) => {
          const jobsList: Job[] = [];
          querySnap.forEach((doc) => {
            jobsList.push(doc.data() as Job);
          });

          // Check if migration is needed (Firestore is empty but localStorage has jobs/shifts)
          const migrationFlag = `paycheck_migrated_${fUser.uid}`;
          const isMigrated = localStorage.getItem(migrationFlag) === 'true';

          if (jobsList.length === 0 && !isMigrated) {
            const localJobs = getStoredJobs();
            const localShifts = getStoredShifts();
            
            console.log('Migrating local storage data to Firestore...', { localJobs, localShifts });

            try {
              const batch = writeBatch(db);
              
              localJobs.forEach((job) => {
                const jobDocRef = doc(db, 'users', fUser.uid, 'jobs', job.id);
                batch.set(jobDocRef, { ...job, userId: fUser.uid });
              });

              localShifts.forEach((shift) => {
                const shiftDocRef = doc(db, 'users', fUser.uid, 'shifts', shift.id);
                batch.set(shiftDocRef, shift);
              });

              await batch.commit();
              localStorage.setItem(migrationFlag, 'true');
              console.log('Migration to Firestore completed successfully!');
            } catch (err) {
              console.error('Error during Firestore migration:', err);
            }
          } else {
            setJobs(jobsList);
          }
        });

        // 4. Set up real-time listener for Shifts
        const shiftsRef = collection(db, 'users', fUser.uid, 'shifts');
        const unsubShifts = onSnapshot(shiftsRef, (querySnap) => {
          const shiftsList: Shift[] = [];
          querySnap.forEach((doc) => {
            shiftsList.push(doc.data() as Shift);
          });
          setShifts(shiftsList);
          setLoading(false);
        });

        return () => {
          unsubUser();
          unsubJobs();
          unsubShifts();
        };

      } catch (error) {
        console.error("Error setting up user session:", error);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Update profile
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!firebaseUser) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    // Support saving both key fields (for register script compatibility and app types)
    const updateData: any = { ...userData };
    if (userData.name) {
      updateData.username = userData.name;
    }
    await setDoc(userRef, updateData, { merge: true });
  };

  // Add job
  const addJob = async (job: Omit<Job, 'userId'>) => {
    if (!firebaseUser) return;
    const jobDocRef = doc(db, 'users', firebaseUser.uid, 'jobs', job.id);
    await setDoc(jobDocRef, { ...job, userId: firebaseUser.uid });
  };

  // Update job
  const updateJob = async (job: Job) => {
    if (!firebaseUser) return;
    const jobDocRef = doc(db, 'users', firebaseUser.uid, 'jobs', job.id);
    await setDoc(jobDocRef, job);
  };

  // Delete job
  const deleteJob = async (jobId: string) => {
    if (!firebaseUser) return;
    
    const batch = writeBatch(db);
    // Delete the job document
    const jobDocRef = doc(db, 'users', firebaseUser.uid, 'jobs', jobId);
    batch.delete(jobDocRef);

    // Delete all shifts associated with this job
    const jobShifts = shifts.filter(s => s.jobId === jobId);
    jobShifts.forEach((shift) => {
      const shiftDocRef = doc(db, 'users', firebaseUser.uid, 'shifts', shift.id);
      batch.delete(shiftDocRef);
    });

    await batch.commit();
  };

  // Add shift
  const addShift = async (shift: Shift) => {
    if (!firebaseUser) return;
    const shiftDocRef = doc(db, 'users', firebaseUser.uid, 'shifts', shift.id);
    await setDoc(shiftDocRef, shift);
  };

  // Update shift
  const updateShift = async (shift: Shift) => {
    if (!firebaseUser) return;
    const shiftDocRef = doc(db, 'users', firebaseUser.uid, 'shifts', shift.id);
    await setDoc(shiftDocRef, shift);
  };

  // Delete shift
  const deleteShift = async (shiftId: string) => {
    if (!firebaseUser) return;
    const shiftDocRef = doc(db, 'users', firebaseUser.uid, 'shifts', shiftId);
    await deleteDoc(shiftDocRef);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <DataContext.Provider
      value={{
        firebaseUser,
        user,
        jobs,
        shifts,
        loading,
        updateUserProfile,
        addJob,
        updateJob,
        deleteJob,
        addShift,
        updateShift,
        deleteShift,
        logout,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const useAuth = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a DataProvider');
  }
  return {
    user: context.user,
    firebaseUser: context.firebaseUser,
    loading: context.loading,
    logout: context.logout,
  };
};
