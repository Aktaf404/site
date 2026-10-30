import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class CyberpunkMiniPCScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Current Active Model ('reactor' or 'minipc')
        this.activeModel = 'reactor';

        // Mini PC 3D Elements
        this.pcChassis = null;
        this.cpuCore = null;
        this.cpuLight = null;
        this.fanBlades = null;
        this.ramSticks = [];
        this.corePillars = [];

        // Cyberpunk Fusion Reactor 3D Elements
        this.reactorGroup = null;
        this.reactorCore = null;
        this.reactorCoreWire = null;
        this.reactorLight = null;
        this.gimbalRings = [];
        this.plasmaParticles = null;
        this.overdriveBursts = [];

        // Shared Environment Elements
        this.hologramRings = [];
        this.ambientParticles = null;

        // State & Dynamic Values
        this.autoRotate = true;
        this.fanSpeed = 0.05;
        this.targetFanSpeed = 0.05;
        this.cpuPulseSpeed = 2;
        this.reactorSpinSpeed = 1.0;
        this.isOverload = false;
        this.currentMetrics = null;

        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050811, 0.035);

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 4.2, 7.5);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.25;
        this.container.appendChild(this.renderer.domElement);

        // 4. Orbit Controls (Optimized for Android Touch)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
        this.controls.minDistance = 3.5;
        this.controls.maxDistance = 14;
        this.controls.autoRotate = this.autoRotate;
        this.controls.autoRotateSpeed = 1.2;

        // 5. Lighting
        this.setupLighting();

        // 6. 3D Elements
        this.createFloorGrid();
        this.createMiniPCModel();
        this.createFusionReactorModel();
        this.createHoloRings();
        this.createAmbientParticles();

        // Initial model visibility
        this.applyModelVisibility();

        // 7. Event Listeners
        window.addEventListener('resize', () => this.onWindowResize());

        // 8. Start Loop
        this.animate();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x101a2e, 1.6);
        this.scene.add(ambientLight);

        // Neon Cyan key light
        const cyanLight = new THREE.PointLight(0x00f0ff, 3.2, 20);
        cyanLight.position.set(4, 5, 4);
        this.scene.add(cyanLight);

        // Neon Magenta rim light
        const magentaLight = new THREE.PointLight(0xff0055, 2.5, 20);
        magentaLight.position.set(-4, 3, -4);
        this.scene.add(magentaLight);

        // Underglow light
        const underglow = new THREE.PointLight(0x00f0ff, 1.8, 8);
        underglow.position.set(0, -0.4, 0);
        this.scene.add(underglow);
    }

    createFloorGrid() {
        const gridHelper = new THREE.GridHelper(30, 40, 0x00f0ff, 0x0a243e);
        gridHelper.position.y = -1.2;
        this.scene.add(gridHelper);
    }

    // ==========================================
    // 1. MINI PC MODEL (Original Object)
    // ==========================================
    createMiniPCModel() {
        this.pcChassis = new THREE.Group();

        // Chassis Outer Box
        const caseGeo = new THREE.BoxGeometry(3.6, 1.2, 3.6);
        const caseMat = new THREE.MeshPhysicalMaterial({
            color: 0x07111e,
            transparent: true,
            opacity: 0.7,
            roughness: 0.2,
            metalness: 0.8,
            clearcoat: 0.8,
            transmission: 0.5
        });
        const caseMesh = new THREE.Mesh(caseGeo, caseMat);
        this.pcChassis.add(caseMesh);

        // Chassis Wireframe Edges
        const edgesGeo = new THREE.EdgesGeometry(caseGeo);
        const edgesMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 1.5 });
        const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
        this.pcChassis.add(wireframe);

        // Motherboard PCB
        const pcbGeo = new THREE.BoxGeometry(3.3, 0.08, 3.3);
        const pcbMat = new THREE.MeshStandardMaterial({
            color: 0x02131b,
            roughness: 0.5,
            metalness: 0.4
        });
        const pcb = new THREE.Mesh(pcbGeo, pcbMat);
        pcb.position.y = -0.3;
        this.pcChassis.add(pcb);

        // Central CPU Die
        const cpuGeo = new THREE.BoxGeometry(1.0, 0.15, 1.0);
        const cpuMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.9
        });
        this.cpuCore = new THREE.Mesh(cpuGeo, cpuMat);
        this.cpuCore.position.set(0, -0.18, 0);
        this.pcChassis.add(this.cpuCore);

        // CPU Core pulsating pointlight
        this.cpuLight = new THREE.PointLight(0x00f0ff, 2, 4);
        this.cpuLight.position.set(0, 0.2, 0);
        this.pcChassis.add(this.cpuLight);

        // CPU Fan on top of CPU
        this.createFan();

        // RAM Sticks
        this.createRAMSticks();

        // 3D Core Load Pillars
        this.createCorePillars(4);

        this.scene.add(this.pcChassis);
    }

    createFan() {
        const fanGroup = new THREE.Group();
        fanGroup.position.set(0, 0.1, 0);

        const hubGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16);
        const hubMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
        const hub = new THREE.Mesh(hubGeo, hubMat);
        fanGroup.add(hub);

        this.fanBlades = new THREE.Group();
        const bladeGeo = new THREE.BoxGeometry(0.12, 0.02, 0.5);
        const bladeMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.85
        });

        for (let i = 0; i < 7; i++) {
            const blade = new THREE.Mesh(bladeGeo, bladeMat);
            blade.rotation.y = (i * Math.PI * 2) / 7;
            blade.position.set(Math.sin((i * Math.PI * 2) / 7) * 0.28, 0, Math.cos((i * Math.PI * 2) / 7) * 0.28);
            blade.rotation.z = 0.35;
            this.fanBlades.add(blade);
        }
        fanGroup.add(this.fanBlades);
        this.pcChassis.add(fanGroup);
    }

    createRAMSticks() {
        this.ramSticks = [];
        const ramOffsets = [0.9, 1.15];
        for (let i = 0; i < 2; i++) {
            const ramGeo = new THREE.BoxGeometry(0.1, 0.5, 1.4);
            const ramMat = new THREE.MeshStandardMaterial({
                color: 0x00f0ff,
                emissive: 0x00f0ff,
                emissiveIntensity: 0.3,
                metalness: 0.7
            });
            const ram = new THREE.Mesh(ramGeo, ramMat);
            ram.position.set(ramOffsets[i], 0, 0);
            this.pcChassis.add(ram);
            this.ramSticks.push(ram);
        }
    }

    createCorePillars(numCores = 4) {
        this.corePillars.forEach(p => this.pcChassis.remove(p));
        this.corePillars = [];

        const startX = -1.2;
        const spacing = 0.35;

        for (let i = 0; i < numCores; i++) {
            const geo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
            const mat = new THREE.MeshStandardMaterial({
                color: 0x00f0ff,
                emissive: 0x00f0ff,
                emissiveIntensity: 0.4,
                roughness: 0.3,
                metalness: 0.6
            });
            const pillar = new THREE.Mesh(geo, mat);
            pillar.position.set(startX, 0.1, -0.6 + (i * spacing));
            pillar.scale.set(1, 0.2, 1);
            this.pcChassis.add(pillar);
            this.corePillars.push(pillar);
        }
    }

    // ==========================================
    // 2. CYBERPUNK FUSION REACTOR (New Object)
    // ==========================================
    createFusionReactorModel() {
        this.reactorGroup = new THREE.Group();

        // 1. Magnetic Containment Pedestal Base
        const baseGeo = new THREE.CylinderGeometry(2.0, 2.4, 0.4, 8);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x050d1a,
            roughness: 0.3,
            metalness: 0.85
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -0.9;
        this.reactorGroup.add(base);

        // Pedestal Wireframe Ring
        const baseEdge = new THREE.LineSegments(
            new THREE.EdgesGeometry(baseGeo),
            new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 })
        );
        baseEdge.position.y = -0.9;
        this.reactorGroup.add(baseEdge);

        // 4 Magnetic Coils around base
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const coilGeo = new THREE.BoxGeometry(0.3, 0.7, 0.3);
            const coilMat = new THREE.MeshStandardMaterial({
                color: 0x0c2033,
                emissive: 0x00f0ff,
                emissiveIntensity: 0.6
            });
            const coil = new THREE.Mesh(coilGeo, coilMat);
            coil.position.set(Math.cos(angle) * 1.6, -0.5, Math.sin(angle) * 1.6);
            this.reactorGroup.add(coil);
        }

        // 2. Central Fusion Plasma Core (Icosahedron + Glowing Core)
        const coreGeo = new THREE.IcosahedronGeometry(0.9, 2);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 1.0,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.85
        });
        this.reactorCore = new THREE.Mesh(coreGeo, coreMat);
        this.reactorCore.position.set(0, 0.2, 0);
        this.reactorGroup.add(this.reactorCore);

        // Outer Wireframe Shield for Core
        const wireGeo = new THREE.IcosahedronGeometry(1.15, 1);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.45
        });
        this.reactorCoreWire = new THREE.Mesh(wireGeo, wireMat);
        this.reactorCoreWire.position.set(0, 0.2, 0);
        this.reactorGroup.add(this.reactorCoreWire);

        // Intense Core PointLight
        this.reactorLight = new THREE.PointLight(0x00f0ff, 3.5, 8);
        this.reactorLight.position.set(0, 0.2, 0);
        this.reactorGroup.add(this.reactorLight);

        // 3. Gyroscopic Magnetic Rings (Gimbal Rings)
        this.gimbalRings = [];
        const ringSpecs = [
            { radius: 1.6, tube: 0.05, speedX: 0.02, speedY: 0.015, color: 0x00f0ff },
            { radius: 2.0, tube: 0.04, speedX: -0.015, speedY: 0.025, color: 0xffaa00 },
            { radius: 2.4, tube: 0.03, speedX: 0.01, speedY: -0.02, color: 0xff0055 }
        ];

        ringSpecs.forEach(spec => {
            const rGeo = new THREE.TorusGeometry(spec.radius, spec.tube, 8, 48);
            const rMat = new THREE.MeshStandardMaterial({
                color: spec.color,
                emissive: spec.color,
                emissiveIntensity: 0.8,
                metalness: 0.9,
                roughness: 0.2
            });
            const ringMesh = new THREE.Mesh(rGeo, rMat);
            ringMesh.position.set(0, 0.2, 0);
            this.reactorGroup.add(ringMesh);
            this.gimbalRings.push({ mesh: ringMesh, spec });
        });

        // 4. Orbiting Plasma Vortex Swarm
        const pCount = 120;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount * 3; i += 3) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 1.2 + Math.random() * 0.9;
            pPos[i] = Math.cos(angle) * dist;
            pPos[i + 1] = 0.2 + (Math.random() - 0.5) * 1.2;
            pPos[i + 2] = Math.sin(angle) * dist;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({
            color: 0x00f0ff,
            size: 0.09,
            transparent: true,
            opacity: 0.85
        });
        this.plasmaParticles = new THREE.Points(pGeo, pMat);
        this.reactorGroup.add(this.plasmaParticles);

        this.scene.add(this.reactorGroup);
    }

    // Toggle between 'reactor' and 'minipc'
    switchModel(name) {
        if (name) {
            this.activeModel = name;
        } else {
            this.activeModel = this.activeModel === 'reactor' ? 'minipc' : 'reactor';
        }
        this.applyModelVisibility();
        return this.activeModel;
    }

    applyModelVisibility() {
        if (this.pcChassis) {
            this.pcChassis.visible = (this.activeModel === 'minipc');
        }
        if (this.reactorGroup) {
            this.reactorGroup.visible = (this.activeModel === 'reactor');
        }
    }

    createHoloRings() {
        const ringConfigs = [
            { radius: 2.8, tube: 0.015, color: 0x00f0ff, rotSpeed: 0.005, axis: 'y' },
            { radius: 3.2, tube: 0.012, color: 0xff0055, rotSpeed: -0.008, axis: 'x' },
            { radius: 3.6, tube: 0.010, color: 0x00ff66, rotSpeed: 0.004, axis: 'z' }
        ];

        ringConfigs.forEach(cfg => {
            const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 8, 64);
            const mat = new THREE.MeshBasicMaterial({
                color: cfg.color,
                transparent: true,
                opacity: 0.5,
                wireframe: true
            });
            const ring = new THREE.Mesh(geo, mat);
            ring.rotation.x = Math.random() * Math.PI;
            ring.rotation.y = Math.random() * Math.PI;
            this.scene.add(ring);
            this.hologramRings.push({ mesh: ring, cfg });
        });
    }

    createAmbientParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 16;
            positions[i + 1] = Math.random() * 8 - 1;
            positions[i + 2] = (Math.random() - 0.5) * 16;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x00f0ff,
            size: 0.05,
            transparent: true,
            opacity: 0.5
        });

        this.ambientParticles = new THREE.Points(geometry, material);
        this.scene.add(this.ambientParticles);
    }

    // Called when WebSocket pushes new metrics
    updateMetrics(metrics) {
        if (!metrics) return;
        this.currentMetrics = metrics;

        const cpuLoad = metrics.cpu?.totalLoad || 0;
        const temp = metrics.temperature?.main || 45;
        const netRx = metrics.network?.rx_kBps || 0;
        const netTx = metrics.network?.tx_kBps || 0;
        const totalNet = netRx + netTx;

        // Is overload condition?
        this.isOverload = (cpuLoad >= 75 || temp >= 70);

        // Base color shift (Cyan -> Amber -> Magenta/Red)
        let coreColorHex = 0x00f0ff;
        if (this.isOverload) {
            coreColorHex = 0xff0055; // Fierce Cyberpunk Red
        } else if (temp > 58 || cpuLoad > 45) {
            coreColorHex = 0xffaa00; // Neon Amber
        }

        // 1. REACTION FOR FUSION REACTOR
        // Spin speed accelerates with network traffic and CPU
        this.reactorSpinSpeed = 1.0 + Math.min(5.0, (totalNet / 250) + (cpuLoad / 30));

        if (this.reactorCore && this.reactorCoreWire && this.reactorLight) {
            this.reactorCore.material.emissive.setHex(coreColorHex);
            this.reactorCore.material.color.setHex(coreColorHex);
            this.reactorCoreWire.material.color.setHex(coreColorHex);
            this.reactorLight.color.setHex(coreColorHex);

            // Scale core slightly with load
            const coreScale = 1.0 + (cpuLoad / 100) * 0.35;
            this.reactorCore.scale.set(coreScale, coreScale, coreScale);

            // Overload particles color
            if (this.plasmaParticles) {
                this.plasmaParticles.material.color.setHex(this.isOverload ? 0xff0055 : (totalNet > 100 ? 0xffaa00 : 0x00f0ff));
            }
        }

        // 2. REACTION FOR MINI PC
        this.targetFanSpeed = 0.04 + Math.max(0, (temp - 35) / 50) * 0.35;
        this.cpuPulseSpeed = 1 + (cpuLoad / 100) * 6;

        if (this.cpuCore) {
            this.cpuCore.material.emissive.setHex(coreColorHex);
            this.cpuCore.material.emissiveIntensity = 0.4 + (cpuLoad / 100) * 0.8;
            this.cpuLight.color.setHex(coreColorHex);
        }

        const memPercent = (metrics.memory?.usedPercent || 10) / 100;
        this.ramSticks.forEach(ram => {
            ram.material.emissiveIntensity = 0.2 + memPercent * 1.2;
            ram.material.emissive.setHex(memPercent > 0.85 ? 0xff0055 : 0x00f0ff);
        });

        const cores = metrics.cpu?.cores || [];
        if (cores.length !== this.corePillars.length && cores.length > 0) {
            this.createCorePillars(cores.length);
        }

        cores.forEach((coreLoad, idx) => {
            if (this.corePillars[idx]) {
                const targetScaleY = Math.max(0.1, (coreLoad / 100) * 2.0);
                this.corePillars[idx].scale.y = targetScaleY;
                this.corePillars[idx].position.y = (targetScaleY * 0.8) / 2;

                if (coreLoad > 75) {
                    this.corePillars[idx].material.emissive.setHex(0xff0055);
                } else if (coreLoad > 40) {
                    this.corePillars[idx].material.emissive.setHex(0xffaa00);
                } else {
                    this.corePillars[idx].material.emissive.setHex(0x00f0ff);
                }
            }
        });
    }

    resetCamera() {
        this.camera.position.set(0, 4.2, 7.5);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
        this.controls.autoRotate = this.autoRotate;
        return this.autoRotate;
    }

    onWindowResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        // 1. ANIMATE FUSION REACTOR
        if (this.activeModel === 'reactor') {
            const spin = delta * this.reactorSpinSpeed;

            // Rotate core & wireframe in counter directions
            if (this.reactorCore) this.reactorCore.rotation.y += spin * 0.8;
            if (this.reactorCoreWire) {
                this.reactorCoreWire.rotation.y -= spin * 1.2;
                this.reactorCoreWire.rotation.x += spin * 0.5;
            }

            // Gimbal rings rotation
            this.gimbalRings.forEach(item => {
                const { mesh, spec } = item;
                mesh.rotation.x += spec.speedX * this.reactorSpinSpeed;
                mesh.rotation.y += spec.speedY * this.reactorSpinSpeed;
            });

            // Plasma vortex spin
            if (this.plasmaParticles) {
                this.plasmaParticles.rotation.y += spin * 2.5;
                if (this.isOverload) {
                    // Jitter particles when overloaded!
                    this.plasmaParticles.rotation.x = (Math.random() - 0.5) * 0.2;
                }
            }

            // Pulsing reactor light
            if (this.reactorLight) {
                const p = (Math.sin(elapsed * (3 + (this.reactorSpinSpeed * 2))) + 1) * 0.5;
                this.reactorLight.intensity = 2.0 + p * (this.isOverload ? 4.5 : 2.5);
            }
        }

        // 2. ANIMATE MINI PC
        if (this.activeModel === 'minipc') {
            this.fanSpeed += (this.targetFanSpeed - this.fanSpeed) * 0.1;
            if (this.fanBlades) {
                this.fanBlades.rotation.y += this.fanSpeed;
            }

            if (this.cpuLight) {
                const pulse = (Math.sin(elapsed * this.cpuPulseSpeed) + 1) * 0.5;
                this.cpuLight.intensity = 1.2 + pulse * 1.5;
            }
        }

        // 3. ANIMATE SHARED HOLO RINGS & PARTICLES
        this.hologramRings.forEach(item => {
            const { mesh, cfg } = item;
            mesh.rotation[cfg.axis] += cfg.rotSpeed;
        });

        if (this.ambientParticles) {
            const positions = this.ambientParticles.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] += 0.005;
                if (positions[i] > 7) {
                    positions[i] = -1;
                }
            }
            this.ambientParticles.geometry.attributes.position.needsUpdate = true;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

window.CyberpunkMiniPCScene = CyberpunkMiniPCScene;
