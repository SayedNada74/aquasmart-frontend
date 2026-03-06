"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/lib/AppContext";
import * as THREE from "three";

interface OceanEtherBackgroundProps {
    className?: string;
    intensity?: number;
    speed?: number;
    causticsIntensity?: number;
    fishCount?: number;
    netOverlay?: boolean;
    vignette?: number;
    dprCap?: number;
    pauseWhenOffscreen?: boolean;
}

// Fragment shader for water + caustics + fish silhouettes
const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uSpeed;
uniform float uCausticsIntensity;
uniform float uVignette;
uniform bool uIsDark;

// Base palette
uniform vec3 uColorBase;
uniform vec3 uColorMid;
uniform vec3 uColorTop;
uniform vec3 uColorGlow;
uniform vec3 uColorNet;

varying vec2 vUv;

// Noise function
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 5; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    // Prevent division by zero and maintain aspect ratio gracefully
    if (uResolution.y > 0.0) {
        p.x *= uResolution.x / uResolution.y;
    }

    // Mouse interaction (distortion field)
    float dist = distance(p, uMouse);
    float mouseWave = exp(-dist * 4.0) * sin(dist * 10.0 - uTime * 5.0) * 0.05 * uIntensity;
    
    // Liquid base
    vec2 q = vec2(0.);
    q.x = fbm(p + uTime * uSpeed * 0.1);
    q.y = fbm(p + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm(p + 1.0 * q + vec2(1.7, 9.2) + uTime * uSpeed * 0.15 + mouseWave);
    r.y = fbm(p + 1.0 * q + vec2(8.3, 2.8) + uTime * uSpeed * 0.126 + mouseWave);

    float f = fbm(p + r);

    // Color mix based on noise
    vec3 color = mix(uColorBase, uColorMid, clamp((f*f)*4.0, 0.0, 1.0));
    color = mix(color, uColorTop, clamp(length(q), 0.0, 1.0));
    color = mix(color, uColorGlow, clamp(length(r.x), 0.0, 1.0) * uIntensity * 0.3);

    // Caustics shimmer
    float c = sin(p.x * 5.0 + uTime * 2.0) * cos(p.y * 5.0 + uTime * 1.5);
    c += sin(p.x * 10.0 - uTime * 3.0) * cos(p.y * 10.0 - uTime * 2.5);
    c *= 0.25;
    float causticGlow = smoothstep(0.5, 0.8, c + noise(p * 3.0 + uTime)) * uCausticsIntensity;
    
    // In light mode, reduce caustic brightness
    if (!uIsDark) {
        causticGlow *= 0.3;
    }
    color += uColorGlow * causticGlow;

    // Vignette
    if (uIsDark) {
        float v = length(uv - 0.5);
        color *= 1.0 - v * uVignette;
    } else {
        float v = length(uv - 0.5);
        color *= 1.0 - v * (uVignette * 0.3); // much softer in light mode
    }

    gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export function OceanEtherBackground({
    className = "",
    intensity = 0.9,
    speed = 0.35,
    causticsIntensity = 0.35,
    fishCount = 28,
    netOverlay = true,
    vignette = 0.55,
    dprCap = 1.5,
    pauseWhenOffscreen = true,
}: OceanEtherBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isVisible = useRef(true);
    const mousePos = useRef({ x: 0, y: 0 });
    const themeRef = useRef(true); // true = dark, false = light
    const { lowPowerMode } = useApp();

    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return;

        // Reduced motion check & Low Power Mode
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mq.matches || lowPowerMode) {
            containerRef.current.style.background = "linear-gradient(135deg, #020617 0%, #0b4d6b 100%)";
            return;
        }

        // --- Three.js Setup ---
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: false,
            powerPreference: "high-performance"
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));

        // --- Detect Theme ---
        const updateThemeState = () => {
            const isDark = !document.documentElement.classList.contains("light-mode");
            themeRef.current = isDark;

            if (mat.uniforms) {
                mat.uniforms.uIsDark.value = isDark;
                if (isDark) {
                    mat.uniforms.uColorBase.value.set("#020617");
                    mat.uniforms.uColorMid.value.set("#0f172a");
                    mat.uniforms.uColorTop.value.set("#0b4d6b");
                    mat.uniforms.uColorGlow.value.set("#0ea5e9");
                } else {
                    mat.uniforms.uColorBase.value.set("#f8fafc");
                    mat.uniforms.uColorMid.value.set("#e2e8f0");
                    mat.uniforms.uColorTop.value.set("#bae6fd");
                    mat.uniforms.uColorGlow.value.set("#38bdf8");
                }
            }
        };

        // --- Liquid Background ---
        const geo = new THREE.PlaneGeometry(2, 2);
        const mat = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(1, 1) },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uIntensity: { value: intensity },
                uSpeed: { value: speed },
                uCausticsIntensity: { value: causticsIntensity },
                uVignette: { value: vignette },
                uIsDark: { value: true },
                uColorBase: { value: new THREE.Color() },
                uColorMid: { value: new THREE.Color() },
                uColorTop: { value: new THREE.Color() },
                uColorGlow: { value: new THREE.Color() },
            },
            depthWrite: false,
            depthTest: false,
        });

        updateThemeState();
        const bgMesh = new THREE.Mesh(geo, mat);
        scene.add(bgMesh);

        const observer = new MutationObserver(updateThemeState);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        // --- Fish Swarm (InstancedMesh) ---
        const fishTexSize = 64;
        const c = document.createElement("canvas");
        c.width = fishTexSize; c.height = fishTexSize;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(10, 32);
        ctx.lineTo(0, 20);
        ctx.lineTo(20, 32);
        ctx.lineTo(0, 44);
        ctx.lineTo(10, 32);
        ctx.moveTo(20, 32);
        ctx.quadraticCurveTo(32, 16, 54, 32);
        ctx.quadraticCurveTo(32, 48, 20, 32);
        ctx.fill();
        const fishTexture = new THREE.CanvasTexture(c);

        const fishGeo = new THREE.PlaneGeometry(0.1, 0.1);
        const fishMat = new THREE.MeshBasicMaterial({
            map: fishTexture,
            transparent: true,
            opacity: themeRef.current ? 0.4 : 0.15,
            color: themeRef.current ? 0x88ccff : 0x0f172a,
            depthWrite: false,
        });
        const fishMesh = new THREE.InstancedMesh(fishGeo, fishMat, fishCount);

        const fishData = Array.from({ length: fishCount }, () => ({
            pos: new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, 0),
            vel: new THREE.Vector3((Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.005, 0),
            scale: 0.5 + Math.random() * 0.8,
            offset: Math.random() * 100,
        }));

        const dummy = new THREE.Object3D();
        fishData.forEach((f, i) => {
            dummy.position.copy(f.pos);
            dummy.scale.set(f.scale, f.scale, 1);
            dummy.updateMatrix();
            fishMesh.setMatrixAt(i, dummy.matrix);
        });
        scene.add(fishMesh);

        // --- Optional Net Overlay ---
        let netGeo: THREE.PlaneGeometry | null = null;
        let netMat: THREE.LineBasicMaterial | null = null;
        let netMesh: THREE.LineSegments | null = null;
        if (netOverlay) {
            netGeo = new THREE.PlaneGeometry(3, 2, 20, 15);
            const wireGeo = new THREE.WireframeGeometry(netGeo);
            netMat = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.03,
            });
            netMesh = new THREE.LineSegments(wireGeo, netMat);
            netMesh.position.z = -0.1;
            scene.add(netMesh);
        }

        // --- Interaction & Resize ---
        const handleResize = () => {
            const container = containerRef.current;
            if (!container) return;
            // Get actual dimensions safely
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w === 0 || h === 0) return; // Prevent WebGL crash on zero size

            renderer.setSize(w, h, false);
            mat.uniforms.uResolution.value.set(w, h);
        };
        handleResize();

        // Use ResizeObserver for accurate SPA mounting sizes
        const resizeObserver = new ResizeObserver(() => handleResize());
        if (containerRef.current) resizeObserver.observe(containerRef.current);

        const handlePointerMove = (e: PointerEvent) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height;
            mousePos.current.x = x * 2 - 1;
            mousePos.current.y = y * 2 - 1;
            mat.uniforms.uMouse.value.set(mousePos.current.x, mousePos.current.y);
        };
        window.addEventListener("pointermove", handlePointerMove);

        // IntersectionObserver to pause
        let io: IntersectionObserver | null = null;
        if (pauseWhenOffscreen) {
            io = new IntersectionObserver(([entry]) => {
                isVisible.current = entry.isIntersecting;
            }, { rootMargin: '100px' });
            if (containerRef.current) io.observe(containerRef.current);
        }

        // --- Animation Loop ---
        let frameId = 0;
        let lastTime = performance.now();

        const render = (time: number) => {
            frameId = requestAnimationFrame(render);

            // Safety: Skip heavily throttled background tabs
            if (time - lastTime > 100) lastTime = time;
            lastTime = time;

            if (!isVisible.current) return;

            const t = time * 0.001;
            mat.uniforms.uTime.value = t;

            fishMat.opacity = themeRef.current ? 0.4 : 0.15;
            fishMat.color.setHex(themeRef.current ? 0x88ccff : 0x0f172a);
            if (netMesh && netMat) {
                netMat.opacity = themeRef.current ? 0.03 : 0.05;
                netMat.color.setHex(themeRef.current ? 0xffffff : 0x334155);
            }

            const cvs = canvasRef.current;
            const aspect = cvs ? (cvs.clientWidth / cvs.clientHeight) : 1;

            fishData.forEach((f, i) => {
                const wobble = Math.sin(t * 3.0 + f.offset) * 0.002;
                f.vel.x -= 0.0001;
                f.vel.y += wobble;

                const distSq = (f.pos.x - mousePos.current.x * aspect) ** 2 + (f.pos.y - mousePos.current.y) ** 2;
                if (distSq < 0.2) {
                    const forceX = (f.pos.x - mousePos.current.x * aspect) * 0.005;
                    const forceY = (f.pos.y - mousePos.current.y) * 0.005;
                    f.vel.x += forceX;
                    f.vel.y += forceY;
                }

                f.vel.clampScalar(-0.02, 0.02);
                f.pos.add(f.vel);

                if (f.pos.x < -aspect - 0.2) { f.pos.x = aspect + 0.2; f.pos.y = (Math.random() - 0.5) * 2; }
                if (f.pos.x > aspect + 0.2) { f.pos.x = -aspect - 0.2; f.pos.y = (Math.random() - 0.5) * 2; }
                if (f.pos.y < -1.2) { f.pos.y = 1.2; }
                if (f.pos.y > 1.2) { f.pos.y = -1.2; }

                const angle = Math.atan2(f.vel.y, f.vel.x);
                const speedRatio = f.vel.length() * 100;
                const wiggleScale = f.scale * (1.0 + Math.sin(t * speedRatio * 2.0 + f.offset) * 0.1);

                dummy.position.copy(f.pos);
                dummy.rotation.z = angle;
                if (Math.abs(angle) < Math.PI / 2) {
                    dummy.scale.set(wiggleScale, -f.scale, 1);
                } else {
                    dummy.scale.set(wiggleScale, f.scale, 1);
                }

                dummy.updateMatrix();
                fishMesh.setMatrixAt(i, dummy.matrix);
            });
            fishMesh.instanceMatrix.needsUpdate = true;

            if (netMesh) {
                netMesh.position.x = Math.sin(t * 0.1) * 0.05;
                netMesh.position.y = Math.cos(t * 0.15) * 0.05;
            }

            renderer.render(scene, camera);
        };

        frameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("pointermove", handlePointerMove);
            observer.disconnect();
            resizeObserver.disconnect();
            if (io) io.disconnect();

            geo.dispose();
            mat.dispose();
            fishTexture.dispose();
            fishGeo.dispose();
            fishMat.dispose();
            if (netGeo) netGeo.dispose();
            if (netMat) netMat.dispose();

            renderer.dispose();
        };
    }, [intensity, speed, causticsIntensity, fishCount, netOverlay, vignette, dprCap, pauseWhenOffscreen, lowPowerMode]);

    return (
        <div ref={containerRef} className={className} style={{ pointerEvents: "none" }}>
            <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%", outline: "none" }} />
        </div>
    );
}
