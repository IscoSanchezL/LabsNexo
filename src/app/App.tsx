import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, DoorOpen, Eye, Fullscreen, Lightbulb, LockKeyhole, LogOut, Play as PlayIcon, Pencil, RotateCcw, Volume2, VolumeX, X, Zap, Trophy } from 'lucide-react';
import { grades } from '../data/grados';
import { tallerLibre } from '../data/retos';
import { worldVisuals } from '../worlds';
import { CLOUD, CONFIG } from '../config';
import type { Grade, Level } from '../types';
import { cargarProgreso, emptyProgress, guardarProgreso, levelKey, mergeProgress, obtenerPerfil, type Profile, type Progress } from './store';
import { isMuted, setMuted as setAudioMuted, sfx } from './audio';
import { Robot, avatarNames } from './Robot';
import Backdrop from './Backdrop';
import ClassicGame from './Classic';

const BlockGame = lazy(() => import('../play/BlockGame'));
const Panel = lazy(() => import('./Panel'));

const cloudError = (e: unknown) => {
  const m = String((e as Error)?.message ?? e);
  if (m.includes('not-school')) return 'Entra con tu cuenta educativa del colegio.';
  if (m.includes('popup-closed') || m.includes('cancelled')) return 'Entrada cancelada.';
  if (m.includes('popup-blocked')) return 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes.';
  return 'No pudimos conectar con Google. Revisa la conexión e inténtalo de nuevo.';
};

type Page = 'entry' | 'home' | 'map' | 'level' | 'exam' | 'advanced' | 'free' | 'panel';

const isBlock = (l: Level) => l.mechanic === 'maze' || l.mechanic === 'turtle';
const unit = (g: Grade) => (g.id <= 2 ? 'aventuras' : 'expediciones');

