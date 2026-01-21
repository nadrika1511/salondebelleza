import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { deleteOrder } from './orderService';
import { createOrderFromAppointment } from './orderService';
import { getGuatemalaDate, getYesterdayDate, getWeekDates, getGuatemalaISOString } from '../utils/dateUtils';

// Exportar funciones de fecha
export { getGuatemalaDate as getTodayDate, getYesterdayDate, getWeekDates };

export const getAllAppointments = async () => {
  const snapshot = await getDocs(collection(db, 'appointments'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAppointmentsByDate = async (date) => {
  const q = query(collection(db, 'appointments'), where('date', '==', date));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAppointmentsByDateRange = async (startDate, endDate) => {
  const appointments = await getAllAppointments();
  return appointments.filter(apt => apt.date >= startDate && apt.date <= endDate);
};

export const createAppointment = async (appointmentData) => {
  const docRef = await addDoc(collection(db, 'appointments'), {
    ...appointmentData,
    status: 'scheduled',
    createdAt: getGuatemalaISOString()
  });
  
  await createOrderFromAppointment(docRef.id, appointmentData);
  
  return docRef;
};

export const updateAppointment = async (appointmentId, appointmentData) => {
  return await updateDoc(doc(db, 'appointments', appointmentId), {
    ...appointmentData,
    updatedAt: getGuatemalaISOString()
  });
};

export const deleteAppointment = async (appointmentId) => {
  await deleteOrder(appointmentId);
  return await deleteDoc(doc(db, 'appointments', appointmentId));
};

export const markAsArrived = async (appointmentId) => {
  return await updateDoc(doc(db, 'appointments', appointmentId), {
    status: 'arrived',
    arrivedAt: getGuatemalaISOString()
  });
};

export const completeAppointment = async (appointmentId) => {
  return await updateDoc(doc(db, 'appointments', appointmentId), {
    status: 'completed',
    completedAt: getGuatemalaISOString()
  });
};

export const cancelAppointment = async (appointmentId) => {
  return await updateDoc(doc(db, 'appointments', appointmentId), {
    status: 'cancelled',
    cancelledAt: getGuatemalaISOString()
  });
};
