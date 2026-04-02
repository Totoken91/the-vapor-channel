'use client';

import { useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas-pro';

// ============================================================
// VERTEX SHADER
// ============================================================
const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// ============================================================
// FRAGMENT SHADER — Full VHS + CRT post-processing
// Techniques sourced from:
//   - Libretro VHS shader (hunterk/ompuco)
//   - VHSPro ReShade (Bapho)
//   - CRTFilter.js (Ichiaka)
//   - CRT-Pi barrel distortion
//   - Shadertoy VHS/VCR shaders
// ============================================================
const FRAG = `
precision highp float;

varying vec2 v_uv;
uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_res;

// ============ UTILITY ============

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// ============ YIQ COLOR SPACE ============
// VHS records in composite video — luma (Y) at full res,
// chroma (I/Q) at much lower res with rightward smear

vec3 rgb2yiq(vec3 c) {
  return vec3(
    0.2989 * c.r + 0.5866 * c.g + 0.1145 * c.b,
    0.5959 * c.r - 0.2744 * c.g - 0.3216 * c.b,
    0.2115 * c.r - 0.5229 * c.g + 0.3114 * c.b
  );
}

vec3 yiq2rgb(vec3 c) {
  return vec3(
    c.x + 0.956 * c.y + 0.621 * c.z,
    c.x - 0.272 * c.y - 0.647 * c.z,
    c.x - 1.106 * c.y + 1.703 * c.z
  );
}

// ============ BARREL DISTORTION (CRT-Pi) ============

vec2 barrelDistort(vec2 uv) {
  vec2 cc = uv - 0.5;
  float dist = dot(cc, cc);
  // Subtle curvature: 0.08
  return uv + cc * dist * 0.08;
}

// ============ TAPE WOBBLE (libretro VHS) ============

float onOff(float a, float b, float c, float t) {
  return step(c, sin(t * 0.001 + a * cos(t * 0.001 * b)));
}

vec2 tapeWobble(vec2 uv, float t) {
  // Window function — concentrates distortion near a moving Y position
  float window = 1.0 / (1.0 + 80.0 * pow(uv.y - mod(t / 4.0, 1.0), 2.0));

  // Horizontal jitter
  uv.x += 0.003 * sin(uv.y * 10.0 + t) * onOff(4.0, 4.0, 0.3, t)
        * (0.5 + cos(t * 20.0)) * window;

  // Vertical tracking shift (rare)
  float vShift = 0.3 * onOff(2.0, 3.0, 0.9, t)
               * (sin(t) * sin(t * 20.0) + 0.5 + 0.1 * sin(t * 200.0) * cos(t));
  uv.y = mod(uv.y - 0.005 * vShift, 1.0);

  return uv;
}

// ============ CHROMA BLUR (sample at different offsets/radii) ============

vec3 chromaSeparation(vec2 uv, float t) {
  // Pixel size
  vec2 px = 1.0 / u_res;

  // Luma: sharp (sample center)
  float y = rgb2yiq(texture2D(u_tex, uv).rgb).x;

  // I channel: blurred wider, shifted right (chroma delay)
  vec3 iSample = vec3(0.0);
  for (int i = -3; i <= 3; i++) {
    float w = 1.0 - abs(float(i)) * 0.15;
    iSample += texture2D(u_tex, uv + vec2(float(i) * px.x * 2.0 + px.x * 3.0, 0.0)).rgb * w;
  }
  iSample /= 5.5;
  float iq_i = rgb2yiq(iSample).y;

  // Q channel: even more blurred, shifted further right
  vec3 qSample = vec3(0.0);
  for (int i = -4; i <= 4; i++) {
    float w = 1.0 - abs(float(i)) * 0.12;
    qSample += texture2D(u_tex, uv + vec2(float(i) * px.x * 3.0 + px.x * 6.0, 0.0)).rgb * w;
  }
  qSample /= 6.6;
  float iq_q = rgb2yiq(qSample).z;

  return yiq2rgb(vec3(y, iq_i * 0.9, iq_q * 0.9));
}

// ============ MAIN ============

void main() {
  float t = u_time;
  float ft = floor(t * 30.0) / 30.0; // 30fps quantized time

  // --- 1. Barrel distortion ---
  vec2 uv = barrelDistort(v_uv);

  // Black outside the curved screen
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // --- 2. Tape wobble ---
  uv = tapeWobble(uv, t * 15.0);

  // --- 3. Head switching noise (bottom 4% of frame) ---
  float headSwitch = smoothstep(0.95, 1.0, uv.y);
  uv.x += headSwitch * (hash2(vec2(uv.x * 20.0, ft * 7.0)) - 0.5) * 0.06;

  // --- 4. Chroma separation (YIQ) ---
  vec3 col = chromaSeparation(uv, t);

  // --- 5. Chromatic aberration (additional RGB shift) ---
  vec2 px = 1.0 / u_res;
  float caAmount = 1.2 + 1.5 * length(uv - 0.5); // stronger at edges
  col.r = chromaSeparation(uv + vec2(px.x * caAmount, 0.0), t).r;
  col.b = chromaSeparation(uv - vec2(px.x * caAmount, 0.0), t).b;

  // --- 6. Scanlines ---
  float scanY = uv.y * u_res.y;
  float scanline = 0.5 + 0.5 * sin(scanY * 3.14159);
  scanline = pow(scanline, 1.2);
  col *= 0.92 + 0.08 * scanline;

  // Interlace: alternate field brightness
  float field = mod(floor(t * 30.0), 2.0);
  float interlace = 0.5 + 0.5 * sin((scanY + field * 0.5) * 3.14159 * 0.5);
  col *= 0.98 + 0.02 * interlace;

  // --- 7. Rolling sync band ---
  float rollY = fract(t * 0.08);
  float rollDist = min(abs(uv.y - rollY), min(abs(uv.y - rollY + 1.0), abs(uv.y - rollY - 1.0)));
  float rollBand = smoothstep(0.05, 0.0, rollDist);
  col *= 1.0 - rollBand * 0.15;

  // --- 8. Grain / tape noise ---
  float grain = hash2(gl_FragCoord.xy * 0.7 + ft * 137.0);
  col += (grain - 0.5) * 0.06;

  // --- 9. Tape hiss (horizontal noise streaks) ---
  float hissLine = hash(floor(uv.y * 350.0) + ft * 73.0);
  if (hissLine > 0.97) {
    col += hash(floor(uv.y * 350.0) + ft * 31.0) * 0.08;
  }

  // --- 10. Horizontal glitch bars ---
  for (int i = 0; i < 3; i++) {
    float seed = float(i) * 17.0 + floor(t * 1.5) * 43.0;
    float active = step(0.7, hash(seed));
    float barY = hash(seed + 1.0);
    float barW = 0.003 + hash(seed + 2.0) * 0.012;
    float barStr = hash(seed + 3.0) * 0.12;
    col += smoothstep(barW, 0.0, abs(uv.y - barY)) * barStr * active;
  }

  // Rare strong burst
  float burstTrigger = step(0.993, hash(floor(t * 0.7) + 999.0));
  float burstY = hash(floor(t * 0.7) + 500.0);
  col += smoothstep(0.04, 0.0, abs(uv.y - burstY)) * 0.3 * burstTrigger;

  // --- 11. Tape crease ---
  float creaseY = fract(t * 0.05 + 0.3);
  col += smoothstep(0.003, 0.0, abs(uv.y - creaseY)) * 0.12;

  // --- 12. Vignette (CRT tube) ---
  vec2 vigUV = v_uv * (1.0 - v_uv);
  float vignette = vigUV.x * vigUV.y * 25.0;
  vignette = clamp(pow(vignette, 0.35), 0.0, 1.0);
  col *= vignette;

  // --- 13. Flicker ---
  float flicker = 1.0 + sin(t * 8.0) * sin(t * 13.0) * 0.01;
  col *= flicker;

  // --- 14. Dot mask (RGB phosphor subpixels) ---
  float dotX = mod(gl_FragCoord.x, 3.0);
  vec3 mask = vec3(
    step(0.0, dotX) * step(dotX, 1.0),
    step(1.0, dotX) * step(dotX, 2.0),
    step(2.0, dotX) * step(dotX, 3.0)
  );
  col *= mix(vec3(1.0), mask + 0.6, 0.15);

  // --- 15. Warm VHS color temperature ---
  col *= vec3(1.02, 0.99, 0.94);

  // --- 16. Slight desaturation ---
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, 0.85);

  // --- 17. Contrast + brightness ---
  col = (col - 0.5) * 1.05 + 0.5;
  col *= 1.05;

  // Head switching: brighten/distort bottom
  col = mix(col, vec3(hash2(vec2(uv.x * 10.0, ft))), headSwitch * 0.7);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

// ============================================================
// WebGL helpers
// ============================================================

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

function linkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('Link error:', gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

// ============================================================
// COMPONENT
// ============================================================

export default function VHSPostProcess({ children }: { children: React.ReactNode }) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const animRef = useRef<number>(0);
  const uniformsRef = useRef<{ time: WebGLUniformLocation | null; res: WebGLUniformLocation | null }>({ time: null, res: null });

  // Capture HTML content to WebGL texture
  const captureContent = useCallback(async () => {
    const source = sourceRef.current;
    const gl = glRef.current;
    if (!source || !gl) return;

    try {
      const capturedCanvas = await html2canvas(source, {
        backgroundColor: '#000000',
        scale: 1,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      if (!textureRef.current) {
        textureRef.current = gl.createTexture();
      }

      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, capturedCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    } catch (e) {
      console.error('html2canvas capture failed:', e);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;
    glRef.current = gl;

    // Compile shaders
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = linkProgram(gl, vs, fs);
    if (!program) return;
    programRef.current = program;

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    uniformsRef.current = {
      time: gl.getUniformLocation(program, 'u_time'),
      res: gl.getUniformLocation(program, 'u_res'),
    };

    // Sizing
    function resize() {
      if (!canvas) return;
      // 4:3 aspect ratio
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const targetRatio = 4 / 3;
      let w: number, h: number;
      if (vw / vh > targetRatio) {
        h = vh;
        w = vh * targetRatio;
      } else {
        w = vw;
        h = vw / targetRatio;
      }
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    // Initial capture + periodic recapture (for marquee animation etc.)
    const captureInterval = setInterval(() => captureContent(), 150);
    captureContent();

    // Render loop
    const t0 = performance.now();
    function render() {
      if (!gl || !program) return;
      const elapsed = (performance.now() - t0) / 1000.0;

      gl.useProgram(program);
      gl.uniform1f(uniformsRef.current.time, elapsed);
      gl.uniform2f(uniformsRef.current.res, canvas!.width, canvas!.height);

      if (textureRef.current) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
        gl.uniform1i(gl.getUniformLocation(program, 'u_tex'), 0);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animRef.current = requestAnimationFrame(render);
    }
    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(captureInterval);
      window.removeEventListener('resize', resize);
    };
  }, [captureContent]);

  return (
    <>
      {/* Hidden source content — rendered but not visible */}
      <div
        ref={sourceRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        {children}
      </div>

      {/* Visible output — WebGL canvas with VHS post-processing */}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          margin: '0 auto',
          borderRadius: '8px',
        }}
      />
    </>
  );
}