function parseHash(): { page: Page; m: number; l: number } | null {
  const h = location.hash.slice(1);
  if (h === 'mapa') return { page: 'map', m: 0, l: 0 };
  if (h === 'inicio') return { page: 'home', m: 0, l: 0 };
  if (h === 'prueba') return { page: 'exam', m: 0, l: 0 };
  if (h === 'avanzado') return { page: 'advanced', m: 0, l: 0 };
  if (h === 'taller') return { page: 'free', m: 0, l: 0 };
  if (h.startsWith('reto/')) { const [, m, l] = h.split('/').map(Number); if (m > 0 && l > 0) return { page: 'level', m: m - 1, l: l - 1 }; }
  return null;
}

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(obtenerPerfil);
  const [progress, setProgress] = useState<Progress>(cargarProgreso);
  const [page, setPageRaw] = useState<Page>(() => {
    const r = obtenerPerfil() ? parseHash() : null;
    return r ? r.page : obtenerPerfil() ? 'home' : 'entry';
  });
  const [active, setActive] = useState<{ m: number; l: number }>(() => { const r = parseHash(); return r ? { m: r.m, l: r.l } : { m: 0, l: 0 }; });
  const [preview, setPreview] = useState(3);
  const [muted, setMutedState] = useState(isMuted());
  const [teacher, setTeacher] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [toast, setToast] = useState('');

  const grade = grades[(profile?.grade ?? preview) - 1];
  const notify = (s: string) => { setToast(s); window.setTimeout(() => setToast(''), 2600); };

  const go = useCallback((p: Page, m = 0, l = 0) => {
    setActive({ m, l }); setPageRaw(p); window.scrollTo({ top: 0 });
    const h = p === 'home' ? 'inicio' : p === 'map' ? 'mapa' : p === 'level' ? `reto/${m + 1}/${l + 1}` : p === 'exam' ? 'prueba' : p === 'advanced' ? 'avanzado' : p === 'free' ? 'taller' : '';
    if (location.hash.slice(1) !== h) history.replaceState(null, '', h ? `#${h}` : location.pathname + location.search);
  }, []);

  // Acento por mundo
  useEffect(() => {
    const v = worldVisuals[grade.id];
    document.documentElement.style.setProperty('--accent', v?.palette[0] ?? grade.accent);
    document.documentElement.style.setProperty('--accent-2', v?.palette[1] ?? grade.accent);
  }, [grade]);

  // Navegación con el historial del navegador y tecla Escape
  useEffect(() => {
    const pop = () => { if (!profile) return; const r = parseHash(); if (r) { setActive({ m: r.m, l: r.l }); setPageRaw(r.page); } };
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (teacherOpen) setTeacherOpen(false);
      else if (confirmExit) setConfirmExit(false);
      else if (page === 'level' || page === 'exam' || page === 'advanced' || page === 'free') go('map');
    };
    window.addEventListener('hashchange', pop); window.addEventListener('keydown', key);
    return () => { window.removeEventListener('hashchange', pop); window.removeEventListener('keydown', key); };
  }, [profile, page, teacherOpen, confirmExit, go]);

  const syncTimer = React.useRef<number>();
  const pushCloud = (p: Progress, pr: Profile | null) => {
    if (!pr?.uid || pr.grade < CLOUD.minGrade || teacher) return;
    window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(async () => {
      try {
        const cloud = await import('../cloud/cloud');
        const u = cloud.currentUser() ?? await cloud.authReady();
        if (!u || u.uid !== pr.uid) { notify('Entra de nuevo con Google para guardar en la nube.'); return; }
        await cloud.saveStudent(u, pr, p);
      } catch { notify('No se pudo guardar en la nube. Se guardó en este dispositivo.'); }
    }, 800);
  };
  const save = (p: Progress) => { setProgress(p); guardarProgreso(p, profile); pushCloud(p, profile); };

  // Al abrir con cuenta de Google: trae el progreso de la nube (otro dispositivo) y lo une con el local.
  useEffect(() => {
    const pr = obtenerPerfil();
    if (!pr?.uid) return;
    let off = false;
    (async () => {
      try {
        const cloud = await import('../cloud/cloud');
        const u = await cloud.authReady();
        if (!u || u.uid !== pr.uid) { notify('Entra de nuevo con Google para sincronizar.'); return; }
        const remote = await cloud.loadStudent(u.uid);
        if (!remote || off) return;
        const merged = mergeProgress(cargarProgreso(), remote.progress);
        setProgress(merged); guardarProgreso(merged, pr);
      } catch { /* sin conexión: se usa el progreso local */ }
    })();
    return () => { off = true; };
  }, []); // eslint-disable-line

  const googleLogin = async (avatar: number, gradeId: number) => {
    try {
      const cloud = await import('../cloud/cloud');
      const u = await cloud.signInStudent();
      // Un docente que entra por aquí solo prueba la plataforma: no se crea perfil de estudiante ni se guarda en la nube.
      if (cloud.isTeacherEmail(u.email)) {
        const t: Profile = { nickname: (u.displayName ?? '').trim().split(/\s+/)[0].slice(0, 16) || 'Docente', grade: gradeId, avatar };
        guardarProgreso(emptyProgress(), t); setProgress(emptyProgress()); setProfile(t);
        await cloud.signOutCloud(); sfx('win'); go('home'); notify('Entraste como docente: tu avance no se guarda en la nube.');
        return;
      }
      const remote = await cloud.loadStudent(u.uid);
      const nick = (u.displayName ?? '').trim().split(/\s+/)[0].slice(0, 16) || 'Explorador';
      const p: Profile = remote ? { nickname: remote.nickname, grade: remote.grade, avatar: remote.avatar, uid: u.uid } : { nickname: nick, grade: gradeId, avatar, uid: u.uid };
      // El progreso local no se mezcla: el dispositivo puede ser compartido.
      const pg = remote ? remote.progress : emptyProgress();
      guardarProgreso(pg, p); setProgress(pg); setProfile(p);
      if (!remote) await cloud.saveStudent(u, p, pg);
      sfx('win'); go('home');
      if (remote && remote.grade !== gradeId) notify(`Tu cuenta ya estaba en ${remote.grade}°. Si es un error, pídele a tu profe que lo cambie.`);
    } catch (e) { notify(cloudError(e)); }
  };

  const register = (nickname: string, avatar: number, gradeId: number) => {
    const p = { nickname, grade: gradeId, avatar };
    guardarProgreso(progress, p); setProfile(p); sfx('win'); go('home');
  };
  const logout = () => {
    const cloudUser = !!profile?.uid;
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify({ profile: null, progress: cloudUser ? emptyProgress() : progress })); } catch { /* sin almacenamiento */ }
    if (cloudUser) { setProgress(emptyProgress()); import('../cloud/cloud').then(c => c.signOutCloud()).catch(() => {}); }
    setProfile(null); setConfirmExit(false); setTeacher(false); setPageRaw('entry'); history.replaceState(null, '', location.pathname);
  };

  const done = (g: number, m: number, l: number) => !!progress.levels[levelKey(g, m, l)];
  const nextTarget = useMemo(() => {
    for (let m = 0; m < grade.modules.length; m++) for (let l = 0; l < grade.modules[m].levels.length; l++) if (!done(grade.id, m, l)) return { m, l };
    return null;
  }, [grade, progress]); // eslint-disable-line

  const completeLevel = (m: number, l: number, stars: number) => {
    const k = levelKey(grade.id, m, l);
    const best = Math.max(stars, progress.levels[k]?.stars ?? 0);
    const levels = { ...progress.levels, [k]: { stars: best } };
    const mod = grade.modules[m];
    const badges = mod.levels.every((_, i) => levels[levelKey(grade.id, m, i)]) ? [...new Set([...progress.badges, `${grade.id}.${m}`])] : progress.badges;
    save({ ...progress, levels, badges });
  };

  const nextOf = (m: number, l: number) => {
    if (l + 1 < grade.modules[m].levels.length) return { m, l: l + 1 };
    if (m + 1 < grade.modules.length) return { m: m + 1, l: 0 };
    return null;
  };

  const toggleSound = () => { const v = !muted; setMutedState(v); setAudioMuted(v); if (!v) sfx('ok'); };

  const levelNode = () => {
    const mod = grade.modules[active.m]; const level = mod?.levels[active.l];
    if (!level) return null;
    const nx = nextOf(active.m, active.l);
    const props = {
      grade, level, levelKey: levelKey(grade.id, active.m, active.l), label: `${mod.title} · reto ${active.l + 1}`,
      dots: { total: mod.levels.length, current: active.l, done: mod.levels.map((_, i) => done(grade.id, active.m, i)) },
      teacher, hasNext: !!nx, onNext: () => nx && go('level', nx.m, nx.l), onBack: () => go('map'),
      onComplete: (s: number) => completeLevel(active.m, active.l, s),
    };
    return isBlock(level) ? <BlockGame {...props} /> : <ClassicGame {...props} />;
  };

  return (
    <>
      <Backdrop />
      <header className="topbar">
        <a className="wordmark" href="#inicio" onClick={e => { e.preventDefault(); go(profile ? 'home' : 'entry'); }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2.4" /><rect x="13" y="3" width="8" height="8" rx="2.4" opacity=".55" /><rect x="3" y="13" width="8" height="8" rx="2.4" opacity=".55" /><rect x="13" y="13" width="8" height="8" rx="2.4" className="wm-acc" /></svg>
          <span>isco<b>lab</b></span>
        </a>
        <div className="top-actions">
          {profile && <button className="chip" onClick={() => go('map')}><span className="chip-avatar"><Robot variant={profile.avatar} size={26} /></span><span>{profile.nickname} · {profile.grade}°</span></button>}
          <button className="btn btn-ghost btn-icon" onClick={toggleSound} aria-label={muted ? 'Activar sonido' : 'Silenciar'}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
          {profile && <button className="btn btn-ghost" onClick={() => setConfirmExit(true)}><LogOut size={16} /> Salir</button>}
          <button className={`btn btn-ghost btn-icon ${teacher ? 'is-on' : ''}`} onClick={() => setTeacherOpen(true)} aria-label="Modo docente"><LockKeyhole size={16} /></button>
        </div>
      </header>

      <main className={`shell page-${page}`}>
        {page === 'entry' && !profile && <Entry preview={preview} setPreview={setPreview} onStart={register} onGoogle={googleLogin} notify={notify} />}
        {page === 'home' && profile && <Home profile={profile} grade={grade} progress={progress} next={nextTarget} onGo={go} />}
        {page === 'map' && profile && <MapView grade={grade} progress={progress} teacher={teacher} onGo={go} />}
        {page === 'level' && profile && <Suspense fallback={<div className="loading">Cargando laboratorio…</div>}>{levelNode()}</Suspense>}
        {page === 'free' && profile && (
          <Suspense fallback={<div className="loading">Cargando laboratorio…</div>}>
            <BlockGame grade={grade} level={tallerLibre(grade.id)} levelKey={`free.${grade.id}`} label="Taller libre" free dots={{ total: 0, current: -1, done: [] }} teacher={teacher} hasNext={false} onNext={() => {}} onBack={() => go('map')} onComplete={() => {}} />
          </Suspense>)}
        {page === 'panel' && teacher && <Suspense fallback={<div className="loading">Cargando panel…</div>}><Panel onBack={() => go(profile ? 'home' : 'entry')} /></Suspense>}
        {page === 'exam' && profile && <Quiz key="exam" title="Prueba final" kicker={`Grado ${grade.id} · ${grade.title}`} questions={grade.exam} scoreScale={10}
          onBack={() => go('map')} onFinish={(c, n) => { save({ ...progress, exam: { ...progress.exam, [grade.id]: { score: Math.round((c / n) * 100), medal: c / n >= 0.9 ? 'oro' : c / n >= 0.6 ? 'plata' : 'bronce' } } }); go('map'); notify(`Prueba terminada: ${c} de ${n}.`); }} />}
        {page === 'advanced' && profile && grade.advanced && <Quiz key="adv" title={grade.advanced.title} kicker="Laboratorio extra · sin puntaje" intro={grade.advanced.intro} questions={grade.advanced.questions}
          onBack={() => go('map')} onFinish={(c, n) => { go('map'); notify(`Zona avanzada: ${c} de ${n}. ¡Buen trabajo explorando!`); }} />}
      </main>

      <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast}</div>

      {confirmExit && (
        <div className="scrim" role="dialog" aria-modal="true"><div className="dialog">
          <button className="close-dialog btn btn-ghost btn-icon" onClick={() => setConfirmExit(false)} aria-label="Cerrar"><X size={16} /></button>
          <span className="eyebrow">Tu progreso está guardado</span><h2>¿Quieres salir?</h2>
          <p>Tu aventura queda guardada en este dispositivo para cuando vuelvas.</p>
          <div className="dialog-actions"><button className="btn btn-ghost" onClick={() => setConfirmExit(false)}>Seguir jugando</button><button className="btn btn-primary" onClick={logout}>Salir del juego <ArrowRight size={16} /></button></div>
        </div></div>
      )}

      {teacherOpen && <TeacherDialog grade={grade} progress={progress} teacher={teacher} setTeacher={setTeacher} notify={notify} onClose={() => setTeacherOpen(false)}
        onPanel={() => { setTeacherOpen(false); go('panel'); }} onJump={(g, m, l) => { if (profile && profile.grade !== g) { const p = { ...profile, grade: g }; setProfile(p); guardarProgreso(progress, p); } setTeacherOpen(false); go('level', m, l); }}
        onReset={() => { save(emptyProgress()); notify('Progreso reiniciado en este dispositivo.'); }} />}

      <footer className="foot"><span>IscoLab · laboratorio de pensamiento computacional</span><span>Aprender es probar una idea</span></footer>
    </>
  );
}

