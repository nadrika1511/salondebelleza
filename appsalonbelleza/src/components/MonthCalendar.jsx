import { useState, useEffect } from 'react';

export const MonthCalendar = ({ selectedDate, onDateChange, appointments }) => {
  const [monthDates, setMonthDates] = useState([]);
  const [monthName, setMonthName] = useState('');

  useEffect(() => {
    generateMonthDates(selectedDate);
  }, [selectedDate]);

  const generateMonthDates = (date) => {
    const current = new Date(date);
    const year = current.getFullYear();
    const month = current.getMonth();
    
    setMonthName(current.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    const dates = [];
    
    // Días del mes anterior (para llenar la primera semana)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(firstDay);
      day.setDate(day.getDate() - (i + 1));
      dates.push({
        date: day.toISOString().split('T')[0],
        dayNumber: day.getDate(),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Días del mes actual
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const day = new Date(year, month, d);
      const dateStr = day.toISOString().split('T')[0];
      dates.push({
        date: dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }
    
    // Días del mes siguiente (para completar la última semana)
    const remainingDays = 42 - dates.length; // 6 semanas * 7 días
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      dates.push({
        date: day.toISOString().split('T')[0],
        dayNumber: day.getDate(),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    setMonthDates(dates);
  };

  const getAppointmentsByDate = (date) => {
    return appointments.filter(apt => apt.date === date);
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-400',
      'in-progress': 'bg-yellow-400',
      'completed': 'bg-green-400',
      'cancelled': 'bg-red-400'
    };
    return colors[status] || 'bg-gray-400';
  };

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header con nombre del mes */}
      <div className="p-6 bg-gradient-to-r from-primary-500 to-pink-500 text-white">
        <h3 className="text-2xl font-bold capitalize">{monthName}</h3>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7">
        {monthDates.map((day, index) => {
          const dayAppointments = getAppointmentsByDate(day.date);
          
          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border-r border-b cursor-pointer hover:bg-primary-50 transition-colors ${
                !day.isCurrentMonth ? 'bg-gray-50 opacity-50' : ''
              } ${day.isToday ? 'bg-primary-50 ring-2 ring-primary-400 ring-inset' : ''}`}
              onClick={() => onDateChange(day.date)}
            >
              <div className={`text-sm font-semibold mb-1 ${
                day.isToday ? 'text-primary-600' : 'text-gray-700'
              }`}>
                {day.dayNumber}
              </div>
              
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={`text-[10px] p-1 rounded ${getStatusColor(apt.status)} text-white truncate`}
                  >
                    {apt.startTime} - {apt.clientName}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-[10px] text-gray-500 font-semibold">
                    +{dayAppointments.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
