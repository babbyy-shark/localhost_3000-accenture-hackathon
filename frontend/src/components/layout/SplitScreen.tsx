import React, { useEffect, useRef } from 'react';

interface SplitScreenProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function SplitScreen({ leftPanel, rightPanel }: SplitScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(syncSize).observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;
    
    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i   = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;
    
    // Mouse influence
    vec2 mouse = u_mouse / u_resolution;
    vec2 mPos = mouse * 2.0 - 1.0;
    mPos.x *= u_resolution.x / u_resolution.y;
    float dist = length(p - mPos);
    
    // Organic mesh layers
    float n1 = snoise(p * 1.5 + u_time * 0.1);
    float n2 = snoise(p * 3.0 - u_time * 0.15 + n1 * 0.5);
    
    // Pulse effect
    float pulse = sin(u_time * 0.5) * 0.5 + 0.5;
    
    // Network lines / Threads
    float threads = smoothstep(0.4, 0.41, abs(n2)) * 0.1;
    threads += smoothstep(0.45, 0.46, abs(n1)) * 0.05;
    
    // Color palette (Indigo/Blue focus)
    vec3 color1 = vec3(0.02, 0.02, 0.05); // Deep base
    vec3 color2 = vec3(0.1, 0.15, 0.4);  // Indigo glow
    vec3 color3 = vec3(0.2, 0.4, 0.8);  // Primary blue
    
    vec3 finalColor = mix(color1, color2, n1 * 0.5 + 0.5);
    finalColor = mix(finalColor, color3, threads * (0.5 + pulse * 0.5));
    
    // Mouse hover glow
    float hoverGlow = smoothstep(0.8, 0.0, dist) * 0.15;
    finalColor += color3 * hoverGlow;
    
    // Vignette
    float vignette = 1.0 - smoothstep(0.6, 1.4, length(p));
    
    gl_FragColor = vec4(finalColor * vignette, 1.0);
}`;
    function cs(type: any, src: any) {
      const s = (gl as WebGLRenderingContext).createShader(type);
      if (!s) return null;
      (gl as WebGLRenderingContext).shaderSource(s, src);
      (gl as WebGLRenderingContext).compileShader(s);
      return s;
    }
    const prog = (gl as WebGLRenderingContext).createProgram();
    if (!prog) return;
    const vShader = cs(gl.VERTEX_SHADER, vs);
    const fShader = cs(gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return;
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    let animationFrameId: number;
    function render(t: number) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      (gl as WebGLRenderingContext).viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen flex flex-col bg-[#131315] text-[#e5e1e4] overflow-hidden font-mono">
      {/* Background Shader */}
      <div className="absolute inset-0 w-full h-full z-0">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      {/* SVG Neural Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40 drop-shadow-[0_0_8px_#c0c1ff]">
        <path className="text-[#c0c1ff] stroke-[2] animate-line-pulse" d="M 40% 60% C 45% 60%, 55% 25%, 60% 25%" fill="none" stroke="currentColor" strokeDasharray="10 5" />
        <path className="text-[#4edea3] stroke-[1.5] animate-line-pulse" d="M 40% 60% C 48% 60%, 52% 45%, 60% 45%" fill="none" stroke="currentColor" strokeDasharray="8 6" style={{ animationDuration: '4s' }} />
        <path className="text-[#4edea3] stroke-[1.5] animate-line-pulse" d="M 40% 60% C 46% 60%, 54% 65%, 60% 65%" fill="none" stroke="currentColor" strokeDasharray="8 6" style={{ animationDuration: '6s' }} />
        <path className="text-[#ffb95f] stroke-[2] animate-line-pulse" d="M 40% 60% C 45% 60%, 55% 85%, 60% 85%" fill="none" stroke="currentColor" strokeDasharray="12 8" style={{ animationDuration: '3s' }} />
      </svg>

      {/* Header / Branding */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4 z-50 pointer-events-none">
        <div className="flex items-center gap-4 glass-card px-4 py-2 rounded-xl">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c0c1ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(192,193,255,0.8)]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-2xl font-bold glow-text-primary tracking-widest uppercase">ControlPlane.ai</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-xs font-mono text-[#c0c1ff]/70 tracking-widest bg-[#131315]/40 backdrop-blur-md px-3 py-1 rounded-full border border-[#c0c1ff]/20">
            SYS.OP.MODE: <span className="glow-text-primary">X-RAY_ACTIVE</span>
          </div>
          <div className="text-[10px] font-mono text-[#4edea3] tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse shadow-[0_0_8px_#4edea3]"></span>
            NEURAL STATUS: Network Active
          </div>
        </div>
      </header>

      {/* Main Layout: Organic Network Nodes */}
      <main className="flex-1 w-full h-full pt-28 pb-12 px-8 z-10 relative flex justify-between items-center gap-12 max-w-[1600px] mx-auto perspective-container">
        {/* Left Cluster: AI Chat Node */}
        <div className="w-5/12 h-full flex flex-col justify-center">
            {leftPanel}
        </div>
        
        {/* Right Cluster: Telemetry Nodes */}
        <div className="w-5/12 h-full flex flex-col justify-center">
            {rightPanel}
        </div>
      </main>
      
      {/* Overlay decorative mesh nodes */}
      <div className="fixed top-8 left-8 w-2 h-2 rounded-full bg-[#c0c1ff]/40 shadow-[0_0_10px_#c0c1ff] pointer-events-none z-50"></div>
      <div className="fixed top-8 right-8 w-2 h-2 rounded-full bg-[#c0c1ff]/40 shadow-[0_0_10px_#c0c1ff] pointer-events-none z-50"></div>
      <div className="fixed bottom-8 left-8 w-2 h-2 rounded-full bg-[#c0c1ff]/40 shadow-[0_0_10px_#c0c1ff] pointer-events-none z-50"></div>
      <div className="fixed bottom-8 right-8 w-2 h-2 rounded-full bg-[#c0c1ff]/40 shadow-[0_0_10px_#c0c1ff] pointer-events-none z-50"></div>
    </div>
  );
}
