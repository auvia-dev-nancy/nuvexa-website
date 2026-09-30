/**
 * NUVEXA — Digital Atelier & Brand Engineering Studio
 * Core Client-side Engine & Magical Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all subsystems
  initThemeSwitcher();
  initAmbientCanvas();
  initAudioEngine();
  initCursorAura();
  init3DTilt();
  initMetricCounters();
  initPortfolio();
  initEstimator();
  initProcessTimeline();
  initTestimonials();
  initModalAndForms();
  initWorldClocks();
});

/* ==========================================================================
   1. Theme & Dynamic Aura Engine
   ========================================================================== */
function initThemeSwitcher() {
  const themeDots = document.querySelectorAll('.aura-dot');
  const root = document.documentElement;

  const currentTheme = localStorage.getItem('nuvexa_theme') || 'violet';
  applyTheme(currentTheme);

  themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const themeVal = dot.getAttribute('data-theme-val');
      applyTheme(themeVal);
      localStorage.setItem('nuvexa_theme', themeVal);
      if (window.nuvexaAudio) window.nuvexaAudio.playChime();
      showToast(`Aura switched to ${themeVal.toUpperCase()}`);
    });
  });

  function applyTheme(theme) {
    themeDots.forEach(d => {
      d.classList.toggle('active', d.getAttribute('data-theme-val') === theme);
    });

    if (theme === 'violet') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }

    // Refresh particle color if canvas is active
    if (window.refreshCanvasParticles) {
      window.refreshCanvasParticles();
    }
  }
}

/* ==========================================================================
   2. Ambient Interactive Canvas (60FPS Glowing Constellation)
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 18000), 75);

  let mouse = { x: width / 2, y: height / 2, active: false };

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  document.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1;
      this.baseAlpha = Math.random() * 0.4 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse gentle gravitational reaction
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }
    }

    draw(themeColor) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = themeColor;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function getComputedColor() {
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue('--aura-primary').trim() || '#8b5cf6';
  }

  let themeColor = getComputedColor();
  window.refreshCanvasParticles = () => {
    setTimeout(() => {
      themeColor = getComputedColor();
    }, 50);
  };

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Render connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < 140) {
          const alpha = (1 - dist / 140) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Render particles
    particles.forEach(p => {
      p.update();
      p.draw(themeColor);
    });

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   3. Web Audio Synthesizer (Chic Haptic & Ambient Sound FX)
   ========================================================================== */
function initAudioEngine() {
  let audioCtx = null;
  let isSoundEnabled = false;
  const soundBtn = document.getElementById('sound-toggle-btn');

  function initCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  window.nuvexaAudio = {
    playHover: () => {
      if (!isSoundEnabled || !audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(740, audioCtx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
      } catch (e) {}
    },

    playChime: () => {
      if (!isSoundEnabled || !audioCtx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C chord
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.06);

          gain.gain.setValueAtTime(0.04, audioCtx.currentTime + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + idx * 0.06 + 0.35);

          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + idx * 0.06);
          osc.stop(audioCtx.currentTime + idx * 0.06 + 0.35);
        });
      } catch (e) {}
    }
  };

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      initCtx();
      isSoundEnabled = !isSoundEnabled;
      soundBtn.classList.toggle('active', isSoundEnabled);
      const textSpan = soundBtn.querySelector('.sound-btn-text');
      if (textSpan) {
        textSpan.textContent = isSoundEnabled ? 'Sound: ON' : 'Sound: OFF';
      }
      if (isSoundEnabled) {
        window.nuvexaAudio.playChime();
        showToast('Subtle Audio Feedback Activated');
      } else {
        showToast('Audio Feedback Muted');
      }
    });
  }

  // Attach hover sound to interactive elements
  const interactiveElements = document.querySelectorAll('button, a, .calc-choice-btn, .project-card, .service-card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.nuvexaAudio) window.nuvexaAudio.playHover();
    });
  });
}

/* ==========================================================================
   4. Cursor Follower Aura
   ========================================================================== */
function initCursorAura() {
  const aura = document.querySelector('.cursor-aura');
  if (!aura) return;

  // Only show on devices with mouse
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      aura.style.opacity = '0.7';
      aura.style.left = `${e.clientX}px`;
      aura.style.top = `${e.clientY}px`;
    });

    document.addEventListener('mouseleave', () => {
      aura.style.opacity = '0';
    });
  }
}

/* ==========================================================================
   5. 3D Perspective Tilt on Mouse Movement
   ========================================================================== */
