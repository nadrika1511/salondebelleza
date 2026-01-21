import { useState } from 'react';

export const DayCalendar = ({ selectedDate, appointments, onTimeClick }) => {
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8am - 8pm

  const getAppointmentsByHour = (hour) => {
    return appointments.filter(apt => {
      const aptHour = parseInt(apt.startTime.split(':')[0]);
      return aptHour === hour;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 border-blue-400 text-blue-800',
      'in-progress': 'bg-yellow-100 border-yellow-400 text-yellow-800',
      'completed': 'bg-green-100 border-green-400 text-green-800',
      'cancelled': 'bg-red-100 border-red-400 text-red-800'
    };
    return colors[status] || 'bg-gray-100 border-gray-400 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'scheduled': '📅',
      'in-progress': '⏳',
      'completed': '✅',
      'cancelled': '❌'
    };
    return icons[status] || '📋';
  };

  const dateObj = new Date(selectedDate);
  const dateStr = dateObj.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-primary-500 to-pink-500 text-white">
        <h3 className="text-2xl font-bold capitalize">{dateStr}</h3>
        <p className="text-sm opacity-90">{appointments.length} cita{appointments.length !== 1 ? 's' : ''} programada{appointments.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Lista de horas */}
      <div className="overflow-y-auto max-h-[600px]">
        {hours.map((hour) => {
          const hourAppointments = getAppointmentsByHour(hour);
          
          return (
            <div 
              key={hour} 
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <div className="flex">
                {/* Hora */}
                <div className="w-24 p-4 bg-gray-50 border-r flex-shrink-0">
                  <div className="text-lg font-bold text-gray-700">{hour}:00</div>
                </div>
                
                {/* Citas */}
                <div 
                  className="flex-1 p-4 min-h-[100px] cursor-pointer"
                  onClick={() => onTimeClick(`${hour}:00`)}
                >
                  {hourAppointments.length === 0 ? (
                    <div className="text-gray-400 text-sm italic">
                      Click para agregar cita
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {hourAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className={`p-3 rounded-xl border-l-4 ${getStatusColor(apt.status)} cursor-pointer hover:shadow-lg transition-shadow`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getStatusIcon(apt.status)}</span>
                            <span className="font-bold text-lg">{apt.startTime}</span>
                          </div>
                          <div className="font-bold text-gray-800 mb-1">{apt.clientName}</div>
                          <div className="text-sm text-gray-600">{apt.clientPhone}</div>
                          <div className="text-xs mt-2 opacity-75">
                            {apt.totalServices} servicio{apt.totalServices > 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
