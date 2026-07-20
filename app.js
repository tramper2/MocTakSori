/* app.js - Moktak Meditation Logic */

// ==========================================
// 1. Scripture Data
// ==========================================
const SCRIPTURES = {
  banya: {
    title: "마하반야바라밀다심경 (반야심경)",
    lines: [
      "마하반야바라밀다심경",
      "관자재보살 행심반야바라밀다시 조견오온개공 도일체고액",
      "사리자 색불이공 공불이색 색즉시공 공즉시색 수상행식 역부여시",
      "사리자 시제법공상 불생불멸 불구부정 부증불감",
      "시고 공중무색 무수상행식",
      "무안이비설신의 무색성향미촉법 무안계 내지 무의식계",
      "무무명 역무무명진 내지 무노사 역무노사진",
      "무고집멸도 무지역무득 이무소득고",
      "보리살타 의반야바라밀다고 심무가애 무가애고",
      "무유공포 원리전도몽상 구경열반",
      "삼세제불 의반야바라밀다고 득아뇩다라삼먁삼보리",
      "고지 반야바라밀다 시대신주 시대명주 시무상주 시무등등주",
      "능제일체고 진실불허 고설 반야바라밀다주 즉설주왈",
      "아제아제 바라아제 바라승아제 모지 사바하 (3번)"
    ],
    streamUrl: "https://edz-audio.s3.amazonaws.com/Chants/01_ChantHeartSutra_SamishIslandSesshin_2008-06.mp3"
  },
  "cheon-su": {
    title: "천수경 (신묘장구대다라니)",
    lines: [
      "정구업진언: 수리수리 마하수리 수수리 사바하 (3번)",
      "오방내외안제신진언: 나무 사만다 못다남 옴 도로도로 지미 사바하 (3번)",
      "개경게: 무상심심미묘법 백천만겁난조우 아금문견득수지 원해여래진실의",
      "개법장진언: 옴 아라남 아라다 (3번)",
      "신묘장구대다라니 나모라 다나다라 야야 나막알야 바로기제 새바라야",
      "모지사다바야 마하사다바야 마하가로니가야 옴 살바 바예수 다라나",
      "가라야 다사명 나막까리다바 이맘알야 바로기제 새바라 다바",
      "니라간타 나막하리나야 마발다 이사미 살발타 사다남 수반아예염",
      "살바보다남 바바말아 바지도 수다감 다냐타 옴 아로계 아로가",
      "마지로가 지가란제 혜혜하례 마하모지사다바 지라지라 마하지라지라",
      "하례하례 바로기제 새바라야 자라자라 마라마라 아마라 몰제예",
      "혜혜로로 설라설라 아라삼 사라사리벌사벌사 바라사야",
      "구로구로 갈마 사다야 사다야 도로도로 미연제 마하미연제",
      "다라다라 다린나례 새바라야 자라자라 마라미마라 아마라",
      "하례하례 사바하"
    ],
    streamUrl: "https://themathesontrust.org/papers/sacredaudio/sa-buddhism/sa-bu-heartsutra-chinese.mp3"
  },
  "gwan-se-eum": {
    title: "관세음보살정근 (관음기도)",
    lines: [
      "나무 삼계도사 사생자부 본사석가모니불",
      "나무 좌보처 대세지보살",
      "나무 우보처 관세음보살",
      "대자대비 민중생 가지옹호 혜원명",
      "관세음보살 관세음보살 관세음보살",
      "관세음보살 관세음보살 관세음보살",
      "관세음보살 관세음보살 관세음보살",
      "관세음보살 관세음보살 관세음보살",
      "관세음보살 관세음보살 관세음보살",
      "관세음보살 관세음보살 관세음보살",
      "관세음보살 멸업장진언: 옴 아로리까 사바하 (3번)",
      "구족신통력 광수지방편 시방제국토 무찰불현신",
      "고아일심귀명정례"
    ],
    streamUrl: "https://themathesontrust.org/papers/sacredaudio/sa-buddhism/sa-bu-heartsutra-tibetan.mp3"
  }
};

