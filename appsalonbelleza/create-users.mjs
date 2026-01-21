import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA2ICkTu6xa_GKLAOsg9fYwKl5PxOwID4g",
  authDomain: "salondebelleza-cac99.firebaseapp.com",
  projectId: "salondebelleza-cac99",
  storageBucket: "salondebelleza-cac99.firebasestorage.app",
  messagingSenderId: "1056056034411",
  appId: "1:1056056034411:web:7868cd642e6ca405085d2e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

async function createUsers() {
  console.log('🚀 Creando usuarios en Firebase...\n');

  for (const user of users) {
    try {
      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        user.email, 
        user.password
      );

      // Crear documento en Firestore
      const userData = {
        nombre: user.nombre,
        email: user.email,
        phone: user.phone,
        rol: user.rol,
        active: true,
        createdAt: new Date().toISOString()
      };

      // Agregar datos específicos de estilista
      if (user.rol === 'estilista') {
        userData.commissionRate = user.commissionRate;
        userData.specialties = user.specialties;
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      console.log(`✅ ${user.nombre} (${user.rol})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   UID: ${userCredential.user.uid}\n`);

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  ${user.email} - Ya existe en el sistema\n`);
      } else {
        console.log(`❌ Error con ${user.email}:`);
        console.log(`   ${error.message}\n`);
      }
    }
  }

  console.log('🎉 Proceso completado!');
  console.log('\n📋 Usuarios creados:');
  console.log('   👑 Propietario: dueno@salon.com / 123456');
  console.log('   💰 Caja: caja@salon.com / 123456');
  console.log('   ✂️  Estilistas:');
  console.log('      - ana@salon.com / 123456');
  console.log('      - laura@salon.com / 123456');
  console.log('      - carmen@salon.com / 123456');
  console.log('      - rosa@salon.com / 123456');
  
  process.exit(0);
}

createUsers().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