function init3DTilt() {
  const cards = document.querySelectorAll('.hero-card-3d, .service-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      if (card.classList.contains('hero-card-3d')) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      if (card.classList.contains('hero-card-3d')) {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      }
    });
  });
}

/* ==========================================================================
   6. Animated Metric Counters
   ========================================================================== */
function initMetricCounters() {
  const counters = document.querySelectorAll('.metric-value');
  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        counters.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const prefix = counter.getAttribute('data-prefix') || '';
          const suffix = counter.getAttribute('data-suffix') || '';
          const decimals = target % 1 !== 0 ? 1 : 0;
          let current = 0;
          const duration = 1800;
          const startTime = performance.now();

          function updateCount(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            current = target * easeProgress;

            counter.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            }
          }

          requestAnimationFrame(updateCount);
        });
      }
    });
  }, { threshold: 0.3 });

  const metricsSection = document.querySelector('.metrics-section');
  if (metricsSection) observer.observe(metricsSection);
}

/* ==========================================================================
   7. Portfolio Filter & Case Studies
   ========================================================================== */
const projectData = {
  aetheria: {
    title: 'Aetheria Wealth OS',
    category: 'Mobile App & Brand Engineering',
    client: 'Aetheria Digital Inc.',
    year: '2026',
    image: 'assets/images/project_fintech.jpg',
    brief: 'A breakthrough decentralized wealth and portfolio management application built for next-generation sovereign capital holders.',
    challenge: 'Transform complex multi-chain liquidity charts and cryptographic wallet protocols into a frictionless, ultra-luxurious mobile experience that feels like using a high-precision Swiss timepiece.',
    solution: 'Designed an obsidian dark-mode interface featuring glowing micro-haptic charts, biometric instant execution, and fluid spatial transitions. Engineered with React Native and native C++ graphics pipeline.',
    results: [
      '+310% App Store conversion rate',
      '$1.4B+ processed in sovereign transactions in 6 months',
      'App of the Day feature in 42 countries'
    ],
    stack: ['React Native', 'TypeScript', 'WebAudio', 'GLSL Shaders', 'Biometrics API']
  },
  aurora: {
    title: 'Aurora Studio Architecture',
    category: 'Web Experience & Creative Engineering',
    client: 'Aurora Atelier Paris',
    year: '2026',
    image: 'assets/images/project_architecture.jpg',
    brief: 'An award-winning immersive digital exhibition platform showcasing avant-garde architectural landmarks across Tokyo, Paris, and Milan.',
    challenge: 'Overcome traditional static portfolio limitations by allowing visitors to interactively walk through 3D architectural renders directly in the browser with sub-second load times.',
    solution: 'Engineered a custom Three.js WebGL canvas pipeline combined with minimal editorial typography and smooth inertia scrolling. Achieved a 99/100 Google Lighthouse performance score despite rich 3D shaders.',
    results: [
      'Awwwards Site of the Month',
      '+420% increase in high-net-worth client inquiries',
      '2.4M unique global visits in launch month'
    ],
    stack: ['WebGL / Three.js', 'Vanilla JS', 'GLSL', 'Custom Shaders', 'Headless CMS']
  },
  kroma: {
    title: 'Kroma Autonomous AI',
    category: 'Brand Architecture & Design System',
    client: 'Kroma Dynamics Corp.',
    year: '2025',
    image: 'assets/images/hero_showcase.jpg',
    brief: 'Complete brand genesis, generative visual identity, and design system for an autonomous AI agent enterprise platform.',
    challenge: 'Create a distinctive, authoritative visual language for enterprise AI that avoids generic purple gradients and clichéd brain graphics.',
    solution: 'Synthesized mathematical algorithmic geometries, custom bespoke typography, debossed titanium stationery, and a modular dark-mode token system scaled across 14 enterprise platforms.',
    results: [
      'Series B funding closed at $85M valuation post-rebrand',
      'Red Dot Design Award Winner 2025',
      'Adopted by Fortune 500 engineering teams'
    ],
    stack: ['Brand Guidelines', 'Generative Typography', 'Figma Tokens', 'Design System Architecture']
  },
  veloce: {
    title: 'Veloce Hypercar Telemetry',
    category: 'Mobile App & IoT Interface',
    client: 'Veloce Automobili',
    year: '2026',
    image: 'assets/images/project_fintech.jpg',
    brief: 'Real-time telemetry companion app and digital cockpit dashboard for limited-edition electric hypercars.',
    challenge: 'Stream live 60Hz telemetry data (battery temperature, torque vectoring, aero drag) over Bluetooth LE with zero perceptual latency on track days.',
    solution: 'Engineered a carbon-fiber textured, high-contrast cockpit UI with tactile haptic warnings and real-time WebSockets synchronization.',
    results: [
      'Zero-latency telemetry transmission confirmed at Nürburgring',
      '100% driver adoption across all vehicle owners',
      'Nominated for UX Design Awards Automotive'
    ],
    stack: ['Flutter', 'Rust FFI', 'Bluetooth Low Energy', 'Canvas 2D Gauges']
  }
};

