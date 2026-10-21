import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { CLOUD } from '../config';
import { emptyProgress, type Profile, type Progress } from '../app/store';

const app = initializeApp(CLOUD.firebase);
const auth = getAuth(app);
const db = getFirestore(app);

export type CloudStudent = { uid: string; email: string; name: string; nickname: string; avatar: number; grade: number; progress: Progress; updatedAt: number };

const lower = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
export const isSchoolEmail = (e: string | null | undefined) => lower(e).endsWith(`@${CLOUD.schoolDomain.toLowerCase()}`);
export const isTeacherEmail = (e: string | null | undefined) => CLOUD.teachers.map(lower).includes(lower(e));

export function authReady(): Promise<User | null> {
  return new Promise(res => { const off = onAuthStateChanged(auth, u => { off(); res(u); }); });
}
export const currentUser = () => auth.currentUser;

async function popup(hd?: string) {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account', ...(hd ? { hd } : {}) });
  return (await signInWithPopup(auth, p)).user;
}

/** Estudiante: solo cuentas del dominio educativo con correo verificado. */
export async function signInStudent(): Promise<User> {
  const u = await popup(CLOUD.schoolDomain);
  if (!u.emailVerified || !isSchoolEmail(u.email)) { await signOut(auth); throw new Error('cloud/not-school'); }
  return u;
}

/** Docente: solo los correos de CLOUD.teachers. */
export async function signInTeacher(): Promise<User> {
  const u = await popup();
  if (!u.emailVerified || !isTeacherEmail(u.email)) { await signOut(auth); throw new Error('cloud/not-teacher'); }
  return u;
}

export const signOutCloud = () => signOut(auth);

const toStudent = (uid: string, d: Record<string, any>): CloudStudent => ({
  uid, email: d.email ?? '', name: d.name ?? '', nickname: d.nickname ?? '', avatar: d.avatar ?? 0, grade: d.grade ?? 0,
  progress: { ...emptyProgress(), levels: d.levels ?? {}, badges: d.badges ?? [], exam: d.exam ?? {} },
  updatedAt: d.updatedAt?.toMillis?.() ?? 0,
});

export async function loadStudent(uid: string): Promise<CloudStudent | null> {
  const s = await getDoc(doc(db, 'students', uid));
  return s.exists() ? toStudent(uid, s.data()) : null;
}

export async function saveStudent(user: User, profile: Profile, progress: Progress) {
  await setDoc(doc(db, 'students', user.uid), {
    email: user.email, name: user.displayName ?? '', nickname: profile.nickname, avatar: profile.avatar, grade: profile.grade,
    levels: progress.levels, badges: progress.badges, exam: progress.exam, updatedAt: serverTimestamp(),
  });
}

export async function listStudents(): Promise<CloudStudent[]> {
  const snap = await getDocs(collection(db, 'students'));
  return snap.docs.map(d => toStudent(d.id, d.data()));
}
