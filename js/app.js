/**
 * AESTHETIX // CYBERFIT - MAIN APPLICATION CONTROLLER
 * Audio Synthesizer, 3D Tilt, ECG Waveform, Coverflow Carousel, 
 * Biometric Tracker, Macro Calculator, VIP Pass Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. WEB AUDIO API CYBER SOUND ENGINE
  // ==========================================
  let audioCtx = null;
  let sfxEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.08) {
    if (!sfxEnabled || !audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context error fallback
    }
  }

  const sfx = {
    hover: () => playTone(680, 'sine', 0.06, 0.03),
    click: () => playTone(980, 'triangle', 0.12, 0.07),
    switchTier: () => {
      playTone(520, 'sine', 0.08, 0.05);
      setTimeout(() => playTone(880, 'sine', 0.12, 0.06), 50);
    },
    celebrate: () => {
      [523, 659, 783, 1046].forEach((f, idx) => {
        setTimeout(() => playTone(f, 'triangle', 0.25, 0.08), idx * 80);
      });
    },
  };

  // SFX Toggle UI
  const sfxToggleBtn = document.getElementById('sfx-toggle-btn');
  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', () => {
      initAudio();
      sfxEnabled = !sfxEnabled;
      sfxToggleBtn.classList.toggle('active', sfxEnabled);
      const textSpan = sfxToggleBtn.querySelector('.sfx-text');
      if (textSpan) {
        textSpan.textContent = sfxEnabled ? 'AUDIO: ON' : 'AUDIO: MUTED';
      }
      if (sfxEnabled) sfx.click();
    });
  }

  // Bind SFX to buttons & interactive cards (Only attach hover SFX on devices that support hover to avoid lag on touchscreens)
  const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.querySelectorAll('button, .nav-link, .btn-neon, .btn-outline').forEach((el) => {
    if (canHover) {
      el.addEventListener('mouseenter', () => {
        initAudio();
        sfx.hover();
      });
    }
    el.addEventListener('click', () => {
      initAudio();
      sfx.click();
    });
  });

  // ==========================================
  // 2. HEADER SCROLL & MOBILE DRAWER (THROTTLED)
  // ==========================================
  const header = document.querySelector('.site-header');
  let isScrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!isScrollTicking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        isScrollTicking = false;
      });
      isScrollTicking = true;
    }
  }, { passive: true });

  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navBackdrop = document.getElementById('mobile-nav-backdrop');

  function openMobileMenu() {
    if (!navLinks) return;
    navLinks.classList.add('is-open');
    if (mobileToggle) {
      mobileToggle.classList.add('is-active');
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileToggle.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    }
    if (navBackdrop) {
      navBackdrop.classList.add('is-active');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!navLinks) return;
    navLinks.classList.remove('is-open');
    if (mobileToggle) {
      mobileToggle.classList.remove('is-active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    }
    if (navBackdrop) {
      navBackdrop.classList.remove('is-active');
    }
    document.body.style.overflow = '';
  }

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // 1. Click on Backdrop (empty space overlay) closes menu
    if (navBackdrop) {
      navBackdrop.addEventListener('click', () => {
        closeMobileMenu();
      });
    }

    // 2. Click outside anywhere on document closes menu
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('is-open')) {
        if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
          closeMobileMenu();
        }
      }
    });

    // 3. Clicking any nav link closes menu
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('is-open')) {
          closeMobileMenu();
        }
      });
    });

    // 4. Pressing Escape key closes menu
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });
  }

  // Smooth Scroll for In-Page Anchor Links (Overview, Why Us, Programs, Pricing, Location, etc.)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#' && targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerEl = document.querySelector('.site-header');
          const headerOffset = headerEl ? headerEl.offsetHeight + 10 : 70;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ==========================================
  // 3. 3D CARD TILT & SPECULAR GLARE (RAF THROTTLED, DESKTOP ONLY)
  // ==========================================
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const tiltCards = document.querySelectorAll('.bento-card, .program-card');
    tiltCards.forEach((card) => {
      let tiltFrame = null;
      card.addEventListener('mousemove', (e) => {
        if (tiltFrame) return;
        tiltFrame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -5;
          const rotateY = ((x - centerX) / centerX) * 5;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
          tiltFrame = null;
        });
      });

      card.addEventListener('mouseleave', () => {
        if (tiltFrame) {
          cancelAnimationFrame(tiltFrame);
          tiltFrame = null;
        }
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // ==========================================
  // 4. BENTO METRICS SVG GRAPH SWITCHER
  // ==========================================
  const graphTabs = document.querySelectorAll('.graph-tab-btn');
  const graphLine = document.getElementById('graph-line');
  const graphArea = document.getElementById('graph-area');
  const graphStatVal = document.getElementById('graph-stat-val');
  const graphStatLbl = document.getElementById('graph-stat-lbl');

  const graphDatasets = {
    bpm: {
      linePath: 'M 10 90 Q 60 40 120 70 T 220 30 T 320 60 T 420 20 T 520 40',
      areaPath: 'M 10 90 Q 60 40 120 70 T 220 30 T 320 60 T 420 20 T 520 40 L 520 120 L 10 120 Z',
      val: '164 BPM',
      lbl: 'PEAK HEART RATE',
    },
    power: {
      linePath: 'M 10 100 Q 80 80 150 45 T 270 20 T 380 40 T 460 15 T 520 25',
      areaPath: 'M 10 100 Q 80 80 150 45 T 270 20 T 380 40 T 460 15 T 520 25 L 520 120 L 10 120 Z',
      val: '485 WATTS',
      lbl: 'EXPLOSIVE OUTPUT',
    },
    kcal: {
      linePath: 'M 10 110 Q 90 95 180 75 T 320 50 T 440 30 T 520 10',
      areaPath: 'M 10 110 Q 90 95 180 75 T 320 50 T 440 30 T 520 10 L 520 120 L 10 120 Z',
      val: '720 KCAL',
      lbl: 'NET METABOLIC BURN',
    },
    reps: {
      linePath: 'M 10 80 Q 70 20 140 85 T 260 25 T 380 90 T 480 20 T 520 60',
      areaPath: 'M 10 80 Q 70 20 140 85 T 260 25 T 380 90 T 480 20 T 520 60 L 520 120 L 10 120 Z',
      val: '34 TOTAL',
      lbl: 'REPS RECORDED',
    },
  };

  graphTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      graphTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const metric = tab.getAttribute('data-metric');
      const data = graphDatasets[metric];
      if (data && graphLine && graphArea) {
        graphLine.setAttribute('d', data.linePath);
        graphArea.setAttribute('d', data.areaPath);
        if (graphStatVal) graphStatVal.textContent = data.val;
        if (graphStatLbl) graphStatLbl.textContent = data.lbl;
      }
    });
  });

  // ==========================================
  // 5. REAL-TIME ECG HEARTBEAT CANVAS (HARDWARE OPTIMIZED)
  // ==========================================
  const ecgCanvas = document.getElementById('ecg-canvas');
  if (ecgCanvas) {
    const ctx = ecgCanvas.getContext('2d');
    let width = (ecgCanvas.width = ecgCanvas.offsetWidth || 500);
    let height = (ecgCanvas.height = ecgCanvas.offsetHeight || 110);
    let isEcgVisible = false;
    let ecgAnimId = null;

    // Offscreen Canvas for static background grid
    const gridCanvas = document.createElement('canvas');
    const gridCtx = gridCanvas.getContext('2d');

    function createGrid() {
      gridCanvas.width = width;
      gridCanvas.height = height;
      gridCtx.clearRect(0, 0, width, height);
      gridCtx.strokeStyle = 'rgba(255, 42, 0, 0.05)';
      gridCtx.lineWidth = 1;
      gridCtx.beginPath();
      for (let gx = 0; gx < width; gx += 25) {
        gridCtx.moveTo(gx, 0);
        gridCtx.lineTo(gx, height);
      }
      gridCtx.stroke();
    }
    createGrid();

    window.addEventListener('resize', () => {
      width = ecgCanvas.width = ecgCanvas.offsetWidth;
      height = ecgCanvas.height = ecgCanvas.offsetHeight;
      createGrid();
    }, { passive: true });

    let x = 0;
    let y = height / 2;
    let step = 0;
    let ecgSpeed = 2.4;
    let peakMultiplier = 1;

    function getEcgY(index) {
      const mid = height / 2;
      const mod = index % 140;

      if (mod > 30 && mod <= 38) return mid - 8 * peakMultiplier;
      if (mod > 38 && mod <= 45) return mid;
      if (mod > 45 && mod <= 49) return mid + 12 * peakMultiplier;
      if (mod > 49 && mod <= 54) return mid - 46 * peakMultiplier;
      if (mod > 54 && mod <= 59) return mid + 20 * peakMultiplier;
      if (mod > 59 && mod <= 75) return mid;
      if (mod > 75 && mod <= 92) return mid - 14 * peakMultiplier;
      return mid;
    }

    function renderEcg() {
      if (!isEcgVisible) {
        ecgAnimId = null;
        return;
      }
      ecgAnimId = requestAnimationFrame(renderEcg);

      ctx.fillStyle = 'rgba(8, 8, 10, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Blit cached grid
      ctx.drawImage(gridCanvas, 0, 0);

      // Fast, crisp neon waveform
      ctx.strokeStyle = '#ff2a00';
      ctx.lineWidth = 2.2;

      ctx.beginPath();
      ctx.moveTo(x, y);

      for (let i = 0; i < 4; i++) {
        x += ecgSpeed * 0.4;
        step++;
        y = getEcgY(step);
        ctx.lineTo(x, y);

        if (x >= width) {
          x = 0;
          ctx.moveTo(0, y);
        }
      }
      ctx.stroke();
    }

    if ('IntersectionObserver' in window) {
      const ecgObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const wasVisible = isEcgVisible;
          isEcgVisible = entry.isIntersecting;
          if (isEcgVisible && !wasVisible && !ecgAnimId) {
            ecgAnimId = requestAnimationFrame(renderEcg);
          }
        });
      }, { threshold: 0.05 });
      ecgObserver.observe(ecgCanvas);
    } else {
      isEcgVisible = true;
      renderEcg();
    }

    // ==========================================
    // 6. INTENSITY CONTROLLER BAR (WARMUP -> BEAST)
    // ==========================================
    const intensityBtns = document.querySelectorAll('.intensity-tier-btn');
    const bpmDisplay = document.getElementById('live-bpm-display');
    const stepCadenceVal = document.getElementById('step-cadence-val');
    const burnRateVal = document.getElementById('burn-rate-val');
    const liveStepCount = document.getElementById('live-step-count');

    const intensitySettings = {
      warmup: { bpm: 108, speed: 1.6, peak: 0.7, cadence: '135 SPM', burn: '8.5 KCAL/M' },
      aerobic: { bpm: 136, speed: 2.2, peak: 1.0, cadence: '158 SPM', burn: '12.4 KCAL/M' },
      threshold: { bpm: 164, speed: 3.0, peak: 1.3, cadence: '178 SPM', burn: '16.8 KCAL/M' },
      beast: { bpm: 188, speed: 4.2, peak: 1.6, cadence: '205 SPM', burn: '22.0 KCAL/M' },
    };

    intensityBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        intensityBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        sfx.switchTier();

        const tier = btn.getAttribute('data-tier');
        const setting = intensitySettings[tier];
        if (setting) {
          ecgSpeed = setting.speed;
          peakMultiplier = setting.peak;
          if (bpmDisplay) bpmDisplay.textContent = setting.bpm;
          if (stepCadenceVal) stepCadenceVal.textContent = setting.cadence;
          if (burnRateVal) burnRateVal.textContent = setting.burn;
        }
      });
    });

    // Continuous Live Steps Incrementor
    let stepCount = 8420;
    setInterval(() => {
      stepCount += Math.floor(Math.random() * 4) + 1;
      if (liveStepCount) {
        liveStepCount.textContent = stepCount.toLocaleString();
      }
    }, 1800);
  }

  // ==========================================
  // 7. ELITE TRAINERS 3D COVERFLOW CAROUSEL
  // ==========================================
  const carouselCards = document.querySelectorAll('.trainer-card');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  let activeIndex = 0;
  const totalCards = carouselCards.length;

  // Build dots
  if (dotsContainer && totalCards > 0) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalCards; i++) {
      const dot = document.createElement('div');
      dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => updateCarousel(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateCarousel(newIndex) {
    activeIndex = (newIndex + totalCards) % totalCards;

    carouselCards.forEach((card, index) => {
      let offset = index - activeIndex;

      // Wrap around for circular coverflow
      if (offset > totalCards / 2) offset -= totalCards;
      if (offset < -totalCards / 2) offset += totalCards;

      card.classList.toggle('is-active', offset === 0);

      if (offset === 0) {
        // Center Active Card
        card.style.transform = 'translateX(0) translateZ(120px) rotateY(0deg) scale(1.04)';
        card.style.opacity = '1';
        card.style.zIndex = '10';
        card.style.filter = 'brightness(1)';
        card.style.pointerEvents = 'auto';
      } else if (offset === -1) {
        // Left 1
        card.style.transform = 'translateX(-220px) translateZ(0px) rotateY(32deg) scale(0.88)';
        card.style.opacity = '0.75';
        card.style.zIndex = '5';
        card.style.filter = 'brightness(0.65)';
        card.style.pointerEvents = 'auto';
      } else if (offset === 1) {
        // Right 1
        card.style.transform = 'translateX(220px) translateZ(0px) rotateY(-32deg) scale(0.88)';
        card.style.opacity = '0.75';
        card.style.zIndex = '5';
        card.style.filter = 'brightness(0.65)';
        card.style.pointerEvents = 'auto';
      } else {
        // Hidden / distant cards
        const dir = offset > 0 ? 1 : -1;
        card.style.transform = `translateX(${dir * 380}px) translateZ(-160px) rotateY(${dir * -45}deg) scale(0.7)`;
        card.style.opacity = '0';
        card.style.zIndex = '1';
        card.style.pointerEvents = 'none';
      }
    });

    // Update Dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIndex);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => updateCarousel(activeIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => updateCarousel(activeIndex + 1));

  // Click on side cards to bring them forward
  carouselCards.forEach((card, idx) => {
    card.addEventListener('click', () => updateCarousel(idx));
  });

  // Swipe / Drag on carousel
  const carouselViewport = document.querySelector('.carousel-viewport');
  if (carouselViewport) {
    let touchStartX = 0;
    carouselViewport.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    carouselViewport.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchStartX - touchEndX > 50) updateCarousel(activeIndex + 1);
      if (touchEndX - touchStartX > 50) updateCarousel(activeIndex - 1);
    }, { passive: true });
  }

  // Initialize Coverflow
  updateCarousel(0);

  // ==========================================
  // 8. INTERACTIVE VIP MACRO & CALORIE CALCULATOR
  // ==========================================
  const weightSlider = document.getElementById('calc-weight-slider');
  const weightValDisplay = document.getElementById('calc-weight-val');
  const daysSlider = document.getElementById('calc-days-slider');
  const daysValDisplay = document.getElementById('calc-days-val');
  const goalBtns = document.querySelectorAll('.calc-goal-btn');

  const resultCalories = document.getElementById('result-calories');
  const resultProtein = document.getElementById('result-protein');
  const resultCarbs = document.getElementById('result-carbs');
  const resultFats = document.getElementById('result-fats');

  let currentGoal = 'recomp';

  goalBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      goalBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentGoal = btn.getAttribute('data-goal');
      calculateMacros();
    });
  });

  if (weightSlider) {
    weightSlider.addEventListener('input', () => {
      if (weightValDisplay) weightValDisplay.textContent = `${weightSlider.value} kg`;
      calculateMacros();
    });
  }

  if (daysSlider) {
    daysSlider.addEventListener('input', () => {
      if (daysValDisplay) daysValDisplay.textContent = `${daysSlider.value} days/wk`;
      calculateMacros();
    });
  }

  function calculateMacros() {
    if (!weightSlider || !daysSlider || !resultCalories) return;

    const weight = parseFloat(weightSlider.value) || 75;
    const days = parseInt(daysSlider.value) || 4;

    // Basal multiplier
    const activityMultiplier = 1.2 + days * 0.08;
    let baseCalories = weight * 24 * activityMultiplier;

    let proteinGrams = weight * 2.2; // 2.2g per kg
    let fatGrams = weight * 0.9; // 0.9g per kg
    let calorieAdjustment = 0;

    if (currentGoal === 'cut') {
      calorieAdjustment = -500;
      proteinGrams = weight * 2.4; // higher protein during cut
    } else if (currentGoal === 'bulk') {
      calorieAdjustment = 450;
      proteinGrams = weight * 2.0;
    }

    const totalCalories = Math.round(baseCalories + calorieAdjustment);
    const caloriesFromProteinAndFat = proteinGrams * 4 + fatGrams * 9;
    const remainingCalories = Math.max(0, totalCalories - caloriesFromProteinAndFat);
    const carbGrams = Math.round(remainingCalories / 4);

    resultCalories.textContent = totalCalories.toLocaleString();
    resultProtein.textContent = `${Math.round(proteinGrams)}g`;
    resultCarbs.textContent = `${carbGrams}g`;
    resultFats.textContent = `${Math.round(fatGrams)}g`;
  }

  calculateMacros();

  // ==========================================
  // 9. MEMBERSHIP & VIP PASS CLAIM MODAL & CONFETTI
  // ==========================================
  const vipModal = document.getElementById('vip-pass-modal');
  const modalBodyCard = vipModal ? vipModal.querySelector('.modal-card') : null;
  const initialModalContent = modalBodyCard ? modalBodyCard.innerHTML : '';

  function updateModalForPlan(planKey) {
    const modalTitle = document.getElementById('vip-modal-title');
    const modalSubtitle = vipModal ? vipModal.querySelector('.modal-subtitle') : null;
    const submitBtn = vipModal ? vipModal.querySelector('#vip-claim-form button[type="submit"]') : null;

    if (planKey === '1month') {
      if (modalTitle) modalTitle.textContent = 'ENROLL: 1 MONTH PASS';
      if (modalSubtitle) modalSubtitle.textContent = 'Enter your athlete details to register for 1-Month Membership (₹500).';
      if (submitBtn) submitBtn.innerHTML = 'CONFIRM 1-MONTH PASS (₹500) &gt;&gt;&gt;';
    } else if (planKey === '3months') {
      if (modalTitle) modalTitle.textContent = 'ENROLL: 3 MONTHS PASS';
      if (modalSubtitle) modalSubtitle.textContent = 'Enter your athlete details to register for 3-Months Transformation Plan (₹1,400).';
      if (submitBtn) submitBtn.innerHTML = 'CONFIRM 3-MONTHS PASS (₹1,400) &gt;&gt;&gt;';
    } else {
      if (modalTitle) modalTitle.textContent = 'CLAIM 1-DAY PASS';
      if (modalSubtitle) modalSubtitle.textContent = 'Enter your details to generate your digital VIP Guest Pass for complimentary full facility access.';
      if (submitBtn) submitBtn.innerHTML = 'GENERATE VIP GUEST PASS &gt;&gt;&gt;';
    }
  }

  function openModal(planKey = 'vippass') {
    const protoModal = document.getElementById('protocol-modal');
    if (protoModal && protoModal.classList.contains('is-open')) {
      protoModal.classList.remove('is-open');
    }
    if (vipModal && modalBodyCard) {
      // If modal was previously showing confirmation screen, restore original form
      if (!modalBodyCard.querySelector('#vip-claim-form')) {
        modalBodyCard.innerHTML = initialModalContent;
        initModalFormEvents();
      }

      const planSelect = document.getElementById('vip-plan-select');
      if (planSelect) {
        planSelect.value = planKey;
      }
      updateModalForPlan(planKey);

      vipModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (vipModal) {
      vipModal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  function initModalFormEvents() {
    const closeBtn = document.getElementById('close-vip-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    const planSelect = document.getElementById('vip-plan-select');
    if (planSelect) {
      planSelect.addEventListener('change', () => {
        updateModalForPlan(planSelect.value);
      });
    }

    // Strict 10-digit numeric restriction for phone input
    const vipPhoneInput = document.getElementById('vip-phone-input');
    if (vipPhoneInput) {
      const syncPhoneState = () => {
        vipPhoneInput.value = vipPhoneInput.value.replace(/\D/g, '').slice(0, 10);
        const badge = document.getElementById('phone-digit-badge');
        if (badge) {
          badge.textContent = `${vipPhoneInput.value.length}/10 Digits`;
          badge.style.color = vipPhoneInput.value.length === 10 ? '#25d366' : '#ff5533';
        }
      };

      vipPhoneInput.addEventListener('input', syncPhoneState);
      vipPhoneInput.addEventListener('paste', () => setTimeout(syncPhoneState, 0));
      vipPhoneInput.addEventListener('keypress', (e) => {
        if (!/[0-9]/.test(e.key) && e.key !== 'Enter') {
          e.preventDefault();
        }
      });
      vipPhoneInput.addEventListener('keydown', (e) => {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
        if (vipPhoneInput.value.length >= 10 && !allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
        }
      });
    }

    const form = document.getElementById('vip-claim-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const phoneInput = document.getElementById('vip-phone-input');
        const phoneRaw = phoneInput?.value.trim() || '';
        const phoneDigits = phoneRaw.replace(/\D/g, '');

        if (phoneDigits.length !== 10) {
          alert('Kripya karke valid 10-digit mobile number enter karein!');
          phoneInput?.focus();
          return;
        }

        const name = document.getElementById('vip-name-input')?.value.trim() || 'Athlete';
        const phone = phoneDigits;
        const email = document.getElementById('vip-email-modal-input')?.value.trim() || 'Not Provided';
        const planEl = document.getElementById('vip-plan-select');
        const planVal = planEl ? planEl.value : 'vippass';
        const planText = planEl ? planEl.options[planEl.selectedIndex].text : '1-Day Free VIP Pass';
        const isPaid = planVal === '1month' || planVal === '3months';
        const goalSelect = document.getElementById('vip-goal-select');
        const goalText = goalSelect ? goalSelect.options[goalSelect.selectedIndex].text : 'General Fitness';
        const passId = (isPaid ? 'FIRE-MEM-' : 'FIRE-VIP-') + Math.floor(100000 + Math.random() * 900000);

        sfx.celebrate();
        triggerConfetti();

        // Format WhatsApp message with rich text and emojis
        const waMessage = isPaid
          ? `🔥 *FIRE FITNESS // MEMBERSHIP REGISTRATION* 🔥
━━━━━━━━━━━━━━━━━━━━━━
👤 *Full Name:* ${name}
📱 *Phone Number:* ${phone}
📧 *Email Address:* ${email}
💳 *Selected Plan:* ${planText}
🎯 *Training Focus:* ${goalText}
🎫 *Booking ID:* ${passId}
📍 *Gym Branch:* Opposite Referral Hospital, Chandi, Nalanda (803108)
━━━━━━━━━━━━━━━━━━━━━━
💬 *Message:* Hello Coach Sonu! I want to confirm my membership registration for *${planText}* at Fire Fitness Chandi. Please confirm my workout slot and payment details. Thank you! 🏋️‍♂️⚡`
          : `🔥 *FIRE FITNESS // NEW VIP PASS BOOKING* 🔥
━━━━━━━━━━━━━━━━━━━━━━
👤 *Full Name:* ${name}
📱 *Phone Number:* ${phone}
📧 *Email Address:* ${email}
🎫 *Pass ID:* ${passId}
🎯 *Training Focus:* ${goalText}
📍 *Gym Branch:* Opposite Referral Hospital, Chandi, Nalanda (803108)
━━━━━━━━━━━━━━━━━━━━━━
💬 *Message:* Hello Fire Fitness! I just claimed my 1-Day VIP Guest Pass on your official website. Please confirm my workout slot and timing. Thank you! 🏋️‍♂️⚡`;

        const gymNumber = '917857895996';
        const encodedText = encodeURIComponent(waMessage);

        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const whatsappUrl = isMobile 
          ? `https://api.whatsapp.com/send?phone=${gymNumber}&text=${encodedText}`
          : `https://web.whatsapp.com/send?phone=${gymNumber}&text=${encodedText}`;

        try {
          window.open(whatsappUrl, '_blank');
        } catch (err) {
          console.log('Auto popup blocked; fallback button provided.');
        }

        // Show confirmation inside modal
        if (modalBodyCard) {
          modalBodyCard.innerHTML = `
            <div style="text-align: center; padding: 8px 0;">
              <div style="width: 65px; height: 65px; border-radius: 50%; background: #ff2a00; color: #ffffff; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 1.8rem; box-shadow: 0 0 30px rgba(255,42,0,0.6);">
                ✓
              </div>
              <h3 style="font-family: 'Syne', sans-serif; font-size: 1.8rem; color: #fff; margin-bottom: 8px;">
                ${isPaid ? 'REGISTRATION CONFIRMED' : 'VIP PASS ACTIVATED'}
              </h3>
              <p style="color: #c8cbd0; font-size: 0.9rem; line-height: 1.5; margin-bottom: 16px;">
                Welcome, <strong>${name}</strong>! Your registration for <strong>${planText}</strong> has been generated and is ready to send to Coach Sonu.
              </p>

              <div style="background: rgba(255,42,0,0.08); border: 1px dashed #ff2a00; border-radius: 12px; padding: 14px; text-align: left; margin-bottom: 18px; font-size: 0.85rem; color: #d4cfd2; line-height: 1.6;">
                <div><strong>Booking ID:</strong> <span style="font-family: monospace; color: #ff3311; font-weight: 700;">${passId}</span></div>
                <div><strong>Plan:</strong> <span style="color: #ffaa00; font-weight: 700;">${planText}</span></div>
                <div><strong>Name:</strong> ${name}</div>
                <div><strong>Mobile:</strong> ${phone}</div>
                <div><strong>Email:</strong> ${email}</div>
                <div><strong>Goal:</strong> ${goalText}</div>
              </div>

              <!-- Direct One-Click WhatsApp Trigger Button -->
              <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-neon" style="width: 100%; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #25D366, #128C7E); box-shadow: 0 0 25px rgba(37, 211, 102, 0.4); margin-bottom: 12px; padding: 14px; font-size: 0.95rem;">
                <span>💬</span> SEND ON WHATSAPP &gt;&gt;&gt;
              </a>

              <button class="btn-outline" id="close-confirmed-btn" style="width: 100%; padding: 10px; font-size: 0.85rem; border-color: rgba(255,255,255,0.15);">
                Close Window
              </button>
            </div>
          `;
          document.getElementById('close-confirmed-btn')?.addEventListener('click', closeModal);
        }
      });
    }
  }

  // Initial event bindings
  initModalFormEvents();

  // Pricing cards & VIP trigger buttons (delegated listener)
  document.addEventListener('click', (e) => {
    const planBtn = e.target.closest('.open-plan-modal-btn');
    if (planBtn) {
      const plan = planBtn.getAttribute('data-plan') || 'vippass';
      openModal(plan);
      return;
    }
    const vipBtn = e.target.closest('.open-vip-modal-btn');
    if (vipBtn) {
      openModal('vippass');
      return;
    }
  });

  if (vipModal) {
    vipModal.addEventListener('click', (e) => {
      if (e.target === vipModal) closeModal();
    });
  }

  // Hero Quick Form & Footer Email Quick Join -> Connects directly to VIP Modal
  const footerCtaForm = document.getElementById('footer-cta-form');
  if (footerCtaForm) {
    footerCtaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = footerCtaForm.querySelector('.cta-email-input');
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const vipEmail = document.getElementById('vip-email-modal-input');
      if (vipEmail && emailVal) {
        vipEmail.value = emailVal;
      }
      openModal();
    });
  }

  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff1a00', '#ff4500', '#ff7700', '#ffaa00', '#ffffff'],
      });
    }
  }

  // ==========================================
  // 10. PROGRAM DETAIL PROTOCOL MODAL
  // ==========================================
  const protocolModal = document.getElementById('protocol-modal');
  const programCards = document.querySelectorAll('.program-card');
  const closeProtocolBtn = document.getElementById('close-protocol-modal-btn');

  const protocolData = {
    barbell: {
      title: 'BARBELL BASICS // POWERLIFTING',
      subtitle: 'Neural Maximum Force Development & Biomechanical Leverage',
      details: 'Focuses on the core kinetic chain: deadlift, low-bar back squat, and bench press. Employs 85-92% 1RM neural stimulation, wave loading, and precision kinetic path analysis.',
      stats: [
        { label: 'Weekly Sessions', val: '4 Days' },
        { label: 'Neural Load', val: '9.4 / 10' },
        { label: 'Target Output', val: '+22% 1RM' },
      ],
    },
    kettlebell: {
      title: 'KETTLEBELL MASTERCLASS',
      subtitle: 'Rotational Velocity & Dynamic Kinetic Torque',
      details: 'Master the Russian swing, Turkish get-up, and snatch. Amplifies posterior chain elasticity, anti-rotational stability, and endurance under metabolic duress.',
      stats: [
        { label: 'Weekly Sessions', val: '3 Days' },
        { label: 'Mobility Index', val: '9.8 / 10' },
        { label: 'VO2 Max Shift', val: '+14%' },
      ],
    },
    cardio: {
      title: 'CARDIO POWER BOOST',
      subtitle: 'Mitochondrial Density & Anaerobic Threshold Expansion',
      details: 'Ergometer intervals, curved treadmill sprints, and air bike power bursts. Designed to elevate your lactate threshold and maximize cardiorespiratory endurance.',
      stats: [
        { label: 'Weekly Sessions', val: '3 Days' },
        { label: 'Heart Zone', val: 'Zone 4-5' },
        { label: 'Lactate Cleared', val: '3.2x faster' },
      ],
    },
    calisthenics: {
      title: 'CALISTHENICS DIVISION',
      subtitle: 'Relative Strength & Gymnastic Joint Mastery',
      details: 'Strict muscle-ups, planches, levers, and handstand presses. Builds tendon resilience and unmatched power-to-bodyweight ratios.',
      stats: [
        { label: 'Weekly Sessions', val: '4 Days' },
        { label: 'Tendon Strength', val: 'Maximum' },
        { label: 'Gravity Index', val: 'Unchained' },
      ],
    },
    hypertrophy: {
      title: 'HYPERTROPHY DIVISION',
      subtitle: 'Metabolic Stress & Mechanical Tension Protocol • Coach Sonu Raj Patel',
      details: 'Engineered volume splits designed by Founder Sonu Raj Patel utilizing drop sets, myo-reps, and peak contraction pauses to trigger maximal myofibrillar hypertrophy.',
      stats: [
        { label: 'Weekly Sessions', val: '5 Days' },
        { label: 'Master Coach', val: 'Sonu Raj Patel' },
        { label: 'Lean Mass Gain', val: '+4.8kg / 12wks' },
      ],
    },
    hiit: {
      title: 'HIIT VELOCITY',
      subtitle: 'High-Velocity EPOC & Post-Exercise Oxygen Debt',
      details: '20-second all-out sprint protocols with micro-recovery intervals. Stimulates high hormonal output and burns calories for up to 36 hours post-session.',
      stats: [
        { label: 'Weekly Sessions', val: '3 Days' },
        { label: 'Afterburn Window', val: '36 Hours' },
        { label: 'Intensity', val: '100% Max HR' },
      ],
    },
  };

  programCards.forEach((card) => {
    card.addEventListener('click', () => {
      const progKey = card.getAttribute('data-program');
      const data = protocolData[progKey];
      if (data && protocolModal) {
        document.getElementById('protocol-title').textContent = data.title;
        document.getElementById('protocol-subtitle').textContent = data.subtitle;
        document.getElementById('protocol-desc').textContent = data.details;

        const statsWrap = document.getElementById('protocol-stats-grid');
        if (statsWrap) {
          statsWrap.innerHTML = data.stats
            .map(
              (s) => `
              <div class="protocol-stat-item">
                <div class="protocol-stat-val">${s.val}</div>
                <div class="protocol-stat-label">${s.label}</div>
              </div>
            `
            )
            .join('');
        }

        protocolModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeProtocolBtn) {
    closeProtocolBtn.addEventListener('click', () => {
      protocolModal.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  }

  if (protocolModal) {
    protocolModal.addEventListener('click', (e) => {
      if (e.target === protocolModal) {
        protocolModal.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }
});
