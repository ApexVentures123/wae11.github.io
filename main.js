// ==========================================
// 3D HERO MODEL INITIALIZATION (Three.js)
// ==========================================

function init3D() {
  const container = document.getElementById('hero-3d-container');
  if (!container || !window.THREE) {
    console.error("Three.js or container not found.");
    return;
  }

  // Prevent multiple initializations (duplicate canvases)
  if (container.children.length > 0) {
    container.innerHTML = '';
  }

  console.log("Initializing 3D Scene...");

  // 1. Scene Setup
  const scene = new THREE.Scene();

  // 2. Camera Setup
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 10; // Moved back to give the model plenty of room

  // 3. Renderer Setup
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  // Cap pixel ratio to 2 to prevent GPU crashes on high-DPI phones when 20k users load the 8k textures
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 4. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Lowered from 0.8
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Lowered from 1.2
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x2e8cff, 1.0, 50); // Lowered from 1.5
  pointLight.position.set(-5, -2, -5);
  scene.add(pointLight);

  // 5. Model Loading Variables
  let model;
  let cloudMesh;
  let outerGlobeGroup = new THREE.Group();
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  // 6. Loading Manager & Assets
  const manager = new THREE.LoadingManager();
  manager.onLoad = function () {
    console.log("All assets loaded! Triggering entrance animations...");
    // Slight delay to ensure the browser has rendered the initial canvas frame
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 100);
  };

  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log(`Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`);
  };

  console.log("Starting to load textures...");
  const textureLoader = new THREE.TextureLoader(manager);
  const earthMap = textureLoader.load('assets_3d/textures/8k_earth_daymap.jpg');
  const normalMap = textureLoader.load('assets_3d/textures/normal.jpg');
  const specMap = textureLoader.load('assets_3d/textures/specular.jpg');
  const cloudTex = textureLoader.load('assets_3d/textures/8k_earth_clouds.jpg');

  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthMap,
    normalMap: normalMap,
    specularMap: specMap,
    specular: new THREE.Color('grey'),
    shininess: 35
  });

  console.log("Starting to load OBJ model...");
  const objLoader = new THREE.OBJLoader(manager);
  objLoader.setPath('assets_3d/');
  
  objLoader.load('Earth.obj', function (object) {
    console.log("OBJ loaded successfully.");
    model = object;
    
    model.traverse(function(child) {
      if (child.isMesh) {
        child.material = earthMaterial;
      }
    });
    
    // AUTO-SCALE & AUTO-CENTER LOGIC
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      
      const targetSize = 5.5; 
      if(maxDim > 0) {
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);
      }
      
      // Recompute the center after scaling
      const scaledBox = new THREE.Box3().setFromObject(model);
      const center = scaledBox.getCenter(new THREE.Vector3());
      
      const visualCenterY = -2.2;
      
      // CREATE AN INNER PIVOT GROUP for the static 90-degree tilted state
      const innerGlobeGroup = new THREE.Group();
      
      // Shift model so its visual center is exactly at 0,0,0 INSIDE the inner group
      model.position.set(-center.x, -center.y, -center.z);
      innerGlobeGroup.add(model);
      
      // ADD SUBTLE CLOUD LAYER
      const cloudGeo = new THREE.SphereGeometry((targetSize / 2) * 1.015, 64, 64);
      const cloudMat = new THREE.MeshPhongMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
      });
      cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      
      // Clouds are naturally centered at 0,0,0 inside the inner group
      cloudMesh.position.set(0, 0, 0);
      innerGlobeGroup.add(cloudMesh);
      
      // 1. Maintain the previous face (spin around Y)
      innerGlobeGroup.rotation.y = 25 * (Math.PI / 180);
      
      // 2. Tilt the object from the front by 90 degrees (Z-axis rotation)
      innerGlobeGroup.rotation.z = -90 * (Math.PI / 180); 
      
      // Place the inner group into the outer group.
      // The outer group now considers this fully tilted visual as its "normal" (tilt 0) starting point.
      outerGlobeGroup.position.set(0, visualCenterY, 0);
      outerGlobeGroup.add(innerGlobeGroup);
      
      scene.add(outerGlobeGroup);
      
    }, 
    function (xhr) {
    }, 
    function (error) {
      console.error("An error happened loading the OBJ:", error);
    });

  // 7. Desktop mouse listeners (if any)

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  function updateCameraForMobile() {
    if (window.innerWidth <= 768) {
      camera.position.z = 21; 
      camera.position.y = -2.3; // Moved camera further down to lift the globe up more
    } else {
      camera.position.z = 10;
      camera.position.y = 0;
    }
  }
  
  // Set initial camera position
  updateCameraForMobile();

  window.addEventListener('resize', () => {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    updateCameraForMobile();
  });

  // 8. Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the entire object (treating current state as "normal") towards the right
    if (outerGlobeGroup) {
      outerGlobeGroup.rotation.y += 0.002;
    }
    
    renderer.render(scene, camera);
  }
  
  animate();
}

// ==========================================
// COUNTDOWN TIMER LOGIC
// ==========================================
function initCountdown() {
  const targetDate = new Date('November 8, 2026 00:00:00').getTime();
  
  // Main section countdown elements
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-minutes');
  const secsEl = document.getElementById('cd-seconds');
  
  // Hero mini countdown elements
  const heroDays = document.getElementById('hero-cd-days');
  const heroHours = document.getElementById('hero-cd-hours');
  const heroMins = document.getElementById('hero-cd-mins');
  const heroSecs = document.getElementById('hero-cd-secs');
  
  function updateTimer() {
    const now = new Date().getTime();
    const diff = targetDate - now;
    
    if (diff <= 0) {
      const zero = '00';
      if(daysEl) daysEl.textContent = zero;
      if(hoursEl) hoursEl.textContent = zero;
      if(minsEl) minsEl.textContent = zero;
      if(secsEl) secsEl.textContent = zero;
      if(heroDays) heroDays.textContent = zero;
      if(heroHours) heroHours.textContent = zero;
      if(heroMins) heroMins.textContent = zero;
      if(heroSecs) heroSecs.textContent = zero;
      return;
    }
    
    const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
    const hours = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    
    // Update main section
    if(daysEl) daysEl.textContent = days;
    if(hoursEl) hoursEl.textContent = hours;
    if(minsEl) minsEl.textContent = mins;
    if(secsEl) secsEl.textContent = secs;
    
    // Update hero mini countdown
    if(heroDays) heroDays.textContent = days;
    if(heroHours) heroHours.textContent = hours;
    if(heroMins) heroMins.textContent = mins;
    if(heroSecs) heroSecs.textContent = secs;
  }
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

// ==========================================
// INITIALIZE APP
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  init3D();
  initCountdown();
});
