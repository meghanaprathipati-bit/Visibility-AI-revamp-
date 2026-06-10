#!/usr/bin/env node
// Converts @gohighlevel/ghl-icons Vue render functions into React functional components.
// Run once: node convert-ghl-icons.js

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));

const GHL_ICONS_BASE =
  '/Users/meghanaprathipatihighlevel/Highlevel/ghl-revex-frontend/node_modules/.pnpm/@gohighlevel+ghl-icons@1.0.47_vue@3.5.25_typescript@4.9.5_/node_modules/@gohighlevel/ghl-icons/24';

const OUT_DIR = join(__dirname, 'src/icons');

// lucide-react name → { ghlName, subdir }
const ICON_MAP = {
  ArrowLeft:     { ghlName: 'ArrowLeftIcon',     subdir: 'outline' },
  MoreHorizontal:{ ghlName: 'DotsHorizontalIcon', subdir: 'outline' },
  ChevronRight:  { ghlName: 'ChevronRightIcon',  subdir: 'outline' },
  ChevronLeft:   { ghlName: 'ChevronLeftIcon',   subdir: 'outline' },
  Search:        { ghlName: 'SearchSmIcon',       subdir: 'outline' },
  Zap:           { ghlName: 'Lightning01Icon',    subdir: 'outline' },
  Settings:      { ghlName: 'Settings01Icon',     subdir: 'outline' },
  LayoutDashboard:{ ghlName: 'LayoutGrid01Icon',  subdir: 'outline' },
  FileText:      { ghlName: 'File06Icon',         subdir: 'outline' },
  Pin:           { ghlName: 'Pin01Icon',          subdir: 'outline' },
  Sparkles:      { ghlName: 'Stars01Icon',        subdir: 'outline' },
  Megaphone:     { ghlName: 'Announcement01Icon', subdir: 'outline' },
  Bell:          { ghlName: 'Bell01Icon',         subdir: 'outline' },
  HelpCircle:    { ghlName: 'HelpCircleIcon',     subdir: 'outline' },
  ChevronDown:   { ghlName: 'ChevronDownIcon',    subdir: 'outline' },
  X:             { ghlName: 'XIcon',              subdir: 'outline' },
  Paperclip:     { ghlName: 'PaperclipIcon',      subdir: 'outline' },
  AlertTriangle: { ghlName: 'AlertTriangleIcon',  subdir: 'outline' },
  Copy:          { ghlName: 'Copy01Icon',         subdir: 'outline' },
  BookOpen:      { ghlName: 'BookOpen01Icon',     subdir: 'outline' },
  Users:         { ghlName: 'Users01Icon',        subdir: 'outline' },
  Calendar:      { ghlName: 'CalendarIcon',       subdir: 'outline' },
  Phone:         { ghlName: 'Phone01Icon',        subdir: 'outline' },
  ExternalLink:  { ghlName: 'LinkExternal02Icon', subdir: 'outline' },
  Bot:           { ghlName: 'CpuChip01Icon',      subdir: 'outline' },
  CreditCard:    { ghlName: 'CreditCard01Icon',   subdir: 'outline' },
  GraduationCap: { ghlName: 'GraduationHat01Icon',subdir: 'outline' },
  Package:       { ghlName: 'PackageIcon',        subdir: 'outline' },
  Send:          { ghlName: 'Send01Icon',         subdir: 'outline' },
  Crown:         { ghlName: 'Star01Icon',         subdir: 'outline' },
  Globe:         { ghlName: 'Globe01Icon',        subdir: 'outline' },
  Image:         { ghlName: 'Image01Icon',        subdir: 'outline' },
  RefreshCw:     { ghlName: 'RefreshCw01Icon',    subdir: 'outline' },
  Star:          { ghlName: 'Star01Icon',         subdir: 'outline' },
  TrendingUp:    { ghlName: 'TrendUp01Icon',      subdir: 'outline' },
  Grid3x3:       { ghlName: 'Grid01Icon',         subdir: 'outline' },
  Tablet:        { ghlName: 'Tablet01Icon',       subdir: 'outline' },
  Link2:         { ghlName: 'Link01Icon',         subdir: 'outline' },
  Plus:          { ghlName: 'PlusIcon',           subdir: 'outline' },
  MessageSquare: { ghlName: 'MessageSquare01Icon',subdir: 'outline' },
  Workflow:      { ghlName: 'Dataflow01Icon',     subdir: 'outline' },
  CheckSquare:   { ghlName: 'CheckSquareIcon',    subdir: 'outline' },
  BarChart3:     { ghlName: 'BarChart01Icon',     subdir: 'outline' },
  LayoutGrid:    { ghlName: 'LayoutGrid01Icon',   subdir: 'outline' },
  // Round 3 – remaining icons found in full scan
  ArrowUpCircle: { ghlName: 'ArrowCircleUpIcon',  subdir: 'outline' },
  Award:         { ghlName: 'Award01Icon',        subdir: 'outline' },
  Building2:     { ghlName: 'Building02Icon',     subdir: 'outline' },
  Check:         { ghlName: 'CheckIcon',          subdir: 'outline' },
  Circle:        { ghlName: 'CircleIcon',         subdir: 'outline' },
  CircleCheck:   { ghlName: 'CheckCircleIcon',    subdir: 'outline' },
  Clock:         { ghlName: 'ClockIcon',          subdir: 'outline' },
  Code2:         { ghlName: 'Code01Icon',         subdir: 'outline' },
  Download:      { ghlName: 'Download01Icon',     subdir: 'outline' },
  FolderPlus:    { ghlName: 'FolderPlusIcon',     subdir: 'outline' },
  ImageIcon:     { ghlName: 'Image01Icon',        subdir: 'outline' },
  LayoutList:    { ghlName: 'ListIcon',           subdir: 'outline' },
  Loader2:       { ghlName: 'Loading01Icon',      subdir: 'outline' },
  Mail:          { ghlName: 'Mail01Icon',         subdir: 'outline' },
  MapPin:        { ghlName: 'MarkerPin01Icon',    subdir: 'outline' },
  MessageCircle: { ghlName: 'MessageCircle01Icon',subdir: 'outline' },
  Pencil:        { ghlName: 'Pencil01Icon',       subdir: 'outline' },
  Refresh:       { ghlName: 'RefreshCw01Icon',    subdir: 'outline' },
  Share2:        { ghlName: 'Share01Icon',        subdir: 'outline' },
  Trash2:        { ghlName: 'Trash01Icon',        subdir: 'outline' },
  User:          { ghlName: 'User01Icon',         subdir: 'outline' },
  Wand2:         { ghlName: 'MagicWand01Icon',    subdir: 'outline' },
};

