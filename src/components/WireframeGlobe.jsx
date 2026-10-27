import { useEffect, useRef, useState } from 'react';

/** Decorative only. Three.js is lazy-loaded, motion-aware, and fully disposed. */
export default function WireframeGlobe() {
  const container = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = container.current;
    if (!host) return undefined;

    let disposed = false;
    let cleanup = () => {};

    async function setup() {
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('webgl2', {
          antialias: true,
          alpha: true,
          powerPreference: 'low-power',
        });
        if (!context) return;
        cleanup = () =>
          context.getExtension('WEBGL_lose_context')?.loseContext();
        const THREE = await import('../lib/three-runtime.js');
        if (disposed) {
          cleanup();
          return;
        }

        const renderer = new THREE.WebGLRenderer({
          canvas,
          context,
          antialias: true,
          alpha: true,
          powerPreference: 'low-power',
        });
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
        camera.position.z = 5.7;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
        renderer.setClearColor(0xe9f5ef, 0);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        host.appendChild(renderer.domElement);

        const group = new THREE.Group();
        group.rotation.z = -0.32;
        scene.add(group);

        const sphereGeometry = new THREE.SphereGeometry(1.38, 32, 20);
        const wireGeometry = new THREE.WireframeGeometry(sphereGeometry);
        const wireMaterial = new THREE.LineBasicMaterial({
          color: 0x1f8a5c,
          transparent: true,
          opacity: 0.3,
        });
        const wire = new THREE.LineSegments(wireGeometry, wireMaterial);
        group.add(wire);

        // A solid inner surface hides rear edges for a restrained technical globe.
        const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xe9f5ef });
        const coreGeometry = new THREE.SphereGeometry(1.365, 32, 24);
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);

        const ringMaterial = new THREE.LineBasicMaterial({
          color: 0x2f9b6b,
          transparent: true,
          opacity: 0.45,
        });
        const ringGeometries = [];
        const rings = [];
        for (let i = 0; i < 2; i += 1) {
          const points = Array.from({ length: 161 }, (_, j) => {
            const angle = (j / 160) * Math.PI * 2;
            return new THREE.Vector3(
              Math.cos(angle) * 1.77,
              Math.sin(angle) * 1.77,
              0,
            );
          });
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          ringGeometries.push(geometry);
          const ring = new THREE.LineLoop(geometry, ringMaterial);
          ring.rotation.x = 1.13 + i * 0.5;
          ring.rotation.y = 0.3 + i * 0.9;
          group.add(ring);
          rings.push(ring);
        }

        // Deterministic constellation positions keep the composition stable.
        const particlePositions = [];
        for (let i = 0; i < 95; i += 1) {
          const angle = i * 2.399963;
          const radius = 1.9 + ((i * 37) % 83) / 83;
          particlePositions.push(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius * 0.78,
            ((i * 13) % 17) / 17 - 0.5,
          );
        }
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(particlePositions, 3),
        );
        const particleMaterial = new THREE.PointsMaterial({
          color: 0x3f8f6c,
          size: 0.018,
          transparent: true,
          opacity: 0.5,
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const target = { x: 0, y: 0 };
        let visible = true;
        let lastTime = 0;
        let phase = 0;

        function resize() {
          const { width, height } = host.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        }

        function pointerMove(event) {
          if (motion.matches) return;
          const rect = host.getBoundingClientRect();
          target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.34;
          target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.22;
        }
        function pointerLeave() {
          target.x = 0;
          target.y = 0;
        }

        function animate(time) {
          if (time - lastTime < 1000 / 30) return;
          const delta = Math.min((time - lastTime) / 1000, 0.05);
          lastTime = time;
          phase += delta * 0.075;
          group.rotation.y += (phase + target.x - group.rotation.y) * 0.055;
          group.rotation.x += (target.y - group.rotation.x) * 0.055;
          rings[0].rotation.z = phase * 0.35;
          particles.rotation.z = phase * 0.06;
          renderer.render(scene, camera);
        }

        function updateAnimation() {
          const shouldAnimate = !motion.matches && visible && !document.hidden;
          renderer.setAnimationLoop(shouldAnimate ? animate : null);
          lastTime = performance.now();
          if (!shouldAnimate) renderer.render(scene, camera);
        }

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        const intersectionObserver = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            updateAnimation();
          },
          { threshold: 0 },
        );
        intersectionObserver.observe(host);
        host.addEventListener('pointermove', pointerMove, { passive: true });
        host.addEventListener('pointerleave', pointerLeave);
        motion.addEventListener('change', updateAnimation);
        document.addEventListener('visibilitychange', updateAnimation);
        const contextLost = (event) => {
          event.preventDefault();
          renderer.setAnimationLoop(null);
          setReady(false);
        };
        renderer.domElement.addEventListener('webglcontextlost', contextLost);
        resize();
        updateAnimation();
        setReady(true);

        cleanup = () => {
          renderer.setAnimationLoop(null);
          resizeObserver.disconnect();
          intersectionObserver.disconnect();
          host.removeEventListener('pointermove', pointerMove);
          host.removeEventListener('pointerleave', pointerLeave);
          motion.removeEventListener('change', updateAnimation);
          document.removeEventListener('visibilitychange', updateAnimation);
          renderer.domElement.removeEventListener(
            'webglcontextlost',
            contextLost,
          );
          [
            sphereGeometry,
            wireGeometry,
            coreGeometry,
            particleGeometry,
            ...ringGeometries,
          ].forEach((item) => item.dispose());
          [wireMaterial, coreMaterial, ringMaterial, particleMaterial].forEach(
            (item) => item.dispose(),
          );
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        // WebGL is optional: the CSS fallback preserves the hero composition.
        cleanup();
        if (!disposed) setReady(false);
      }
    }

    setup();
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      className={`globe-canvas ${ready ? 'is-ready' : ''}`}
      ref={container}
      aria-hidden="true"
    >
      <div className="globe-fallback">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
