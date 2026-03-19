import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

function initLoader(onHandoff) {
  return new Promise(resolve => {
    const counter = { val: 0 };
    const counterEl = document.querySelector('.loader-counter');
    const statusEl = document.querySelector('.loader-status');
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&";

    function scrambleText(element, finalString) {
      let iterations = 0;
      const interval = setInterval(() => {
        element.innerText = finalString.split("").map((letter, index) => {
          if (index < iterations) return finalString[index];
          return chars[Math.floor(Math.random() * 26)];
        }).join("");
        if (iterations >= finalString.length) clearInterval(interval);
        iterations += 1 / 2;
      }, 30);
    }

    const tl = gsap.timeline();
    
    gsap.to('.loader-grid', {
      y: "20%", rotateX: 50, scale: 1.5,
      duration: 3, ease: "none", repeat: -1, yoyo: true
    });

    tl.to(counter, {
      val: 100,
      duration: 3.5,
      ease: "power4.inOut",
      onUpdate: () => {
        const val = Math.floor(counter.val);
        if (counterEl) counterEl.innerText = val.toString().padStart(2, '0');
        if (statusEl) {
          if (val === 15) scrambleText(statusEl, "LOADING CORE...");
          if (val === 40) scrambleText(statusEl, "OPTIMIZING ASSETS...");
          if (val === 75) scrambleText(statusEl, "ESTABLISHING UPLINK...");
          if (val === 98) scrambleText(statusEl, "ACCESS GRANTED");
        }
      }
    });

    tl.to('.loader-line', { width: '100vw', duration: 3, ease: "expo.out" }, '<');

    tl.to('.loader-content', {
      filter: "blur(20px)",
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "power2.in"
    });

    tl.to('.acid-loader', {
      yPercent: -100,
      duration: 1.2,
      ease: "power4.inOut",
      onStart: () => {
        if (onHandoff) setTimeout(onHandoff, 100);
      },
      onComplete: resolve
    });
  });
}


function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  gsap.ticker.add(() => {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    gsap.set(cursor, { x: cx, y: cy });
    gsap.set(dot, { x: mx, y: my });
  });
  document.querySelectorAll('a, button, .hotspot').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}


function initLenis() {
  const lenis = new Lenis({ lerp: 0.08, smooth: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}


function initStars() {
  const field = document.getElementById('star-field');
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  field.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  let w, h;
  const setSize = () => { w = canvas.width = field.clientWidth; h = canvas.height = Math.max(field.clientHeight, window.innerHeight); };
  setSize();
  window.addEventListener('resize', setSize);

  const stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * w, 
    y: Math.random() * h,
    s: Math.random() * 1.5 + 0.5,
    a: Math.random() * Math.PI * 2,
    v: 0.02 + Math.random() * 0.03
  }));

  gsap.ticker.add(() => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    stars.forEach(st => {
      st.a += st.v;
      ctx.globalAlpha = 0.2 + Math.abs(Math.sin(st.a)) * 0.8;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.s, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}


function drawWireframeFish(canvasId, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
  const cx = W * 0.42, cy = H * 0.5, rx = W * 0.3, ry = H * 0.25;
  ctx.beginPath(); ctx.arc(cx - rx * 0.55, cy - ry * 0.1, 4, 0, Math.PI * 2); ctx.stroke();
}

function drawWireframeJellyfish(canvasId, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.65;
  const cx = W / 2, cy = H * 0.28, rx = W * 0.38, ry = H * 0.26;
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI; ctx.lineTo(cx + Math.cos(a) * rx, cy - Math.sin(a) * ry); }
  ctx.stroke();
  for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(cx - rx + (i * rx * 2 / 6), cy); ctx.bezierCurveTo(cx, cy - ry * 0.5, cx, cy - ry * 0.8, cx, cy - ry); ctx.stroke(); }
  for (let i = 0; i < 8; i++) {
    const tx = cx - rx * 0.78 + (i * rx * 1.56 / 7), tl = H * (0.3 + Math.random() * 0.35);
    ctx.beginPath(); ctx.moveTo(tx, cy);
    ctx.bezierCurveTo(tx + (Math.random() - 0.5) * 18, cy + tl * 0.35, tx + (Math.random() - 0.5) * 24, cy + tl * 0.7, tx + (Math.random() - 0.5) * 14, cy + tl);
    ctx.stroke();
  }
}

