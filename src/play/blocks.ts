import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as Es from 'blockly/msg/es';
import * as En from 'blockly/msg/en';
import { LANG } from '../i18n';
import { t } from '../i18n/ui';
import type { Cond, Expr, Program, Stmt } from './ast';
import { PALETTE } from './turtle';
import type { Tool } from '../types';

Blockly.setLocale((LANG === 'en' ? En : Es) as unknown as { [key: string]: string });

// ───────────────────────── Definición de bloques propios ─────────────────────────
const swatch = (hex: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"><circle cx="11" cy="11" r="9" fill="${hex}" stroke="#ffffff" stroke-width="2"/></svg>`)}`;
const COLOR_OPTIONS = Object.entries(PALETTE).map(([name, hex]) => [{ src: swatch(hex), width: 22, height: 22, alt: name }, name]);

const TURN = [[t('blk.left'), 'L'], [t('blk.right'), 'R']];
const COND = [[t('blk.condAhead'), 'ahead'], [t('blk.condLeft'), 'left'], [t('blk.condRight'), 'right']];

let defined = false;
export function defineBlocks() {
  if (defined) return;
  defined = true;
  Blockly.common.defineBlocksWithJsonArray([
    { type: 'evt_start', message0: t('blk.start'), nextStatement: null, style: 'hat_blocks', tooltip: t('blk.startTip') },
    { type: 'maze_move', message0: t('blk.move'), previousStatement: null, nextStatement: null, style: 'move_blocks', tooltip: t('blk.moveTip') },
    { type: 'maze_turn', message0: t('blk.turn'), args0: [{ type: 'field_dropdown', name: 'DIR', options: TURN }], previousStatement: null, nextStatement: null, style: 'turn_blocks', tooltip: t('blk.turnTip') },
    { type: 'maze_if', message0: t('blk.if'), args0: [{ type: 'field_dropdown', name: 'COND', options: COND }], message1: t('blk.do'), args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, style: 'logic_blocks' },
    { type: 'maze_ifelse', message0: t('blk.if'), args0: [{ type: 'field_dropdown', name: 'COND', options: COND }], message1: t('blk.do'), args1: [{ type: 'input_statement', name: 'DO' }], message2: t('blk.else'), args2: [{ type: 'input_statement', name: 'ELSE' }], previousStatement: null, nextStatement: null, style: 'logic_blocks' },
    { type: 'maze_until', message0: t('blk.until'), message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], previousStatement: null, nextStatement: null, style: 'loop_blocks', tooltip: t('blk.untilTip') },
    { type: 'tur_fd', message0: t('blk.fd'), args0: [{ type: 'input_value', name: 'DIST', check: 'Number' }], inputsInline: true, previousStatement: null, nextStatement: null, style: 'move_blocks', tooltip: t('blk.fdTip') },
    { type: 'tur_turn', message0: t('blk.rot'), args0: [{ type: 'field_dropdown', name: 'DIR', options: TURN }, { type: 'input_value', name: 'ANGLE', check: 'Number' }], inputsInline: true, previousStatement: null, nextStatement: null, style: 'turn_blocks', tooltip: t('blk.rotTip') },
    { type: 'tur_pen', message0: t('blk.pen'), args0: [{ type: 'field_dropdown', name: 'STATE', options: [[t('blk.penDown'), 'down'], [t('blk.penUp'), 'up']] }], previousStatement: null, nextStatement: null, style: 'pen_blocks', tooltip: t('blk.penTip') },
    { type: 'tur_color', message0: t('blk.color'), args0: [{ type: 'field_dropdown', name: 'C', options: COLOR_OPTIONS }], previousStatement: null, nextStatement: null, style: 'pen_blocks', tooltip: t('blk.colorTip') },
  ]);
}

// ───────────────────────── Tema visual ─────────────────────────
const style = (hex: string, hat?: 'cap') => ({
  colourPrimary: hex, colourSecondary: shade(hex, 0.18), colourTertiary: shade(hex, -0.22), ...(hat ? { hat } : {}),
});
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(Math.max(0, Math.min(255, amt >= 0 ? c + (255 - c) * amt : c * (1 + amt))));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('');
}

