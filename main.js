import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, dinosaur, controls;
let isUserInteracting = false; // Tiene traccia dell'interazione dell'utente
let inactivityTimer = null; // Timer per rilevare l'inattività
const INACTIVITY_DELAY = 2000; // 2 secondi di inattività prima di riprendere la rotazione

function init() {
    // Setup scena
    scene = new THREE.Scene();
    
    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Carica modello 3D
    const loader = new GLTFLoader();
    loader.load('assets/dinosuaro.glb', (gltf) => {
        dinosaur = gltf.scene;
        dinosaur.scale.set(1.5, 1.5, 1.5);
        dinosaur.position.y = 0;
        dinosaur.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });
        scene.add(dinosaur);
    });

    // Illuminazione
    setupLights();

    // Aggiungi OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = false;
    controls.enablePan = false;

    // Rileva interazione dell'utente
    controls.addEventListener('start', () => {
        isUserInteracting = true;
        clearTimeout(inactivityTimer); // Resetta il timer di inattività
    });

    controls.addEventListener('end', () => {
        isUserInteracting = false;
        // Avvia il timer di inattività
        inactivityTimer = setTimeout(() => {
            isUserInteracting = false; // Riprendi la rotazione automatica
        }, INACTIVITY_DELAY);
    });

    // Animazione
    animate();
}

function setupLights() {
    // Spotlight principale (tono caldo, meno intenso)
    const spotlight = new THREE.SpotLight(0xffddaa, 2);
    spotlight.position.set(5, 5, 5);
    spotlight.castShadow = true;
    spotlight.angle = Math.PI / 4;
    spotlight.penumbra = 1.0;
    spotlight.decay = 1;
    spotlight.distance = 50;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    scene.add(spotlight);

    // Luce ambientale (tono caldo, meno intenso)
    const ambientLight = new THREE.AmbientLight(0xfff4e6, 1.5);
    scene.add(ambientLight);

    // Luce direzionale complementare (tono caldo, meno intenso)
    const directionalLight = new THREE.DirectionalLight(0xffeebb, 0.8);
    directionalLight.position.set(-5, 5, 5);
    scene.add(directionalLight);
}

function animate() {
    requestAnimationFrame(animate);

    // Aggiorna i controlli (necessario per l'effetto di inerzia)
    controls.update();

    // Rotazione automatica se l'utente non sta interagendo
    if (dinosaur && !isUserInteracting) {
        dinosaur.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

// Gestione resize finestra
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();