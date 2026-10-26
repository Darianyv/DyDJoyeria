/* D&D Joyería · Visor 3D del banner (dos anillos entrelazados)
   Todo se dibuja con código usando Three.js: no necesitas archivos 3D ni Blender.
   Cada visor se activa con <div class="visor-3d" data-modelo="anillos"> */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ---------- Colores y materiales (cámbialos aquí) ---------- */
const ORO = 0xF9C633;

const matOro = (rugosidad = 0.16) => new THREE.MeshStandardMaterial({ color: ORO, metalness: 1, roughness: rugosidad, envMapIntensity: 1.3 });

/* ---------- MODELOS ---------- */
const MODELOS = {
    /* Dos anillos entrelazados */
    anillos: {
        ancho: 3.6, alto: 3.4, rotX: 0.25, rotY: 0.5,
        crear() {
            const raiz = new THREE.Group();
            const oro = matOro();

            const anilloA = new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 48, 140), oro);
            anilloA.position.x = -0.55;
            raiz.add(anilloA);

            const anilloB = new THREE.Mesh(new THREE.TorusGeometry(1, 0.09, 48, 140), oro);
            anilloB.position.x = 0.55;
            anilloB.rotation.x = Math.PI / 5;            // inclinación del segundo anillo
            raiz.add(anilloB);
            return { raiz };
        }
    }
};

document.querySelectorAll('.visor-3d').forEach(iniciar);

/* ---------- Visor genérico ---------- */
function iniciar(caja) {
    const def = MODELOS[caja.dataset.modelo];
    const canvas = caja.querySelector('canvas');
    if (!def || !canvas) return;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {            // Sin WebGL: se oculta el visor y el banner queda solo con el texto
        caja.hidden = true;
        return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const escena = new THREE.Scene();
    escena.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    const luz = new THREE.DirectionalLight(0xffffff, 1.2);
    luz.position.set(3, 4, 5);
    escena.add(luz);

    const camara = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const modelo = def.crear();
    escena.add(modelo.raiz);

    function ajustar() {
        const w = caja.clientWidth, h = caja.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camara.aspect = w / h;
        const t = Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
        camara.position.set(0, 0, Math.max((def.ancho / 2) / (t * camara.aspect), (def.alto / 2) / t));
        camara.updateProjectionMatrix();
    }
    new ResizeObserver(ajustar).observe(caja);
    ajustar();

    /* ---- Interacción: arrastrar para girar e inclinación con el mouse ---- */
    const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rotY = def.rotY, rotX = def.rotX, velY = 0, arrastrando = false;
    let ultX = 0, ultY = 0, inclX = 0, inclY = 0;

    canvas.addEventListener('pointerdown', e => {
        arrastrando = true;
        ultX = e.clientX; ultY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        canvas.classList.add('grabbing');
        caja.classList.add('is-touched');
    });
    canvas.addEventListener('pointermove', e => {
        if (arrastrando) {
            const dx = e.clientX - ultX, dy = e.clientY - ultY;
            velY = dx * 0.01;
            rotY += velY;
            rotX = THREE.MathUtils.clamp(rotX + dy * 0.005, -0.9, 0.9);
            ultX = e.clientX; ultY = e.clientY;
        } else if (e.pointerType === 'mouse') {
            const r = canvas.getBoundingClientRect();
            inclX = ((e.clientX - r.left) / r.width - 0.5) * 2;
            inclY = ((e.clientY - r.top) / r.height - 0.5) * 2;
        }
    });
    const soltar = () => { arrastrando = false; canvas.classList.remove('grabbing'); };
    canvas.addEventListener('pointerup', soltar);
    canvas.addEventListener('pointercancel', soltar);
    canvas.addEventListener('pointerleave', () => { inclX = 0; inclY = 0; });

    /* ---- Bucle: solo dibuja cuando este banner está visible ---- */
    const slide = caja.closest('.slide');
    let enPantalla = true;
    new IntersectionObserver(([en]) => { enPantalla = en.isIntersecting; }).observe(caja);

    function dibujar() {
        requestAnimationFrame(dibujar);
        if (!enPantalla || document.hidden || (slide && !slide.classList.contains('is-active'))) return;
        if (!arrastrando) {
            rotY += velY;
            velY *= 0.95;
            if (!sinMovimiento && Math.abs(velY) < 0.002) rotY += 0.004;   // giro suave en reposo
        }
        const r = modelo.raiz.rotation;
        r.y = rotY;
        r.x += (rotX + inclY * 0.12 - r.x) * 0.08;
        r.z += (-inclX * 0.08 - r.z) * 0.08;
        renderer.render(escena, camara);
    }
    dibujar();
}