function drawWireframeAnglerfish(canvasId, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
  const cx = W * 0.45, cy = H * 0.52, rx = W * 0.33, ry = H * 0.3;
  const pts = [];
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2, w = 1 + 0.15 * Math.sin(a * 3 + 1.5); pts.push({ x: cx + Math.cos(a) * rx * w, y: cy + Math.sin(a) * ry * w }); }
  ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.closePath(); ctx.stroke();
  for (let i = 0; i < 18; i += 3) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(cx - rx * 0.2, cy - ry); ctx.bezierCurveTo(cx, cy - ry * 1.8, cx + rx * 0.6, cy - ry * 1.4, cx + rx * 0.5, cy - ry * 0.7); ctx.stroke();
  ctx.globalAlpha = 0.9; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cx + rx * 0.5, cy - ry * 0.7, 6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 0.6;
  ctx.beginPath(); ctx.moveTo(cx - rx, cy + ry * 0.1); ctx.lineTo(cx - rx * 1.15, cy - ry * 0.2);
  for (let t = 0; t <= 7; t++) { const ty = cy - ry * 0.2 + (t * ry * 0.45 / 7); ctx.lineTo(cx - rx * 1.15 + (t % 2 === 0 ? 6 : 18), ty); }
  ctx.stroke();
}

function initCreatures() {
  drawWireframeFish('fish-1', '#99eb1e');
  drawWireframeJellyfish('jellyfish-1', '#333333');
  drawWireframeFish('fish-2', '#7e7f9a');
  drawWireframeAnglerfish('anglerfish-1', '#99eb1e');
}


function animateCounter(el, target, duration = 2) {
  const obj = { val: 0 };
  gsap.to(obj, { val: target, duration, ease: 'power2.out', onUpdate: () => { el.textContent = Math.floor(obj.val).toLocaleString(); } });
}