export const labTheme = Blockly.Theme.defineTheme('iscolab', {
  name: 'iscolab',
  base: Blockly.Themes.Classic,
  blockStyles: {
    hat_blocks: style('#ffb02e', 'cap'),
    move_blocks: style('#3d8bff'),
    turn_blocks: style('#8b5cf6'),
    loop_blocks: style('#ff8a3d'),
    logic_blocks: style('#1fbf8f'),
    math_blocks: style('#e8588d'),
    variable_blocks: style('#ff6b6b'),
    procedure_blocks: style('#b45cf0'),
    pen_blocks: style('#14b8d4'),
  },
  categoryStyles: {
    move_category: { colour: '#3d8bff' }, turn_category: { colour: '#8b5cf6' }, loop_category: { colour: '#ff8a3d' },
    logic_category: { colour: '#1fbf8f' }, variable_category: { colour: '#ff6b6b' }, procedure_category: { colour: '#b45cf0' },
    pen_category: { colour: '#14b8d4' }, math_category: { colour: '#e8588d' },
  },
  componentStyles: {
    workspaceBackgroundColour: '#0e1530',
    toolboxBackgroundColour: '#131c3d',
    toolboxForegroundColour: '#dfe6ff',
    flyoutBackgroundColour: '#17224a',
    flyoutForegroundColour: '#dfe6ff',
    flyoutOpacity: 0.97,
    scrollbarColour: '#6f7fc4',
    scrollbarOpacity: 0.55,
    insertionMarkerColour: '#ffffff',
    insertionMarkerOpacity: 0.28,
    markerColour: '#ffffff',
    cursorColour: '#ffffff',
  },
  fontStyle: { family: 'Outfit, Inter, system-ui, sans-serif', weight: '600', size: 12 },
  startHats: false,
});

// ───────────────────────── Caja de herramientas ─────────────────────────
type J = Record<string, unknown>;
const numShadow = (n: number) => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const BLOCK: Record<string, () => J> = {
  move: () => ({ kind: 'block', type: 'maze_move' }),
  turnL: () => ({ kind: 'block', type: 'maze_turn', fields: { DIR: 'L' } }),
  turnR: () => ({ kind: 'block', type: 'maze_turn', fields: { DIR: 'R' } }),
  repeat: () => ({ kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: numShadow(4) } }),
  until: () => ({ kind: 'block', type: 'maze_until' }),
  if: () => ({ kind: 'block', type: 'maze_if' }),
  ifelse: () => ({ kind: 'block', type: 'maze_ifelse' }),
  fd: () => ({ kind: 'block', type: 'tur_fd', inputs: { DIST: numShadow(100) } }),
  rotL: () => ({ kind: 'block', type: 'tur_turn', fields: { DIR: 'L' }, inputs: { ANGLE: numShadow(90) } }),
  rotR: () => ({ kind: 'block', type: 'tur_turn', fields: { DIR: 'R' }, inputs: { ANGLE: numShadow(90) } }),
  penUp: () => ({ kind: 'block', type: 'tur_pen', fields: { STATE: 'up' } }),
  penDown: () => ({ kind: 'block', type: 'tur_pen', fields: { STATE: 'down' } }),
  color: () => ({ kind: 'block', type: 'tur_color', fields: { C: 'rojo' } }),
};

function varBlocks(vars: string[]): J[] {
  const out: J[] = [];
  for (const v of vars) {
    out.push({ kind: 'block', type: 'variables_set', fields: { VAR: { name: v } }, inputs: { VALUE: numShadow(10) } });
    out.push({ kind: 'block', type: 'math_change', fields: { VAR: { name: v } }, inputs: { DELTA: numShadow(10) } });
    out.push({ kind: 'block', type: 'variables_get', fields: { VAR: { name: v } } });
  }
  out.push({ kind: 'block', type: 'math_number', fields: { NUM: 10 } });
  out.push({ kind: 'block', type: 'math_arithmetic', fields: { OP: 'ADD' }, inputs: { A: numShadow(1), B: numShadow(1) } });
  return out;
}

export function buildToolbox(tools: Tool[], vars: string[] = []): J {
  const has = (t: Tool) => tools.includes(t);
  const moves: J[] = []; const control: J[] = []; const pen: J[] = [];
  (['move', 'fd'] as const).forEach(t => has(t) && moves.push(BLOCK[t]()));
  (['turnL', 'turnR', 'rotL', 'rotR'] as const).forEach(t => has(t) && moves.push(BLOCK[t]()));
  (['repeat', 'until', 'if', 'ifelse'] as const).forEach(t => has(t) && control.push(BLOCK[t]()));
  if (has('pen')) pen.push(BLOCK.penDown(), BLOCK.penUp());
  if (has('color')) pen.push(BLOCK.color());
  const needsCategories = has('vars') || has('proc') || moves.length + control.length + pen.length > 7;
  if (!needsCategories) return { kind: 'flyoutToolbox', contents: [...moves, ...control, ...pen] };

  const cats: J[] = [];
  if (moves.length) cats.push({ kind: 'category', name: t('cat.move'), categorystyle: 'move_category', contents: moves });
  if (control.length) cats.push({ kind: 'category', name: t('cat.control'), categorystyle: 'loop_category', contents: control });
  if (pen.length) cats.push({ kind: 'category', name: t('cat.pen'), categorystyle: 'pen_category', contents: pen });
  if (has('vars')) cats.push({ kind: 'category', name: t('cat.vars'), categorystyle: 'variable_category', contents: varBlocks(vars) });
  if (has('proc')) cats.push({ kind: 'category', name: t('cat.funcs'), categorystyle: 'procedure_category', custom: 'PROCEDURE' });
  return { kind: 'categoryToolbox', contents: cats };
}