// ── AST types ────────────────────────────────────────────────────────────────

function el(tag, props, children) {
  return { tag, props: props ?? {}, children: Array.isArray(children) ? children : [] };
}

// Mock vue module – just enough for ghl-icons render functions
const vueMock = {
  createElementVNode: el,
  createElementBlock: el,
  openBlock: () => null,
  createTextVNode: (t) => t,
  renderSlot: () => null,
  Fragment: 'Fragment',
};

// ── AST → React JSX ──────────────────────────────────────────────────────────

const PROP_RENAMES = {
  'class': 'className',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'aria-hidden': 'aria-hidden', // keep as-is
  'xmlns:xlink': 'xmlnsXlink',
  'xlink:href': 'xlinkHref',
};

function toProp(key) {
  return PROP_RENAMES[key] ?? key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function propsToJSX(props, isRoot) {
  const parts = [];
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined) continue;
    const jsxKey = toProp(k);
    if (isRoot && (jsxKey === 'ariaHidden' || jsxKey === 'aria-hidden')) continue; // let caller control
    if (typeof v === 'boolean') {
      parts.push(v ? jsxKey : `${jsxKey}={false}`);
    } else if (typeof v === 'number') {
      parts.push(`${jsxKey}={${v}}`);
    } else {
      parts.push(`${jsxKey}="${v}"`);
    }
  }
  return parts.join(' ');
}

function nodeToJSX(node, indent = '    ') {
  if (typeof node === 'string') return `${indent}{${JSON.stringify(node)}}`;
  if (!node || !node.tag) return '';
  const { tag, props, children } = node;
  const p = propsToJSX(props, false);
  const open = p ? `${indent}<${tag} ${p}` : `${indent}<${tag}`;
  const kids = children.filter(Boolean);
  if (kids.length === 0) return `${open} />`;
  if (kids.length === 1 && typeof kids[0] === 'string') {
    return `${open}>${kids[0]}</${tag}>`;
  }
  const inner = kids.map(c => nodeToJSX(c, indent + '  ')).filter(Boolean).join('\n');
  return `${open}>\n${inner}\n${indent}</${tag}>`;
}

// ── Load icon AST from Vue render fn ─────────────────────────────────────────

function loadIconAST(filePath) {
  const src = readFileSync(filePath, 'utf8');
  // Replace require("vue") with our mock by running in a VM with a fake require
  const fakeRequire = (mod) => {
    if (mod === 'vue') return vueMock;
    throw new Error(`Unexpected require: ${mod}`);
  };
  const sandbox = {
    require: fakeRequire,
    module: { exports: {} },
    exports: {},
  };
  sandbox.exports = sandbox.module.exports;
  try {
    vm.runInNewContext(src, sandbox);
  } catch (e) {
    throw new Error(`Failed to load ${filePath}: ${e.message}`);
  }
  const renderFn = sandbox.module.exports;
  if (typeof renderFn !== 'function') throw new Error(`No render function in ${filePath}`);
  return renderFn(/* _ctx */ {}, /* _cache */ []);
}

// ── Generate React component source ──────────────────────────────────────────

function generateReactComponent(reactName, ast) {
  const { props: svgProps, children } = ast;
  const svgPropsStr = propsToJSX(svgProps, true);
  const inner = children
    .filter(Boolean)
    .map(c => nodeToJSX(c, '    '))
    .filter(Boolean)
    .join('\n');

  return `import React from 'react';

export function ${reactName}({ size = 24, className = '', color = 'currentColor', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
${inner}
    </svg>
  );
}

export default ${reactName};
`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

mkdirSync(OUT_DIR, { recursive: true });

const indexLines = [
  "// Auto-generated GHL icon React components",
  "// Source: @gohighlevel/ghl-icons v1.0.47 (converted from Vue)",
  "",
];

let ok = 0, fail = 0;

for (const [lucideName, { ghlName, subdir }] of Object.entries(ICON_MAP)) {
  const iconPath = join(GHL_ICONS_BASE, subdir, `${ghlName}.js`);
  try {
    const ast = loadIconAST(iconPath);
    const src = generateReactComponent(lucideName, ast);
    const outFile = join(OUT_DIR, `${lucideName}.jsx`);
    writeFileSync(outFile, src, 'utf8');
    indexLines.push(`export { ${lucideName} } from './${lucideName}.jsx';`);
    console.log(`✓  ${lucideName}  ←  ${ghlName}`);
    ok++;
  } catch (e) {
    console.error(`✗  ${lucideName}: ${e.message}`);
    fail++;
  }
}

writeFileSync(join(OUT_DIR, 'index.js'), indexLines.join('\n') + '\n', 'utf8');

console.log(`\nDone: ${ok} icons converted, ${fail} failed.`);
console.log(`Output: src/icons/index.js`);
