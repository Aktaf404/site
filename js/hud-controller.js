// Web Audio Cyberpunk Sound FX Generator (Zero external audio files required)
class CyberAudio {
    constructor() {
        this.ctx = null;
        this.enabled = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.enabled = true;
        }
    }

    playBeep(freq = 880, type = 'sine', duration = 0.08) {
        if (!this.enabled || !this.ctx) return;
        try {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Audio ignore
        }
    }

    playBootSound() {
        if (!this.enabled) return;
        setTimeout(() => this.playBeep(523, 'sawtooth', 0.1), 0);
        setTimeout(() => this.playBeep(659, 'sawtooth', 0.1), 100);
        setTimeout(() => this.playBeep(784, 'sine', 0.25), 200);
    }
}

const cyberAudio = new CyberAudio();

// HUD UI & WebSocket Manager
class HUDController {
    constructor(sceneInstance) {
        this.scene = sceneInstance;
        this.socket = null;
        this.reconnectTimer = null;
        this.dom = {
            hostname: document.getElementById('hud-hostname'),
            os: document.getElementById('hud-os'),
            cpuBrand: document.getElementById('hud-cpu-brand'),
            statusText: document.getElementById('hud-status-text'),
            statusDot: document.getElementById('hud-status-dot'),
            
            // CPU
            cpuVal: document.getElementById('val-cpu'),
            cpuFill: document.getElementById('fill-cpu'),
            coreBars: document.getElementById('hud-core-bars'),

            // RAM
            ramVal: document.getElementById('val-ram'),
            ramSub: document.getElementById('sub-ram'),
            ramFill: document.getElementById('fill-ram'),

            // Temp
            tempVal: document.getElementById('val-temp'),
            tempFill: document.getElementById('fill-temp'),
            tempStatus: document.getElementById('sub-temp'),

            // Disk
            diskVal: document.getElementById('val-disk'),
            diskSub: document.getElementById('sub-disk'),
            diskFill: document.getElementById('fill-disk'),

            // Net
            netRx: document.getElementById('val-net-rx'),
            netTx: document.getElementById('val-net-tx'),
            netIface: document.getElementById('sub-net-iface'),

            // Uptime
            uptime: document.getElementById('hud-uptime'),

            // Buttons
            btnRotate: document.getElementById('btn-rotate'),
            btnReset: document.getElementById('btn-reset'),
            btnFullscreen: document.getElementById('btn-fullscreen'),
            btnSound: document.getElementById('btn-sound')
        };

        this.initControls();
        this.connectWebSocket();
    }

