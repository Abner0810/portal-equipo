import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { projectRoot } from './files.mjs';

const workspaceRoot = resolve(projectRoot, '..');
const output = resolve(projectRoot, 'docs/project-inventory.md');

const projects = readdirSync(workspaceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(resolve(workspaceRoot, name, 'package.json')));

const lines = [
  '# Inventario de proyectos del espacio de trabajo',
  '',
  '| Proyecto | package.json | .env presente |',
  '|---|---|---|',
  ...projects.map((name) => {
    const hasEnv = existsSync(resolve(workspaceRoot, name, '.env')) ? 'sí' : 'no';
    return `| ${name} | sí | ${hasEnv} |`;
  }),
  '',
  `Total: ${projects.length} proyectos.`,
  '',
];

mkdirSync(resolve(projectRoot, 'docs'), { recursive: true });
writeFileSync(output, lines.join('\n'));
console.log(`Inventario creado en ${output}`);
