'use client';

import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Ultra-realistic VHS + CRT post-processing shader
// Inspired by CRTFilter.js, Shadertoy VHS shaders, and RetroArch CRT shaders
const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

// ============================================================
// HASH / NOISE FUNCTIONS
// ============================================================
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise with smooth interpolation
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2(i + vec2(0.0, 0.0)), hash2(i + vec2(1.0, 0.0)), u.x),
    mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// ============================================================
// MAIN SHADER
// ============================================================
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time;

  // Quantize time for frame-by-frame VHS feel (simulate ~30fps tape)
  float ft = floor(t * 30.0) / 30.0;

  // --------------------------------------------------------
  // 1. FINE SCANLINES (CRT phosphor rows)
  // --------------------------------------------------------
  // High frequency scanlines with slight brightness variation
  float scanY = gl_FragCoord.y;
  float scanline = 0.5 + 0.5 * sin(scanY * 3.14159);
  scanline = pow(scanline, 0.8);
  float scanDark = (1.0 - scanline) * 0.10;

  // Thicker interlace band (alternates every frame)
  float field = mod(floor(t * 30.0), 2.0);
  float interlace = 0.5 + 0.5 * sin((scanY + field * 0.5) * 3.14159 * 0.5);
  scanDark += (1.0 - interlace) * 0.02;

  // --------------------------------------------------------
  // 2. ROLLING SYNC BAND (VCR head drum)
  // --------------------------------------------------------
  float rollY = fract(t * 0.1);
  float rollDist = min(abs(uv.y - rollY), abs(uv.y - rollY + 1.0));
  rollDist = min(rollDist, abs(uv.y - rollY - 1.0));
  float rollBand = smoothstep(0.06, 0.0, rollDist);
  float rollDark = rollBand * 0.12;

  // --------------------------------------------------------
  // 3. HEAD SWITCHING NOISE (bottom of frame)
  // --------------------------------------------------------
  float headSwitch = smoothstep(0.96, 1.0, uv.y);
  float headNoise = headSwitch * hash2(vec2(uv.x * 20.0 + ft, ft * 7.0));
  float headBright = headNoise * 0.5;

  // --------------------------------------------------------
  // 4. TAPE GRAIN / STATIC (luma noise)
  // --------------------------------------------------------
  // Fast-changing grain at tape frame rate
  float grain = hash2(gl_FragCoord.xy * 0.8 + ft * 137.0);
  grain = (grain - 0.5) * 0.10;

  // --------------------------------------------------------
  // 5. TAPE HISS (horizontal noise streaks)
  // --------------------------------------------------------
  float hissLine = hash(floor(uv.y * 300.0) + ft * 73.0);
  float hissActive = step(0.96, hissLine);
  float hissBright = hissActive * hash(floor(uv.y * 300.0) + ft * 31.0) * 0.15;

  // --------------------------------------------------------
  // 6. HORIZONTAL GLITCH BARS (tape damage)
  // --------------------------------------------------------
  float glitch = 0.0;
  for (int i = 0; i < 3; i++) {
    float seed = float(i) * 17.0 + floor(t * 1.5) * 43.0;
    float active = step(0.65, hash(seed));
    float barY = hash(seed + 1.0);
    float barW = 0.003 + hash(seed + 2.0) * 0.012;
    float barStr = hash(seed + 3.0) * 0.20;
    glitch += smoothstep(barW, 0.0, abs(uv.y - barY)) * barStr * active;
  }

  // Rare strong glitch burst
  float burstTrigger = step(0.995, hash(floor(t * 0.8) + 999.0));
  float burstY = hash(floor(t * 0.8) + 500.0);
  float burstH = 0.02 + hash(floor(t * 0.8) + 501.0) * 0.08;
  float burst = smoothstep(burstH, 0.0, abs(uv.y - burstY)) * 0.4 * burstTrigger;
  glitch += burst;

  // --------------------------------------------------------
  // 7. TAPE CREASE (traveling horizontal line)
  // --------------------------------------------------------
  float creaseY = fract(t * 0.06 + 0.3);
  float crease = smoothstep(0.004, 0.0, abs(uv.y - creaseY));
  float creaseBright = crease * 0.18;

  // --------------------------------------------------------
  // 8. SIGNAL RINGING (edge overshoot — bright line near dark edges)
  // --------------------------------------------------------
  // Simulated by slight brightness oscillation along X
  float ringing = sin(uv.x * u_resolution.x * 0.8 + t * 5.0) * 0.008;

  // --------------------------------------------------------
  // 9. VIGNETTE (CRT tube edge darkening)
  // --------------------------------------------------------
  vec2 vigUV = uv * (1.0 - uv);
  float vignette = vigUV.x * vigUV.y * 25.0;
  vignette = clamp(pow(vignette, 0.4), 0.0, 1.0);
  float vigDark = (1.0 - vignette) * 0.45;

  // --------------------------------------------------------
  // 10. PHOSPHOR GLOW (slight bloom on bright areas)
  // --------------------------------------------------------
  // Subtle warm glow
  float glow = smoothstep(0.6, 1.0, 1.0 - vigDark) * 0.03;

  // --------------------------------------------------------
  // 11. FLICKER (CRT brightness instability)
  // --------------------------------------------------------
  float flicker = sin(t * 8.0) * sin(t * 13.0) * sin(t * 21.0);
  flicker = flicker * 0.008;

  // --------------------------------------------------------
  // 12. DOT MASK (RGB phosphor subpixels)
  // --------------------------------------------------------
  float dotX = mod(gl_FragCoord.x, 3.0);
  vec3 dotMask = vec3(
    step(0.0, dotX) * step(dotX, 1.0),
    step(1.0, dotX) * step(dotX, 2.0),
    step(2.0, dotX) * step(dotX, 3.0)
  );
  // Very subtle — mix 90% white with 10% dot mask
  dotMask = mix(vec3(1.0), dotMask, 0.06);

  // --------------------------------------------------------
  // COMPOSITE
  // --------------------------------------------------------
  // Total darkening
  float totalDark = scanDark + rollDark + vigDark + flicker;

  // Total brightening (noise / artifacts)
  float totalBright = grain + hissBright + headBright + glitch + creaseBright + ringing + glow;

  // Warm VHS color tint
  vec3 warmColor = vec3(1.0, 0.97, 0.92);

  // Output: dark overlay with noise
  vec3 color = warmColor * (totalBright * 0.5) * dotMask;

  // Alpha combines darkening + noise visibility
  float alpha = clamp(totalDark + abs(totalBright) * 0.4, 0.0, 0.8);

  gl_FragColor = vec4(color, alpha);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('VHS Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('VHS Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export default function VHSEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) {
      console.warn('WebGL not available, VHS effects disabled');
      return;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = createProgram(gl, vs, fs);
    if (!program) return;

    // Fullscreen quad
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'a_position');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');

    function resize() {
      if (!canvas || !parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const startTime = performance.now();

    function render() {
      if (!gl || !program) return;
      const elapsed = (performance.now() - startTime) / 1000.0;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.enableVertexAttribArray(aPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uResolution, canvas!.width, canvas!.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animRef.current = requestAnimationFrame(render);
    }

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      resizeObserver.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(posBuffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
    />
  );
}
