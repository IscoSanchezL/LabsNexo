import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, LogIn, RefreshCw } from 'lucide-react';
import { grades } from '../data/grados';
import { CLOUD } from '../config';
import { t } from '../i18n/ui';
import { LANG } from '../i18n';
import type { CloudStudent } from '../cloud/cloud';

type Cloud = typeof import('../cloud/cloud');

const totalLevels = (g: number) => grades[g - 1]?.modules.reduce((a, m) => a + m.levels.length, 0) ?? 0;
const stat = (s: CloudStudent) => {
  const mine = Object.entries(s.progress.levels).filter(([k]) => k.startsWith(`${s.grade}.`));
  return { done: mine.length, total: totalLevels(s.grade), stars: mine.reduce((a, [, v]) => a + v.stars, 0), badges: s.progress.badges.filter(b => b.startsWith(`${s.grade}.`)).length, exam: s.progress.exam[s.grade]?.score };
};
const date = (t: number) => (t ? new Date(t).toLocaleDateString(LANG, { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

/** Los nombres vienen de los estudiantes: se neutralizan las fórmulas (=, +, -, @) para que Excel no las ejecute. */
const cell = (v: string | number) => {
  let t = String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
};

export function toCsv(rows: CloudStudent[]) {
  const head = [t('csv.grade'), t('csv.nick'), t('csv.name'), t('csv.email'), t('csv.done'), t('csv.total'), t('csv.stars'), t('csv.badges'), t('csv.exam'), t('csv.last'), t('csv.keys')];
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
    try { setRows((await c.listStudents()).filter(r => !c.isTeacherEmail(r.email)).sort((a, b) => a.grade - b.grade || a.nickname.localeCompare(b.nickname, 'es'))); }
    catch { setMsg(t('panel.readFail')); }
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
    catch (e) { setMsg(String((e as Error).message).includes('not-teacher') ? t('panel.notTeacher') : t('panel.loginFail')); }
  };

  const shown = useMemo(() => (rows ?? []).filter(r => !grade || r.grade === grade), [rows, grade]);
  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(shown)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${t('csv.file')}${grade ? `-grado${grade}` : ''}-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="panel">
      <div className="panel-top">
        <button className="btn btn-ghost" onClick={onBack}><ArrowLeft size={16} /> {t('panel.back')}</button>
        <span className="eyebrow">{t('panel.kicker', { g: CLOUD.minGrade })}</span>
      </div>
      <h1>{t('panel.h1a')} <em>{t('panel.h1b')}</em></h1>
      {!ok ? (
        <div className="panel-login">
          <p>{t('panel.loginBody')}</p>
          <button className="btn btn-primary" disabled={!cloud} onClick={signIn}><LogIn size={16} /> {t('panel.login')}</button>
        </div>
      ) : (
        <>
          <div className="panel-tools">
            <label>{t('panel.grade')}
              <select className="input" value={grade} onChange={e => setGrade(+e.target.value)}>
                <option value={0}>{t('panel.all')}</option>
                {grades.filter(g => g.id >= CLOUD.minGrade).map(g => <option key={g.id} value={g.id}>{g.id}° · {g.title}</option>)}
              </select>
            </label>
            <button className="btn btn-ghost" disabled={busy || !cloud} onClick={() => cloud && load(cloud)}><RefreshCw size={15} /> {t('panel.refresh')}</button>
            <button className="btn btn-primary" disabled={!shown.length} onClick={download}><Download size={15} /> {t('panel.export', { n: shown.length })}</button>
          </div>
          {rows && !shown.length && <p className="panel-empty">{t('panel.empty')}</p>}
          {shown.length > 0 && (
            <div className="panel-table" role="region" aria-label={t('panel.region')} tabIndex={0}>
              <table>
                <thead><tr><th>{t('panel.thGrade')}</th><th>{t('panel.thStudent')}</th><th>{t('panel.thLevels')}</th><th>★</th><th>{t('panel.thBadges')}</th><th>{t('panel.thExam')}</th><th>{t('panel.thLast')}</th></tr></thead>
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
      {busy && <p className="panel-empty">{t('panel.loading')}</p>}
      {msg && <p className="panel-error" role="alert">{msg}</p>}
    </section>
  );
}
