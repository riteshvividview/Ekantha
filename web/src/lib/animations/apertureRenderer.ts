import { CENTER, MAIN_LOGO_PATH, RECENTER, TRIANGLE_PATH, VIEWBOX } from './pageTransitionGeometry'

// The logo is rasterised once, soft-edged, into a texture; the fragment shader
// then only has to sample it, so a full-screen frame costs the GPU almost
// nothing, where the SVG mask this replaced was re-rasterised by the CPU on
// every frame. Soft edges thresholded at 0.5 stay crisp at the huge scales.
const PAD = 200
const TEXTURE_WIDTH = 1024

const VERTEX = `#version 300 es
in vec2 pos;
void main() { gl_Position = vec4(pos, 0.0, 1.0); }`

const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D logo;
uniform vec2 resolution;
uniform float slice;
uniform float scale;
uniform float holeWhite;
uniform float solidWhite;
uniform float opacity;
out vec4 color;
const vec2 CENTER = vec2(${CENTER.x.toFixed(1)}, ${CENTER.y.toFixed(1)});
const vec2 VIEW = vec2(${VIEWBOX.width.toFixed(1)}, ${VIEWBOX.height.toFixed(1)});
const float PAD = ${PAD.toFixed(1)};
const vec3 INK = vec3(0.114, 0.114, 0.106);
void main() {
  vec2 px = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y);
  vec2 point = (px - resolution * 0.5) / slice / scale + CENTER;
  float d = texture(logo, (point + PAD) / (VIEW + 2.0 * PAD)).a;
  float edge = max(fwidth(d), 0.002);
  float hole = max(smoothstep(0.5 - edge, 0.5 + edge, d), solidWhite);
  color = mix(vec4(INK, 1.0), vec4(vec3(holeWhite), holeWhite), hole) * opacity;
}`

export type ApertureState = { scale: number; holeWhite: number; solidWhite: number; opacity: number }

function logoTexture() {
  const canvas = document.createElement('canvas')
  const ratio = TEXTURE_WIDTH / (VIEWBOX.width + 2 * PAD)
  canvas.width = TEXTURE_WIDTH
  canvas.height = Math.round((VIEWBOX.height + 2 * PAD) * ratio)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.filter = 'blur(3px)'
  ctx.scale(ratio, ratio)
  ctx.translate(PAD + RECENTER.dx, PAD + RECENTER.dy)
  ctx.fill(new Path2D(MAIN_LOGO_PATH))
  ctx.fill(new Path2D(TRIANGLE_PATH))
  return canvas
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

export function createApertureRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false })
  const image = logoTexture()
  if (!gl || !image) return null

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const pos = gl.getAttribLocation(program, 'pos')
  gl.enableVertexAttribArray(pos)
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const uniform = (name: string) => gl.getUniformLocation(program, name)
  const resolution = uniform('resolution')
  const slice = uniform('slice')
  const scale = uniform('scale')
  const holeWhite = uniform('holeWhite')
  const solidWhite = uniform('solidWhite')
  const opacity = uniform('opacity')

  return {
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(slice, Math.max(canvas.width / VIEWBOX.width, canvas.height / VIEWBOX.height))
    },
    draw(state: ApertureState) {
      gl.uniform1f(scale, state.scale)
      gl.uniform1f(holeWhite, state.holeWhite)
      gl.uniform1f(solidWhite, state.solidWhite)
      gl.uniform1f(opacity, state.opacity)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
  }
}
