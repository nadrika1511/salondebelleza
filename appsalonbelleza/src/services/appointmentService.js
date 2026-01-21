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

// Función para obtener fecha en timezone de Guatemala
const getGuatemalaDate = () => {
  return new Date().toLocaleString('en-CA', { 
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split(',')[0];
};

export const getTodayDate = () => {
  return getGuatemalaDate();
};

export const getYesterdayDate = () => {
  const today = new Date(getGuatemalaDate());
  today.setDate(today.getDate() - 1);
  return today.toISOString().split('T')[0];
};

export const getWeekDates = (date) => {
  const currentDate = new Date(date);
  const dayOfWeek = currentDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + mondayOffset);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

export const getAllAppointments = async () => {
  const snapshot = await getDocs(collection(db, 'appointments'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAppointmentsByDate = async (date) => {
  const q = query(collection(db, 'appointments'), where('date', '==', date));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createAppointment = async (appointmentData) => {
  const docRef = await addDoc(collection(db, 'appointments'), {
    ...appointmentData,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  });
  
  await createOrderFromAppointment(docRef.id, appointmentData);
  
  return docRef;
};

export const updateAppointment = async (appointmentId, appointmentData) => {
  return await updateDoc(doc(db, 'appointments', appointmentId), {
    ...appointmentData,
    updatedAt: new Date().toISOString()
  });
};

export const deleteAppointment = async (appointmentId) => {
  await deleteOrder(appointmentId);
  return await deleteDoc(doc(db, 'appointments', appointmentId));
};

export const markAsArrived = async (appointmentId) => {
  return await updateDoc(doc(db, 'appointments', appointmentId), {
    status: 'arrived',
    arrivedAt: new Date().toISOString()
  });
};

export const completeAppointment = async (appointmentId) => {
  return await updateDoc(doc(db, 'appointments', appointmentId), {
    status: 'completed',
    completedAt: new Date().toISOString()
  });
};

export const cancelAppointment = async (appointmentId) => {
  return await updateDoc(doc(db, 'appointments', appointmentId), {
    status: 'cancelled',
    cancelledAt: new Date().toISOString()
  });
};

export const getAppointmentsByDateRange = async (startDate, endDate) => {
  const appointments = await getAllAppointments();
  return appointments.filter(apt => apt.date >= startDate && apt.date <= endDate);
};
