import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const children=[spawn(process.execPath,['--watch','backend/server.js'],{cwd:root,stdio:'inherit'}),spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1'],{cwd:root+'frontend',stdio:'inherit'})];
function stop(){children.forEach(c=>c.kill());}
process.on('SIGINT',()=>{stop();process.exit();});process.on('SIGTERM',()=>{stop();process.exit();});
children.forEach(c=>c.on('exit',code=>{stop();process.exit(code??1);}));
