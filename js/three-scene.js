/**
 * AESTHETIX // CYBERFIT - 3D THREE.JS EXPERIENCE
 * Ultra-futuristic interactive 3D Biomechanical Gym Gear & Energy Gyroscope
 */

(function () {
  function startScene() {
    const container = document.getElementById('three-canvas-container');
    if (!container) return;

    // Device & Performance Profiling for Budget Devices (Tier-2/3 Phones)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isBudgetDevice = (
      prefersReducedMotion ||
      (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) ||
      (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 3) ||
      (/Android/i.test(navigator.userAgent) && window.innerWidth <= 600)
    );

    // If user requests reduced motion or THREE is missing, use lightweight 2D canvas
    if (prefersReducedMotion || typeof THREE === 'undefined') {
      initFallbackCanvas(container);
      return;
    }

    // Scene, Camera, Adaptive Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 550;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.5);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isBudgetDevice,
        alpha: true,
        powerPreference: isBudgetDevice ? 'low-power' : 'high-performance',
        precision: isBudgetDevice ? 'mediump' : 'highp',
      });
    } catch (e) {
      initFallbackCanvas(container);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(isBudgetDevice ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

  // Group for whole 3D rig
  const mainRig = new THREE.Group();
  scene.add(mainRig);

  // Material Library
  const darkMetalMaterial = new THREE.MeshStandardMaterial({
    color: 0x141416,
    metalness: 0.88,
    roughness: 0.22,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.98,
    roughness: 0.12,
  });

  const neonLimeMaterial = new THREE.MeshStandardMaterial({
    color: 0xff1e00,
    emissive: 0xff1e00,
    emissiveIntensity: 2.6,
    metalness: 0.2,
    roughness: 0.1,
  });

  const neonCyanMaterial = new THREE.MeshStandardMaterial({
    color: 0xff7700,
    emissive: 0xff7700,
    emissiveIntensity: 2.0,
    metalness: 0.2,
    roughness: 0.1,
  });

  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff2a00,
    wireframe: true,
  });

  // Track all meshes for wireframe toggle
  const meshes = [];

  // ==========================================
  // BUILD 3D DUMBBELL / BIOMECHANICAL APPARATUS
  // ==========================================
  const dumbbellGroup = new THREE.Group();
  mainRig.add(dumbbellGroup);

  // 1. Central Titanium Handle
  const handleGeo = new THREE.CylinderGeometry(0.22, 0.22, 3.8, 32);
  const handleMesh = new THREE.Mesh(handleGeo, chromeMaterial);
  handleMesh.rotation.z = Math.PI / 2;
  dumbbellGroup.add(handleMesh);
  meshes.push({ mesh: handleMesh, originalMat: chromeMaterial });

  // Grip Ribs / Knurling Accents
  for (let i = -1.2; i <= 1.2; i += 0.35) {
    const ringGeo = new THREE.TorusGeometry(0.24, 0.02, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, neonLimeMaterial);
    ringMesh.rotation.y = Math.PI / 2;
    ringMesh.position.x = i;
    dumbbellGroup.add(ringMesh);
    meshes.push({ mesh: ringMesh, originalMat: neonLimeMaterial });
  }

  // 2. Weight Plates (Both Ends)
  const platePositions = [-1.9, -2.25, 1.9, 2.25];
  const plateRadii = [1.35, 1.15, 1.35, 1.15];

  platePositions.forEach((pos, idx) => {
    const r = plateRadii[idx];
    const plateGeo = new THREE.CylinderGeometry(r, r, 0.28, 8); // Hexagonal bevel
    plateGeo.rotateZ(Math.PI / 2);
    const plateMesh = new THREE.Mesh(plateGeo, darkMetalMaterial);
    plateMesh.position.x = pos;
    dumbbellGroup.add(plateMesh);
    meshes.push({ mesh: plateMesh, originalMat: darkMetalMaterial });

    // Inner Glowing Fire Ring
    const fireRingGeo = new THREE.TorusGeometry(r * 0.72, 0.045, 16, 48);
    fireRingGeo.rotateY(Math.PI / 2);
    const fireRingMesh = new THREE.Mesh(fireRingGeo, neonLimeMaterial);
    fireRingMesh.position.x = pos + (pos > 0 ? 0.15 : -0.15);
    dumbbellGroup.add(fireRingMesh);
    meshes.push({ mesh: fireRingMesh, originalMat: neonLimeMaterial });

    // Outer Chrome Rim
    const outerRimGeo = new THREE.TorusGeometry(r * 0.98, 0.035, 16, 48);
    outerRimGeo.rotateY(Math.PI / 2);
    const outerRimMesh = new THREE.Mesh(outerRimGeo, chromeMaterial);
    outerRimMesh.position.x = pos;
    dumbbellGroup.add(outerRimMesh);
    meshes.push({ mesh: outerRimMesh, originalMat: chromeMaterial });
  });

  // End Collars / Retainers
  [-2.45, 2.45].forEach((pos) => {
    const collarGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 24);
    collarGeo.rotateZ(Math.PI / 2);
    const collarMesh = new THREE.Mesh(collarGeo, neonCyanMaterial);
    collarMesh.position.x = pos;
    dumbbellGroup.add(collarMesh);
    meshes.push({ mesh: collarMesh, originalMat: neonCyanMaterial });
  });

  // ==========================================
  // HOLOGRAPHIC ENERGY GYROSCOPE RINGS
  // ==========================================
  const gyroGroup = new THREE.Group();
  mainRig.add(gyroGroup);

  const ring1Geo = new THREE.TorusGeometry(3.2, 0.04, 16, 100);
  const ring1Mesh = new THREE.Mesh(ring1Geo, neonLimeMaterial);
  gyroGroup.add(ring1Mesh);
  meshes.push({ mesh: ring1Mesh, originalMat: neonLimeMaterial });

  const ring2Geo = new THREE.TorusGeometry(3.6, 0.03, 16, 100);
  const ring2Mesh = new THREE.Mesh(ring2Geo, neonCyanMaterial);
  ring2Mesh.rotation.x = Math.PI / 2.8;
  gyroGroup.add(ring2Mesh);
  meshes.push({ mesh: ring2Mesh, originalMat: neonCyanMaterial });

  const ring3Geo = new THREE.TorusGeometry(4.0, 0.02, 16, 100);
  const ring3Mesh = new THREE.Mesh(ring3Geo, chromeMaterial);
  ring3Mesh.rotation.y = Math.PI / 2.5;
  gyroGroup.add(ring3Mesh);
  meshes.push({ mesh: ring3Mesh, originalMat: chromeMaterial });

  // ==========================================
  // AMBIENT LUMINOUS PARTICLE AURA (FIRE EMBERS)
  // ==========================================
  // Dynamic particle scaling: 32 particles on budget Android/tier-2 mobile, 65 on desktop for peak 60fps
  const particleCount = isBudgetDevice ? 32 : 65;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleScales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 12;
    particlePositions[i + 1] = (Math.random() - 0.5) * 12;
    particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    particleScales[i / 3] = Math.random();
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xff5500,
    size: 0.08,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // ==========================================
  // CINEMATIC LIGHTING (FIRE FLAME & SOLAR GOLD)
  // ==========================================
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(5, 8, 5);
  scene.add(keyLight);

  // Radiant Fire Red Rim Light
  const limeRimLight = new THREE.PointLight(0xff1e00, 5.5, 16);
  limeRimLight.position.set(-4, 3, 3);
  scene.add(limeRimLight);

  // Molten Solar Gold Accent Light
  const cyanRimLight = new THREE.PointLight(0xff8800, 4.2, 16);
  cyanRimLight.position.set(4, -3, 3);
  scene.add(cyanRimLight);

  // Center Fire subtle core glow
  const centerGlow = new THREE.PointLight(0xff2a00, 2.5, 9);
  centerGlow.position.set(0, 0, 1);
  scene.add(centerGlow);

  // ==========================================
  // INTERACTIVITY & MOUSE PARALLAX
  // ==========================================
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0.25;
  let targetRotationY = -0.4;
  let isDragging = false;
  let previousMousePos = { x: 0, y: 0 };
  let spinVelocity = { x: 0, y: 0 };
  let isWireframe = false;
  let rotationSpeed = 1;

  window.addEventListener('mousemove', (e) => {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX = (e.clientX - windowHalfX) / windowHalfX;
    mouseY = (e.clientY - windowHalfY) / windowHalfY;
  }, { passive: true });

  // Scroll Reactivity: 3D apparatus rotates fluidly with page scroll
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const scrollDelta = (currentY - lastScrollY) * 0.003;
    targetRotationY += scrollDelta;
    lastScrollY = currentY;
  }, { passive: true });

  // Drag interaction on canvas
  renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePos.x;
    const deltaY = e.clientY - previousMousePos.y;

    spinVelocity.x = deltaX * 0.006;
    spinVelocity.y = deltaY * 0.006;

    targetRotationY += spinVelocity.x;
    targetRotationX += spinVelocity.y;

    previousMousePos = { x: e.clientX, y: e.clientY };
  }, { passive: true });

  // Touch Support (Smart vertical pass-through so page scroll never stutters on phone)
  let touchStartPos = { x: 0, y: 0 };
  let isHorizontalTouch = false;

  renderer.domElement.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      isHorizontalTouch = false;
      touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      previousMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
    isHorizontalTouch = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(currentX - touchStartPos.x);
    const diffY = Math.abs(currentY - touchStartPos.y);

    // If gesture is vertical, release dragging immediately to let phone smoothly scroll
    if (!isHorizontalTouch && diffY > diffX && diffY > 6) {
      isDragging = false;
      return;
    }
    if (diffX > diffY && diffX > 6) {
      isHorizontalTouch = true;
    }

    if (isHorizontalTouch) {
      const deltaX = currentX - previousMousePos.x;
      const deltaY = currentY - previousMousePos.y;
      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;
    }
    previousMousePos = { x: currentX, y: currentY };
  }, { passive: true });

  // Wireframe Mode Toggle
  const wireBtn = document.getElementById('toggle-wireframe-btn');
  if (wireBtn) {
    wireBtn.addEventListener('click', () => {
      isWireframe = !isWireframe;
      wireBtn.classList.toggle('active', isWireframe);
      wireBtn.textContent = isWireframe ? '⚡ WIREFRAME ON' : '⚡ CYBER WIRE';

      meshes.forEach(({ mesh, originalMat }) => {
        mesh.material = isWireframe ? wireframeMaterial : originalMat;
      });
    });
  }

  // Speed Toggle
  const speedBtn = document.getElementById('toggle-speed-btn');
  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      rotationSpeed = rotationSpeed === 1 ? 2.5 : 1;
      speedBtn.classList.toggle('active', rotationSpeed > 1);
      speedBtn.textContent = rotationSpeed > 1 ? '🚀 HYPER DRIVE' : '🔄 NORMAL ROTATION';
    });
  }

  // Reset Camera View
  const resetBtn = document.getElementById('reset-3d-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      targetRotationX = 0.25;
      targetRotationY = -0.4;
      mainRig.rotation.set(0.25, -0.4, 0);
    });
  }

  // ==========================================
  // ANIMATION LOOP (PAUSES WHEN OFF-SCREEN)
  // ==========================================
  const clock = new THREE.Clock();
  let isSceneVisible = true;
  let animFrameId = null;

  function animate() {
    if (!isSceneVisible) {
      animFrameId = null;
      return;
    }
    animFrameId = requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsedTime = clock.getElapsedTime();

    // Delta-timed smooth idle orbit (never slows down on scroll or frame drops)
    if (!isDragging) {
      targetRotationY += delta * 0.75 * rotationSpeed;
    }

    // Parallax influence from mouse
    const parallaxX = mouseX * 0.35;
    const parallaxY = mouseY * 0.25;

    // Smooth Euler damping with delta time
    const damping = Math.min(1, delta * 4.5);
    mainRig.rotation.y += (targetRotationY + parallaxX - mainRig.rotation.y) * damping;
    mainRig.rotation.x += (targetRotationX + parallaxY - mainRig.rotation.x) * damping;

    // Floating breathing bounce
    mainRig.position.y = Math.sin(elapsedTime * 1.5) * 0.15;

    // Gyro Rings individual rotations with delta time
    ring1Mesh.rotation.z += delta * 1.4 * rotationSpeed;
    ring2Mesh.rotation.y -= delta * 1.8 * rotationSpeed;
    ring3Mesh.rotation.x += delta * 1.0 * rotationSpeed;

    // Particle Drift
    particleSystem.rotation.y = elapsedTime * 0.03;
    particleSystem.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;

    // Light Pulsing
    const pulse = Math.sin(elapsedTime * 3) * 0.5 + 1;
    limeRimLight.intensity = 4.0 * pulse;
    cyanRimLight.intensity = 3.0 * (2 - pulse);

    renderer.render(scene, camera);
  }

  // Intersection Observer to stop render loop when scrolled away from Hero
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const wasVisible = isSceneVisible;
          isSceneVisible = entry.isIntersecting;
          if (isSceneVisible && !wasVisible && !animFrameId) {
            animFrameId = requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.02 }
    );
    heroObserver.observe(container);
  }

  animate();

  // Throttled Resize Handler
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    if (resizeTimeout) return;
    resizeTimeout = requestAnimationFrame(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      resizeTimeout = null;
    });
  }, { passive: true });

  } // End startScene

  // Fallback 2D Animated Canvas in case WebGL or Three.js fails or reduced-motion is requested
  function initFallbackCanvas(parent) {
    if (!parent) return;
    const canvas = document.createElement('canvas');
    const width = parent.clientWidth || 480;
    const height = parent.clientHeight || 420;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    parent.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    let animId = null;
    let isVisible = true;

    function render2d() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.save();
      ctx.translate(cx, cy);

      // Outer Fire Ring
      ctx.save();
      ctx.rotate(angle);
      ctx.strokeStyle = '#ff2a00';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff2a00';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(cx, cy) * 0.55, 0, Math.PI * 2);
      ctx.stroke();

      // Dashed Solar Orbit
      ctx.setLineDash([8, 12]);
      ctx.strokeStyle = '#ff7700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(cx, cy) * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Inner Counter-Rotating Hexagon
      ctx.save();
      ctx.rotate(-angle * 1.5);
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 14;
      const r = Math.min(cx, cy) * 0.35;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Central Brand Emblem Core
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 18px "Syne", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#ff2a00';
      ctx.shadowBlur = 12;
      ctx.fillText('FIRE FITNESS', 0, 0);

      ctx.restore();

      angle += 0.012;
      animId = requestAnimationFrame(render2d);
    }

    // Battery saver: pause when off-screen
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animId) {
            animId = requestAnimationFrame(render2d);
          } else if (!isVisible && animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        });
      }, { threshold: 0.05 });
      observer.observe(canvas);
    }

    render2d();
  }

  // Safe Initialization with defer script support
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startScene);
  } else {
    startScene();
  }
})();
