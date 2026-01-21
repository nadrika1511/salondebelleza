import { db } from '../config/firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';

export const getAllClients = async () => {
  const snapshot = await getDocs(collection(db, 'clients'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const searchClients = async (searchTerm) => {
  const clients = await getAllClients();
  return clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );
};

export const createClient = async (clientData) => {
  return await addDoc(collection(db, 'clients'), {
    ...clientData,
    createdAt: new Date().toISOString()
  });
};
