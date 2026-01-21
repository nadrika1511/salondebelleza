import { db } from '../config/firebase';
import { collection, doc, getDocs, addDoc, updateDoc, query, where } from 'firebase/firestore';

export const getAllServices = async () => {
  const snapshot = await getDocs(collection(db, 'services'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getActiveServices = async () => {
  const q = query(collection(db, 'services'), where('active', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createService = async (serviceData) => {
  return await addDoc(collection(db, 'services'), {
    ...serviceData,
    active: true,
    createdAt: new Date().toISOString()
  });
};

export const updateService = async (serviceId, serviceData) => {
  return await updateDoc(doc(db, 'services', serviceId), serviceData);
};

export const deleteService = async (serviceId) => {
  return await updateDoc(doc(db, 'services', serviceId), { active: false });
};