function initGlobe() {
  const container = document.getElementById('globe-container');
  if (!container) return;

  const W = container.clientWidth || 600;
  const H = container.clientHeight || 600;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
  camera.position.z = 2.8;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
  const sphereMat = new THREE.MeshPhongMaterial({
    color: 0x020c1a,
    emissive: 0x000a14,
    emissiveIntensity: 0.5,
    shininess: 30,
    transparent: true,
    opacity: 0.95
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphere);

  const wireGeo = new THREE.SphereGeometry(1.002, 32, 32);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x99eb1e, wireframe: true, transparent: true, opacity: 0.04 });
  scene.add(new THREE.Mesh(wireGeo, wireMat));

  const atmGeo = new THREE.SphereGeometry(1.12, 64, 64);
  const atmMat = new THREE.MeshBasicMaterial({ color: 0x99eb1e, transparent: true, opacity: 0.06, side: THREE.BackSide });
  scene.add(new THREE.Mesh(atmGeo, atmMat));


  const ambient = new THREE.AmbientLight(0x020612, 1.8);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0x99eb1e, 0.8);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);
  const dirLight2 = new THREE.DirectionalLight(0x333333, 0.4);
  dirLight2.position.set(-5, -2, -3);
  scene.add(dirLight2);


  function latLngToVec3(lat, lng, r = 1.02) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  function createArc(startLat, startLng, endLat, endLng, color, segments = 60) {
    const start = latLngToVec3(startLat, startLng);
    const end = latLngToVec3(endLat, endLng);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const altitude = 1 + start.distanceTo(end) * 0.4;
    mid.normalize().multiplyScalar(altitude);

    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = new THREE.Vector3()
        .addScaledVector(start, (1 - t) * (1 - t))
        .addScaledVector(mid, 2 * (1 - t) * t)
        .addScaledVector(end, t * t);
      points.push(p);
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 });
    return new THREE.Line(geo, mat);
  }

  function createPoint(lat, lng, color) {
    const pos = latLngToVec3(lat, lng, 1.025);
    const geo = new THREE.SphereGeometry(0.012, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    return mesh;
  }

  const cables = [
    [40.7, -74.0, 51.5, -0.1, 0x99eb1e],
    [38.7, -9.1, 25.8, -80.2, 0x99eb1e],
    [51.5, -0.1, 38.7, -9.1, 0x99eb1e],
    [40.7, -74.0, -23.5, -46.6, 0x99eb1e],
    [37.8, -122.4, 35.7, 139.7, 0x333333],
    [32.1, -117.1, 1.3, 103.8, 0x333333],
    [35.7, 139.7, 22.3, 114.2, 0x333333],
    [22.3, 114.2, 1.3, 103.8, 0x333333],
    [37.8, -122.4, -33.9, 151.2, 0x333333],
    [35.7, 139.7, -33.9, 151.2, 0x333333],
    [51.5, -0.1, 25.2, 55.3, 0x99eb1e],
    [25.2, 55.3, 1.3, 103.8, 0x99eb1e],
    [13.1, 80.3, 1.3, 103.8, 0x99eb1e],
    [19.1, 72.9, -33.9, 18.4, 0x7e7f9a],
    [51.5, -0.1, -33.9, 18.4, 0x7e7f9a],
    [-33.9, 18.4, -23.5, -46.6, 0x7e7f9a],
    [-33.9, 151.2, 1.3, 103.8, 0x7e7f9a],
    [-23.5, -46.6, 38.7, -9.1, 0x333333],
    [1.3, 103.8, 13.1, 80.3, 0x333333],
    [13.1, 80.3, 25.2, 55.3, 0x99eb1e],
  ];

  const cities = [
    [40.7, -74.0, 0x99eb1e, 'New York'], [51.5, -0.1, 0x99eb1e, 'London'],
    [38.7, -9.1, 0x99eb1e, 'Lisbon'], [25.8, -80.2, 0x99eb1e, 'Miami'],
    [37.8, -122.4, 0x333333, 'San Francisco'], [35.7, 139.7, 0x333333, 'Tokyo'],
    [22.3, 114.2, 0x333333, 'Hong Kong'], [1.3, 103.8, 0x333333, 'Singapore'],
    [-33.9, 151.2, 0x7e7f9a, 'Sydney'], [-33.9, 18.4, 0x7e7f9a, 'Cape Town'],
    [-23.5, -46.6, 0x7e7f9a, 'São Paulo'], [25.2, 55.3, 0x99eb1e, 'Dubai'],
    [13.1, 80.3, 0x99eb1e, 'Chennai'], [19.1, 72.9, 0x7e7f9a, 'Mumbai'],
  ];

  cables.forEach(([sLat, sLng, eLat, eLng, col]) => {
    const arc = createArc(sLat, sLng, eLat, eLng, col);
    scene.add(arc);
  });

  cities.forEach(([lat, lng, col]) => {
    scene.add(createPoint(lat, lng, col));
  });

  const pulseRings = [];
  cities.forEach(([lat, lng, col]) => {
    const pos = latLngToVec3(lat, lng, 1.03);
    const geo = new THREE.RingGeometry(0.012, 0.025, 16);
    const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.copy(pos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    ring.userData = { baseScale: 1, phase: Math.random() * Math.PI * 2 };
    scene.add(ring);
    pulseRings.push(ring);
  });

  let isDragging = false, prevMouse = { x: 0, y: 0 };
  let rotX = 0, rotY = 0, velX = 0, velY = 0;

  const dom = renderer.domElement;
  dom.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
  dom.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x, dy = e.clientY - prevMouse.y;
    velX = dy * 0.003; velY = dx * 0.003;
    rotX += velX; rotY += velY;
    prevMouse = { x: e.clientX, y: e.clientY };
  });
  dom.addEventListener('mouseup', () => { isDragging = false; });
  dom.addEventListener('mouseleave', () => { isDragging = false; });

  let lastTouch = null;
  dom.addEventListener('touchstart', e => { lastTouch = e.touches[0]; });
  dom.addEventListener('touchmove', e => {
    if (!lastTouch) return;
    const dx = e.touches[0].clientX - lastTouch.clientX;
    const dy = e.touches[0].clientY - lastTouch.clientY;
    velY = dx * 0.003; velX = dy * 0.003;
    rotX += velX; rotY += velY;
    lastTouch = e.touches[0];
  });

  function onResize() {
    const nW = container.clientWidth, nH = container.clientHeight;
    camera.aspect = nW / nH; camera.updateProjectionMatrix();
    renderer.setSize(nW, nH);
  }
  window.addEventListener('resize', onResize);

  let globeVisible = false;
  ScrollTrigger.create({
    trigger: '#globe-section',
    start: 'top 80%',
    once: true,
    onEnter: () => { globeVisible = true; dom.style.opacity = '0'; dom.style.transition = 'opacity 1s ease'; setTimeout(() => dom.style.opacity = '1', 100); }
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!isDragging) {
      velX *= 0.95; velY *= 0.95;
      rotY += 0.0015; 
    }
    rotX += (velX - rotX) * 0;
    sphere.rotation.x = rotX;
    sphere.rotation.y += velY + (isDragging ? 0 : 0.0015);
    scene.children.forEach(c => {
      if (c !== sphere && c.type !== 'AmbientLight' && c.type !== 'DirectionalLight') {
        c.rotation.x = sphere.rotation.x;
        c.rotation.y = sphere.rotation.y;
      }
    });


    pulseRings.forEach((ring, i) => {
      const phase = ring.userData.phase;
      const s = 1 + 0.4 * Math.abs(Math.sin(t * 1.5 + phase));
      ring.scale.setScalar(s);
      ring.material.opacity = 0.8 - 0.5 * Math.abs(Math.sin(t * 1.5 + phase));
    });

    renderer.render(scene, camera);
  }
  animate();
}


