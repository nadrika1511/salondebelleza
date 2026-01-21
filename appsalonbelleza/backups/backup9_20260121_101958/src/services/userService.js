import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const getAllStylists = async () => {
  const q = query(
    collection(db, 'users'),
    where('rol', '==', 'estilista'),
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
