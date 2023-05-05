import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const galaxyParameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

let galaxyGeometry = null;
let galaxyMaterial = null;
let galaxy = null;

const galaxyGenerator = () => {
  if (galaxyGeometry !== null || galaxyMaterial !== null) {
    galaxyGeometry.dispose();
    galaxyMaterial.dispose();
    scene.remove(galaxy);
  }
  galaxyGeometry = new THREE.BufferGeometry();
  galaxyMaterial = new THREE.PointsMaterial({
    size: galaxyParameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });
  const positions = new Float32Array(galaxyParameters.count * 3);
  const colors = new Float32Array(galaxyParameters.count * 3);

  const insideColor = new THREE.Color(galaxyParameters.insideColor);
  const outsideColor = new THREE.Color(galaxyParameters.outsideColor);

  for (let i = 0; i < galaxyParameters.count; i++) {
    const x = i * 3;
    const radius = Math.random() * galaxyParameters.radius;
    const spinAngle = radius * galaxyParameters.spin;
    const brancheAngle =
      ((i % galaxyParameters.branches) / galaxyParameters.branches) *
      Math.PI *
      2;

    const mixedColor = insideColor.clone();
    mixedColor.lerp(outsideColor, radius / galaxyParameters.radius);

    const randomX =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParameters.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), galaxyParameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParameters.randomness *
      radius;
    positions[x] = Math.cos(brancheAngle + spinAngle) * radius + randomX;
    positions[x + 1] = randomY;
    positions[x + 2] = Math.sin(brancheAngle + spinAngle) * radius + randomZ;

    colors[x] = mixedColor.r;
    colors[x + 1] = mixedColor.g;
    colors[x + 2] = mixedColor.b;
  }
  galaxyGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  galaxyGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
  scene.add(galaxy);
};
galaxyGenerator();

gui
  .add(galaxyParameters, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(galaxyGenerator);
gui
  .add(galaxyParameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(galaxyGenerator);
gui
  .add(galaxyParameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(galaxyGenerator);
gui
  .add(galaxyParameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(galaxyGenerator);
gui
  .add(galaxyParameters, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(galaxyGenerator);
gui
  .add(galaxyParameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(galaxyGenerator);
gui
  .add(galaxyParameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(galaxyGenerator);
gui.addColor(galaxyParameters, "insideColor").onFinishChange(galaxyGenerator);
gui.addColor(galaxyParameters, "outsideColor").onFinishChange(galaxyGenerator);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
