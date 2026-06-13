import { useEffect, useRef } from "react";
import * as THREE from "three";

const fluidVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fluidFragmentShader = `
  precision highp float;
  uniform sampler2D uFluidTex;
  uniform vec2 u_resolution;
  uniform vec2 iMouse;
  uniform float uBrushSize;
  uniform float uBrushStrength;

  void main() {
    vec2 p = gl_FragCoord.xy / u_resolution.xy;
    vec4 fluid = texture2D(uFluidTex, p);
    vec2 vel = fluid.xy;
    float ink = fluid.z;

    float dt = 0.016;
    float decay = 0.98;
    float diff = 0.25;

    vec2 diffusionStep = vel * dt * diff + 0.5 / u_resolution;

    vec4 s1 = texture2D(uFluidTex, p + vec2(-diffusionStep.x, -diffusionStep.y));
    vec4 s2 = texture2D(uFluidTex, p + vec2( diffusionStep.x, -diffusionStep.y));
    vec4 s3 = texture2D(uFluidTex, p + vec2(-diffusionStep.x,  diffusionStep.y));
    vec4 s4 = texture2D(uFluidTex, p + vec2( diffusionStep.x,  diffusionStep.y));

    vec4 newFluid = (s1 + s2 + s3 + s4) * 0.25;
    newFluid = mix(newFluid, fluid, 0.85);
    newFluid *= decay;

    vec2 coord = gl_FragCoord.xy - iMouse;
    float dist = length(coord);
    float radius = uBrushSize;
    float strength = uBrushStrength;

    if (dist < radius) {
      float falloff = (radius - dist) / radius;
      newFluid.xy += (coord * strength * falloff) / u_resolution;
      newFluid.z += falloff * strength;
    }

    newFluid.a = fluid.a;
    gl_FragColor = clamp(newFluid, 0.0, 1.0);
  }
`;

const displayVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const displayFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform sampler2D u_fluid;

  void main() {
    vec2 uv = vUv;
    vec4 fluid = texture2D(u_fluid, vUv);
    vec2 fluidVel = fluid.xy;

    // Create organic distortion
    float t = u_time * 0.3;
    vec2 distort = vec2(
      sin(uv.y * 6.0 + t) * 0.015,
      cos(uv.x * 4.0 + t * 0.7) * 0.015
    );

    // Add fluid ripple
    vec2 rippleUV = uv + fluidVel * 0.04 + distort;

    // Create procedural dark pattern
    float pattern = sin(rippleUV.x * 12.0 + t) * cos(rippleUV.y * 8.0 - t * 0.5);
    pattern += sin(rippleUV.x * 20.0 - t * 1.3) * 0.3;
    pattern += cos(rippleUV.y * 16.0 + t * 0.8) * 0.2;
    pattern = pattern * 0.5 + 0.5;

    // Mouse-reactive glow
    vec2 mouseNorm = u_mouse / u_resolution;
    float mouseDist = length(uv - mouseNorm);
    float glowRadius = 0.35;
    float cursorGlow = 0.0;
    if (mouseDist < glowRadius) {
      cursorGlow = (glowRadius - mouseDist) / glowRadius;
    }

    // Color composition - dark teal/cyan on black
    vec3 baseColor = vec3(0.02, 0.03, 0.04);
    vec3 cyanGlow = vec3(0.0, 0.94, 1.0) * pattern * 0.15;
    vec3 deepCyan = vec3(0.0, 0.4, 0.5) * (1.0 - pattern) * 0.08;
    vec3 cursorColor = vec3(0.0, 0.94, 1.0) * cursorGlow * 0.4;

    // Fluid ink color
    vec3 inkColor = vec3(0.1, 0.6, 0.7) * fluid.z * 0.5;

    vec3 finalColor = baseColor + cyanGlow + deepCyan + cursorColor + inkColor;

    // Add subtle grain
    float grain = fract(sin(dot(uv * 1000.0, vec2(12.9898, 78.233))) * 43758.5453) * 0.02;
    finalColor += grain;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function FluidIntelligenceCore() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create render targets for fluid simulation
    const rtParams: THREE.RenderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    };

    let rtA = new THREE.WebGLRenderTarget(
      container.offsetWidth,
      container.offsetHeight,
      rtParams
    );
    let rtB = new THREE.WebGLRenderTarget(
      container.offsetWidth,
      container.offsetHeight,
      rtParams
    );

    // Initialize fluid with soft radial gradient
    const initScene = new THREE.Scene();
    const initMaterial = new THREE.ShaderMaterial({
      vertexShader: fluidVertexShader,
      fragmentShader: `
        void main() {
          vec2 p = gl_FragCoord.xy / vec2(800.0, 600.0);
          vec2 center = vec2(0.5, 0.5);
          float dist = length(p - center);
          float ink = smoothstep(0.5, 0.0, dist) * 0.3;
          vec2 vel = (p - center) * 0.02;
          gl_FragColor = vec4(vel, ink, 1.0);
        }
      `,
    });
    const quad = new THREE.PlaneGeometry(2, 2);
    const initMesh = new THREE.Mesh(quad, initMaterial);
    initScene.add(initMesh);
    renderer.setRenderTarget(rtA);
    renderer.render(initScene, camera);
    renderer.setRenderTarget(rtB);
    renderer.render(initScene, camera);
    renderer.setRenderTarget(null);

    // Fluid simulation material
    const fluidMaterial = new THREE.ShaderMaterial({
      vertexShader: fluidVertexShader,
      fragmentShader: fluidFragmentShader,
      uniforms: {
        uFluidTex: { value: rtA.texture },
        u_resolution: {
          value: new THREE.Vector2(
            container.offsetWidth,
            container.offsetHeight
          ),
        },
        iMouse: { value: new THREE.Vector2(-9999, -9999) },
        uBrushSize: { value: 100.0 },
        uBrushStrength: { value: 0.5 },
      },
    });

    const fluidMesh = new THREE.Mesh(quad, fluidMaterial);
    const fluidScene = new THREE.Scene();
    fluidScene.add(fluidMesh);

    // Display material
    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader: displayVertexShader,
      fragmentShader: displayFragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_mouse: { value: new THREE.Vector2(-9999, -9999) },
        u_resolution: {
          value: new THREE.Vector2(
            container.offsetWidth,
            container.offsetHeight
          ),
        },
        u_fluid: { value: rtA.texture },
      },
    });

    const displayMesh = new THREE.Mesh(quad, displayMaterial);
    const displayScene = new THREE.Scene();
    displayScene.add(displayMesh);

    // Mouse tracking
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = rect.height - (e.clientY - rect.top);
    };

    container.addEventListener("pointermove", handlePointerMove);

    // Animation loop
    let isVisible = true;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = clock.getElapsedTime();

      // Lerp mouse
      mouseRef.current.x +=
        (mouseRef.current.targetX - mouseRef.current.x) * 0.15;
      mouseRef.current.y +=
        (mouseRef.current.targetY - mouseRef.current.y) * 0.15;

      // Fluid pass
      fluidMaterial.uniforms.uFluidTex.value = rtA.texture;
      fluidMaterial.uniforms.iMouse.value.set(
        mouseRef.current.x * renderer.getPixelRatio(),
        mouseRef.current.y * renderer.getPixelRatio()
      );

      renderer.setRenderTarget(rtB);
      renderer.render(fluidScene, camera);

      // Swap
      const temp = rtA;
      rtA = rtB;
      rtB = temp;

      // Display pass
      displayMaterial.uniforms.u_time.value = elapsed;
      displayMaterial.uniforms.u_fluid.value = rtA.texture;
      displayMaterial.uniforms.u_mouse.value.set(
        mouseRef.current.x,
        mouseRef.current.y
      );

      renderer.setRenderTarget(null);
      renderer.render(displayScene, camera);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    // Visibility check
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    animate();

    // Resize
    const handleResize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      renderer.setSize(w, h);
      rtA.setSize(w, h);
      rtB.setSize(w, h);
      fluidMaterial.uniforms.u_resolution.value.set(w, h);
      displayMaterial.uniforms.u_resolution.value.set(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      rtA.dispose();
      rtB.dispose();
      fluidMaterial.dispose();
      displayMaterial.dispose();
      initMaterial.dispose();
      quad.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}
