// Local test execution only. Production module resolution remains owned by Next.
import {registerHooks} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve as resolvePath} from 'node:path';
import ts from 'typescript';
const root=fileURLToPath(new URL('../',import.meta.url));
registerHooks({
 resolve(specifier,context,next){
  if(specifier.startsWith('@/'))specifier=pathToFileURL(resolvePath(root,specifier.slice(2))).href;
  try{return next(specifier,context);}catch(error){
   if(!specifier.startsWith('.')&&!specifier.startsWith('file:'))throw error;
   const url=new URL(specifier,context.parentURL||pathToFileURL(root+'/').href),file=fileURLToPath(url);
   for(const suffix of ['.ts','.tsx','.mjs','.js','/index.ts'])if(existsSync(file+suffix))return next(pathToFileURL(file+suffix).href,context);
   throw error;
  }
 },
 load(url,context,next){
  if(url.startsWith('file:')&&/\.tsx?$/.test(url)&&!url.includes('/node_modules/'))return {format:'module',shortCircuit:true,source:ts.transpileModule(readFileSync(fileURLToPath(url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText.replace(/from\s+(['"])([^'"]+\.json)\1/g,'from $1$2$1 with { type: "json" }')};
  return next(url,context);
 }
});
