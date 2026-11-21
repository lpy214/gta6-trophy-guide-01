// Leonida Trophy Guide — entry program (Node 22, standard library only).
// Hands the guide in: copies this repository's app/ and screenshots/
// beside this file into the output directory and writes dossier.json
// there with the make.fun frontend library, byte for byte as the scorer
// writes it. Run outside the grader with MAKEFUN_OUTPUT_DIR set:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyFolder(name: string): void {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function handInGuide(): void {
  mkdirSync(outputDir, { recursive: true });
  copyFolder('app');
  copyFolder('screenshots');
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  const dossierPath = join(outputDir, 'dossier.json');
  writeFileSync(dossierPath, dossier);
  const bytes = statSync(dossierPath).size;
  console.log(`wrote ${dossierPath} (${bytes} bytes)`);
}

handInGuide();