// ==========================================
// 2. Application State
// ==========================================
const state = {
  // Config Settings
  activeScriptureKey: 'banya',
  audioMode: 'danny', // 'danny' | 'eunee' | 'tts' | 'custom'
  volume: 0.85,     // 0.0 - 1.0
  speed: 1.0,       // 0.5 - 1.5 (TTS speed)
  synthPitch: 750,  // 500Hz - 1000Hz (Moktak pitch)
  synthVolume: 0.45,// 0.0 - 1.0
  idleTimeout: 8000,// milliseconds until fadeout (default 8s)

  // State Variables
  audioState: 'idle', // 'idle' | 'playing' | 'fading_out' | 'fading_in' | 'paused'
  activeLineIndex: 0,
  totalStrikes: 0,
  meditationTimeSec: 0,
  
  // Timers and References
  idleTimer: null,
  meditationTimer: null,
  fadeInterval: null,
  ttsActiveUtterance: null,
  
  // Custom uploaded audio object url
  customAudioUrl: null,
  
  // Web Audio Context (initialized on first click)
  audioCtx: null,
  noiseBuffer: null
};

// DOM Cache
const dom = {
  moktakHitArea: document.getElementById('moktak-hit-area'),
  moktakBodyGroup: document.getElementById('moktak-body-group'),
  malletElement: document.getElementById('mallet-element'),
  scriptureSelect: document.getElementById('scripture-select'),
  audioModeRadios: document.getElementsByName('audio-mode'),
  fileUploadContainer: document.getElementById('file-upload-container'),
  audioFileInput: document.getElementById('audio-file-input'),
  fileNameText: document.getElementById('file-name-text'),
  
  volumeSlider: document.getElementById('volume-slider'),
  volumeVal: document.getElementById('volume-val'),
  speedSlider: document.getElementById('speed-slider'),
  speedVal: document.getElementById('speed-val'),
  speedControlGroup: document.getElementById('speed-control-group'),
  synthPitchSlider: document.getElementById('synth-pitch-slider'),
  pitchVal: document.getElementById('pitch-val'),
  synthVolumeSlider: document.getElementById('synth-volume-slider'),
  synthVolumeVal: document.getElementById('synth-volume-val'),
  idleTimeoutSlider: document.getElementById('idle-timeout-slider'),
  idleTimeoutVal: document.getElementById('idle-timeout-val'),
  
  statCountToday: document.getElementById('stat-count-today'),
  statTimeToday: document.getElementById('stat-time-today'),
  resetStatsBtn: document.getElementById('reset-stats-btn'),
  
  menuToggleBtn: document.getElementById('menu-toggle-btn'),
  panelCloseBtn: document.getElementById('panel-close-btn'),
  controlsPanel: document.getElementById('controls-panel'),
  
  waveRing1: document.getElementById('wave-ring-1'),
  waveRing2: document.getElementById('wave-ring-2'),
  auraGlow: document.getElementById('aura-glow'),
  tapHint: document.getElementById('tap-hint'),
  
  scriptureTitleBadge: document.getElementById('scripture-title-badge'),
  playbackStatusIndicator: document.getElementById('playback-status-indicator'),
  soundIndicator: document.getElementById('sound-indicator'),
  scriptureBodyContainer: document.getElementById('scripture-body-container'),
  restartChantBtn: document.getElementById('restart-chant-btn'),
  
  sutraAudioPlayer: document.getElementById('sutra-audio-player'),
  particleCanvas: document.getElementById('particle-canvas'),
  starsContainer: document.getElementById('stars-container')
};

// ==========================================
// 3. Audio & Synthesis Engines
// ==========================================

// Web Audio Context initialization
function initAudioContext() {
  if (state.audioCtx) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioContextClass();
    
    // Create pre-allocated noise buffer for mallet click
    const sampleRate = state.audioCtx.sampleRate;
    const bufferSize = sampleRate * 0.1; // 0.1s is plenty
    state.noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, sampleRate);
    const data = state.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } catch (e) {
    console.error("Web Audio API is not supported in this browser.", e);
  }
}

