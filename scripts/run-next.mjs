// Isolated cache keeps native Next and Vinext development artifacts separate.
import {fileURLToPath} from 'node:url';
const [command,...args]=process.argv.slice(2);
if(!['dev','build','start'].includes(command))throw new Error('Use dev, build or start');
process.env.EU_NEXT_RUNTIME='1';
const cli=new URL('../node_modules/next/dist/bin/next',import.meta.url);
process.argv=[process.execPath,fileURLToPath(cli),command,...args];
await import(cli.href);
