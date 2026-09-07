/**
 * AMZKER.IO — Core Interactive Experience
 * Particle Mechanics, Draggable Terminal, Interactive Simulators & Sound Synthesis.
 */

(() => {
  'use strict';

  // ==========================================
  // 1. WEB AUDIO SYNTHESIZER
  // ==========================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = false;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.init();
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playClick() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(720, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(340, this.ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
      } catch (e) {}
    }

    playPulse() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(560, this.ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
      } catch (e) {}
    }

    playRev() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(860, this.ctx.currentTime + 0.38);
        gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.38);
      } catch (e) {}
    }

    playGlitch() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.setValueAtTime(180, this.ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
      } catch (e) {}
    }
  }

  const sfx = new SoundEngine();

  // ==========================================
  // 2. FULL-PAGE KINETIC PARTICLE FIELD
  // ==========================================
  class KineticField {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.mode = 'zerog'; // 'zerog' | 'orbit' | 'vortex' | 'repel'
      this.particles = [];
      this.numParticles = 75;
      this.mouse = { x: -1000, y: -1000, isOver: false };
      this.shockwaves = [];

      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initParticles();
      this.bindEvents();
      this.render();
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    }

    initParticles() {
      this.particles = [];
      const colors = ['#c8ff45', '#38bdf8', '#a855f7', '#ffffff', '#fbbf24'];
      for (let i = 0; i < this.numParticles; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 2.2 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          mass: Math.random() * 2 + 1,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitRadius: Math.random() * 260 + 90,
          orbitSpeed: (Math.random() * 0.018 + 0.006) * (Math.random() > 0.5 ? 1 : -1)
        });
      }
    }

    bindEvents() {
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.isOver = true;
      });

      window.addEventListener('mouseleave', () => {
        this.mouse.isOver = false;
      });

      window.addEventListener('click', (e) => {
        // Only trigger shockwave if not clicking input/buttons
        if (!['BUTTON', 'INPUT', 'A'].includes(e.target.tagName)) {
          this.triggerShockwave(e.clientX, e.clientY);
        }
      });
    }

    triggerShockwave(x, y) {
      this.shockwaves.push({
        x,
        y,
        radius: 10,
        maxRadius: 280,
        opacity: 0.8,
        speed: 10
      });

      for (let p of this.particles) {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 260) {
          const force = (1 - dist / 260) * 14;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
    }

    setMode(newMode) {
      this.mode = newMode;
      sfx.playClick();
      if (this.mouse.isOver) {
        this.triggerShockwave(this.mouse.x, this.mouse.y);
      } else {
        this.triggerShockwave(this.width / 2, this.height / 3);
      }
    }

    update() {
      const centerX = this.mouse.isOver ? this.mouse.x : this.width * 0.5;
      const centerY = this.mouse.isOver ? this.mouse.y : this.height * 0.4;

      for (let p of this.particles) {
        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const dist = Math.hypot(dx, dy) || 1;

        if (this.mode === 'vortex') {
          const force = Math.min(1.8, 120 / dist);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.vx *= 0.94;
          p.vy *= 0.94;
        } else if (this.mode === 'repel') {
          if (dist < 340) {
            const force = (1 - dist / 340) * 2.2;
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
          }
          p.vx *= 0.96;
          p.vy *= 0.96;
        } else if (this.mode === 'orbit') {
          p.orbitAngle += p.orbitSpeed;
          const targetX = centerX + Math.cos(p.orbitAngle) * p.orbitRadius;
          const targetY = centerY + Math.sin(p.orbitAngle) * p.orbitRadius;
          p.vx += (targetX - p.x) * 0.025;
          p.vy += (targetY - p.y) * 0.025;
          p.vx *= 0.92;
          p.vy *= 0.92;
        } else {
          // Zero-G
          if (this.mouse.isOver && dist < 220) {
            const force = (1 - dist / 220) * 0.45;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
          p.vx *= 0.985;
          p.vy *= 0.985;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;
      }

      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += sw.speed;
        sw.opacity = (1 - sw.radius / sw.maxRadius) * 0.8;
        if (sw.radius >= sw.maxRadius) {
          this.shockwaves.splice(i, 1);
        }
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let sw of this.shockwaves) {
        this.ctx.beginPath();
        this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(200, 255, 69, ${sw.opacity})`;
        this.ctx.lineWidth = 2.2;
        this.ctx.stroke();
      }

      this.ctx.lineWidth = 0.55;
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];
          const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (d < 115) {
            const alpha = (1 - d / 115) * 0.18;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }
      }

      for (let p of this.particles) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }

      this.update();
      requestAnimationFrame(() => this.render());
    }
  }

  // ==========================================
  // 3. INTERACTIVE TERMINAL (amzker-sh)
  // ==========================================
  class InteractiveTerminal {
    constructor() {
      this.win = document.getElementById('terminal-window');
      this.titlebar = document.getElementById('terminal-titlebar');
      this.body = document.getElementById('terminal-body');
      this.input = document.getElementById('terminal-input');
      this.history = [];
      this.historyIdx = -1;
      this.savedStyles = null;

      if (!this.win) return;

      this.initDrag();
      this.initCommands();
      this.bindWindowControls();
    }

    initDrag() {
      let isDragging = false;
      let startX, startY, initialLeft, initialTop;

      this.titlebar.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('terminal-dot')) return;
        if (this.win.classList.contains('maximized')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = this.win.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        this.win.style.right = 'auto';
        this.win.style.bottom = 'auto';
        this.win.style.left = `${initialLeft}px`;
        this.win.style.top = `${initialTop}px`;
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        this.win.style.left = `${Math.max(10, Math.min(window.innerWidth - 300, initialLeft + dx))}px`;
        this.win.style.top = `${Math.max(10, Math.min(window.innerHeight - 80, initialTop + dy))}px`;
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });
    }

    bindWindowControls() {
      const closeBtn = document.getElementById('term-close');
      const minBtn = document.getElementById('term-min');
      const maxBtn = document.getElementById('term-max');

      // Red dot: Close / hide completely
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggle(false);
        });
      }

      // Yellow dot: Minimize / Roll up to titlebar
      if (minBtn) {
        minBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.minimize();
        });
      }

      // Green dot: Maximize / Restore window
      if (maxBtn) {
        maxBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.maximize();
        });
      }

      // Titlebar double click: toggle maximize
      if (this.titlebar) {
        this.titlebar.addEventListener('dblclick', (e) => {
          if (e.target.classList.contains('terminal-dot')) return;
          this.maximize();
        });
      }

      window.addEventListener('keydown', (e) => {
        if ((e.key === '`' || e.key === '~') && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    minimize() {
      sfx.playClick();
      if (this.win.classList.contains('maximized')) {
        this.maximize();
      }
      this.win.classList.toggle('collapsed');
      if (!this.win.classList.contains('collapsed')) {
        setTimeout(() => this.input.focus(), 100);
      }
    }

    maximize() {
      sfx.playClick();
      if (this.win.classList.contains('collapsed')) {
        this.win.classList.remove('collapsed');
      }

      const isMax = this.win.classList.contains('maximized');
      if (!isMax) {
        this.savedStyles = {
          left: this.win.style.left,
          top: this.win.style.top,
          right: this.win.style.right,
          bottom: this.win.style.bottom,
          width: this.win.style.width,
          height: this.win.style.height
        };
        this.win.style.left = '';
        this.win.style.top = '';
        this.win.style.right = '';
        this.win.style.bottom = '';
        this.win.style.width = '';
        this.win.style.height = '';
        this.win.classList.add('maximized');
      } else {
        this.win.classList.remove('maximized');
        if (this.savedStyles) {
          Object.assign(this.win.style, this.savedStyles);
        }
      }
      setTimeout(() => this.input.focus(), 100);
    }

    toggle(forceState) {
      const isMin = this.win.classList.contains('minimized');
      const shouldOpen = forceState !== undefined ? forceState : isMin;
      if (shouldOpen) {
        this.win.classList.remove('minimized');
        if (this.win.classList.contains('collapsed')) {
          this.win.classList.remove('collapsed');
        }
        sfx.playPulse();
        setTimeout(() => this.input.focus(), 150);
      } else {
        this.win.classList.add('minimized');
        sfx.playClick();
      }
    }

    initCommands() {
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = this.input.value.trim();
          if (cmd) {
            this.history.push(cmd);
            this.historyIdx = this.history.length;
            this.execute(cmd);
          }
          this.input.value = '';
        } else if (e.key === 'ArrowUp') {
          if (this.historyIdx > 0) {
            this.historyIdx--;
            this.input.value = this.history[this.historyIdx] || '';
          }
        } else if (e.key === 'ArrowDown') {
          if (this.historyIdx < this.history.length - 1) {
            this.historyIdx++;
            this.input.value = this.history[this.historyIdx] || '';
          } else {
            this.historyIdx = this.history.length;
            this.input.value = '';
          }
        }
      });
    }

    execute(rawCmd) {
      const parts = rawCmd.split(' ');
      const command = parts[0].toLowerCase();
      const arg = parts.slice(1).join(' ').toLowerCase();

      this.printLine(`<span class="prompt-prefix">amzker@cyberdeck:~$</span> ${this.escape(rawCmd)}`);
      sfx.playClick();

      switch (command) {
        case 'help':
          this.printLine(`
Available commands:
  <span class="highlight">projects</span>       List PyPI tools, neural interfaces & systems
  <span class="highlight">cat &lt;project&gt;</span>    Deep-dive into loopsentry, ldcorn, asyncagentic, tcup, amzux
  <span class="highlight">play spinners</span>    Rev up 3D combat momentum turbine
  <span class="highlight">tcup --pulse</span>     Trigger EMG neural-motor spike waveform
  <span class="highlight">neat --step</span>      Trigger neuroevolution mutation on PlatformerAI
  <span class="highlight">chem --lab</span>       Stream chemical extraction & precipitate log
  <span class="highlight">stack</span>            Display core engineering toolchain
  <span class="highlight">sfx &lt;on|off&gt;</span>     Toggle audio synthesis
  <span class="highlight">clear</span>            Clear terminal screen
  <span class="highlight">exit</span>             Minimize terminal window
          `);
          break;

        case 'projects':
        case 'ls':
          this.printLine(`
<span class="accent">[PYPI & DEV INFRASTRUCTURE]</span>
  • <span class="highlight">loopsentry</span>     — asyncio event-loop blocker detector (<span class="mono">uv add loopsentry</span>)
  • <span class="highlight">ldcorn</span>         — Path-based L7 process manager for Uvicorn (<span class="mono">uv add ldcorn</span>)
  • <span class="highlight">asyncagentic</span>   — Async-native LLM agent framework (<span class="mono">uv add asyncagentic</span>)
<span class="accent">[HARDWARE & NEURAL INTERFACES]</span>
  • <span class="highlight">tcup</span>           — Thought to Computer Use Protocol (EMG/Piezo + ESP32S3 + CNN)
<span class="accent">[GAME DEV & SIMULATION]</span>
  • <span class="highlight">spinners-arena</span> — 3D physics combat game (Godot 3D / Android)
  • <span class="highlight">PlatformerAI</span>   — Genetic neuroevolution (NEAT) agent in Godot
  • <span class="highlight">Gsheet_Godot</span>   — Two-way Godot to Google Sheets bridge
<span class="accent">[SYSTEMS & OS]</span>
  • <span class="highlight">Amzux</span>          — Debian distro for pharmaceutical & molecular docking
  • <span class="highlight">Parrotsec-Android</span> — Penetration testing environment for Android
          `);
          break;

        case 'cat':
          if (arg.includes('loopsentry')) {
            this.printLine(`
<span class="highlight">LoopSentry</span> (PyPI: loopsentry)
Detects event loop stalls by sampling task execution time with microsecond resolution.
Captures full call stack traces, function arguments, CPU/memory/GC metrics,
and compiles standalone interactive HTML diagnostics reports + CLI TUI.
Install: uv add loopsentry
            `);
          } else if (arg.includes('ldcorn')) {
            this.printLine(`
<span class="highlight">Ldcorn</span> (PyPI: ldcorn)
Path-based L7 reverse proxy and process manager for Uvicorn worker pools.
Built on asyncio streams and UNIX domain sockets. Supports worker isolation,
zero-downtime config reloads via SIGHUP, per-group concurrency limits, and auto crash recovery.
Install: uv add ldcorn
            `);
          } else if (arg.includes('asyncagentic') || arg.includes('agent')) {
            this.printLine(`
<span class="highlight">Async Agentic</span> (PyPI: asyncagentic)
Lightweight asynchronous framework for multi-agent LLM orchestration.
Features event hooks, parallel tool execution, native vision support, and flow-trigger listeners.
Install: uv add asyncagentic
            `);
          } else if (arg.includes('tcup') || arg.includes('thought') || arg.includes('emg')) {
            this.printLine(`
<span class="highlight">Thought to Computer Use Protocol (TCUP)</span>:
EMG and piezo-based neural-motor interface.
Hardware prototype built with custom Seeed Studio XIAO ESP32S3 PCB, firmware,
and CNN classification pipeline mapping muscle voltage potentials to discrete computer inputs.
            `);
          } else if (arg.includes('spinner')) {
            this.printLine(`
<span class="highlight">Spinners Arena</span>:
High-velocity 3D mechanical combat in Godot Engine with rigid-body momentum,
modular builds, and LAN multiplayer.
Launch: /spinners-arena-web/
            `);
          } else if (arg.includes('amzux')) {
            this.printLine(`
<span class="highlight">Amzux</span> (Debian-based Distro):
Engineered for pharmaceutical drug development and molecular docking studies.
Includes custom .amzx package format and workflow automation scripts.
            `);
          } else {
            this.printLine(`cat: file not found. Try: cat loopsentry, cat ldcorn, cat asyncagentic, cat tcup, cat spinners, cat amzux`);
          }
          break;

        case 'tcup':
          this.printLine(`<span class="highlight">TCUP:</span> Sampling EMG piezo sensors... Microvolt spike registered.`);
          window.triggerTcupSpike && window.triggerTcupSpike();
          break;

        case 'play':
          if (arg.includes('spinner')) {
            this.printLine(`<span class="highlight">Spinners Arena:</span> Revving turbine to 18,500 RPM!`);
            window.revSpinner && window.revSpinner();
          } else {
            this.printLine(`Usage: play spinners`);
          }
          break;

        case 'neat':
          this.printLine(`<span class="accent">NEAT Neuroevolution:</span> Mutating synapse topology and weights...`);
          window.mutateNeat && window.mutateNeat();
          break;

        case 'chem':
          this.printLine(`
<span class="highlight">[MEDICINAL CHEMISTRY LAB LOG]</span>
[00:01] Loading botanical matrix into reflux extraction condenser...
[00:04] Solvent reflux at 68°C; partitioning target active fractions...
[00:07] Acid-base extraction & precipitation initiated...
[00:10] Crystal formation confirmed.
Demonstrations on YouTube: @amzker
          `);
          sfx.playPulse();
          break;

        case 'stack':
          this.printLine(`
<span class="highlight">Core Stack:</span>
• Systems: Python, Go, Bash, asyncio, UNIX domain sockets, memory-mapped I/O
• AI/ML: Multi-Agent Orchestration, PyTorch, Transformers, Fine-Tuning, Numba
• Hardware: EMG/Piezo sensors, Custom PCB, XIAO ESP32S3, Raspberry Pi
• Engines: Godot Engine (3D/2D), GDScript, NEAT genetic algorithms
• Databases: Redis, Milvus, ChromaDB, SQLite WAL, PostgreSQL
          `);
          break;

        case 'sfx':
          if (arg === 'on') {
            sfx.init();
            sfx.enabled = true;
            this.printLine(`SFX enabled.`);
            updateSfxHud(true);
          } else if (arg === 'off') {
            sfx.enabled = false;
            this.printLine(`SFX muted.`);
            updateSfxHud(false);
          } else {
            const state = sfx.toggle();
            this.printLine(`SFX is now: ${state ? 'ENABLED' : 'MUTED'}`);
            updateSfxHud(state);
          }
          break;

        case 'clear':
          this.body.innerHTML = '';
          return;

        case 'exit':
          this.toggle(false);
          break;

        default:
          this.printLine(`amzker-sh: command not found: "${command}". Type <span class="highlight">help</span> for available commands.`);
          sfx.playGlitch();
          break;
      }

      this.body.scrollTop = this.body.scrollHeight;
    }

    printLine(html) {
      const div = document.createElement('div');
      div.className = 'terminal-output';
      div.innerHTML = html;
      this.body.appendChild(div);
      this.body.scrollTop = this.body.scrollHeight;
    }

    escape(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }

  // ==========================================
  // 4. TCUP EMG SIGNAL SIMULATOR
  // ==========================================
  class TcupSignalVisualizer {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.points = [];
      this.spikeVal = 0;

      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initPoints();
      this.render();

      window.triggerTcupSpike = () => this.triggerSpike();
    }

    resize() {
      this.width = this.canvas.width = this.canvas.clientWidth || 300;
      this.height = this.canvas.height = 120;
    }

    initPoints() {
      this.points = new Array(Math.floor(this.width / 3)).fill(this.height / 2);
    }

    triggerSpike() {
      sfx.playPulse();
      this.spikeVal = (Math.random() * 35 + 25) * (Math.random() > 0.5 ? 1 : -1);
    }

    render() {
      this.ctx.fillStyle = '#090b10';
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Draw Grid
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      this.ctx.lineWidth = 1;
      for (let x = 0; x < this.width; x += 30) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.height);
        this.ctx.stroke();
      }
      for (let y = 0; y < this.height; y += 25) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.width, y);
        this.ctx.stroke();
      }

      // Compute new sample
      const baseline = this.height / 2;
      const noise = (Math.random() - 0.5) * 5;
      const val = baseline + noise + this.spikeVal;
      this.spikeVal *= 0.88; // decay spike

      this.points.shift();
      this.points.push(val);

      // Draw Signal Line
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 1.8;
      this.ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
      this.ctx.shadowBlur = 6;

      const step = this.width / (this.points.length - 1);
      for (let i = 0; i < this.points.length; i++) {
        const x = i * step;
        const y = this.points[i];
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      requestAnimationFrame(() => this.render());
    }
  }

  // ==========================================
  // 5. LOOPSENTRY EVENT LOOP PROFILER SIMULATOR
  // ==========================================
  function initLoopsentrySim() {
    const track = document.getElementById('ls-bar-1');
    const timeVal = document.getElementById('ls-time-1');
    const badge = document.getElementById('ls-badge');
    const runBtn = document.getElementById('ls-run-btn');

    if (!track) return;

    let isBlocked = false;

    function simulateCycle() {
      if (isBlocked) return;
      const ms = (Math.random() * 1.8 + 0.4).toFixed(1);
      track.style.width = `${Math.min(95, ms * 25)}%`;
      track.classList.remove('blocked');
      if (timeVal) timeVal.innerText = `${ms}ms`;
      if (badge) {
        badge.innerText = 'HEALTHY';
        badge.style.color = 'var(--acid)';
        badge.style.borderColor = 'rgba(200, 255, 69, 0.3)';
        badge.style.background = 'rgba(200, 255, 69, 0.08)';
      }
    }

    setInterval(simulateCycle, 1800);

    function triggerBlock() {
      isBlocked = true;
      sfx.playGlitch();
      track.classList.add('blocked');
      track.style.width = '100%';
      const stallTime = (Math.random() * 120 + 85).toFixed(0);
      if (timeVal) timeVal.innerText = `${stallTime}ms!`;
      if (badge) {
        badge.innerText = 'STALL DETECTED';
        badge.style.color = 'var(--coral)';
        badge.style.borderColor = 'rgba(255, 92, 92, 0.4)';
        badge.style.background = 'rgba(255, 92, 92, 0.15)';
      }

      setTimeout(() => {
        isBlocked = false;
        simulateCycle();
      }, 3500);
    }

    if (runBtn) {
      runBtn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerBlock();
      });
    }

    setInterval(() => {
      if (Math.random() > 0.65) triggerBlock();
    }, 12000);
  }

  // ==========================================
  // 6. NEAT NEURAL NETWORK VISUALIZER
  // ==========================================
  class NeatVisualizer {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.pulseTime = 0;

      this.inputs = [
        { name: 'X-Dist', y: 0.2 },
        { name: 'Y-Vel', y: 0.5 },
        { name: 'Obstacle', y: 0.8 }
      ];
      this.hidden = [
        { y: 0.3 },
        { y: 0.7 }
      ];
      this.outputs = [
        { name: 'JUMP', y: 0.35 },
        { name: 'DASH', y: 0.65 }
      ];

      this.weights = [
        [0.8, -0.4],
        [0.6, 0.9],
        [-0.5, 0.7]
      ];
      this.outputWeights = [
        [0.9, -0.3],
        [0.4, 0.8]
      ];

      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.render();

      window.mutateNeat = () => this.mutate();
    }

    resize() {
      this.width = this.canvas.width = this.canvas.clientWidth || 300;
      this.height = this.canvas.height = 140;
    }

    mutate() {
      sfx.playClick();
      for (let i = 0; i < this.weights.length; i++) {
        for (let j = 0; j < this.weights[i].length; j++) {
          this.weights[i][j] += (Math.random() - 0.5) * 0.6;
        }
      }
      this.pulseTime = 0;
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.pulseTime += 0.04;

      const colIn = 35;
      const colMid = this.width / 2;
      const colOut = this.width - 35;

      for (let i = 0; i < this.inputs.length; i++) {
        const y1 = this.inputs[i].y * this.height;
        for (let h = 0; h < this.hidden.length; h++) {
          const y2 = this.hidden[h].y * this.height;
          const w = this.weights[i][h];
          const alpha = Math.min(1, Math.max(0.15, Math.abs(w)));
          this.ctx.strokeStyle = w > 0 ? `rgba(56, 189, 248, ${alpha})` : `rgba(255, 92, 92, ${alpha})`;
          this.ctx.lineWidth = Math.abs(w) * 2;
          this.ctx.beginPath();
          this.ctx.moveTo(colIn, y1);
          this.ctx.lineTo(colMid, y2);
          this.ctx.stroke();
        }
      }

      for (let h = 0; h < this.hidden.length; h++) {
        const y2 = this.hidden[h].y * this.height;
        for (let o = 0; o < this.outputs.length; o++) {
          const y3 = this.outputs[o].y * this.height;
          const w = this.outputWeights[h][o];
          const alpha = Math.min(1, Math.max(0.15, Math.abs(w)));
          this.ctx.strokeStyle = w > 0 ? `rgba(200, 255, 69, ${alpha})` : `rgba(168, 85, 247, ${alpha})`;
          this.ctx.lineWidth = Math.abs(w) * 2;
          this.ctx.beginPath();
          this.ctx.moveTo(colMid, y2);
          this.ctx.lineTo(colOut, y3);
          this.ctx.stroke();
        }
      }

      const drawNeuron = (x, y, label, color) => {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        if (label) {
          this.ctx.fillStyle = '#8b949e';
          this.ctx.font = '9px "JetBrains Mono"';
          this.ctx.fillText(label, x < colMid ? x + 10 : x - 32, y + 3);
        }
      };

      for (let inp of this.inputs) {
        drawNeuron(colIn, inp.y * this.height, inp.name, '#38bdf8');
      }
      for (let hid of this.hidden) {
        drawNeuron(colMid, hid.y * this.height, '', '#c8ff45');
      }
      for (let out of this.outputs) {
        drawNeuron(colOut, out.y * this.height, out.name, '#a855f7');
      }

      requestAnimationFrame(() => this.render());
    }
  }

  // ==========================================
  // 7. SPINNERS ARENA GYRO DIAL
  // ==========================================
  function initSpinnerDial() {
    const dial = document.getElementById('spin-dial');
    const valText = document.getElementById('spin-val');
    const revBtn = document.getElementById('spin-rev-btn');

    if (!dial || !valText) return;

    let currentRpm = 4200;
    let targetRpm = 4200;
    let angle = 0;

    function loop() {
      currentRpm += (targetRpm - currentRpm) * 0.08;
      angle += currentRpm * 0.003;
      dial.style.transform = `rotate(${angle}deg)`;
      valText.innerText = `${Math.round(currentRpm)} RPM`;

      if (targetRpm > 4200) {
        targetRpm -= 25;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    window.revSpinner = () => {
      sfx.playRev();
      targetRpm = 18500;
    };

    if (revBtn) {
      revBtn.addEventListener('click', () => {
        window.revSpinner();
      });
    }
  }

  // ==========================================
  // 8. SPOTLIGHT MOUSE TRACKER
  // ==========================================
  function initSpotlightTracker() {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // ==========================================
  // 9. COMMAND PALETTE (Cmd+K / Ctrl+K)
  // ==========================================
  class CommandPalette {
    constructor(terminal) {
      this.modal = document.getElementById('palette-modal');
      this.input = document.getElementById('palette-input');
      this.results = document.getElementById('palette-results');
      this.terminal = terminal;

      this.actions = [
        { label: 'Open Terminal Shell (amzker-sh)', kbd: '~', action: () => this.terminal.toggle(true) },
        { label: 'View Loopsentry Profiler (uv add loopsentry)', kbd: 'Go', action: () => document.getElementById('loopsentry')?.scrollIntoView({ behavior: 'smooth' }) },
        { label: 'TCUP Neural-Motor Interface (EMG/Piezo)', kbd: 'Go', action: () => document.getElementById('tcup')?.scrollIntoView({ behavior: 'smooth' }) },
        { label: 'Enter Spinners Arena (Godot 3D)', kbd: 'Go', action: () => window.open('/spinners-arena-web/', '_blank') },
        { label: 'PlatformerAI Genetic NEAT Agent', kbd: 'Go', action: () => document.getElementById('platformerai')?.scrollIntoView({ behavior: 'smooth' }) },
        { label: 'Explore YouTube Experiments (@amzker)', kbd: 'URL', action: () => window.open('https://www.youtube.com/@amzker', '_blank') },
        { label: 'Amzker GitHub Repositories (28)', kbd: 'URL', action: () => window.open('https://github.com/amzker', '_blank') },
        { label: 'Toggle Synthesized Audio SFX', kbd: 'SFX', action: () => toggleSfx() }
      ];

      this.bindEvents();
    }

    bindEvents() {
      window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.toggle();
        } else if (e.key === 'Escape' && this.isOpen()) {
          this.toggle(false);
        }
      });

      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.toggle(false);
        });
      }

      if (this.input) {
        this.input.addEventListener('input', () => this.filter());
      }
    }

    isOpen() {
      return this.modal && this.modal.classList.contains('open');
    }

    toggle(force) {
      if (!this.modal) return;
      const shouldOpen = force !== undefined ? force : !this.isOpen();
      if (shouldOpen) {
        this.modal.classList.add('open');
        this.input.value = '';
        this.filter();
        setTimeout(() => this.input.focus(), 100);
        sfx.playClick();
      } else {
        this.modal.classList.remove('open');
      }
    }

    filter() {
      const q = (this.input.value || '').toLowerCase();
      const filtered = this.actions.filter(a => a.label.toLowerCase().includes(q));
      this.results.innerHTML = '';

      filtered.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = `palette-item ${idx === 0 ? 'selected' : ''}`;
        div.innerHTML = `
          <span>${item.label}</span>
          <span class="palette-kbd">${item.kbd}</span>
        `;
        div.addEventListener('click', () => {
          sfx.playClick();
          item.action();
          this.toggle(false);
        });
        this.results.appendChild(div);
      });
    }
  }

  // ==========================================
  // 10. HUD & DOCK CONTROLS
  // ==========================================
  function updateSfxHud(enabled) {
    const sfxBtn = document.getElementById('hud-sfx-toggle');
    const dockSfx = document.getElementById('dock-sfx');
    if (sfxBtn) {
      sfxBtn.classList.toggle('active', enabled);
      sfxBtn.innerHTML = enabled ? 'SFX: ON' : 'SFX: MUTED';
    }
    if (dockSfx) {
      dockSfx.classList.toggle('active', enabled);
    }
  }

  function toggleSfx() {
    const state = sfx.toggle();
    updateSfxHud(state);
    if (state) sfx.playClick();
  }

  // ==========================================
  // INITIALIZATION ON DOM READY
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    window.kineticField = new KineticField('ambient-canvas');

    document.querySelectorAll('.physics-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        document.querySelectorAll('.physics-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.kineticField?.setMode(mode);
      });
    });

    const terminal = new InteractiveTerminal();
    window.interactiveTerminal = terminal;

    const palette = new CommandPalette(terminal);
    const cmdTrigger = document.getElementById('cmd-palette-trigger');
    if (cmdTrigger) {
      cmdTrigger.addEventListener('click', () => palette.toggle(true));
    }

    initLoopsentrySim();
    new NeatVisualizer('neat-canvas');
    new TcupSignalVisualizer('tcup-canvas');
    initSpinnerDial();
    initSpotlightTracker();

    document.getElementById('dock-term')?.addEventListener('click', () => terminal.toggle());
    document.getElementById('dock-loopsentry')?.addEventListener('click', () => {
      document.getElementById('loopsentry')?.scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('dock-tcup')?.addEventListener('click', () => {
      document.getElementById('tcup')?.scrollIntoView({ behavior: 'smooth' });
      window.triggerTcupSpike && window.triggerTcupSpike();
    });
    document.getElementById('dock-spinners')?.addEventListener('click', () => {
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
      window.revSpinner && window.revSpinner();
    });
    document.getElementById('dock-sfx')?.addEventListener('click', () => toggleSfx());
    document.getElementById('hud-sfx-toggle')?.addEventListener('click', () => toggleSfx());

    document.querySelectorAll('.btn, .dock-item, .hud-btn').forEach(el => {
      el.addEventListener('click', () => sfx.playClick());
    });

    document.getElementById('mutate-neat-btn')?.addEventListener('click', () => {
      window.mutateNeat && window.mutateNeat();
    });

    document.getElementById('tcup-pulse-btn')?.addEventListener('click', () => {
      window.triggerTcupSpike && window.triggerTcupSpike();
    });
  });

})();
