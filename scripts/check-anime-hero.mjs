// Render the real cover to verify the artwork, title and collection link for each line.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
import {ImageConfigContext} from 'next/dist/shared/lib/image-config-context.shared-runtime.js';
import {imageConfigDefault} from 'next/dist/shared/lib/image-config.js';

const require = createRequire(import.meta.url);
const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const styles = new Proxy({}, {get: (_target, name) => String(name)});

function loadComponent(file) {
  const {outputText} = ts.transpileModule(read(file), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
  });
  const exports = {};
  const componentRequire = name => {
    if (name.endsWith('.module.css')) return {__esModule: true, default: styles};
    if (name === '@/lib/anime-cinema-art') return loadComponent('lib/anime-cinema-art.ts');
    return require(name);
  };
  new Function('require', 'exports', outputText)(componentRequire, exports);
  return exports;
}

const {default: Hero} = loadComponent('components/anime/AnimeUniverseHero.tsx');
const covers = [
  {line: '', title: 'Todas', file: 'jordan-cinema-v2.webp'},
  {line: 'anime', title: 'Anime', file: 'luffy-cinema.webp'},
  {line: 'cartoon', title: 'Cartoon', file: 'cartoon-pink-panther.webp'},
  {line: 'rock', title: 'Rock', file: 'rock-slash.webp'},
  {line: 'urbanos', title: 'Urbanas', file: 'urbanas-snoop-dogg.webp'},
];
for (const {line, title, file} of covers) {
  const src = '/anime/cinema/' + file;
  const html = renderToStaticMarkup(React.createElement(
    ImageConfigContext.Provider,
    {value: {...imageConfigDefault, unoptimized: true, qualities: [75, 85]}},
    React.createElement(Hero, {line, navigation: React.createElement('nav', null, 'Selector de líneas')}),
  ));
  assert(fs.existsSync(new URL('../public' + src, import.meta.url)));
  assert.equal((html.match(/<img /g) || []).length, 1);
  assert(html.includes('src="' + src + '"'));
  assert(html.includes('id="anime-hero-title">' + title + '</h1>'));
  assert(html.includes('El universo sigue contigo'));
  assert(html.includes('Tu próxima favorita empieza aquí'));
  assert(html.includes('href="#coleccion">Explora los diseños'));
  assert(html.includes('id="anime-discover"><nav>Selector de líneas</nav>'));
  assert.doesNotMatch(html, /<canvas|data-cinema|href="#anime-inicio"/);
}
console.log('PASS: cinco portadas fijas de Anime Shop, con su arte, título, enlace al catálogo y selector de líneas.');
