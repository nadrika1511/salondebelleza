import { db, auth } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser as deleteAuthUser
} from 'firebase/auth';

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserById = async (userId) => {
  const docSnap = await getDoc(doc(db, 'users', userId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createUser = async (userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    const uid = userCredential.user.uid;
    
    const userDoc = {
      uid,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol.toUpperCase(),
      telefono: userData.telefono || '',
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await addDoc(collection(db, 'users'), userDoc);
    
    return { success: true, uid };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  const updateData = {
    nombre: userData.nombre,
    telefono: userData.telefono || '',
    rol: userData.rol.toUpperCase(),
    activo: userData.activo !== undefined ? userData.activo : true,
    updatedAt: new Date().toISOString()
  };
  
  return await updateDoc(doc(db, 'users', userId), updateData);
};

export const deactivateUser = async (userId) => {
  return await updateDoc(doc(db, 'users', userId), {
    activo: false,
    updatedAt: new Date().toISOString()
  });
};

export const activateUser = async (userId) => {
  return await updateDoc(doc(db, 'users', userId), {
    activo: true,
    updatedAt: new Date().toISOString()
  });
};

export const resetUserPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  return await deleteDoc(doc(db, 'users', userId));
};

export const getAllStylists = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return users.filter(user => 
    user.rol?.toUpperCase() === 'ESTILISTA' && user.activo === true
  );
};