function initPortfolio() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      if (window.nuvexaAudio) window.nuvexaAudio.playHover();

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // Open Project Modal
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('data-project');
      const data = projectData[projectId];
      if (data) {
        openProjectModal(data);
      }
    });
  });
}

function openProjectModal(data) {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  modal.querySelector('#modal-project-title').textContent = data.title;
  modal.querySelector('#modal-project-category').textContent = data.category;
  modal.querySelector('#modal-project-client').textContent = data.client;
  modal.querySelector('#modal-project-year').textContent = data.year;
  modal.querySelector('#modal-project-brief').textContent = data.brief;
  modal.querySelector('#modal-project-challenge').textContent = data.challenge;
  modal.querySelector('#modal-project-solution').textContent = data.solution;
  modal.querySelector('#modal-project-img').src = data.image;

  const resultsList = modal.querySelector('#modal-project-results');
  resultsList.innerHTML = '';
  data.results.forEach(res => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>✦</strong> ${res}`;
    resultsList.appendChild(li);
  });

  const stackContainer = modal.querySelector('#modal-project-stack');
  stackContainer.innerHTML = '';
  data.stack.forEach(tech => {
    const span = document.createElement('span');
    span.className = 'service-tag';
    span.textContent = tech;
    stackContainer.appendChild(span);
  });

  modal.classList.add('open');
  if (window.nuvexaAudio) window.nuvexaAudio.playChime();
}

/* ==========================================================================
   8. Magic Studio Project Estimator
   ========================================================================== */
function initEstimator() {
  const serviceButtons = document.querySelectorAll('.calc-service-btn');
  const scaleButtons = document.querySelectorAll('.calc-scale-btn');
  const timelineButtons = document.querySelectorAll('.calc-timeline-btn');

  const priceOutput = document.getElementById('calc-price-output');
  const timelineOutput = document.getElementById('calc-timeline-output');
  const deliverablesList = document.getElementById('calc-deliverables-list');
  const lockConfigBtn = document.getElementById('lock-estimator-config-btn');

  // Base configurations
  let selectedServices = ['web', 'branding'];
  let selectedScale = 'market'; // mvp (1.0), market (1.5), enterprise (2.4)
  let selectedTimeline = 'standard'; // rush (1.25), standard (1.0), phased (0.9)

  const serviceCatalog = {
    web: { name: 'Immersive Web Experience', cost: 12000, weeks: 4, deliverable: 'Custom WebGL / Responsive Web Platform' },
    branding: { name: 'Iconic Brand Identity', cost: 7500, weeks: 3, deliverable: 'Brand Identity Guidelines & 3D Assets' },
    app: { name: 'High-Performance Mobile App', cost: 16000, weeks: 6, deliverable: 'iOS & Android Production Codebase' },
    motion: { name: '3D Motion & Shaders', cost: 6000, weeks: 2, deliverable: 'Custom 3D Interactive WebGL Scenes' },
    ai: { name: 'AI Product & Agent UI', cost: 8500, weeks: 3, deliverable: 'Intelligent Agent UX & Flow Integration' }
  };

  const scaleMultipliers = {
    mvp: { mult: 0.85, label: 'MVP Sprint', weekMult: 0.8 },
    market: { mult: 1.3, label: 'Market Leader', weekMult: 1.1 },
    enterprise: { mult: 2.2, label: 'Global Enterprise', weekMult: 1.5 }
  };

  const timelineMultipliers = {
    rush: { mult: 1.25, label: 'Rush Sprint' },
    standard: { mult: 1.0, label: 'Standard Cadence' },
    phased: { mult: 0.95, label: 'Phased Multi-Quarter' }
  };

  function updateCalculation() {
    let baseCost = 0;
    let baseWeeks = 0;
    const deliverables = [];

    selectedServices.forEach(srvKey => {
      const srv = serviceCatalog[srvKey];
      if (srv) {
        baseCost += srv.cost;
        baseWeeks += srv.weeks * 0.7; // concurrent sprint overlap
        deliverables.push(srv.deliverable);
      }
    });

    if (baseCost === 0) {
      baseCost = 6000;
      baseWeeks = 3;
      deliverables.push('Consultative Strategy & Discovery Roadmap');
    }

    const scale = scaleMultipliers[selectedScale] || scaleMultipliers.market;
    const time = timelineMultipliers[selectedTimeline] || timelineMultipliers.standard;

    const totalMin = Math.round((baseCost * scale.mult * time.mult) / 500) * 500;
    const totalMax = Math.round((totalMin * 1.35) / 500) * 500;
    const totalWeeks = Math.max(3, Math.round(baseWeeks * scale.weekMult));

    if (priceOutput) {
      priceOutput.textContent = `$${totalMin.toLocaleString()} – $${totalMax.toLocaleString()}`;
    }

    if (timelineOutput) {
      timelineOutput.textContent = `Est. Timeline: ~${totalWeeks} Sprints (${totalWeeks * 2} Weeks)`;
    }

    if (deliverablesList) {
      deliverablesList.innerHTML = '';
      deliverables.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${item}</span>
        `;
        deliverablesList.appendChild(li);
      });
      // Add standard guarantee
      const guaranteeLi = document.createElement('li');
      guaranteeLi.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Full IP Ownership & Production-Ready Handoff</span>
      `;
      deliverablesList.appendChild(guaranteeLi);
    }
  }

  // Service toggle handler
  serviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceKey = btn.getAttribute('data-calc-service');
      if (selectedServices.includes(serviceKey)) {
        if (selectedServices.length > 1) {
          selectedServices = selectedServices.filter(s => s !== serviceKey);
          btn.classList.remove('selected');
        }
      } else {
        selectedServices.push(serviceKey);
        btn.classList.add('selected');
      }
      if (window.nuvexaAudio) window.nuvexaAudio.playHover();
      updateCalculation();
    });
  });

  // Scale buttons
  scaleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      scaleButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedScale = btn.getAttribute('data-calc-scale');
      if (window.nuvexaAudio) window.nuvexaAudio.playHover();
      updateCalculation();
    });
  });

  // Timeline buttons
  timelineButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      timelineButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTimeline = btn.getAttribute('data-calc-timeline');
      if (window.nuvexaAudio) window.nuvexaAudio.playHover();
      updateCalculation();
    });
  });

  // Lock Config & Open Contact Modal
  if (lockConfigBtn) {
    lockConfigBtn.addEventListener('click', () => {
      const contactModal = document.getElementById('contact-modal');
      const serviceNames = selectedServices.map(s => serviceCatalog[s]?.name).join(', ');
      const priceText = priceOutput ? priceOutput.textContent : '';

      const projectBriefField = document.getElementById('contact-message');
      if (projectBriefField) {
        projectBriefField.value = `Hi Nuvexa Team,\n\nI configured an estimate for: [${serviceNames}] at [${selectedScale.toUpperCase()}] scale with a [${selectedTimeline.toUpperCase()}] timeline. Estimated range: ${priceText}.\n\nLet's discuss taking our project forward!`;
      }

      if (contactModal) {
        contactModal.classList.add('open');
        if (window.nuvexaAudio) window.nuvexaAudio.playChime();
      }
    });
  }

  // Run initial calculation
  updateCalculation();
}

