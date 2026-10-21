/** Configuración de aula. Cambia esta clave antes de compartir el dispositivo. */
export const CONFIG={teacherPin:'038100',storageKey:'iscolab.profile.v2',legacyKey:'iscolab-v1'} as const;

/**
 * Cuentas y progreso en la nube (Firebase). Solo desde `minGrade`.
 * schoolDomain: dominio de los correos educativos (sin @). teachers: correos que pueden ver el panel.
 * Estos mismos valores van en firestore.rules.
 */
export const CLOUD = {
  minGrade: 3,
  schoolDomain: 'gi.edu.co',
  teachers: ['franciscos@gi.edu.co'],
  /** Administradores: ven y gestionan todo (panel, reiniciar y eliminar estudiantes). Pueden ser cuentas personales. */
  admins: ['franksanlo@gmail.com'],
  firebase: {
    apiKey: 'AIzaSyDZQ4ZUpM-1V1JzMZ_QXWQRK8qCBm2sRMw',
    authDomain: 'labsnexo-ba465.firebaseapp.com',
    projectId: 'labsnexo-ba465',
    storageBucket: 'labsnexo-ba465.firebasestorage.app',
    messagingSenderId: '1005862505268',
    appId: '1:1005862505268:web:781323cf89a18c5ef8b361',
  },
};