/* ───────── Entrada ───────── */
function Entry({ preview, setPreview, onStart, onGoogle, notify }: { preview: number; setPreview: (g: number) => void; onStart: (n: string, a: number, g: number) => void; onGoogle: (a: number, g: number) => Promise<void>; notify: (s: string) => void }) {
  const [avatar, setAvatar] = useState(0);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const g = grades[preview - 1], v = worldVisuals[g.id], early = g.id <= 2;
  return (
    <section className="entry">
      <div className="entry-copy">
        <span className="eyebrow">{early ? 'Un laboratorio para imaginar' : 'Laboratorio de pensamiento'}</span>
        <h1>{early ? <>¡Hola,<br /><em>explorador!</em></> : <>Programa.<br /><em>Piensa. Crea.</em></>}</h1>
        <p>{early ? 'Elige tu grado, pon tu apodo y vamos a jugar con ideas.' : 'Resuelve retos con bloques, dibuja con código y depura como un ingeniero. Cada grado, un mundo nuevo.'}</p>
        <div className="world-card" key={g.id}>
          <span className="eyebrow">Mundo 0{g.id}</span><strong>{v.name}</strong><small>{early ? 'Tu primera misión empieza aquí.' : g.title}</small>
          <div className="world-robot"><Robot variant={g.id} mood="happy" size={92} /></div>
        </div>
      </div>
      <form className="entry-form" onSubmit={e => { e.preventDefault(); const n = name.trim(); if (!n) { notify('Escribe tu apodo para empezar.'); return; } onStart(n, avatar, preview); }}>
        <span className="eyebrow">1 · Elige tu grado</span>
        <div className="grade-pick" role="radiogroup" aria-label="Grado">
          {grades.map(x => <button type="button" role="radio" aria-checked={preview === x.id} key={x.id} className={preview === x.id ? 'on' : ''} style={{ '--c': worldVisuals[x.id].palette[0] } as React.CSSProperties} onClick={() => { sfx('click'); setPreview(x.id); }}><b>{x.id}°</b><small>{worldVisuals[x.id].name}</small></button>)}
        </div>
        <label className="eyebrow" htmlFor="nick">2 · ¿Cómo te llamamos?</label>
        <input id="nick" className="input" value={name} onChange={e => setName(e.target.value)} maxLength={16} autoComplete="given-name" placeholder="Tu apodo" />
        <span className="eyebrow">3 · Elige tu robot</span>
        <div className="avatar-pick" role="radiogroup" aria-label="Avatar">
          {avatarNames.map((n, i) => <button type="button" role="radio" aria-checked={avatar === i} key={n} className={avatar === i ? 'on' : ''} onClick={() => { sfx('click'); setAvatar(i); }}><Robot variant={i} size={54} /><small>{n}</small></button>)}
        </div>
        <button className="btn btn-primary btn-lg">Entrar al laboratorio <ArrowRight size={18} /></button>
        {preview >= CLOUD.minGrade && (
          <>
            <button type="button" className="btn btn-ghost btn-lg" disabled={busy} onClick={async () => { setBusy(true); await onGoogle(avatar, preview); setBusy(false); }}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.500 14.500 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.600l7.900-6.100z"/><path fill="#34A853" d="M24 48c6.500 0 12-2.100 16-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.500 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/></svg>
              {busy ? 'Conectando…' : 'Entrar con mi cuenta del colegio'}
            </button>
            <small className="fine">Con tu cuenta del colegio tu progreso se guarda en la nube y lo ves desde cualquier dispositivo.</small>
          </>
        )}
        <small className="fine">Sin cuenta, no pedimos apellidos ni correo: el progreso se guarda solo en este dispositivo.</small>
      </form>
    </section>
  );
}