/* ==========================================================================
   9. The Alchemy Process Interactive Steps
   ========================================================================== */
function initProcessTimeline() {
  const steps = document.querySelectorAll('.process-step');
  steps.forEach(step => {
    step.addEventListener('mouseenter', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
  });
}

/* ==========================================================================
   10. Client Praise Testimonials Slider
   ========================================================================== */
const testimonialsData = [
  {
    quote: "“Nuvexa redesigned our entire mobile ecosystem. Within 90 days of launch, our retention increased by 64% and we secured our Series B round. Their aesthetic craftsmanship and engineering speed are truly supernatural.”",
    name: "Elena Rostova",
    role: "Founder & Chief Executive, Aetheria Labs",
    avatar: "ER"
  },
  {
    quote: "“Working with Nuvexa was like working with artists who understand high-load architecture. They delivered our WebGL showcase ahead of schedule. The site won 4 industry awards in its first month.”",
    name: "Marcello Vane",
    role: "Global Creative Director, Aurora Atelier Paris",
    avatar: "MV"
  },
  {
    quote: "“In 15 years of building tech companies, Nuvexa is the only agency that didn't just deliver a design—they elevated our brand into an iconic category king. Truly in a league of their own.”",
    name: "Siddharth Mehta",
    role: "VP of Product, Kroma Dynamics",
    avatar: "SM"
  }
];

function initTestimonials() {
  let currentIndex = 0;
  const quoteEl = document.getElementById('testimonial-quote-text');
  const nameEl = document.getElementById('testimonial-author-name');
  const roleEl = document.getElementById('testimonial-author-role');
  const avatarEl = document.getElementById('testimonial-avatar-text');
  const prevBtn = document.getElementById('testimonial-prev-btn');
  const nextBtn = document.getElementById('testimonial-next-btn');

  function renderTestimonial(index) {
    const data = testimonialsData[index];
    if (!data || !quoteEl) return;

    quoteEl.style.opacity = '0';
    setTimeout(() => {
      quoteEl.textContent = data.quote;
      nameEl.textContent = data.name;
      roleEl.textContent = data.role;
      avatarEl.textContent = data.avatar;
      quoteEl.style.opacity = '1';
    }, 150);
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + testimonialsData.length) % testimonialsData.length;
      renderTestimonial(currentIndex);
      if (window.nuvexaAudio) window.nuvexaAudio.playHover();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % testimonialsData.length;
      renderTestimonial(currentIndex);
      if (window.nuvexaAudio) window.nuvexaAudio.playHover();
    });
  }

  // Auto advance every 8 seconds
  setInterval(() => {
    currentIndex = (currentIndex + 1) % testimonialsData.length;
    renderTestimonial(currentIndex);
  }, 8000);
}