function initAnimations() {

  gsap.set('.hero-subtitle', { y: '100%' });
  gsap.set(['.outro-title', '.outro-body', '.outro-cta-row'], { y: 40 });
  gsap.set('.truth-eyebrow', { y: 20 });

  const heroTl = gsap.timeline({ paused: true });
  heroTl
    .to('.hero-eyebrow', { opacity: 1, duration: 0.8, ease: 'power2.out' })
    .fromTo('.hero-title .line', { y: '110%', skewY: 5 }, { y: '0%', skewY: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }, '-=0.5')
    .to('.hero-subtitle', { y: '0%', duration: 0.8, ease: 'expo.out' }, '-=0.6')
    .to('.stat-item', { opacity: 1, duration: 0.5, stagger: 0.12, ease: 'power2.out' }, '-=0.4')
    .to('.scroll-cue', { opacity: 1, duration: 0.5 }, '-=0.2');

  document.querySelectorAll('.stat-num').forEach(el => {
    ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => animateCounter(el, parseInt(el.dataset.val, 10)) });
  });


  const gauge = document.querySelector('.depth-gauge');
  const depthVal = document.getElementById('depth-value');
  const depthBar = document.getElementById('depth-bar');
  ScrollTrigger.create({
    trigger: '#descent', start: 'top 90%', end: 'bottom 10%',
    onToggle: self => gauge.classList.toggle('visible', self.isActive),
    onUpdate: self => {
      depthVal.innerHTML = `${Math.floor(self.progress * 11000).toLocaleString()}<span>M</span>`;
      depthBar.style.height = (self.progress * 100) + '%';
    }
  });


  const pContainer = document.getElementById('particles-container');
  if (pContainer) {
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 3 + 1;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      pContainer.appendChild(p);
      gsap.to(p, {
        y: -window.innerHeight * (0.8 + Math.random()),
        ease: 'none',
        scrollTrigger: { trigger: '#descent', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  }


  const fibers = document.querySelectorAll('#cable-casing, .fiber-line, .fiber-glow');
  fibers.forEach(path => {
    const len = path.getTotalLength() || 6500;
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    ScrollTrigger.create({
      trigger: '#descent', start: 'top center', end: 'bottom center', scrub: true,
      onUpdate: self => path.style.strokeDashoffset = len * (1 - self.progress)
    });
  });


  const pulseFiber = document.querySelector('.pulse-fiber');
  if (pulseFiber) {
    gsap.to(pulseFiber, { strokeDashoffset: -2000, duration: 40, ease: 'none', repeat: -1 });
  }


  document.querySelectorAll('.creature').forEach((creature, i) => {
    const speed = parseFloat(creature.dataset.speed) || 0.3;
    ScrollTrigger.create({
      trigger: creature, start: 'top bottom', once: true,
      onEnter: () => {
        gsap.to(creature, { opacity: 0.9, duration: 1.5, delay: i * 0.2, ease: 'power2.out' });
        gsap.to(creature, { y: `+=${20 + i * 8}`, duration: 3 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.4 });
      }
    });
    ScrollTrigger.create({
      trigger: '#descent', start: 'top bottom', end: 'bottom top', scrub: true,
      onUpdate: self => gsap.set(creature, { y: (self.progress - 0.5) * 400 * speed })
    });
  });


  const hotspots = document.querySelectorAll('.hotspot');
  hotspots.forEach((hs, i) => {
    const line = hs.querySelector('.hotspot-line');
    const card = hs.querySelector('.inline-card');
    const content = card.querySelectorAll(':scope > *');
    const pulse = hs.querySelector('.hotspot-pulse');
    const isLeft = hs.classList.contains('left-aligned');
    gsap.set(hs, { opacity: 1 });
    gsap.set(pulse, { scale: 0, opacity: 0 });
    gsap.set(line, { width: 0 });
    const clipStart = isLeft 
      ? 'polygon(100% 50%, 100% 50%, 100% 50%, 100% 50%, 100% 50%, 100% 50%)' 
      : 'polygon(0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%)';
    const clipEnd = 'polygon(0% 5%, 5% 0%, 100% 0%, 100% 95%, 95% 100%, 0% 100%)';
    
    gsap.set(card, { autoAlpha: 0, clipPath: clipStart });
    gsap.set(content, { autoAlpha: 0, y: 15 });

    const tl = gsap.timeline({ paused: true });

    tl.to(pulse, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' })
      .to(line, { width: 80, duration: 0.4, ease: 'expo.inOut' }, '-=0.1')
      .to(card, { autoAlpha: 1, duration: 0.05 }, '-=0.1')
      .to(card, { clipPath: clipEnd, duration: 0.5, ease: 'power4.out' }, '<')
      .to(content, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }, '-=0.3');

    ScrollTrigger.create({
      trigger: hs,
      start: 'top 55%',
      end: 'bottom 10%',
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
      onLeave: () => gsap.to(hs, { opacity: 0, y: -30, duration: 0.5 }),
      onEnterBack: () => gsap.to(hs, { opacity: 1, y: 0, duration: 0.5, onComplete: () => tl.play() })
    });
  });


  ScrollTrigger.create({
    trigger: '#truth', start: 'top 65%', once: true,
    onEnter: () => {
      gsap.to('.truth-eyebrow', { opacity: 1, y: 0, duration: 0.6 });
      gsap.to('.reveal-word', { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out', delay: 0.2 });
      gsap.to('.truth-col', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.6 });
    }
  });


  ScrollTrigger.create({
    trigger: '#globe-section', start: 'top 70%', once: true,
    onEnter: () => {
      gsap.to('.globe-eyebrow', { opacity: 1, duration: 0.5 });
      gsap.to('.globe-title', { opacity: 1, duration: 0.6, delay: 0.2 });
      gsap.to('.globe-sub', { opacity: 1, duration: 0.6, delay: 0.4 });
      gsap.to('.globe-legend', { opacity: 1, duration: 0.6, delay: 0.8 });
    }
  });


  ScrollTrigger.create({
    trigger: '#outro', start: 'top 70%', once: true,
    onEnter: () => {
      gsap.timeline()
        .to('.outro-title', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to('.outro-body', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .to('.outro-cta-row', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .to('.outro-credit', { opacity: 1, duration: 0.6 }, '-=0.3');
    }
  });

  return heroTl;
}


async function main() {
  initCursor();
  initStars();
  initCreatures();
  const lenis = initLenis();
  initGlobe();
  ScrollTrigger.refresh();
  const introTl = initAnimations();
  await initLoader(() => {
    if (introTl) introTl.play();
  });
}

main();