// Synthesize Moktak strike woodblock sound
function playMoktakSynth() {
  initAudioContext();
  if (!state.audioCtx) return;

  // Resume context if suspended (common browser security rule)
  if (state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }

  const ctx = state.audioCtx;
  const now = ctx.currentTime;
  
  // Randomize pitch slightly (±12Hz) to make it sound organic
  const randomPitchOffset = (Math.random() * 24) - 12;
  const pitch = state.synthPitch + randomPitchOffset;
  const vol = state.synthVolume;
  
  // 1. Master gain envelope
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(vol, now + 0.002); // instant attack
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28); // hollow tail decay
  
  // 2. Main Sine sweep (Fundamental tone of cavity)
  const oscMain = ctx.createOscillator();
  oscMain.type = 'sine';
  oscMain.frequency.setValueAtTime(pitch * 1.15, now);
  oscMain.frequency.exponentialRampToValueAtTime(pitch, now + 0.05); // quick drop in pitch mimics hollow shape
  
  // 3. Secondary triangle/sine wave (Wood resonance overtones)
  const oscOver = ctx.createOscillator();
  oscOver.type = 'triangle';
  oscOver.frequency.setValueAtTime(pitch * 1.58, now); // wood block resonance ratio
  
  const overtoneGain = ctx.createGain();
  overtoneGain.gain.setValueAtTime(vol * 0.35, now);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  
  // 4. White noise burst (mallet contact click)
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = state.noiseBuffer;
  
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 1300;
  noiseFilter.Q.value = 5.0;
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vol * 0.6, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012); // very rapid decay
  
  // Connect modules
  oscMain.connect(masterGain);
  
  oscOver.connect(overtoneGain);
  overtoneGain.connect(masterGain);
  
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  
  masterGain.connect(ctx.destination);
  
  // Play nodes
  oscMain.start(now);
  oscOver.start(now);
  noiseSource.start(now);
  
  oscMain.stop(now + 0.3);
  oscOver.stop(now + 0.3);
  noiseSource.stop(now + 0.3);
}

