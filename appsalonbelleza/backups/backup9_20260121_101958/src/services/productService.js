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

export const getAllProducts = async () => {
  const snapshot = await getDocs(collection(db, 'products'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getActiveProducts = async () => {
  const q = query(collection(db, 'products'), where('active', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getProductsByCategory = async (category) => {
  const q = query(
    collection(db, 'products'),
    where('category', '==', category),
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createProduct = async (productData) => {
  return await addDoc(collection(db, 'products'), {
    ...productData,
    active: true,
    createdAt: new Date().toISOString()
  });
};

export const updateProduct = async (productId, productData) => {
  return await updateDoc(doc(db, 'products', productId), {
    ...productData,
    updatedAt: new Date().toISOString()
  });
};

export const deleteProduct = async (productId) => {
  return await updateDoc(doc(db, 'products', productId), { 
    active: false,
    deletedAt: new Date().toISOString()
  });
};

export const updateStock = async (productId, quantity) => {
  const productDoc = doc(db, 'products', productId);
  return await updateDoc(productDoc, {
    stock: quantity,
    updatedAt: new Date().toISOString()
  });
};

export const adjustStock = async (productId, adjustment) => {
  const snapshot = await getDocs(query(collection(db, 'products'), where('__name__', '==', productId)));
  if (!snapshot.empty) {
    const currentStock = snapshot.docs[0].data().stock;
    return await updateStock(productId, currentStock + adjustment);
  }
};
