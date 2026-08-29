'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Bottle } from './Bottle'

/**
 * 判定的主角：一瓶真的玻璃酒瓶。
 *
 * 梗还是那个——扫码验茅台真假人人都会，这个工具反过来扫买家。
 * 而瓶子永远是满的，变的是里面装什么：
 * 琥珀是酒，红色是税差（消费税 20% ＋ 退税 13%），从瓶底把酒顶上来。
 *
 * 液面高度 = 套利风险分。玻璃走 transmission 折射，液体是自绘 shader，
 * 交界处有一条会晃的亮线。WebGL 拿不到就退回同样语义的 SVG 版本。
 */

// 瓶身轮廓（半径, 高），照贵州酱香那种矮胖圆肩的形
const SHELL: [number, number][] = [
  [0.00, 0.00], [0.42, 0.00], [0.505, 0.05], [0.538, 0.15],
  [0.545, 0.55], [0.545, 1.08], [0.540, 1.24], [0.518, 1.38],
  [0.468, 1.52], [0.380, 1.65], [0.278, 1.745], [0.205, 1.815],
  [0.180, 1.90], [0.176, 2.05], [0.190, 2.10],
]
const BODY_R = 0.545
const LIQ_BOT = 0.055
const LIQ_TOP = 1.50
const LIQUID: [number, number][] = [
  [0.00, LIQ_BOT], [0.40, LIQ_BOT], [0.478, 0.11], [0.500, 0.55],
  [0.500, 1.08], [0.495, 1.24], [0.480, 1.38], [0.430, LIQ_TOP], [0.00, LIQ_TOP],
]

