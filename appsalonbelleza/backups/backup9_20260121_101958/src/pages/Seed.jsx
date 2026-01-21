import { useState } from 'react';
import { Layout } from '../components/Layout';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const Seed = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const users = [
    {
      nombre: 'Juan Propietario',
      email: 'dueno@salon.com',
      password: '123456',
      rol: 'propietario',
      phone: '+502 1234-5678'
    },
    {
      nombre: 'María Caja',
      email: 'caja@salon.com',
      password: '123456',
      rol: 'caja',
      phone: '+502 2345-6789'
    },
    {
      nombre: 'Ana Estilista',
      email: 'ana@salon.com',
      password: '123456',
      rol: 'estilista',
      phone: '+502 3456-7890',
      commissionRate: 30,
      specialties: ['corte', 'tinte']
    },
    {
      nombre: 'Laura Estilista',
      email: 'laura@salon.com',
      password: '123456',
      rol: 'estilista',
      phone: '+502 4567-8901',
      commissionRate: 30,
      specialties: ['peinado', 'maquillaje']
    },
    {
      nombre: 'Carmen Estilista',
      email: 'carmen@salon.com',
      password: '123456',
      rol: 'estilista',
      phone: '+502 5678-9012',
      commissionRate: 35,
      specialties: ['corte', 'peinado']
    },
    {
      nombre: 'Rosa Estilista',
      email: 'rosa@salon.com',
      password: '123456',
      rol: 'estilista',
      phone: '+502 6789-0123',
      commissionRate: 30,
      specialties: ['tinte', 'tratamientos']
    }
  ];

  const createUsers = async () => {
    setLoading(true);
    setResults([]);
    const newResults = [];

    for (const user of users) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          user.email, 
          user.password
        );

        const userData = {
          nombre: user.nombre,
          email: user.email,
          phone: user.phone,
          rol: user.rol,
          active: true,
          createdAt: new Date().toISOString()
        };

        if (user.rol === 'estilista') {
          userData.commissionRate = user.commissionRate;
          userData.specialties = user.specialties;
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), userData);

        newResults.push({
          success: true,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        });

      } catch (error) {
        newResults.push({
          success: false,
          nombre: user.nombre,
          email: user.email,
          error: error.message
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">🌱 Crear Usuarios Iniciales</h2>
          <p className="text-gray-600 mb-6">
            Este script creará 6 usuarios para el sistema:
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="bg-white p-4 rounded-xl border-l-4 border-purple-500">
              <p className="font-bold text-purple-700">👑 Propietario</p>
              <p className="text-sm text-gray-600">dueno@salon.com / 123456</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl border-l-4 border-blue-500">
              <p className="font-bold text-blue-700">💰 Caja</p>
              <p className="text-sm text-gray-600">caja@salon.com / 123456</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl border-l-4 border-pink-500">
              <p className="font-bold text-pink-700">✂️ Estilistas (4)</p>
              <div className="text-sm text-gray-600 space-y-1 mt-2">
                <p>• Ana: ana@salon.com / 123456</p>
                <p>• Laura: laura@salon.com / 123456</p>
                <p>• Carmen: carmen@salon.com / 123456</p>
                <p>• Rosa: rosa@salon.com / 123456</p>
              </div>
            </div>
          </div>

          <button
            onClick={createUsers}
            disabled={loading}
            className="btn-primary w-full text-lg"
          >
            {loading ? '⏳ Creando usuarios...' : '🚀 Crear Usuarios'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">📋 Resultados</h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border-l-4 ${
                    result.success 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">
                        {result.success ? '✅' : '❌'} {result.nombre}
                      </p>
                      <p className="text-sm text-gray-600">{result.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{result.rol}</p>
                    </div>
                    {!result.success && (
                      <p className="text-xs text-red-600">{result.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
