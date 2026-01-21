import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';

export const getAllPackages = async () => {
  const snapshot = await getDocs(collection(db, 'packages'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getActivePackages = async () => {
  const q = query(collection(db, 'packages'), where('active', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createPackage = async (packageData) => {
  return await addDoc(collection(db, 'packages'), {
    ...packageData,
    active: true,
    createdAt: new Date().toISOString()
  });
};

export const updatePackage = async (packageId, packageData) => {
  return await updateDoc(doc(db, 'packages', packageId), {
    ...packageData,
    updatedAt: new Date().toISOString()
  });
};

export const deletePackage = async (packageId) => {
  return await updateDoc(doc(db, 'packages', packageId), { 
    active: false,
    deletedAt: new Date().toISOString()
  });
};

// Paquetes de cliente
export const getClientPackages = async (clientId) => {
  const q = query(
    collection(db, 'clientPackages'),
    where('clientId', '==', clientId),
    where('remaining', '>', 0)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createClientPackage = async (clientId, packageData) => {
  return await addDoc(collection(db, 'clientPackages'), {
    clientId,
    clientName: packageData.clientName,
    packageId: packageData.packageId,
    packageName: packageData.packageName,
    serviceId: packageData.serviceId,
    serviceName: packageData.serviceName,
    quantity: packageData.quantity,
    remaining: packageData.quantity,
    price: packageData.price,
    status: 'active',
    purchasedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  });
};

export const usePackageService = async (clientPackageId) => {
  const clientPackageRef = doc(db, 'clientPackages', clientPackageId);
  const snapshot = await getDocs(query(collection(db, 'clientPackages'), where('__name__', '==', clientPackageId)));
  
  if (!snapshot.empty) {
    const currentData = snapshot.docs[0].data();
    const newRemaining = currentData.remaining - 1;
    
    await updateDoc(clientPackageRef, {
      remaining: newRemaining,
      status: newRemaining === 0 ? 'depleted' : 'active',
      lastUsedAt: new Date().toISOString()
    });
  }
};