/* ==========================================================================
   11. Modals, Contact Form & Confetti Celebration
   ========================================================================== */
function initModalAndForms() {
  const openContactBtns = document.querySelectorAll('.open-contact-modal-btn');
  const contactModal = document.getElementById('contact-modal');
  const projectModal = document.getElementById('project-modal');
  const closeBtns = document.querySelectorAll('.modal-close-btn');
  const backdrops = document.querySelectorAll('.modal-backdrop');

  openContactBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (contactModal) contactModal.classList.add('open');
      if (window.nuvexaAudio) window.nuvexaAudio.playChime();
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      backdrops.forEach(b => b.classList.remove('open'));
    });
  });

  backdrops.forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      backdrops.forEach(b => b.classList.remove('open'));
    }
  });

  // Contact Form Submission
  const contactForm = document.getElementById('nuvexa-inquiry-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<span>Transmitting...</span>';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (contactModal) contactModal.classList.remove('open');
        triggerConfetti();
        if (window.nuvexaAudio) window.nuvexaAudio.playChime();
        showToast('✦ Vision Transmitted! We will reach out within 4 hours.');
        contactForm.reset();
        if (submitBtn) {
          submitBtn.innerHTML = '<span>Submit Project Inquiry</span>';
          submitBtn.disabled = false;
        }
      }, 1000);
    });
  }

  // Newsletter Form
  const newsletterForm = document.getElementById('footer-newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      triggerConfetti();
      if (window.nuvexaAudio) window.nuvexaAudio.playChime();
      showToast('✦ Welcome to Nuvexa Studio Dispatch.');
      newsletterForm.reset();
    });
  }
}

/* ==========================================================================
   12. Pure Canvas Confetti Burst
   ========================================================================== */
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiPieces = [];
  const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#ffffff'];

  for (let i = 0; i < 90; i++) {
    confettiPieces.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      alpha: 1
    });
  }

  let animationFrame;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeCount = 0;

    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // gravity
      p.rotation += p.vRotation;
      p.alpha -= 0.012;

      if (p.alpha > 0) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      }
    });

    if (activeCount > 0) {
      animationFrame = requestAnimationFrame(updateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  updateConfetti();
}

/* ==========================================================================
   13. Global Toast System
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span style="color:var(--aura-primary);font-weight:bold;">✦</span> ${message}`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
}

/* ==========================================================================
   14. World Clocks in Footer
   ========================================================================== */
function initWorldClocks() {
  function updateTime() {
    const timeSF = new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hour12: false });
    const timeLON = new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false });
    const timeTYO = new Date().toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false });
    const timeDXB = new Date().toLocaleTimeString('en-AE', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', hour12: false });

    const sfEl = document.getElementById('clock-sf');
    const lonEl = document.getElementById('clock-lon');
    const tyoEl = document.getElementById('clock-tyo');
    const dxbEl = document.getElementById('clock-dxb');

    if (sfEl) sfEl.textContent = timeSF;
    if (lonEl) lonEl.textContent = timeLON;
    if (tyoEl) tyoEl.textContent = timeTYO;
    if (dxbEl) dxbEl.textContent = timeDXB;
  }

  updateTime();
  setInterval(updateTime, 1000);
}