// ───────────────────────── AST → bloques (XML) ─────────────────────────
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function exprXml(e: Expr, input: string): string {
  if (e.k === 'num') return `<value name="${input}"><shadow type="math_number"><field name="NUM">${e.v}</field></shadow></value>`;
  if (e.k === 'var') return `<value name="${input}"><block type="variables_get"><field name="VAR">${esc(e.name)}</field></block></value>`;
  const OP = { '+': 'ADD', '-': 'MINUS', '*': 'MULTIPLY', '/': 'DIVIDE' }[e.op];
  return `<value name="${input}"><block type="math_arithmetic"><field name="OP">${OP}</field>${exprXml(e.a, 'A')}${exprXml(e.b, 'B')}</block></value>`;
}

function chainXml(list: Stmt[]): string {
  if (!list.length) return '';
  const [first, ...rest] = list;
  const next = rest.length ? `<next>${chainXml(rest)}</next>` : '';
  return stmtXml(first, next);
}
const sub = (name: string, list: Stmt[]) => (list.length ? `<statement name="${name}">${chainXml(list)}</statement>` : '');

function stmtXml(s: Stmt, next: string): string {
  switch (s.t) {
    case 'move': return `<block type="maze_move">${next}</block>`;
    case 'turn': return `<block type="maze_turn"><field name="DIR">${s.dir}</field>${next}</block>`;
    case 'repeat': return `<block type="controls_repeat_ext">${exprXml(s.n, 'TIMES')}${sub('DO', s.body)}${next}</block>`;
    case 'until': return `<block type="maze_until">${sub('DO', s.body)}${next}</block>`;
    case 'if': return s.else
      ? `<block type="maze_ifelse"><field name="COND">${s.cond}</field>${sub('DO', s.then)}${sub('ELSE', s.else)}${next}</block>`
      : `<block type="maze_if"><field name="COND">${s.cond}</field>${sub('DO', s.then)}${next}</block>`;
    case 'call': return `<block type="procedures_callnoreturn"><mutation name="${esc(s.name)}"></mutation>${next}</block>`;
    case 'fd': return `<block type="tur_fd">${exprXml(s.n, 'DIST')}${next}</block>`;
    case 'rot': return `<block type="tur_turn"><field name="DIR">${s.dir}</field>${exprXml(s.n, 'ANGLE')}${next}</block>`;
    case 'pen': return `<block type="tur_pen"><field name="STATE">${s.down ? 'down' : 'up'}</field>${next}</block>`;
    case 'color': return `<block type="tur_color"><field name="C">${esc(s.c)}</field>${next}</block>`;
    case 'set': return `<block type="variables_set"><field name="VAR">${esc(s.name)}</field>${exprXml(s.e, 'VALUE')}${next}</block>`;
    case 'chg': return `<block type="math_change"><field name="VAR">${esc(s.name)}</field>${exprXml(s.e, 'DELTA')}${next}</block>`;
  }
}

export function programToXml(p: Program, vars: string[] = []): string {
  const varXml = vars.length ? `<variables>${vars.map(v => `<variable>${esc(v)}</variable>`).join('')}</variables>` : '';
  const hat = `<block type="evt_start" deletable="false" x="24" y="24">${p.main.length ? `<next>${chainXml(p.main)}</next>` : ''}</block>`;
  let y = 24;
  const defs = Object.entries(p.defs).map(([name, body]) => {
    const x = `<block type="procedures_defnoreturn" x="${Math.max(24, 300)}" y="${y}"><field name="NAME">${esc(name)}</field>${sub('STACK', body)}</block>`;
    y += 90 + heightOf(body);
    return x;
  });
  return `<xml xmlns="https://developers.google.com/blockly/xml">${varXml}${hat}${defs.join('')}</xml>`;
}
/** Altura aproximada (px) de una pila de bloques, para que las definiciones no se monten unas sobre otras. */
const heightOf = (l: Stmt[]): number => Math.max(48, l.reduce((n, st) => n + 54 + (st.t === 'repeat' || st.t === 'until' ? 40 + heightOf(st.body) : st.t === 'if' ? 40 + heightOf(st.then) + (st.else ? 40 + heightOf(st.else) : 0) : 0), 0));