// ==========================================
// 4. Canvas Particle System
// ==========================================
const canvas = dom.particleCanvas;
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'spark' | 'petal' | 'ambient'
    
    if (type === 'spark') {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - (Math.random() * 2); // slight bias upwards
      this.size = Math.random() * 3 + 2;
      this.color = `hsla(${Math.random() * 15 + 40}, 100%, ${Math.random() * 20 + 70}%, 1)`; // gold shades
      this.life = 1.0;
      this.decay = Math.random() * 0.03 + 0.02;
    } else if (type === 'petal') {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 1; // rise slightly
      this.size = Math.random() * 6 + 4;
      // Lotus pink/crimson shades
      this.color = `hsla(${Math.random() * 20 + 345}, 80%, ${Math.random() * 10 + 65}%, 0.95)`;
      this.life = 1.0;
      this.decay = Math.random() * 0.015 + 0.01;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.05;
    } else if (type === 'ambient') {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -Math.random() * 0.5 - 0.1; // steady float upwards
      this.size = Math.random() * 1.5 + 0.5;
      this.color = `rgba(212, 175, 55, ${Math.random() * 0.15 + 0.05})`; // soft gold glow
      this.life = Math.random() * 0.5 + 0.5;
      this.decay = 0; // ambient stars recycle
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    if (this.type === 'spark') {
      this.vy += 0.08; // gravity
      this.life -= this.decay;
    } else if (this.type === 'petal') {
      this.vy += 0.03; // light gravity
      this.vx += Math.sin(this.y * 0.02) * 0.05; // sway breeze
      this.angle += this.spin;
      this.life -= this.decay;
    } else if (this.type === 'ambient') {
      // Recycle ambient when float out of top or side
      if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.y = canvas.height + 10;
        this.x = Math.random() * canvas.width;
      }
    }
  }

  draw() {
    ctx.save();
    if (this.type === 'spark') {
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(252, 232, 129, 0.6)';
      ctx.fillStyle = this.color.replace('1)', `${this.life})`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'petal') {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color.replace('0.95)', `${this.life * 0.95})`);
      
      // Draw a small curved leaf shape (lotus petal)
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.quadraticCurveTo(this.size * 0.6, -this.size * 0.3, 0, this.size);
      ctx.quadraticCurveTo(-this.size * 0.6, -this.size * 0.3, 0, -this.size);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'ambient') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// Spawn visual strike burst particles
function spawnStrikeParticles(x, y) {
  // Spark count
  const sparkCount = 15;
  for (let i = 0; i < sparkCount; i++) {
    particles.push(new Particle(x, y, 'spark'));
  }
  
  // Lotus petal count
  const petalCount = 8;
  for (let i = 0; i < petalCount; i++) {
    particles.push(new Particle(x, y, 'petal'));
  }
}

// Seed ambient backdrop particles
function seedAmbientParticles() {
  const ambientCount = 35;
  for (let i = 0; i < ambientCount; i++) {
    particles.push(new Particle(0, 0, 'ambient'));
  }
}

// Visual Particle Loop
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles = particles.filter(p => {
    p.update();
    p.draw();
    // Keep ambient or those still alive
    return p.type === 'ambient' || p.life > 0;
  });
  
  requestAnimationFrame(animateParticles);
}

// Start particle engine
seedAmbientParticles();
animateParticles();

// ==========================================
// 5. Scripture Text Rendering & Sync
// ==========================================
function renderActiveScriptureText() {
  if (state.audioMode === 'danny') {
    dom.scriptureTitleBadge.textContent = "대니음원 (우종관 개인기도)";
    dom.scriptureBodyContainer.innerHTML = `
      <div class="scripture-placeholder audio-notice-box">
        <p class="audio-notice-icon">☸</p>
        <p class="audio-notice-title">대니음원 수행</p>
        <p class="audio-notice-sub">우종관 개인기도2</p>
        <p class="audio-notice-desc">목탁을 두드리면 마음의 평온과 함께 음원이 재생됩니다.</p>
      </div>
    `;
    return;
  } else if (state.audioMode === 'eunee') {
    dom.scriptureTitleBadge.textContent = "으니음원 (조은희 개인기도)";
    dom.scriptureBodyContainer.innerHTML = `
      <div class="scripture-placeholder audio-notice-box">
        <p class="audio-notice-icon">☸</p>
        <p class="audio-notice-title">으니음원 수행</p>
        <p class="audio-notice-sub">조은희 개인기도</p>
        <p class="audio-notice-desc">목탁을 두드리면 마음의 평온과 함께 음원이 재생됩니다.</p>
      </div>
    `;
    return;
  }

  const sc = SCRIPTURES[state.activeScriptureKey];
  dom.scriptureTitleBadge.textContent = sc.title;
  dom.scriptureBodyContainer.innerHTML = '';
  
  sc.lines.forEach((line, index) => {
    const p = document.createElement('p');
    p.textContent = line;
    p.id = `scripture-line-${index}`;
    if (index === state.activeLineIndex) {
      p.classList.add('active-line');
    }
    dom.scriptureBodyContainer.appendChild(p);
  });
  
  scrollToActiveLine();
}

function updateActiveLineHighlight(newIndex) {
  if (newIndex < 0 || newIndex >= SCRIPTURES[state.activeScriptureKey].lines.length) return;
  
  // Remove old highlight
  const prevLine = dom.scriptureBodyContainer.querySelector('.active-line');
  if (prevLine) prevLine.classList.remove('active-line');
  
  // Set new highlight
  state.activeLineIndex = newIndex;
  const currLine = document.getElementById(`scripture-line-${newIndex}`);
  if (currLine) {
    currLine.classList.add('active-line');
    scrollToActiveLine();
  }
}

function scrollToActiveLine() {
  const activeEl = dom.scriptureBodyContainer.querySelector('.active-line');
  if (activeEl) {
    const containerHeight = dom.scriptureBodyContainer.clientHeight;
    const elemTop = activeEl.offsetTop;
    const elemHeight = activeEl.clientHeight;
    // Align active element centered in scrollable area
    dom.scriptureBodyContainer.scrollTop = elemTop - (containerHeight / 2) + (elemHeight / 2);
  }
}

// ==========================================
// 6. Audio Playing & TTS Recitation
// ==========================================

// Setup external streaming source or custom audio file
function setupAudioPlayer() {
  if (state.audioMode === 'danny') {
    dom.sutraAudioPlayer.src = 'Audio/우종관개인기도2.wav';
  } else if (state.audioMode === 'eunee') {
    dom.sutraAudioPlayer.src = 'Audio/조은희개인기도.wav';
  } else if (state.audioMode === 'custom' && state.customAudioUrl) {
    dom.sutraAudioPlayer.src = state.customAudioUrl;
  } else if (state.audioMode === 'stream') {
    dom.sutraAudioPlayer.src = SCRIPTURES[state.activeScriptureKey].streamUrl;
  } else {
    dom.sutraAudioPlayer.src = '';
  }
  dom.sutraAudioPlayer.load();
}

// Fade audio volume smoothly (HTML5 Audio element helper)
function fadeAudioElement(targetVol, durationMs, callback) {
  clearInterval(state.fadeInterval);
  const player = dom.sutraAudioPlayer;
  const startVol = player.volume;
  const step = 0.05;
  const volumeDelta = targetVol - startVol;
  
  if (Math.abs(volumeDelta) < 0.01) {
    player.volume = targetVol;
    if (callback) callback();
    return;
  }
  
  const stepIntervalTime = durationMs * step;
  let currentStepRatio = 0;
  
  state.fadeInterval = setInterval(() => {
    currentStepRatio += step;
    if (currentStepRatio >= 1.0) {
      clearInterval(state.fadeInterval);
      player.volume = targetVol;
      if (callback) callback();
    } else {
      player.volume = startVol + (volumeDelta * currentStepRatio);
    }
  }, stepIntervalTime);
}

// Audio Stream sync loop to auto-scroll scripture based on audio progress
dom.sutraAudioPlayer.addEventListener('timeupdate', () => {
  if (state.audioMode === 'tts' || state.audioMode === 'danny' || state.audioMode === 'eunee') return;
  const player = dom.sutraAudioPlayer;
  if (!player.duration || player.duration === Infinity) return;
  
  const totalLines = SCRIPTURES[state.activeScriptureKey].lines.length;
  // Distribute lines evenly across duration
  const ratio = player.currentTime / player.duration;
  const computedIndex = Math.min(Math.floor(ratio * totalLines), totalLines - 1);
  
  if (computedIndex !== state.activeLineIndex) {
    updateActiveLineHighlight(computedIndex);
  }
});

// If audio player ends, loop back to start
dom.sutraAudioPlayer.addEventListener('ended', () => {
  restartChant();
});

// Handles TTS playback line by line
function speakNextTTSLine() {
  if (state.audioState !== 'playing' && state.audioState !== 'fading_in') return;
  
  window.speechSynthesis.cancel(); // Clear any queued utterances
  
  const lines = SCRIPTURES[state.activeScriptureKey].lines;
  if (state.activeLineIndex >= lines.length) {
    state.activeLineIndex = 0; // restart
  }
  
  const lineText = lines[state.activeLineIndex];
  
  // Create Speech Utterance
  const utter = new SpeechSynthesisUtterance(lineText);
  utter.lang = 'ko-KR';
  utter.rate = state.speed * 0.78; // Meditative slower pacing
  utter.pitch = 0.75; // Deeper resonant voice mimicking a Buddhist monk
  utter.volume = state.volume;
  
  state.ttsActiveUtterance = utter;
  
  // Highlight text
  updateActiveLineHighlight(state.activeLineIndex);
  
  utter.onend = () => {
    // When a line finishes, advance and speak next line
    if (state.audioState === 'playing' || state.audioState === 'fading_in') {
      state.activeLineIndex = (state.activeLineIndex + 1) % lines.length;
      // Small pause between lines for meditation spacing (e.g. 800ms)
      setTimeout(speakNextTTSLine, 700);
    }
  };
  
  utter.onerror = (e) => {
    console.error("TTS SpeechSynthesis error", e);
  };
  
  window.speechSynthesis.speak(utter);
}

// Pause TTS
function pauseTTS() {
  window.speechSynthesis.cancel();
}

// Resume TTS
function resumeTTS() {
  speakNextTTSLine();
}

// Update playback UI indicators
function updatePlayerUI() {
  const badge = dom.playbackStatusIndicator.querySelector('.status-text');
  const dot = dom.playbackStatusIndicator.querySelector('.dot');
  
  dot.className = 'dot';
  
  switch (state.audioState) {
    case 'playing':
      badge.textContent = "수행 낭독 중";
      dot.classList.add('playing-dot');
      dom.auraGlow.classList.add('playing');
      dom.soundIndicator.classList.add('active');
      break;
    case 'fading_out':
      badge.textContent = "서서히 정지 중";
      dot.classList.add('fading-dot');
      dom.auraGlow.classList.remove('playing');
      dom.soundIndicator.classList.remove('active');
      break;
    case 'fading_in':
      badge.textContent = "수행 이어하기";
      dot.classList.add('playing-dot');
      dom.auraGlow.classList.add('playing');
      dom.soundIndicator.classList.add('active');
      break;
    case 'paused':
      badge.textContent = "명상 멈춤";
      dot.classList.add('idle-dot');
      dom.auraGlow.classList.remove('playing');
      dom.soundIndicator.classList.remove('active');
      break;
    case 'idle':
    default:
      badge.textContent = "대기 중";
      dot.classList.add('idle-dot');
      dom.auraGlow.classList.remove('playing');
      dom.soundIndicator.classList.remove('active');
      break;
  }
}

// ==========================================
// 7. Keep-Alive / Fade State Machine
// ==========================================

// Resets idle timer when user is active (tapping)
function resetIdleTimer() {
  clearTimeout(state.idleTimer);
  
  // Set new timer
  state.idleTimer = setTimeout(() => {
    // Fades out and pauses if no strikes occur within interval
    triggerFadeOut();
  }, state.idleTimeout);
}

// Tapping while paused or fading initiates Fade-In
function triggerFadeIn() {
  if (state.audioState === 'playing') {
    resetIdleTimer();
    return;
  }
  
  state.audioState = 'fading_in';
  updatePlayerUI();
  resetIdleTimer();
  startMeditationTimer();
  
  if (state.audioMode === 'tts') {
    state.audioState = 'playing'; // TTS resumes instantly
    updatePlayerUI();
    resumeTTS();
  } else {
    // HTML5 Audio Stream / Custom File
    dom.sutraAudioPlayer.volume = 0;
    
    // Play audio
    dom.sutraAudioPlayer.play().then(() => {
      fadeAudioElement(state.volume, 1500, () => {
        state.audioState = 'playing';
        updatePlayerUI();
      });
    }).catch(e => {
      console.warn("Audio element play failed, falling back to TTS", e);
      // Fallback: switch to TTS automatically
      state.audioMode = 'tts';
      document.querySelector('input[name="audio-mode"][value="tts"]').checked = true;
      toggleAudioModeConfig('tts');
      state.audioState = 'playing';
      updatePlayerUI();
      resumeTTS();
    });
  }
}

// Fades out audio and pauses
function triggerFadeOut() {
  if (state.audioState === 'paused' || state.audioState === 'idle') return;
  
  state.audioState = 'fading_out';
  updatePlayerUI();
  stopMeditationTimer();
  
  if (state.audioMode === 'tts') {
    pauseTTS();
    state.audioState = 'paused';
    updatePlayerUI();
  } else {
    fadeAudioElement(0, 1500, () => {
      dom.sutraAudioPlayer.pause();
      state.audioState = 'paused';
      updatePlayerUI();
    });
  }
}

// Restarts chanting from line 0
function restartChant() {
  state.activeLineIndex = 0;
  
  if (state.audioMode === 'tts') {
    if (state.audioState === 'playing' || state.audioState === 'fading_in') {
      window.speechSynthesis.cancel();
      speakNextTTSLine();
    } else {
      updateActiveLineHighlight(0);
    }
  } else {
    dom.sutraAudioPlayer.currentTime = 0;
    if (state.audioMode !== 'danny' && state.audioMode !== 'eunee') {
      updateActiveLineHighlight(0);
    }
  }
}

// ==========================================
// 8. Statistics Tracker
// ==========================================
function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function loadStats() {
  const today = getTodayString();
  state.totalStrikes = parseInt(localStorage.getItem(`moktak_strikes_${today}`) || '0');
  state.meditationTimeSec = parseInt(localStorage.getItem(`moktak_time_${today}`) || '0');
  
  updateStatsUI();
}

function recordStrike() {
  const today = getTodayString();
  state.totalStrikes++;
  localStorage.setItem(`moktak_strikes_${today}`, state.totalStrikes);
  updateStatsUI();
}

function startMeditationTimer() {
  clearInterval(state.meditationTimer);
  state.meditationTimer = setInterval(() => {
    state.meditationTimeSec++;
    const today = getTodayString();
    localStorage.setItem(`moktak_time_${today}`, state.meditationTimeSec);
    updateStatsUI();
  }, 1000);
}

function stopMeditationTimer() {
  clearInterval(state.meditationTimer);
}

function updateStatsUI() {
  dom.statCountToday.textContent = state.totalStrikes.toLocaleString();
  
  const m = String(Math.floor(state.meditationTimeSec / 60)).padStart(2, '0');
  const s = String(state.meditationTimeSec % 60).padStart(2, '0');
  dom.statTimeToday.textContent = `${m}:${s}`;
}

function resetStats() {
  const today = getTodayString();
  localStorage.setItem(`moktak_strikes_${today}`, '0');
  localStorage.setItem(`moktak_time_${today}`, '0');
  
  state.totalStrikes = 0;
  state.meditationTimeSec = 0;
  updateStatsUI();
}

// ==========================================
// 9. Interactive Action (Moktak Strike)
// ==========================================
function strikeMoktak(e) {
  // Prevent double triggers on mobile
  if (e) {
    e.preventDefault();
  }

  // 1. Trigger Sound Synthesizer
  playMoktakSynth();
  
  // 2. Play CSS Animations
  // Remove classes to trigger reflow
  dom.moktakHitArea.classList.remove('active');
  dom.malletElement.classList.remove('active');
  dom.waveRing1.classList.remove('wave-ring-animate');
  dom.waveRing2.classList.remove('wave-ring-animate');
  
  // Force browser layout recalculation
  void dom.moktakHitArea.offsetWidth;
  
  // Add active classes
  dom.moktakHitArea.classList.add('active');
  dom.malletElement.classList.add('active');
  
  // Trigger ripple rings
  dom.waveRing1.classList.add('wave-ring-animate');
  setTimeout(() => {
    dom.waveRing2.classList.add('wave-ring-animate');
  }, 150);

  // Hide the floating instruction hint on first strike
  if (dom.tapHint) {
    dom.tapHint.classList.add('hidden');
  }

  // 3. Spawn Canvas Particles centered on the Woodfish slit
  const rect = dom.moktakHitArea.getBoundingClientRect();
  const impactX = rect.left + rect.width / 2;
  const impactY = rect.top + rect.height / 2 + 30; // offset down to hit slit area
  spawnStrikeParticles(impactX, impactY);

  // 4. Update Strike Statistics
  recordStrike();

  // 5. Update Chanting Player State Machine (Trigger play/fade-in)
  triggerFadeIn();
}

// ==========================================
// 10. Configuration & Panel Triggers
// ==========================================

function toggleAudioModeConfig(mode) {
  state.audioMode = mode;
  
  if (mode === 'tts') {
    dom.fileUploadContainer.classList.add('hidden');
    dom.speedControlGroup.classList.remove('hidden');
    
    // Stop audio player
    dom.sutraAudioPlayer.pause();
  } else if (mode === 'danny' || mode === 'eunee') {
    dom.fileUploadContainer.classList.add('hidden');
    dom.speedControlGroup.classList.add('hidden');
    
    // Stop Speech
    window.speechSynthesis.cancel();
    setupAudioPlayer();
  } else if (mode === 'stream') {
    dom.fileUploadContainer.classList.add('hidden');
    dom.speedControlGroup.classList.add('hidden');
    
    // Stop Speech
    window.speechSynthesis.cancel();
    setupAudioPlayer();
  } else if (mode === 'custom') {
    dom.fileUploadContainer.classList.remove('hidden');
    dom.speedControlGroup.classList.add('hidden');
    
    // Stop Speech
    window.speechSynthesis.cancel();
    setupAudioPlayer();
  }
  
  renderActiveScriptureText();
  
  // Reset audio state to pause/idle on switch
  triggerFadeOut();
  state.audioState = 'idle';
  updatePlayerUI();
  restartChant();
}

// Wire Event Listeners
function setupEventListeners() {
  
  // Moktak Strike triggers (Mobile touchstart + PC mousedown)
  // Use non-passive touchstart to eliminate 300ms mobile tap delay
  dom.moktakHitArea.addEventListener('touchstart', strikeMoktak, { passive: false });
  dom.moktakHitArea.addEventListener('mousedown', (e) => {
    // Only trigger on left clicks
    if (e.button === 0) {
      strikeMoktak(e);
    }
  });

  // Settings Slide out panels
  dom.menuToggleBtn.addEventListener('click', () => {
    dom.controlsPanel.classList.add('open');
  });
  
  dom.panelCloseBtn.addEventListener('click', () => {
    dom.controlsPanel.classList.remove('open');
  });

  // Scripture Select
  dom.scriptureSelect.addEventListener('change', (e) => {
    state.activeScriptureKey = e.target.value;
    state.activeLineIndex = 0;
    renderActiveScriptureText();
    setupAudioPlayer();
    
    if (state.audioState === 'playing' || state.audioState === 'fading_in') {
      triggerFadeIn();
    }
  });

  // Radio Mode select
  dom.audioModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      toggleAudioModeConfig(e.target.value);
    });
  });

  // Local File Upload
  dom.audioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (state.customAudioUrl) {
        URL.revokeObjectURL(state.customAudioUrl);
      }
      state.customAudioUrl = URL.createObjectURL(file);
      dom.fileNameText.textContent = file.name;
      
      if (state.audioMode === 'custom') {
        setupAudioPlayer();
        triggerFadeOut();
        restartChant();
      }
    }
  });

  // Volume slider
  dom.volumeSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    dom.volumeVal.textContent = `${val}%`;
    state.volume = val / 100;
    
    // Dynamically adjust audio players
    dom.sutraAudioPlayer.volume = state.volume;
  });

  // Speed slider (TTS)
  dom.speedSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    dom.speedVal.textContent = `${val.toFixed(2)}x`;
    state.speed = val;
  });

  // Moktak Pitch Synth slider
  dom.synthPitchSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    dom.pitchVal.textContent = `${val}Hz`;
    state.synthPitch = val;
  });
  
  // Moktak Volume slider
  dom.synthVolumeSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    dom.synthVolumeVal.textContent = `${val}%`;
    state.synthVolume = val / 100;
  });

  // Idle Timeout slider
  dom.idleTimeoutSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    dom.idleTimeoutVal.textContent = `${val}초`;
    state.idleTimeout = val * 1000;
  });

  // Stats reset
  dom.resetStatsBtn.addEventListener('click', () => {
    if (confirm("오늘의 수행 기록을 완전히 초기화하시겠습니까?")) {
      resetStats();
    }
  });

  // Restart Scripture chant button
  dom.restartChantBtn.addEventListener('click', restartChant);
}

// Generate stars/ambient floating dots in background
function renderBackgroundStars() {
  const container = dom.starsContainer;
  const starCount = 20;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Random sizes, positions, animations
    const size = Math.random() * 2.5 + 0.5;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    
    // Stagger animation starts
    star.style.animationDelay = `${Math.random() * 15}s`;
    star.style.animationDuration = `${Math.random() * 10 + 10}s`;
    
    container.appendChild(star);
  }
}

// Init App
function initApp() {
  setupEventListeners();
  loadStats();
  renderActiveScriptureText();
  renderBackgroundStars();
  setupAudioPlayer();
  updatePlayerUI();
}

// Run init
initApp();
