import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

// Obtener paquetes activos de un cliente
export const getClientPackages = async (clientId) => {
  const q = query(
    collection(db, 'clientPackages'), 
    where('clientId', '==', clientId),
    where('remaining', '>', 0)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Actualizar remaining de un paquete
export const updateClientPackageRemaining = async (clientPackageId, newRemaining) => {
  const status = newRemaining === 0 ? 'consumed' : 'active';
  return await updateDoc(doc(db, 'clientPackages', clientPackageId), {
    remaining: newRemaining,
    status,
    updatedAt: new Date().toISOString()
  });
};

// Crear paquete para cliente (cuando compran)
export const createClientPackage = async (clientId, packageData) => {
  return await addDoc(collection(db, 'clientPackages'), {
    clientId,
    packageId: packageData.id,
    packageName: packageData.name,
    serviceId: packageData.serviceId,
    serviceName: packageData.serviceName,
    quantity: packageData.quantity,
    remaining: packageData.quantity,
    price: packageData.price,
    purchaseDate: new Date().toISOString(),
    status: 'active'
  });
};
