import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, LogIn, RefreshCw } from 'lucide-react';
import { grades } from '../data/grados';
import { CLOUD } from '../config';
import type { CloudStudent } from '../cloud/cloud';

type Cloud = typeof import('../cloud/cloud');

const totalLevels = (g: number) => grades[g - 1]?.modules.reduce((a, m) => a + m.levels.length, 0) ?? 0;
const stat = (s: CloudStudent) => {
  const mine = Object.entries(s.progress.levels).filter(([k]) => k.startsWith(`${s.grade}.`));
  return { done: mine.length, total: totalLevels(s.grade), stars: mine.reduce((a, [, v]) => a + v.stars, 0), badges: s.progress.badges.filter(b => b.startsWith(`${s.grade}.`)).length, exam: s.progress.exam[s.grade]?.score };
};
const date = (t: number) => (t ? new Date(t).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

/** Los nombres vienen de los estudiantes: se neutralizan las fórmulas (=, +, -, @) para que Excel no las ejecute. */
const cell = (v: string | number) => {
  let t = String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
};

export function toCsv(rows: CloudStudent[]) {
  const head = ['Grado', 'Apodo', 'Nombre', 'Correo', 'Retos completados', 'Retos del grado', 'Estrellas', 'Insignias', 'Prueba final', 'Última actividad', 'Retos hechos'];
  const lines = rows.map(s => {
    const x = stat(s);
    const keys = Object.keys(s.progress.levels).filter(k => k.startsWith(`${s.grade}.`)).sort().join(' ');
    return [s.grade, s.nickname, s.name, s.email, x.done, x.total, x.stars, x.badges, x.exam ?? '', s.updatedAt ? new Date(s.updatedAt).toISOString().slice(0, 10) : '', keys].map(cell).join(',');
  });
  return '﻿' + [head.map(cell).join(','), ...lines].join('\r\n');
}

export default function Panel({ onBack }: { onBack: () => void }) {
  const [cloud, setCloud] = useState<Cloud | null>(null);
  const [rows, setRows] = useState<CloudStudent[] | null>(null);
  const [grade, setGrade] = useState(0);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  const load = async (c: Cloud) => {
    setBusy(true); setMsg('');
    try { setRows((await c.listStudents()).sort((a, b) => a.grade - b.grade || a.nickname.localeCompare(b.nickname, 'es'))); }
    catch { setMsg('No se pudo leer el progreso. Revisa las reglas de Firestore y tu conexión.'); }
    setBusy(false);
  };
  useEffect(() => {
    import('../cloud/cloud').then(async c => {
      setCloud(c);
      const u = await c.authReady();
      if (u && c.isTeacherEmail(u.email)) { setOk(true); load(c); }
    });
  }, []); // eslint-disable-line
  // Al salir se cierra la sesión del docente, para no dejarla abierta en un equipo de estudiantes.
  useEffect(() => () => { import('../cloud/cloud').then(c => { if (c.isTeacherEmail(c.currentUser()?.email)) c.signOutCloud(); }); }, []);

  const signIn = async () => {
    if (!cloud) return;
    try { await cloud.signInTeacher(); setOk(true); load(cloud); }
    catch (e) { setMsg(String((e as Error).message).includes('not-teacher') ? 'Ese correo no está en la lista de docentes.' : 'No se pudo iniciar sesión con Google.'); }
  };

  const shown = useMemo(() => (rows ?? []).filter(r => !grade || r.grade === grade), [rows, grade]);
  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(shown)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `progreso-labsnexo${grade ? `-grado${grade}` : ''}-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="panel">
      <div className="panel-top">
        <button className="btn btn-ghost" onClick={onBack}><ArrowLeft size={16} /> Volver</button>
        <span className="eyebrow">Panel docente · estudiantes con cuenta (desde {CLOUD.minGrade}°)</span>
      </div>
      <h1>Progreso por <em>estudiante</em></h1>
      {!ok ? (
        <div className="panel-login">
          <p>Entra con tu cuenta de Google de docente para ver el progreso del grupo.</p>
          <button className="btn btn-primary" disabled={!cloud} onClick={signIn}><LogIn size={16} /> Entrar con Google</button>
        </div>
      ) : (
        <>
          <div className="panel-tools">
            <label>Grado
              <select className="input" value={grade} onChange={e => setGrade(+e.target.value)}>
                <option value={0}>Todos</option>
                {grades.filter(g => g.id >= CLOUD.minGrade).map(g => <option key={g.id} value={g.id}>{g.id}° · {g.title}</option>)}
              </select>
            </label>
            <button className="btn btn-ghost" disabled={busy || !cloud} onClick={() => cloud && load(cloud)}><RefreshCw size={15} /> Actualizar</button>
            <button className="btn btn-primary" disabled={!shown.length} onClick={download}><Download size={15} /> Exportar CSV ({shown.length})</button>
          </div>
          {rows && !shown.length && <p className="panel-empty">Aún no hay estudiantes con cuenta en este grado.</p>}
          {shown.length > 0 && (
            <div className="panel-table" role="region" aria-label="Progreso de estudiantes" tabIndex={0}>
              <table>
                <thead><tr><th>Grado</th><th>Estudiante</th><th>Retos</th><th>★</th><th>Insignias</th><th>Prueba</th><th>Última vez</th></tr></thead>
                <tbody>{shown.map(s => { const x = stat(s); return (
                  <tr key={s.uid}>
                    <td>{s.grade}°</td>
                    <td><b>{s.nickname}</b><small>{s.name} · {s.email}</small></td>
                    <td><span className="bar"><span style={{ width: `${x.total ? (x.done / x.total) * 100 : 0}%` }} /></span>{x.done}/{x.total}</td>
                    <td>{x.stars}</td><td>{x.badges}</td><td>{x.exam ?? '—'}</td><td>{date(s.updatedAt)}</td>
                  </tr>); })}</tbody>
              </table>
            </div>
          )}
        </>
      )}
      {busy && <p className="panel-empty">Cargando…</p>}
      {msg && <p className="panel-error" role="alert">{msg}</p>}
    </section>
  );
}