/* ───────── Inicio ───────── */
function Home({ profile, grade, progress, next, onGo }: { profile: Profile; grade: Grade; progress: Progress; next: { m: number; l: number } | null; onGo: (p: Page, m?: number, l?: number) => void }) {
  const total = grade.modules.reduce((a, m) => a + m.levels.length, 0);
  const count = Object.keys(progress.levels).filter(k => k.startsWith(`${grade.id}.`)).length;
  const badges = progress.badges.filter(b => b.startsWith(`${grade.id}.`)).length;
  const exam = progress.exam[grade.id];
  const early = grade.id <= 2, v = worldVisuals[grade.id];
  const nl = next ? grade.modules[next.m].levels[next.l] : null;
  return (
    <section className="home">
      <div className="home-copy">
        <span className="eyebrow">Mundo {v.name} · grado {grade.id}</span>
        <h1>{early ? '¡Hola,' : 'Hola,'}<br /><em>{profile.nickname}{early ? '!' : '.'}</em></h1>
        <p>{early ? '¿Listo para una nueva misión?' : 'Tu próxima idea empieza aquí.'}</p>
        {nl ? (
          <button className="resume" onClick={() => onGo('level', next!.m, next!.l)}>
            <span className="resume-play"><PlayIcon size={22} fill="currentColor" /></span>
            <span><small>{count ? 'Continuar' : 'Empezar'}</small><b>{nl.title}</b><i>{grade.modules[next!.m].title}</i></span><ArrowRight size={20} />
          </button>
        ) : <div className="resume resume-done"><Trophy size={24} /><span><small>¡Completaste el mundo!</small><b>Prueba final y taller libre te esperan</b></span></div>}
        <div className="home-actions">
          <button className="btn btn-ghost" onClick={() => onGo('map')}>Ver mapa completo</button>
          <button className="btn btn-ghost" onClick={() => onGo('free')}><Pencil size={15} /> Taller libre</button>
        </div>
      </div>
      <div className="home-side">
        <div className="home-robot"><Robot variant={profile.avatar} mood="happy" /></div>
        <div className="metrics">
          <div className="metric"><small>Retos</small><b>{count}<i>/{total}</i></b><span className="bar"><span style={{ width: `${(count / total) * 100}%` }} /></span></div>
          <div className="metric"><small>Insignias</small><b>{badges}<i>/{grade.modules.length}</i></b></div>
          <div className="metric"><small>Prueba</small><b>{exam ? exam.score : '—'}<i>/100</i></b></div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Mapa de aventura ───────── */
function MapView({ grade, progress, teacher, onGo }: { grade: Grade; progress: Progress; teacher: boolean; onGo: (p: Page, m?: number, l?: number) => void }) {
  const done = (m: number, l: number) => !!progress.levels[levelKey(grade.id, m, l)];
  const total = grade.modules.reduce((a, m) => a + m.levels.length, 0);
  const count = Object.keys(progress.levels).filter(k => k.startsWith(`${grade.id}.`)).length;
  const examDone = progress.exam[grade.id];
  return (
    <section className="map">
      <header className="map-head">
        <div><span className="eyebrow">{grade.world} · grado {grade.id}</span>
          <h1>{grade.id <= 2 ? <>¡Tu mapa de <em>aventuras!</em></> : <>Tu mapa de <em>descubrimiento.</em></>}</h1>
          <p>{grade.id <= 2 ? 'Elige una misión. ¡Completa una y aparece la siguiente!' : `${grade.modules.length} ${unit(grade)}, ${total} retos. Cada paso abre el siguiente.`}</p></div>
        <div className="ring" style={{ '--p': count / total } as React.CSSProperties}><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" className="ring-bg" /><circle cx="40" cy="40" r="34" className="ring-fg" pathLength={1} strokeDasharray={`${count / total} 1`} /></svg><b>{count}</b><small>de {total}</small></div>
      </header>

      <div className="modules">
        {grade.modules.map((mod, m) => {
          const badge = progress.badges.includes(`${grade.id}.${m}`);
          return (
            <article className="module" key={mod.title} style={{ '--i': m } as React.CSSProperties}>
              <div className="module-top"><span className="eyebrow">{m + 1 < 10 ? `0${m + 1}` : m + 1} · {badge ? 'Insignia ganada' : `${mod.levels.length} retos`}</span>{badge && <span className="badge"><Check size={14} /></span>}</div>
              <h2>{mod.title}</h2><p>{mod.intro}</p>
              <ol className="trail">
                {mod.levels.map((lv, l) => {
                  const ok = done(m, l), open = teacher || l === 0 || done(m, l - 1), cur = open && !ok && (l === 0 || done(m, l - 1));
                  const s = progress.levels[levelKey(grade.id, m, l)]?.stars ?? 0;
                  return (
                    <li key={lv.title} className={`${ok ? 'is-done' : ''} ${cur ? 'is-current' : ''} ${!open ? 'is-locked' : ''}`} style={{ '--x': Math.sin(l * 1.3) * 34 } as React.CSSProperties}>
                      <button className="node" disabled={!open} onClick={() => { sfx('click'); onGo('level', m, l); }} aria-label={`${lv.title}${ok ? `, ${s} estrellas` : !open ? ', bloqueado' : ''}`}>
                        {ok ? <Check size={20} /> : !open ? <LockKeyhole size={16} /> : <span>{l + 1}</span>}
                      </button>
                      <span className="node-label"><b>{lv.title}</b><small>{ok ? '★'.repeat(s) + '☆'.repeat(3 - s) : lv.concept}</small></span>
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </div>

      <div className="portals">
        <button className="portal" onClick={() => onGo('exam')}><span className="portal-ico"><Trophy /></span><span><small>Al terminar tu ruta</small><b>Prueba final</b><i>{examDone ? `Tu mejor puntaje: ${examDone.score}/100 · ${examDone.medal}` : '10 preguntas para mostrar lo que sabes'}</i></span><ArrowRight /></button>
        <button className="portal" onClick={() => onGo('free')}><span className="portal-ico"><Pencil /></span><span><small>Sin reglas ni estrellas</small><b>Taller libre</b><i>Dibuja lo que imagines con la tortuga</i></span><ArrowRight /></button>
        {grade.advanced && <button className="portal" onClick={() => onGo('advanced')}><span className="portal-ico"><Zap /></span><span><small>Ruta opcional</small><b>{grade.advanced.title}</b><i>{grade.advanced.intro}</i></span><ArrowRight /></button>}
      </div>
      <p className="map-note"><Lightbulb size={16} /> {grade.id <= 2 ? '¡Cada reto abre una nueva aventura!' : 'Piensa · Prueba · Ajusta.'}</p>
    </section>
  );
}

/* ───────── Preguntas (prueba final y zona avanzada) ───────── */
function Quiz({ title, kicker, intro, questions, scoreScale, onBack, onFinish }: { title: string; kicker: string; intro?: string; questions: { question: string; options: string[]; answer: string }[]; scoreScale?: number; onBack: () => void; onFinish: (correct: number, total: number) => void }) {
  const [i, setI] = useState(0), [score, setScore] = useState(0), [sel, setSel] = useState<string | null>(null);
  const q = questions[i];
  const opts = useMemo(() => [...new Set([...q.options, q.answer])], [q]);
  const answer = (a: string) => {
    if (sel) return;
    const ok = a === q.answer; setSel(a); sfx(ok ? 'ok' : 'fail');
    window.setTimeout(() => {
      const sc = score + (ok ? 1 : 0); setSel(null);
      if (i < questions.length - 1) { setScore(sc); setI(i + 1); } else onFinish(sc, questions.length);
    }, 750);
  };
  return (
    <section className="quiz">
      <div className="quiz-top"><button className="btn btn-ghost" onClick={onBack}><ArrowLeft size={16} /> Volver al mapa</button><span className="eyebrow">{kicker}</span>{scoreScale && <span className="count-pill">{score * scoreScale} pts</span>}</div>
      <div className="quiz-progress"><i style={{ width: `${(i / questions.length) * 100}%` }} /></div>
      <div className="quiz-card">
        {i === 0 && intro && <p className="quiz-intro">{intro}</p>}
        <span className="eyebrow">{title} · pregunta {i + 1} de {questions.length}</span>
        <h1>{q.question}</h1>
        <div className="cl-options">{opts.map((o, k) => <button key={o} className={`cl-opt ${sel ? (o === q.answer ? 'good' : o === sel ? 'bad' : '') : ''}`} disabled={!!sel} onClick={() => answer(o)}><span>{String.fromCharCode(65 + k)}</span>{o}<ArrowRight size={15} /></button>)}</div>
      </div>
    </section>
  );
}

/* ───────── Modo docente ───────── */
function TeacherDialog({ grade, progress, teacher, setTeacher, notify, onClose, onPanel, onJump, onReset }: { grade: Grade; progress: Progress; teacher: boolean; setTeacher: (v: boolean) => void; notify: (s: string) => void; onClose: () => void; onPanel: () => void; onJump: (g: number, m: number, l: number) => void; onReset: () => void }) {
  const [unlocked, setUnlocked] = useState(teacher);
  const [pin, setPin] = useState('');
  const [g, setG] = useState(grade.id), [idx, setIdx] = useState(0);
  const [fs, setFs] = useState(!!document.fullscreenElement);
  useEffect(() => { const f = () => setFs(!!document.fullscreenElement); document.addEventListener('fullscreenchange', f); return () => document.removeEventListener('fullscreenchange', f); }, []);
  const target = grades[g - 1];
  const flat = target.modules.flatMap((m, mi) => m.levels.map((l, li) => ({ mi, li, label: `${mi + 1}.${li + 1} · ${l.title}` })));
  return (
    <div className="scrim" role="dialog" aria-modal="true"><div className="dialog dialog-wide">
      <button className="close-dialog btn btn-ghost btn-icon" onClick={onClose} aria-label="Cerrar"><X size={16} /></button>
      {!unlocked ? (
        <>
          <span className="eyebrow">Modo docente</span><h2>Acceso del aula</h2><p>Escribe la clave docente para abrir las herramientas.</p>
          <form className="pin-form" onSubmit={e => { e.preventDefault(); if (pin === CONFIG.teacherPin) { setUnlocked(true); setTeacher(true); sfx('ok'); } else { notify('Esa clave no coincide.'); setPin(''); } }}>
            <input className="input" type="password" inputMode="numeric" autoFocus value={pin} onChange={e => setPin(e.target.value)} placeholder="Clave" aria-label="Clave docente" />
            <button className="btn btn-primary">Desbloquear <ArrowRight size={16} /></button>
          </form>
        </>
      ) : (
        <>
          <span className="eyebrow">Panel de proyección</span><h2>Herramientas docentes</h2>
          <p>Con el modo activo se desbloquean todos los retos y aparece el botón de ver solución dentro de cada reto.</p>
          <div className="teacher-grid">
            <label>Grado<select className="input" value={g} onChange={e => { setG(+e.target.value); setIdx(0); }}>{grades.map(x => <option key={x.id} value={x.id}>{x.id}° · {x.title}</option>)}</select></label>
            <label>Reto<select className="input" value={idx} onChange={e => setIdx(+e.target.value)}>{flat.map((f, i) => <option key={i} value={i}>{f.label}</option>)}</select></label>
          </div>
          <div className="dialog-actions vertical">
            <button className="btn btn-primary" onClick={() => onJump(g, flat[idx].mi, flat[idx].li)}>Abrir reto seleccionado <ArrowRight size={16} /></button>
            <button className="btn btn-ghost" onClick={onPanel}><Eye size={16} /> Panel de estudiantes</button>
            <button className="btn btn-ghost" onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.()}><Fullscreen size={16} /> {fs ? 'Salir de pantalla completa' : 'Pantalla completa'}</button>
            <button className="btn btn-ghost" onClick={() => { if (confirm('¿Reiniciar el progreso de este dispositivo?')) onReset(); }}><RotateCcw size={16} /> Reiniciar progreso</button>
            <button className="btn btn-ghost" onClick={() => { setTeacher(false); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); onClose(); }}><DoorOpen size={16} /> Salir del modo docente</button>
          </div>
          <div className="teacher-summary"><Eye size={14} /> Este dispositivo · {Object.keys(progress.levels).length} retos · {progress.badges.length} insignias{progress.exam[grade.id] ? ` · prueba ${progress.exam[grade.id].score}/100` : ''}</div>
        </>
      )}
    </div></div>
  );
}