// ───────────────────────── Bloques → AST ─────────────────────────
type B = Blockly.Block;
const on = (b: B) => (typeof b.isEnabled === 'function' ? b.isEnabled() : true);

function exprOf(b: B | null, fallback = 0): Expr {
  if (!b) return { k: 'num', v: fallback };
  switch (b.type) {
    case 'math_number': return { k: 'num', v: Number(b.getFieldValue('NUM')) || 0 };
    case 'variables_get': return { k: 'var', name: b.getField('VAR')?.getText() ?? '' };
    case 'math_arithmetic': {
      const op = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/' }[b.getFieldValue('OP') as string] as '+' | '-' | '*' | '/' | undefined;
      return { k: 'bin', op: op ?? '+', a: exprOf(b.getInputTargetBlock('A')), b: exprOf(b.getInputTargetBlock('B')) };
    }
    default: return { k: 'num', v: fallback };
  }
}

function chainOf(b: B | null): Stmt[] {
  const out: Stmt[] = [];
  for (let cur = b; cur; cur = cur.getNextBlock()) {
    if (!on(cur)) continue;
    const id = cur.id;
    const body = (name: string) => chainOf(cur.getInputTargetBlock(name));
    switch (cur.type) {
      case 'maze_move': out.push({ t: 'move', id }); break;
      case 'maze_turn': out.push({ t: 'turn', dir: cur.getFieldValue('DIR') as 'L' | 'R', id }); break;
      case 'controls_repeat_ext': out.push({ t: 'repeat', n: exprOf(cur.getInputTargetBlock('TIMES')), body: body('DO'), id }); break;
      case 'controls_repeat': out.push({ t: 'repeat', n: { k: 'num', v: Number(cur.getFieldValue('TIMES')) || 0 }, body: body('DO'), id }); break;
      case 'maze_until': out.push({ t: 'until', body: body('DO'), id }); break;
      case 'maze_if': out.push({ t: 'if', cond: cur.getFieldValue('COND') as Cond, then: body('DO'), id }); break;
      case 'maze_ifelse': out.push({ t: 'if', cond: cur.getFieldValue('COND') as Cond, then: body('DO'), else: body('ELSE'), id }); break;
      case 'procedures_callnoreturn': {
        const name = (cur as unknown as { getProcedureCall?: () => string }).getProcedureCall?.() ?? String(cur.getFieldValue('NAME') ?? '');
        out.push({ t: 'call', name, id }); break;
      }
      case 'tur_fd': out.push({ t: 'fd', n: exprOf(cur.getInputTargetBlock('DIST')), id }); break;
      case 'tur_turn': out.push({ t: 'rot', dir: cur.getFieldValue('DIR') as 'L' | 'R', n: exprOf(cur.getInputTargetBlock('ANGLE')), id }); break;
      case 'tur_pen': out.push({ t: 'pen', down: cur.getFieldValue('STATE') === 'down', id }); break;
      case 'tur_color': out.push({ t: 'color', c: String(cur.getFieldValue('C')), id }); break;
      case 'variables_set': out.push({ t: 'set', name: cur.getField('VAR')?.getText() ?? '', e: exprOf(cur.getInputTargetBlock('VALUE')), id }); break;
      case 'math_change': out.push({ t: 'chg', name: cur.getField('VAR')?.getText() ?? '', e: exprOf(cur.getInputTargetBlock('DELTA'), 1), id }); break;
      default: break;
    }
  }
  return out;
}

export function workspaceToProgram(ws: Blockly.Workspace): Program {
  const tops = ws.getTopBlocks(true);
  const hat = tops.find(b => b.type === 'evt_start');
  const main = hat ? chainOf(hat.getNextBlock()) : [];
  const defs: Record<string, Stmt[]> = {};
  for (const b of tops) {
    if (b.type !== 'procedures_defnoreturn' || !on(b)) continue;
    const name = String(b.getFieldValue('NAME'));
    defs[name] = chainOf(b.getInputTargetBlock('STACK'));
  }
  return { main, defs };
}

/** Bloques que cuentan para el límite de un reto (sin el «al empezar» ni los bloques sueltos). */
export function countWorkspaceBlocks(ws: Blockly.Workspace): number {
  return ws.getAllBlocks(false).filter(b => !b.isShadow() && b.type !== 'evt_start' && on(b)).length;
}

export { Blockly };
