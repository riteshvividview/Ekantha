/**
 * Fireflies: a tiny WebGL2 points shader (no textures, no three.js). Every
 * particle's path is computed on the GPU from its index and the time, so
 * there are no per-frame buffers to upload. Renders only while the canvas
 * is on screen; returns null when WebGL2 isn't available.
 */
const VERT = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform float uDpr;
out float vGlow;

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  float id = float(gl_VertexID);
  float speed = 0.012 + hash(id * 1.7) * 0.03;
  // Rise slowly from below the frame, wrapping back to the bottom.
  float y = fract(hash(id * 3.1) + uTime * speed);
  float x = hash(id * 5.3) + sin(uTime * (0.25 + hash(id) * 0.5) + id) * 0.04;
  vec2 pos = vec2(x, y) * 2.0 - 1.0;
  gl_Position = vec4(pos, 0.0, 1.0);
  // Each firefly blinks on its own slow rhythm and fades near the top.
  float blink = 0.5 + 0.5 * sin(uTime * (0.8 + hash(id * 9.1) * 1.6) + id * 4.0);
  vGlow = blink * smoothstep(1.0, 0.65, y) * smoothstep(0.0, 0.12, y);
  gl_PointSize = (3.0 + hash(id * 7.7) * 7.0) * uDpr;
}`

const FRAG = `#version 300 es
precision mediump float;
in float vGlow;
out vec4 outColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  float halo = pow(core, 2.5);
  vec3 warm = mix(vec3(1.0, 0.62, 0.22), vec3(1.0, 0.92, 0.6), halo);
  outColor = vec4(warm * vGlow, core * vGlow);
}`

export function createFireflies(canvas: HTMLCanvasElement, count = 70) {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false })
  if (!gl) return null

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  const uTime = gl.getUniformLocation(prog, 'uTime')
  const uRes = gl.getUniformLocation(prog, 'uRes')
  const uDpr = gl.getUniformLocation(prog, 'uDpr')
  const vao = gl.createVertexArray()

  let raf = 0
  let visible = false
  let destroyed = false
  const start = performance.now()

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr))
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr))
    gl.viewport(0, 0, canvas.width, canvas.height)
    return dpr
  }
  let dpr = resize()

  const frame = () => {
    if (destroyed || !visible) return
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(prog)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    gl.uniform1f(uTime, (performance.now() - start) / 1000)
    gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.uniform1f(uDpr, dpr)
    gl.bindVertexArray(vao)
    gl.drawArrays(gl.POINTS, 0, count)
    raf = requestAnimationFrame(frame)
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    cancelAnimationFrame(raf)
    if (visible) raf = requestAnimationFrame(frame)
  })
  io.observe(canvas)
  const ro = new ResizeObserver(() => {
    dpr = resize()
  })
  ro.observe(canvas)

  return {
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    },
  }
}