const VERT = /* glsl */ `
  varying vec3 vP;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vP = position;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */ `
  uniform float uGap;
  uniform float uTime;
  uniform vec3 cAmberTop, cAmberBot, cRedTop, cRedBot;
  varying vec3 vP;
  varying vec3 vN;
  varying vec3 vV;

  void main() {
    float h = clamp((vP.y - ${LIQ_BOT.toFixed(3)}) / ${(LIQ_TOP - LIQ_BOT).toFixed(3)}, 0.0, 1.0);

    // 界面晃两下，像刚倒完还没静下来
    float w = sin(vP.x * 7.0 + uTime * 1.5) * 0.013 + sin(vP.z * 9.0 - uTime * 1.05) * 0.010;
    float g = clamp(uGap + w, 0.0, 1.0);
    float edge = smoothstep(g - 0.010, g + 0.010, h);

    vec3 amber = mix(cAmberBot, cAmberTop, smoothstep(g, 1.0, h));
    vec3 red = mix(cRedBot, cRedTop, h / max(g, 0.001));
    vec3 col = mix(red, amber, edge);

    // 交界的那条亮线
    float line = exp(-pow((h - g) / 0.013, 2.0));
    col += line * 0.42 * mix(vec3(1.0, 0.42, 0.34), vec3(1.0, 0.80, 0.42), edge);

    // 边缘加厚，让它有体积不是一张色卡
    float fres = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.1);
    col = mix(col, col * 0.42, fres * 0.55);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function Bottle3D({
  score, level, abv = 53, height = 340,
}: { score: number; level: 'low' | 'mid' | 'high'; abv?: number; height?: number }) {
  const host = useRef<HTMLDivElement>(null)
  const target = useRef(score)
  const [ok, setOk] = useState<boolean | null>(null)
  const [n, setN] = useState(0)

  useEffect(() => { target.current = score }, [score])
  useEffect(() => { setOk(supportsWebGL()) }, [])

  useEffect(() => {
    if (ok !== true || !host.current) return
    const el = host.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch {
      setOk(false)
      return
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.18
    el.appendChild(renderer.domElement)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'

    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(23, 1, 0.1, 40)
    cam.position.set(0, 1.10, 8.6)
    cam.lookAt(0, 1.02, 0)

    // 环境：一张手绘的渐变天光，玻璃靠它才有反射
    const cv = document.createElement('canvas')
    cv.width = 512
    cv.height = 256
    {
      const g = cv.getContext('2d')!
      const grd = g.createLinearGradient(0, 0, 0, 256)
      grd.addColorStop(0, '#FFF7EA')
      grd.addColorStop(0.42, '#E6D2B2')
      grd.addColorStop(0.68, '#8A7358')
      grd.addColorStop(1, '#2B2018')
      g.fillStyle = grd
      g.fillRect(0, 0, 512, 256)
      // 摄影棚那支竖直柔光灯管——瓶子上那道长高光就是它
      for (const [cx, w, a] of [[128, 26, 1], [372, 15, 0.72]] as const) {
        const strip = g.createLinearGradient(cx - w, 0, cx + w, 0)
        strip.addColorStop(0, 'rgba(255,255,255,0)')
        strip.addColorStop(0.5, `rgba(255,255,255,${a})`)
        strip.addColorStop(1, 'rgba(255,255,255,0)')
        g.fillStyle = strip
        g.fillRect(cx - w, 6, w * 2, 190)
      }
      const hot = g.createRadialGradient(190, 46, 4, 190, 46, 74)
      hot.addColorStop(0, 'rgba(255,255,255,.95)')
      hot.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = hot
      g.fillRect(0, 0, 512, 256)
    }
    const envTex = new THREE.CanvasTexture(cv)
    envTex.mapping = THREE.EquirectangularReflectionMapping
    envTex.colorSpace = THREE.SRGBColorSpace
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromEquirectangular(envTex).texture
    scene.environment = env

    scene.add(new THREE.AmbientLight(0xfff2e0, 0.55))
    const key = new THREE.DirectionalLight(0xfff4e4, 2.1)
    key.position.set(2.6, 4.2, 3.4)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xffd9a0, 1.15)
    rim.position.set(-3.2, 1.4, -2.6)
    scene.add(rim)

    const hi = level === 'high'
    const mid = level === 'mid'
    const accent = hi ? '#BE3A2E' : mid ? '#9A5414' : '#8A5A16'

    const group = new THREE.Group()
    scene.add(group)

    const lathe = (pts: [number, number][], seg = 96) =>
      new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg)

    // 液体：自绘 shader，琥珀在上、税差在下
    const uni = {
      uGap: { value: 0 },
      uTime: { value: 0 },
      cAmberTop: { value: new THREE.Color('#E8B451') },
      cAmberBot: { value: new THREE.Color('#9E6417') },
      cRedTop: { value: new THREE.Color('#DC4438') },
      cRedBot: { value: new THREE.Color('#7C1B17') },
    }
    const liquid = new THREE.Mesh(
      lathe(LIQUID),
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: uni }),
    )
    group.add(liquid)

    // 玻璃瓶身
    const glass = new THREE.Mesh(
      lathe(SHELL),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0, roughness: 0.022,
        transmission: 1, thickness: 0.22, ior: 1.5,
        clearcoat: 1, clearcoatRoughness: 0.045,
        envMapIntensity: 2.4, transparent: true,
        attenuationColor: new THREE.Color('#EADFCB'), attenuationDistance: 2.4,
      }),
    )
    group.add(glass)

    // 瓶盖：白瓷
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.262, 0.250, 0.255, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0xf3ece1, roughness: 0.42, metalness: 0.02,
        clearcoat: 0.35, clearcoatRoughness: 0.35, envMapIntensity: 0.85,
      }),
    )
    cap.position.y = 2.198
    group.add(cap)

    // 红飘带：一眼认得出是中国白酒，不是洋酒
    const ribbon = new THREE.Mesh(
      new THREE.TorusGeometry(0.196, 0.034, 18, 84),
      new THREE.MeshStandardMaterial({ color: 0xa8231c, roughness: 0.44, metalness: 0.05 }),
    )
    ribbon.rotation.x = Math.PI / 2
    ribbon.position.y = 2.015
    group.add(ribbon)

    // 酒标：装的是什么就写什么，贴在瓶身上跟着一起转
    const lc = document.createElement('canvas')
    lc.width = 440
    lc.height = 320
    const labelTex = new THREE.CanvasTexture(lc)
    labelTex.colorSpace = THREE.SRGBColorSpace
    labelTex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    const drawLabel = () => {
      const g = lc.getContext('2d')!
      g.clearRect(0, 0, 440, 320)
      g.fillStyle = '#FAF6EF'
      g.fillRect(0, 0, 440, 320)
      g.strokeStyle = accent
      g.lineWidth = 5
      g.strokeRect(13, 13, 414, 294)
      g.strokeStyle = 'rgba(28,22,19,.22)'
      g.lineWidth = 1.5
      g.strokeRect(27, 27, 386, 266)
      g.textAlign = 'center'
      g.fillStyle = accent
      g.font = '500 150px Oswald, "Helvetica Neue", sans-serif'
      g.fillText(hi ? '33' : String(abv), 220, 190)
      g.fillStyle = '#8B7F6F'
      g.font = '500 30px "JetBrains Mono", monospace'
      g.fillText(hi ? '税差 %' : mid ? '存疑 °' : '酱香 °', 220, 244)
      labelTex.needsUpdate = true
    }
    drawLabel()
    // 字体是异步加载的，回来了再画一次，不然会掉到系统字体
    void document.fonts?.ready.then(drawLabel)

    const label = new THREE.Mesh(
      new THREE.CylinderGeometry(BODY_R + 0.007, BODY_R + 0.007, 0.66, 72, 1, true, -0.78, 1.56),
      new THREE.MeshStandardMaterial({
        map: labelTex, roughness: 0.72, metalness: 0,
        transparent: true, envMapIntensity: 0.35,
      }),
    )
    label.position.y = 0.74
    group.add(label)

    let raf = 0
    const t0 = performance.now()
    let shown = 0

    function resize() {
      const w = el.clientWidth || 240
      const h = el.clientHeight || height
      renderer.setSize(w, h, false)
      cam.aspect = w / h
      cam.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const loop = (now: number) => {
      const t = (now - t0) / 1000
      uni.uTime.value = t

      // 入场：液面涌上来、晃过头、回落
      const k = Math.min(1, t / 1.5)
      const ease = 1 - Math.pow(1 - k, 4)
      const goal = target.current / 100
      const slosh = k < 0.62 && !reduce ? Math.sin((k * Math.PI) / 0.62) * 0.055 * (1 - k) : 0
      shown += (goal * ease + slosh - shown) * (k < 1 ? 1 : 0.09)
      uni.uGap.value = Math.max(0, Math.min(1.04, shown))
      setN(Math.round(Math.max(0, Math.min(100, shown * 100))))

      if (reduce) {
        group.rotation.y = 0
      } else {
        // 先转正，再极慢地左右摆——是被端出来给你看，不是在转圈
        const settle = Math.min(1, t / 1.6)
        group.rotation.y = -0.95 * (1 - (1 - settle) ** 3) + 0.95 + Math.sin(t * 0.32) * 0.2
        group.position.y = Math.sin(t * 0.62) * 0.022
      }

      renderer.render(scene, cam)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      pmrem.dispose()
      envTex.dispose()
      env.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [ok, height, level, abv])

  if (ok === false) return <Bottle score={score} level={level} abv={abv} />

  const hi = level === 'high'
  const mid = level === 'mid'
  const glow = hi ? 'var(--color-halt)' : mid ? 'var(--color-probe)' : '#8A5A16'

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ height, width: '100%', maxWidth: 250 }}>
        {/* 落在纸上的影子 */}
        <div
          className="pointer-events-none absolute bottom-[7%] left-1/2 h-[26px] w-[62%] -translate-x-1/2 rounded-[50%]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(28,22,19,.30), transparent 72%)' }}
        />
        <div
          className="pointer-events-none absolute bottom-[6%] left-1/2 h-[150px] w-[85%] -translate-x-1/2 rounded-[50%] blur-2xl"
          style={{ background: `radial-gradient(ellipse at center, ${glow}, transparent 70%)`, opacity: 0.17 }}
        />
        <div ref={host} className="absolute inset-0" />
      </div>

      <div className="mt-1 text-center">
        <div className="flex items-baseline justify-center gap-2">
          <span className="num text-[42px] leading-none" style={{ color: glow }}>{n}</span>
          <span className="tag text-ink3">套利风险</span>
        </div>
        <p className="mx-auto mt-2 max-w-[16em] text-[11.5px] leading-relaxed text-ink2">
          {hi ? '红的是税差。他要的不是这瓶酒，是那 33%。'
            : mid ? '还看不清瓶里装的是什么，先问清楚。'
              : '瓶里是酒，不是税差。这是来买酒的。'}
        </p>
      </div>
    </div>
  )
}
