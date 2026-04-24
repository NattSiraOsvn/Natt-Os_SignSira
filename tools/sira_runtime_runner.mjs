import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';

const target = process.argv[2];

if (!target) {
  console.error('Usage: node tools/sira_runtime_runner.mjs <file.sira> [...args]');
  process.exit(1);
}

const targetPath = path.resolve(process.cwd(), target);

if (!fs.existsSync(targetPath)) {
  console.error('SIRA runtime file not found:', targetPath);
  process.exit(1);
}

if (!targetPath.endsWith('.sira')) {
  console.error('SIRA runtime runner only accepts .sira files:', targetPath);
  process.exit(1);
}

const code = fs.readFileSync(targetPath, 'utf8');

process.argv = [process.execPath, targetPath, ...process.argv.slice(3)];

const mod = new Module(targetPath, null);
mod.filename = targetPath;
mod.paths = Module._nodeModulePaths(path.dirname(targetPath));
mod._compile(code, targetPath);
