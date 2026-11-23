import * as THREE from 'three';
const clamp = (x:number, min:number, max:number) => Math.max(min,Math.min(max,x));
export function createFogField() {
const FW = 64, FH = 36, N = FW * FH;
  const fx = new Float32Array(N), fy = new Float32Array(N), fh = new Float32Array(N), tmp = new Float32Array(N * 3);
  const fdata = new Uint8Array(N * 4);
  const field = new THREE.DataTexture(fdata, FW, FH, THREE.RGBAFormat);
  field.magFilter = field.minFilter = THREE.LinearFilter; field.needsUpdate = true;

    function advance(dt: number, vx: number, vy: number, mx: number, my: number, aspect: number) {
    const k = Math.exp(-dt / 0.42);
    for (let i = 0; i < N; i++) { fx[i] *= k; fy[i] *= k; fh[i] *= k; }
    const cxg = mx * FW - 0.5, cyg = my * FH - 0.5, ar = aspect * (FH / FW), R = 5, s2 = 2 * 2.4 * 2.4;
    const amt = Math.min(1, Math.hypot(vx, vy) * 0.9);
    const ax = clamp(vx * 0.35, -1.5, 1.5) * dt * 6, ay = clamp(vy * 0.35, -1.5, 1.5) * dt * 6;
    for (let j = Math.max(0, Math.floor(cyg - R)); j <= Math.min(FH - 1, Math.ceil(cyg + R)); j++)
      for (let i = Math.max(0, Math.floor(cxg - R / ar)); i <= Math.min(FW - 1, Math.ceil(cxg + R / ar)); i++) {
        const dx = (i - cxg) * ar, dy = j - cyg, w = Math.exp(-(dx * dx + dy * dy) / s2), id = j * FW + i;
        fx[id] = clamp(fx[id] + ax * w, -1, 1); fy[id] = clamp(fy[id] + ay * w, -1, 1); fh[id] = Math.min(1, fh[id] + w * (0.012 + amt * 0.22));
      }
    for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) {
      const id = j * FW + i, l = i > 0 ? id - 1 : id, r = i < FW - 1 ? id + 1 : id, d = j > 0 ? id - FW : id, u = j < FH - 1 ? id + FW : id;
      tmp[id * 3] = fx[id] * 0.6 + (fx[l] + fx[r] + fx[d] + fx[u]) * 0.1;
      tmp[id * 3 + 1] = fy[id] * 0.6 + (fy[l] + fy[r] + fy[d] + fy[u]) * 0.1;
      tmp[id * 3 + 2] = fh[id] * 0.6 + (fh[l] + fh[r] + fh[d] + fh[u]) * 0.1;
    }
    for (let i = 0; i < N; i++) {
      fx[i] = tmp[i * 3]; fy[i] = tmp[i * 3 + 1]; fh[i] = tmp[i * 3 + 2];
      fdata[i * 4] = 128 + fx[i] * 127; fdata[i * 4 + 1] = 128 + fy[i] * 127; fdata[i * 4 + 2] = fh[i] * 255; fdata[i * 4 + 3] = 255;
    }
    field.needsUpdate = true;
  }

  return {field, advance};
}