    initControls() {
        this.dom.btnRotate.addEventListener('click', () => {
            cyberAudio.init();
            cyberAudio.playBeep(900, 'triangle', 0.05);
            const active = this.scene.toggleAutoRotate();
            this.dom.btnRotate.classList.toggle('active', active);
        });

        this.dom.btnReset.addEventListener('click', () => {
            cyberAudio.init();
            cyberAudio.playBeep(1100, 'sine', 0.06);
            this.scene.resetCamera();
        });

        this.dom.btnFullscreen.addEventListener('click', () => {
            cyberAudio.init();
            cyberAudio.playBeep(750, 'sine', 0.05);
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        });

        this.dom.btnSound.addEventListener('click', () => {
            cyberAudio.init();
            cyberAudio.enabled = !cyberAudio.enabled;
            this.dom.btnSound.classList.toggle('active', cyberAudio.enabled);
            this.dom.btnSound.textContent = cyberAudio.enabled ? '🔊 SOUND ON' : '🔈 SFX OFF';
            if (cyberAudio.enabled) {
                cyberAudio.playBootSound();
            }
        });
    }

    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            this.dom.statusText.textContent = 'ONLINE (WS)';
            this.dom.statusDot.style.background = 'var(--neon-green)';
            this.dom.statusDot.style.boxShadow = '0 0 8px var(--neon-green)';
            clearTimeout(this.reconnectTimer);
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'INIT_HARDWARE') {
                    this.renderHardware(message.data);
                } else if (message.type === 'METRICS_UPDATE') {
                    this.renderMetrics(message.data);
                }
            } catch (err) {
                console.error('Error parsing WS message:', err);
            }
        };

        this.socket.onclose = () => {
            this.dom.statusText.textContent = 'RECONNECTING...';
            this.dom.statusDot.style.background = 'var(--neon-magenta)';
            this.dom.statusDot.style.boxShadow = '0 0 8px var(--neon-magenta)';
            this.reconnectTimer = setTimeout(() => this.connectWebSocket(), 2000);
        };

        this.socket.onerror = (err) => {
            console.warn('WS error:', err);
            this.socket.close();
        };
    }

    renderHardware(hw) {
        if (!hw) return;
        this.dom.hostname.textContent = (hw.hostname || 'MINIPC').toUpperCase();
        this.dom.os.textContent = `${hw.osDistro || 'Linux'} [${hw.arch || 'x64'}]`;
        this.dom.cpuBrand.textContent = `${hw.cpuBrand || 'Processor'} (${hw.cores} Cores)`;
    }

    renderMetrics(m) {
        if (!m) return;

        // Push data to Three.js 3D world
        if (this.scene) {
            this.scene.updateMetrics(m);
        }

        // 1. CPU
        const cpuLoad = m.cpu?.totalLoad || 0;
        this.dom.cpuVal.innerHTML = `${cpuLoad}<span>%</span>`;
        this.dom.cpuFill.style.width = `${Math.min(100, cpuLoad)}%`;

        // Render per-core load mini bars
        const cores = m.cpu?.cores || [];
        if (this.dom.coreBars.children.length !== cores.length) {
            this.dom.coreBars.innerHTML = '';
            cores.forEach((_, i) => {
                const bar = document.createElement('div');
                bar.className = 'core-bar';
                bar.innerHTML = `<div class="core-bar-inner" id="core-bar-${i}" style="height: 0%"></div>`;
                this.dom.coreBars.appendChild(bar);
            });
        }
        cores.forEach((coreVal, idx) => {
            const inner = document.getElementById(`core-bar-${idx}`);
            if (inner) {
                inner.style.height = `${Math.min(100, coreVal)}%`;
                if (coreVal > 75) inner.style.background = 'var(--neon-magenta)';
                else if (coreVal > 40) inner.style.background = 'var(--neon-amber)';
                else inner.style.background = 'var(--neon-cyan)';
            }
        });

        // 2. RAM
        const ramUsed = m.memory?.activeGB || 0;
        const ramTotal = m.memory?.totalGB || 1;
        const ramPct = m.memory?.usedPercent || 0;
        this.dom.ramVal.innerHTML = `${ramUsed}<span>GB</span>`;
        this.dom.ramSub.textContent = `${ramPct}% of ${ramTotal} GB`;
        this.dom.ramFill.style.width = `${Math.min(100, ramPct)}%`;

        // 3. Temp
        const temp = m.temperature?.main || 0;
        this.dom.tempVal.innerHTML = `${temp}<span>°C</span>`;
        const tempPct = Math.min(100, Math.max(0, (temp - 30) / 60 * 100));
        this.dom.tempFill.style.width = `${tempPct}%`;
        if (temp > 70) {
            this.dom.tempVal.style.color = 'var(--neon-magenta)';
            this.dom.tempStatus.textContent = 'HIGH THERMAL';
            this.dom.tempStatus.style.color = 'var(--neon-magenta)';
        } else if (temp > 55) {
            this.dom.tempVal.style.color = 'var(--neon-amber)';
            this.dom.tempStatus.textContent = 'ELEVATED';
            this.dom.tempStatus.style.color = 'var(--neon-amber)';
        } else {
            this.dom.tempVal.style.color = 'var(--neon-cyan)';
            this.dom.tempStatus.textContent = 'NORMAL';
            this.dom.tempStatus.style.color = 'var(--text-muted)';
        }

        // 4. Disk
        const diskPct = m.storage?.usedPercent || 0;
        const diskUsed = m.storage?.usedGB || 0;
        const diskSize = m.storage?.sizeGB || 0;
        this.dom.diskVal.innerHTML = `${diskPct}<span>%</span>`;
        this.dom.diskSub.textContent = `${diskUsed} / ${diskSize} GB`;
        this.dom.diskFill.style.width = `${Math.min(100, diskPct)}%`;

        // 5. Network
        this.dom.netRx.innerHTML = `${m.network?.rx_kBps || 0}<span>kB/s</span>`;
        this.dom.netTx.innerHTML = `${m.network?.tx_kBps || 0}<span>kB/s</span>`;
        this.dom.netIface.textContent = `IFACE: ${m.network?.iface || 'eth0'}`;

        // 6. Uptime
        if (m.uptime) {
            const days = Math.floor(m.uptime / 86400);
            const hrs = Math.floor((m.uptime % 86400) / 3600);
            const mins = Math.floor((m.uptime % 3600) / 60);
            const secs = Math.floor(m.uptime % 60);
            this.dom.uptime.textContent = `UPTIME: ${days > 0 ? days + 'd ' : ''}${hrs}h ${mins}m ${secs}s`;
        }
    }
}

window.HUDController = HUDController;
