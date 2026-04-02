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

// ============ HEAVY CHROMA BLUR (the key VHS look — colors bleeding) ============

vec3 chromaBleed(vec2 uv) {
  vec2 px = 1.0 / u_res;

  // Luma (Y): stays sharp — sample at center only
  float y = rgb2yiq(texture2D(u_tex, uv).rgb).x;

  // I channel: WIDE blur + shifted right (chroma delay in analog signal)
  // This is what makes colors "bleed" into each other
  vec3 iAcc = vec3(0.0);
  float iWeight = 0.0;
  for (int i = -8; i <= 8; i++) {
    float w = exp(-0.04 * float(i * i)); // gaussian-ish
    // Shift RIGHT by 5 pixels (analog chroma delay)
    iAcc += texture2D(u_tex, uv + vec2(float(i) * px.x * 3.0 + px.x * 5.0, 0.0)).rgb * w;
    iWeight += w;
  }
  float iq_i = rgb2yiq(iAcc / iWeight).y;

  // Q channel: EVEN WIDER blur + shifted further right
  vec3 qAcc = vec3(0.0);
  float qWeight = 0.0;
  for (int i = -12; i <= 12; i++) {
    float w = exp(-0.025 * float(i * i));
    qAcc += texture2D(u_tex, uv + vec2(float(i) * px.x * 4.0 + px.x * 10.0, 0.0)).rgb * w;
    qWeight += w;
  }
  float iq_q = rgb2yiq(qAcc / qWeight).z;

  return yiq2rgb(vec3(y, iq_i, iq_q));
}

// ============ MAIN ============

void main() {
  float t = u_time;
  float ft = floor(t * 24.0) / 24.0; // 24fps quantized for grain

  // --- 1. Subtle barrel distortion ---
  vec2 uv = barrelDistort(v_uv);

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // --- 2. Very subtle tape wobble ---
  uv = tapeWobble(uv, t * 8.0);

  // --- 3. HEAVY CHROMA BLEEDING (the main VHS look) ---
  vec3 col = chromaBleed(uv);

  // --- 4. Slight chromatic aberration (RGB fringing) ---
  vec2 px = 1.0 / u_res;
  float ca = 1.0 + 0.8 * length(uv - 0.5);
  col.r = chromaBleed(uv + vec2(px.x * ca, 0.0)).r;
  col.b = chromaBleed(uv - vec2(px.x * ca, 0.0)).b;

  // --- 5. Overall softness (slight blur to simulate analog) ---
  vec3 blur = vec3(0.0);
  blur += texture2D(u_tex, uv + vec2(px.x, 0.0)).rgb;
  blur += texture2D(u_tex, uv - vec2(px.x, 0.0)).rgb;
  blur += texture2D(u_tex, uv + vec2(0.0, px.y)).rgb;
  blur += texture2D(u_tex, uv - vec2(0.0, px.y)).rgb;
  blur *= 0.25;
  col = mix(col, blur, 0.15); // 15% softness

  // --- 6. HEAVY GRAIN (big, visible, like real VHS) ---
  // Low frequency = big chunky grain (not fine noise)
  float grain1 = hash2(floor(gl_FragCoord.xy * 0.5) * 2.0 + ft * 137.0); // 2x2 pixel blocks
  float grain2 = hash2(floor(gl_FragCoord.xy * 0.25) * 4.0 + ft * 73.0); // 4x4 pixel blocks
  float grain = mix(grain1, grain2, 0.4);
  col += (grain - 0.5) * 0.14; // Strong grain

  // --- 7. Very subtle scanlines (barely visible, like the ref) ---
  float scanY = uv.y * u_res.y;
  float scanline = 0.5 + 0.5 * sin(scanY * 3.14159);
  col *= 0.97 + 0.03 * scanline; // Only 3% modulation

  // --- 8. Very light vignette (ref barely has any) ---
  vec2 vigUV = v_uv * (1.0 - v_uv);
  float vignette = vigUV.x * vigUV.y * 30.0;
  vignette = clamp(pow(vignette, 0.5), 0.0, 1.0);
  col *= mix(0.85, 1.0, vignette); // Light darkening at extreme edges only

  // --- 9. Warm color temperature ---
  col *= vec3(1.04, 1.00, 0.93);

  // --- 10. Slight desaturation (VHS washes out colors a bit) ---
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, 0.82);

  // --- 11. Brightness boost (VHS recordings were bright, not dark) ---
  col *= 1.12;
  // Slight gamma lift in shadows (VHS blacks are never truly black)
  col = mix(vec3(0.04), col, 0.97);

  // --- 12. Subtle flicker ---
  float flicker = 1.0 + sin(t * 6.0) * 0.005;
  col *= flicker;

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
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
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

    // Initial capture after a short delay (ensure content is rendered),
    // then periodic recapture for animations (marquee, clock, etc.)
    const initialDelay = setTimeout(() => {
      captureContent();
    }, 500);
    const captureInterval = setInterval(() => captureContent(), 200);

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
      clearTimeout(initialDelay);
      clearInterval(captureInterval);
      window.removeEventListener('resize', resize);
    };
  }, [captureContent]);

  return (
    <>
      {/* Offscreen source content — rendered but positioned out of view */}
      <div
        ref={sourceRef}
        style={{
          position: 'fixed',
          top: 0,
          left: '-9999px',
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
