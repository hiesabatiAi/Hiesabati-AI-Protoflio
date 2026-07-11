/* ==========================================================================
   HIESABATI AI — Luxury 3D Sculpture: Golden Torus Knot + Crystal Shards
   Champagne Gold · Liquid Metal Shader · Volumetric Light · Crystal Orbit
   ========================================================================== */

(function () {
  const canvas = document.getElementById("hero-orb-canvas");
  if (!canvas) return;

  const prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const scene = new THREE.Scene();
  const container = canvas.parentElement;

  const camera = new THREE.PerspectiveCamera(
    42,
    container.clientWidth / container.clientHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, 8.5);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  /* ─────────────────────────────────────────────
     LIGHTS — Champagne gold 3-point rig
  ───────────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0xfff8e8, 0.3));

  const goldKey = new THREE.PointLight(0xffd080, 6, 30);
  goldKey.position.set(4, 4, 5);
  scene.add(goldKey);

  const roseRim = new THREE.PointLight(0xff9cad, 3, 20);
  roseRim.position.set(-5, -2, 3);
  scene.add(roseRim);

  const cyanFill = new THREE.PointLight(0xa0d8ff, 2.5, 20);
  cyanFill.position.set(0, 5, -4);
  scene.add(cyanFill);

  const whiteCore = new THREE.PointLight(0xffffff, 2, 8);
  whiteCore.position.set(0, 0, 3);
  scene.add(whiteCore);

  const masterGroup = new THREE.Group();
  scene.add(masterGroup);

  /* ─────────────────────────────────────────────
     1. LIQUID GOLD TORUS KNOT — The Centerpiece
        Custom GLSL: Anisotropic metallic + Fresnel
        + animated colour swirl
  ───────────────────────────────────────────── */
  const torusVS = `
    varying vec3 vNormal;
    varying vec3 vViewPos;
    varying vec3 vWorldPos;
    varying vec2 vUv;
    uniform float uTime;

    // Value noise for subtle surface undulation
    float hash(vec3 p){ p=fract(p*vec3(443.897,397.297,491.187)); p+=dot(p.xyz,p.yzx+19.19); return fract(p.x*p.y*p.z); }
    float noise(vec3 p){
      vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }

    void main(){
      vNormal    = normalize(normalMatrix * normal);
      vUv        = uv;
      vec4 mv    = modelViewMatrix * vec4(position,1.);
      vViewPos   = -mv.xyz;
      vWorldPos  = (modelMatrix * vec4(position,1.)).xyz;

      // Micro surface ripple
      float ripple = noise(position * 3.0 + vec3(0., uTime * 0.4, uTime * 0.25)) * 0.04;
      vec3 displaced = position + normal * ripple;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.);
    }
  `;

  const torusFS = `
    varying vec3 vNormal;
    varying vec3 vViewPos;
    varying vec3 vWorldPos;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3  uMouseDir;

    // Layered noise for colour swirl
    float hash(vec3 p){ p=fract(p*vec3(443.897,397.297,491.187)); p+=dot(p.xyz,p.yzx+19.19); return fract(p.x*p.y*p.z); }
    float noise(vec3 p){
      vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }

    // Anisotropic highlight (Schlich GGX ward approx)
    float anisoHighlight(vec3 n, vec3 v, vec3 l, float rough){
      vec3 h = normalize(l+v);
      float NdH = max(dot(n,h),0.);
      float spec = pow(NdH, 1.0/(rough*rough+0.001));
      return spec;
    }

    void main(){
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewPos);

      // Fresnel — gold at rim, dark core
      float fr = pow(1. - max(dot(N,V),0.), 2.5);

      // Colour swirl — champagne gold ↔ rose gold ↔ platinum
      float swirl = noise(vWorldPos * 1.8 + vec3(uTime*0.18, uTime*0.12, 0.));
      vec3 champagne = vec3(0.90, 0.76, 0.46);   // #e6c276
      vec3 roseGold  = vec3(0.82, 0.60, 0.52);   // #d199.84
      vec3 platinum  = vec3(0.85, 0.85, 0.90);   // cool silver
      vec3 baseColor = mix(mix(champagne, roseGold, swirl), platinum, fr*0.4);

      // Light directions
      vec3 L1 = normalize(vec3( 4., 4., 5.));
      vec3 L2 = normalize(vec3(-5.,-2., 3.));

      // Diffuse
      float d1 = max(dot(N,L1),0.);
      float d2 = max(dot(N,L2),0.) * 0.5;
      vec3 diffuse = baseColor * (d1 + d2 + 0.12);

      // Primary specular — sharp gold flare
      float spec1 = anisoHighlight(N, V, L1, 0.08) * d1 * 1.8;
      float spec2 = anisoHighlight(N, V, L2, 0.14) * d2 * 0.9;
      vec3 specular = vec3(1.0,0.94,0.72)*spec1 + vec3(1.0,0.8,0.85)*spec2;

      // Environment rim glow
      vec3 rimColor = mix(vec3(0.72,0.54,0.28), vec3(0.6,0.8,1.0), fr);
      vec3 rim = rimColor * fr * 1.4;

      // Mouse glint
      float mouseGlint = max(dot(N, normalize(uMouseDir)), 0.);
      mouseGlint = pow(mouseGlint, 12.) * 1.2;
      vec3 glint = vec3(1.0,0.97,0.82) * mouseGlint;

      // Final composite
      vec3 col = diffuse + specular + rim + glint;

      // Subtle depth fog toward back
      float depth = (1.0 - gl_FragCoord.z) * 0.5 + 0.5;
      col = mix(col, col * 0.6, 1. - depth);

      float alpha = 0.92 + fr * 0.08;
      gl_FragColor = vec4(col, alpha);
    }
  `;

  const torusMat = new THREE.ShaderMaterial({
    vertexShader: torusVS,
    fragmentShader: torusFS,
    uniforms: {
      uTime:     { value: 0 },
      uMouseDir: { value: new THREE.Vector3(0.5, 0.5, 1) }
    },
    transparent: true,
    depthWrite: true,
  });

  // p=2, q=3 gives elegant interlocking loops — the mathematical "trefoil knot"
  const knotGeo = new THREE.TorusKnotGeometry(1.55, 0.42, 280, 32, 2, 3);
  const knotMesh = new THREE.Mesh(knotGeo, torusMat);
  masterGroup.add(knotMesh);

  /* ─────────────────────────────────────────────
     2. INNER GLOWING CORE — soft volumetric sphere
  ───────────────────────────────────────────── */
  const coreVS = `
    varying vec3 vNormal;
    varying vec3 vViewPos;
    void main(){
      vNormal  = normalize(normalMatrix * normal);
      vec4 mv  = modelViewMatrix * vec4(position,1.);
      vViewPos = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `;
  const coreFS = `
    varying vec3 vNormal;
    varying vec3 vViewPos;
    uniform float uTime;
    void main(){
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewPos);
      float fr = pow(1. - max(dot(N,V),0.),1.8);
      float pulse = 0.5 + 0.5*sin(uTime*1.4);
      vec3 col = mix(vec3(0.62,0.42,0.18), vec3(1.0,0.92,0.64), fr);
      col += vec3(0.3,0.2,0.05)*pulse*0.4;
      gl_FragColor = vec4(col, fr * 0.55);
    }
  `;
  const coreMat = new THREE.ShaderMaterial({
    vertexShader: coreVS,
    fragmentShader: coreFS,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  });
  const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(1.9, 32, 32), coreMat);
  masterGroup.add(coreMesh);

  /* ─────────────────────────────────────────────
     3. CRYSTAL SHARD RING — 12 faceted diamonds orbiting
  ───────────────────────────────────────────── */
  const shardGroup = new THREE.Group();
  masterGroup.add(shardGroup);

  const shardMat = new THREE.MeshPhongMaterial({
    color: 0xfff0cc,
    specular: 0xffffff,
    shininess: 300,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    reflectivity: 1,
  });

  const shardCount = 14;
  const shards = [];
  for (let i = 0; i < shardCount; i++) {
    // Use OctahedronGeometry as crystal diamond
    const size = 0.12 + Math.random() * 0.18;
    const geo = new THREE.OctahedronGeometry(size, 0);
    const mat = shardMat.clone();
    mat.color.setHSL(0.1 + Math.random() * 0.08, 0.6, 0.8); // gold to rose gold hue
    const mesh = new THREE.Mesh(geo, mat);

    const orbitR   = 2.4 + Math.random() * 0.7;
    const orbitSpd = (0.18 + Math.random() * 0.22) * (Math.random() < 0.5 ? 1 : -1);
    const phase    = (i / shardCount) * Math.PI * 2;
    const tilt     = (Math.random() - 0.5) * Math.PI;

    shards.push({ mesh, orbitR, orbitSpd, phase, tilt, spinX: Math.random(), spinY: Math.random() });
    shardGroup.add(mesh);
  }

  /* ─────────────────────────────────────────────
     4. GOLDEN DUST PARTICLES — 3 spiral arms
  ───────────────────────────────────────────── */
  function makeDustArm(count, armAngle, color) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const orbitData = [];
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const spread = 0.4;
      const r = 2.0 + t * 2.5 + (Math.random() - 0.5) * spread;
      const angle = armAngle + t * Math.PI * 2.5;
      const y = (Math.random() - 0.5) * 1.4;
      const speed = (0.008 + Math.random() * 0.012) * (Math.random() < 0.5 ? 1 : -1);
      orbitData.push({ r, angle, y, speed });
      pos[i*3]   = Math.cos(angle) * r;
      pos[i*3+1] = y;
      pos[i*3+2] = Math.sin(angle) * r;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color, size: 0.028, transparent: true, opacity: 0.75,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    return { cloud: new THREE.Points(geo, mat), orbitData };
  }

  const arm1 = makeDustArm(120, 0,             0xffd080); // gold
  const arm2 = makeDustArm(90,  Math.PI*2/3,   0xffb8c8); // rose
  const arm3 = makeDustArm(80,  Math.PI*4/3,   0xc8e8ff); // platinum
  [arm1, arm2, arm3].forEach(a => masterGroup.add(a.cloud));

  /* ─────────────────────────────────────────────
     5. OUTER RING — thin glowing torus halo
  ───────────────────────────────────────────── */
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xffd47a,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    wireframe: false,
    side: THREE.DoubleSide
  });
  const haloMesh = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.018, 8, 160), haloMat);
  haloMesh.rotation.x = Math.PI / 2;
  masterGroup.add(haloMesh);

  const halo2 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.01, 8, 160), haloMat.clone());
  halo2.rotation.x = Math.PI / 3;
  masterGroup.add(halo2);

  /* ─────────────────────────────────────────────
     MOUSE
  ───────────────────────────────────────────── */
  const mouse = { lx: 0, ly: 0, tx: 0, ty: 0 };
  const mouseDir = new THREE.Vector3(0.5, 0.5, 1);

  window.addEventListener('mousemove', e => {
    mouse.tx = (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  window.addEventListener('resize', () => {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  /* ─────────────────────────────────────────────
     ANIMATION LOOP
  ───────────────────────────────────────────── */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse
    mouse.lx += (mouse.tx - mouse.lx) * 0.05;
    mouse.ly += (mouse.ty - mouse.ly) * 0.05;

    // Master group: slow majestic auto-rotation + mouse tilt
    masterGroup.rotation.y = t * 0.08 + mouse.lx * 0.3;
    masterGroup.rotation.x = mouse.ly * 0.18;

    // Knot: gentle additional spin on its own axis
    knotMesh.rotation.z = t * 0.05;

    // Update shader uniforms
    torusMat.uniforms.uTime.value     = t;
    coreMat.uniforms.uTime.value      = t;
    mouseDir.set(mouse.lx, mouse.ly, 1).normalize();
    torusMat.uniforms.uMouseDir.value.lerp(mouseDir, 0.07);

    // Animate crystal shards
    shards.forEach(s => {
      s.phase += s.orbitSpd * 0.016;
      const cos = Math.cos(s.phase + t * 0.02);
      const sin = Math.sin(s.phase + t * 0.02);
      s.mesh.position.set(
        cos * s.orbitR,
        Math.sin(s.phase * 0.7 + s.tilt) * 0.9,
        sin * s.orbitR
      );
      s.mesh.rotation.x += s.spinX * 0.02;
      s.mesh.rotation.y += s.spinY * 0.025;
      // Pulsing opacity
      s.mesh.material.opacity = 0.4 + 0.35 * Math.abs(Math.sin(t * 0.6 + s.phase));
    });

    // Animate dust arms
    [arm1, arm2, arm3].forEach(a => {
      const pos = a.cloud.geometry.attributes.position.array;
      a.orbitData.forEach((d, i) => {
        d.angle += d.speed;
        pos[i*3]   = Math.cos(d.angle) * d.r;
        pos[i*3+1] = d.y + Math.sin(d.angle * 0.4 + t) * 0.08;
        pos[i*3+2] = Math.sin(d.angle) * d.r;
      });
      a.cloud.geometry.attributes.position.needsUpdate = true;
    });

    // Pulse halo rings
    haloMesh.material.opacity = 0.12 + 0.08 * Math.sin(t * 1.1);
    halo2.material.opacity    = 0.10 + 0.07 * Math.sin(t * 0.8 + 1);
    halo2.rotation.y          = t * 0.04;

    // Breathe the light
    goldKey.intensity = 5.5 + 1.5 * Math.sin(t * 0.9);
    roseRim.intensity = 2.5 + 1.0 * Math.sin(t * 0.7 + 1);

    renderer.render(scene, camera);
  }

  animate();
})();
