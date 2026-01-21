/**
 * Utilidades de fecha y hora configuradas para timezone de Guatemala (America/Guatemala)
 * Todas las funciones del proyecto deben usar estas utilidades para consistencia
 */

// Obtener fecha actual en Guatemala (formato YYYY-MM-DD)
export const getGuatemalaDate = () => {
  return new Date().toLocaleString('en-CA', { 
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split(',')[0];
};

// Obtener fecha y hora actual en Guatemala
export const getGuatemalaDateTime = () => {
  const date = new Date().toLocaleString('en-US', { 
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  return date;
};

// Obtener hora actual en Guatemala (formato HH:MM)
export const getGuatemalaTime = () => {
  return new Date().toLocaleString('en-US', { 
    timeZone: 'America/Guatemala',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Obtener fecha de ayer
export const getYesterdayDate = () => {
  const today = new Date(getGuatemalaDate());
  today.setDate(today.getDate() - 1);
  return today.toISOString().split('T')[0];
};

// Obtener fecha de mañana
export const getTomorrowDate = () => {
  const today = new Date(getGuatemalaDate());
  today.setDate(today.getDate() + 1);
  return today.toISOString().split('T')[0];
};

// Formatear fecha para mostrar (DD/MM/YYYY)
export const formatDateDisplay = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Obtener ISO timestamp en Guatemala
export const getGuatemalaISOString = () => {
  return new Date().toLocaleString('en-US', { 
    timeZone: 'America/Guatemala'
  });
};

// Obtener rango de semana
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
