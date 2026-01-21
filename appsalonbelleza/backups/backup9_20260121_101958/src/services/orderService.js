import { db } from '../config/firebase';
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

export const getNextOrderNumber = async () => {
  const snapshot = await getDocs(collection(db, 'orders'));
  const orders = snapshot.docs.map(doc => doc.data());
  const maxNumber = orders.length > 0 
    ? Math.max(...orders.map(o => o.orderNumber || 0))
    : 60287;
  return maxNumber + 1;
};

export const createOrderFromAppointment = async (appointmentId, appointmentData) => {
  const orderNumber = await getNextOrderNumber();
  
  const orderData = {
    orderNumber,
    appointmentId,
    clientId: appointmentData.clientId,
    clientName: appointmentData.clientName,
    clientPhone: appointmentData.clientPhone || '',
    date: appointmentData.date,
    
    services: [],
    products: [],
    packagesSold: [], // Paquetes vendidos
    tips: {},
    
    subtotalServices: 0,
    subtotalProducts: 0,
    subtotalPackages: 0, // Nuevo
    subtotal: 0,
    totalTips: 0,
    total: 0,
    
    status: 'open',
    closedAt: null,
    closedBy: null,
    
    paymentMethod: null,
    paid: false,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return await addDoc(collection(db, 'orders'), orderData);
};

export const getOrdersByDate = async (date) => {
  const q = query(
    collection(db, 'orders'),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return orders.sort((a, b) => b.orderNumber - a.orderNumber);
};

export const searchOrdersByClient = async (clientName) => {
  const snapshot = await getDocs(collection(db, 'orders'));
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return orders.filter(order => 
    order.clientName.toLowerCase().includes(clientName.toLowerCase())
  ).sort((a, b) => b.orderNumber - a.orderNumber);
};

export const getOrderById = async (orderId) => {
  const docSnap = await getDoc(doc(db, 'orders', orderId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const updateOrder = async (orderId, data) => {
  return await updateDoc(doc(db, 'orders', orderId), {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const closeOrder = async (orderId, paymentMethod, userId) => {
  return await updateDoc(doc(db, 'orders', orderId), {
    status: 'closed',
    paymentMethod,
    paid: true,
    closedAt: new Date().toISOString(),
    closedBy: userId,
    updatedAt: new Date().toISOString()
  });
};

export const reopenOrder = async (orderId) => {
  return await updateDoc(doc(db, 'orders', orderId), {
    status: 'open',
    updatedAt: new Date().toISOString()
  });
};



export const deleteOrder = async (appointmentId) => {
  const q = query(collection(db, 'orders'), where('appointmentId', '==', appointmentId));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const orderId = snapshot.docs[0].id;
    await deleteDoc(doc(db, 'orders', orderId));
  }
};
