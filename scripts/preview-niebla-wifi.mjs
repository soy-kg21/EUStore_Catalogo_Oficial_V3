import {networkInterfaces} from 'node:os';

const privateAddresses = Object.entries(networkInterfaces()).flatMap(([name, entries]) =>
  (entries ?? [])
    .filter(({address,family,internal}) =>
      family === 'IPv4' && !internal && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address))
    .map(({address}) => ({name,address})),
);
const wiFi = privateAddresses.find(({name}) => /wi[ -]?fi|wlan|wireless/i.test(name));
const address = process.argv[2] ?? wiFi?.address ?? (privateAddresses.length === 1 ? privateAddresses[0].address : undefined);
if (!privateAddresses.some(entry => entry.address === address)) {
  throw new Error('Indica la dirección IPv4 privada de este computador. Ejemplo: pnpm preview:niebla:wifi 192.168.1.10');
}
process.env.EUSTORE_PREVIEW_LAN_HOST = address;
console.log('Vista previa para el celular: http://' + address + ':5189/');
process.argv.splice(2,Infinity,'dev','--webpack','--hostname','0.0.0.0','--port','5189');
await import('./run-next.mjs');
