'use client';

import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

// --- Pseudo-random hash ---
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float hash1(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// --- Value noise ---
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time;

  // ========================================
  // 1. SCANLINES (fine interlacing)
  // ========================================
  float scanFreq = u_resolution.y * 0.5;
  float scanline = sin(uv.y * scanFreq * 3.14159) * 0.5 + 0.5;
  scanline = pow(scanline, 1.5) * 0.12;

  // Slower rolling scanline band (like a VCR head drum)
  float rollSpeed = t * 0.15;
  float rollY = fract(rollSpeed);
  float rollBand = smoothstep(0.0, 0.05, abs(uv.y - rollY)) *
                   smoothstep(0.0, 0.05, abs(uv.y - rollY - 1.0));
  float rollDark = (1.0 - rollBand) * 0.06;

  // ========================================
  // 2. NOISE / GRAIN (animated VHS static)
  // ========================================
  float grainTime = floor(t * 24.0);
  float grain = hash(uv * u_resolution.xy * 0.5 + grainTime) * 0.09;

  // Tape hiss noise - horizontal streaks
  float hissNoise = hash(vec2(uv.y * 400.0, grainTime)) * 0.03;
  hissNoise *= step(0.97, hash(vec2(floor(uv.y * 200.0), grainTime)));

  // ========================================
  // 3. TRACKING DISTORTION
  // ========================================
  // Head switching noise at bottom of frame
  float headSwitch = smoothstep(0.97, 1.0, uv.y);
  float headNoise = headSwitch * hash(vec2(uv.x * 10.0, grainTime)) * 0.6;

  // Occasional tracking jump (whole frame shifts)
  float trackTrigger = step(0.992, hash(vec2(floor(t * 1.5), 42.0)));
  float trackOffset = trackTrigger * (hash(vec2(floor(t * 1.5), 99.0)) - 0.5) * 0.01;

  // ========================================
  // 4. HORIZONTAL GLITCH BARS
  // ========================================
  float glitch = 0.0;
  for (int i = 0; i < 4; i++) {
    float seed = float(i) + floor(t * 2.0) * 13.0;
    float active = step(0.7, hash(vec2(seed, 0.0)));
    float barY = hash(vec2(seed, 1.0));
    float barW = 0.002 + hash(vec2(seed, 2.0)) * 0.015;
    float barIntensity = hash(vec2(seed, 3.0)) * 0.2;
    float bar = smoothstep(barW, 0.0, abs(uv.y - barY));
    glitch += bar * barIntensity * active;
  }

  // ========================================
  // 5. VIGNETTE (CRT tube darkening)
  // ========================================
  vec2 vigUV = uv * (1.0 - uv);
  float vignette = vigUV.x * vigUV.y * 20.0;
  vignette = clamp(pow(vignette, 0.35), 0.0, 1.0);

  // ========================================
  // 6. COLOR TEMPERATURE (warm VHS tint)
  // ========================================
  // VHS tapes had slightly warm, desaturated look
  vec3 warmTint = vec3(0.015, 0.005, -0.02);

  // Slight color bleed - shifts per scanline
  float colorBleed = sin(uv.y * 300.0 + t * 2.0) * 0.008;

  // ========================================
  // 7. TAPE CREASE (horizontal distortion line)
  // ========================================
  float creaseY = fract(t * 0.08);
  float crease = smoothstep(0.008, 0.0, abs(uv.y - creaseY));
  crease *= 0.25;

  // ========================================
  // 8. SUBTLE WAVINESS (tape warp)
  // ========================================
  float waveAmount = sin(t * 0.3) * 0.001;
  float wave = sin(uv.y * 15.0 + t * 3.0) * waveAmount;

  // ========================================
  // COMPOSITE
  // ========================================
  // Darkness layer (scanlines, vignette, roll)
  float darkness = scanline + rollDark + headNoise + crease;

  // Brightness layer (noise, glitch)
  float brightness = grain + hissNoise + glitch;

  // Final color: dark overlay with warm tint
  vec3 darkColor = vec3(0.0) + warmTint;
  vec3 brightColor = vec3(1.0, 0.95, 0.9); // warm white noise

  vec3 finalColor = mix(darkColor, brightColor, brightness);

  // Alpha: how much to affect the underlying content
  float alpha = darkness + brightness * 0.5;
  alpha *= vignette; // reduce effect at edges (vignette is separate)

  // Add vignette darkening
  float vigDark = (1.0 - vignette) * 0.35;

  // Output
  gl_FragColor = vec4(finalColor * 0.5, alpha + vigDark);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
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
    console.error('Program link error:', gl.getProgramInfoLog(program));
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

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      console.warn('WebGL not available, VHS effects disabled');
      return;
    }

    // Create shaders
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

    // Resize handler
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
    window.addEventListener('resize', resize);

    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Animation loop
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
      window.removeEventListener('resize', resize);
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
