/* ==========================================================================
   nawwaSpace - Interactive JS Engine
   Handles: 3s Boot Loader, Continuous Snake Cursor Trail, Audio Synthesizer,
   Theme Switcher, Guestbook LocalStorage, Mood Switcher, Arcade Game & Modals.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // 1. Audio Synthesizer Engine (Web Audio API - No external sound assets needed!)
  // ------------------------------------------------------------------------
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playTone(freq, duration, type = 'square', gainVal = 0.1) {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context playback error:", e);
    }
  }

  function playClickSound() {
    playTone(600, 0.05, 'square', 0.08);
  }

  function playHitburstSound() {
    playTone(880, 0.08, 'triangle', 0.12);
    setTimeout(() => playTone(1174.66, 0.1, 'square', 0.1), 50);
  }

  function playBootChime() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((note, i) => {
      setTimeout(() => playTone(note, 0.15, 'triangle', 0.15), i * 100);
    });
  }

  // Audio Toggle Button
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  audioToggleBtn?.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    if (audioIcon) audioIcon.textContent = isSoundEnabled ? '🔊' : '🔇';
    const textSpan = audioToggleBtn.querySelector('.btn-text');
    if (textSpan) textSpan.textContent = isSoundEnabled ? 'Audio ON' : 'Audio OFF';
    playClickSound();
  });


  // ------------------------------------------------------------------------
  // 2. 3-Second Retro OS Boot Loader
  // ------------------------------------------------------------------------
  const retroLoader = document.getElementById('retro-loader');
  const loaderProgressFill = document.getElementById('loader-progress-fill');
  const loadPercentText = document.getElementById('load-percent-text');
  const loadTimer = document.getElementById('load-timer');
  const skipLoadBtn = document.getElementById('skip-load-btn');
  const loaderCloseBtn = document.getElementById('loader-close-btn');

  let loadProgress = 0;
  let loadDuration = 3000; // 3 seconds
  let intervalTime = 50; // update every 50ms
  let totalSteps = loadDuration / intervalTime;
  let currentStep = 0;
  let loaderTimerId = null;

  function runLoader() {
    playBootChime();

    loaderTimerId = setInterval(() => {
      currentStep++;
      loadProgress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      
      if (loaderProgressFill) loaderProgressFill.style.width = `${loadProgress}%`;
      if (loadPercentText) loadPercentText.textContent = `${loadProgress}%`;

      const remainingSecs = Math.max(0, Math.ceil((loadDuration - (currentStep * intervalTime)) / 1000));
      if (loadTimer) loadTimer.textContent = remainingSecs;

      if (loadProgress >= 100) {
        clearInterval(loaderTimerId);
        finishLoading();
      }
    }, intervalTime);
  }

  function finishLoading() {
    if (retroLoader) {
      retroLoader.classList.add('hidden');
    }
  }

  skipLoadBtn?.addEventListener('click', () => {
    clearInterval(loaderTimerId);
    finishLoading();
    playClickSound();
  });

  loaderCloseBtn?.addEventListener('click', () => {
    clearInterval(loaderTimerId);
    finishLoading();
  });

  runLoader();


  // ------------------------------------------------------------------------
  // 3. Continuous Snake Cursor Trail Engine — Smooth + Fade + Mobile Disabled
  // ------------------------------------------------------------------------
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const canvas = document.getElementById('snake-trail-canvas');
  let ctx = null;

  if (!isTouchDevice && canvas) {
    // Hide canvas on touch devices
    ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const snakeColors = ['#C85828', '#C8A230', '#7A8C38', '#A83838', '#307870', '#604880'];
    const snakePoints = [];
    const maxPoints = 32;
    let lastMoveTime = 0;

    // Smooth lerp target
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let smoothX = targetX;
    let smoothY = targetY;

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      lastMoveTime = performance.now();
    });

    function renderSnakeTrail(now) {
      if (!ctx || !canvas) { requestAnimationFrame(renderSnakeTrail); return; }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lerp smoothly toward cursor
      smoothX += (targetX - smoothX) * 0.22;
      smoothY += (targetY - smoothY) * 0.22;

      const timeSinceMove = now - lastMoveTime;

      if (timeSinceMove < 60) {
        // Mouse is moving — add new point
        snakePoints.push({ x: smoothX, y: smoothY });
        if (snakePoints.length > maxPoints) snakePoints.shift();
      } else {
        // Mouse stopped — drain tail gradually
        if (snakePoints.length > 0) snakePoints.shift();
      }

      if (snakePoints.length > 1) {
        for (let i = 1; i < snakePoints.length; i++) {
          const pt1 = snakePoints[i - 1];
          const pt2 = snakePoints[i];
          const progress = i / snakePoints.length; // 0 (tail) → 1 (head)
          const colorIdx = Math.floor(progress * snakeColors.length) % snakeColors.length;

          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.strokeStyle = snakeColors[colorIdx];
          ctx.lineWidth = Math.max(1.5, progress * 9);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.globalAlpha = Math.max(0.05, progress * 0.85);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(renderSnakeTrail);
    }
    requestAnimationFrame(renderSnakeTrail);
  } else if (canvas) {
    // Touch device — hide the canvas entirely
    canvas.style.display = 'none';
  }


  // ------------------------------------------------------------------------
  // 4. Hitburst Spawner (Restricted EXCLUSIVELY to Mini Arcade Box!)
  // ------------------------------------------------------------------------
  const hitburstTexts = ['300!', '300!', 'PERFECT!', '100!', 'GREAT!', '300!'];

  function triggerArcadeHitburst(x, y) {
    const arcadeBox = document.getElementById('arcade-box');
    if (!arcadeBox) return;

    const rect = arcadeBox.getBoundingClientRect();
    const relX = x - rect.left;
    const relY = y - rect.top;

    const text = document.createElement('div');
    text.className = 'hitburst-text';
    text.textContent = hitburstTexts[Math.floor(Math.random() * hitburstTexts.length)];
    text.style.left = `${relX}px`;
    text.style.top = `${relY}px`;

    arcadeBox.appendChild(text);
    playHitburstSound();
    setTimeout(() => text.remove(), 600);
  }

  // Play click sound on general buttons (NO HITBURST OUTSIDE ARCADE)
  document.addEventListener('mousedown', () => {
    playClickSound();
  });


  // ------------------------------------------------------------------------
  // 5. Theme Toggler (Light / Dark Mode)
  // ------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem('nawwaspace_theme') || 'light';
  setTheme(savedTheme);

  function setTheme(mode) {
    htmlEl.setAttribute('data-theme', mode);
    localStorage.setItem('nawwaspace_theme', mode);
    if (themeIcon && themeText) {
      if (mode === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
      } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
      }
    }
  }

  themeToggleBtn?.addEventListener('click', () => {
    const currentMode = htmlEl.getAttribute('data-theme');
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    setTheme(newMode);
    playClickSound();
  });


  // ------------------------------------------------------------------------
  // 6. Interactive Chiptune Audio Player (Web Audio API Synthesized Music)
  // ------------------------------------------------------------------------
  const tracks = [
    { name: "Track 1: 8-Bit Arcade Chill", notes: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63] },
    { name: "Track 2: Synthwave Midnight Run", notes: [220.00, 261.63, 329.63, 440.00, 329.63, 261.63] },
    { name: "Track 3: Pixel Victory Fanfare", notes: [349.23, 440.00, 523.25, 698.46, 523.25, 440.00] }
  ];

  let currentTrackIdx = 0;
  let isPlayingMusic = false;
  let musicIntervalId = null;
  let noteStep = 0;

  const playPauseBtn = document.getElementById('play-pause-btn');
  const prevTrackBtn = document.getElementById('prev-track-btn');
  const nextTrackBtn = document.getElementById('next-track-btn');
  const trackNameDisplay = document.getElementById('current-track-name');
  const cassetteDeck = document.querySelector('.cassette-deck');
  const spoolLeft = document.getElementById('spool-left');
  const spoolRight = document.getElementById('spool-right');

  function updateTrackUI() {
    if (trackNameDisplay) {
      trackNameDisplay.textContent = tracks[currentTrackIdx].name;
    }
  }

  function startMusicPlayback() {
    isPlayingMusic = true;
    if (playPauseBtn) playPauseBtn.textContent = '⏸️ Pause';
    if (cassetteDeck) cassetteDeck.classList.add('playing');
    if (spoolLeft) spoolLeft.classList.add('spinning');
    if (spoolRight) spoolRight.classList.add('spinning');

    const currentNotes = tracks[currentTrackIdx].notes;
    musicIntervalId = setInterval(() => {
      const noteFreq = currentNotes[noteStep % currentNotes.length];
      playTone(noteFreq, 0.18, 'square', 0.08);
      noteStep++;
    }, 220);
  }

  function stopMusicPlayback() {
    isPlayingMusic = false;
    clearInterval(musicIntervalId);
    if (playPauseBtn) playPauseBtn.textContent = '▶️ Play Tune';
    if (cassetteDeck) cassetteDeck.classList.remove('playing');
    if (spoolLeft) spoolLeft.classList.remove('spinning');
    if (spoolRight) spoolRight.classList.remove('spinning');
  }

  playPauseBtn?.addEventListener('click', () => {
    playClickSound();
    if (isPlayingMusic) {
      stopMusicPlayback();
    } else {
      startMusicPlayback();
    }
  });

  prevTrackBtn?.addEventListener('click', () => {
    playClickSound();
    currentTrackIdx = (currentTrackIdx - 1 + tracks.length) % tracks.length;
    updateTrackUI();
    if (isPlayingMusic) {
      stopMusicPlayback();
      startMusicPlayback();
    }
  });

  nextTrackBtn?.addEventListener('click', () => {
    playClickSound();
    currentTrackIdx = (currentTrackIdx + 1) % tracks.length;
    updateTrackUI();
    if (isPlayingMusic) {
      stopMusicPlayback();
      startMusicPlayback();
    }
  });


  // ------------------------------------------------------------------------
  // 7. Mood Switcher Widget
  // ------------------------------------------------------------------------
  const moods = [
    { emoji: '🎧', text: 'In The Zone / Coding' },
    { emoji: '🎮', text: 'Gaming Arcade Mode' },
    { emoji: '🧋', text: 'Drinking Boba Tea' },
    { emoji: '💻', text: 'Building SentRa FYP' },
    { emoji: '🛡️', text: 'EDAG IT Security Admin' },
    { emoji: '✨', text: 'Designing Pixel UI' }
  ];

  let currentMoodIdx = 0;
  const moodBtn = document.getElementById('mood-selector-btn');
  const currentMoodEmoji = document.getElementById('current-mood-emoji');
  const currentMoodText = document.getElementById('current-mood-text');

  moodBtn?.addEventListener('click', () => {
    playClickSound();
    currentMoodIdx = (currentMoodIdx + 1) % moods.length;
    if (currentMoodEmoji) currentMoodEmoji.textContent = moods[currentMoodIdx].emoji;
    if (currentMoodText) currentMoodText.textContent = moods[currentMoodIdx].text;
  });


  // ------------------------------------------------------------------------
  // 8. Interactive Guestbook (LocalStorage Persistence)
  // ------------------------------------------------------------------------
  const guestbookForm = document.getElementById('guestbook-form');
  const guestbookList = document.getElementById('guestbook-list');

  function loadGuestbook() {
    const savedComments = JSON.parse(localStorage.getItem('nawwaspace_guestbook') || '[]');
    savedComments.forEach(comment => {
      renderComment(comment, false);
    });
  }

  function renderComment(data, prepend = true) {
    if (!guestbookList) return;
    const commentEl = document.createElement('div');
    commentEl.className = 'guestbook-comment';
    commentEl.innerHTML = `
      <div class="comment-avatar">${data.avatar || '👾'}</div>
      <div class="comment-content">
        <div class="comment-meta">
          <strong class="comment-author">${escapeHTML(data.name)}</strong>
          <span class="comment-time">${data.time}</span>
        </div>
        <p class="comment-text">${escapeHTML(data.message)}</p>
      </div>
    `;

    if (prepend && guestbookList.firstChild) {
      guestbookList.insertBefore(commentEl, guestbookList.firstChild);
    } else {
      guestbookList.appendChild(commentEl);
    }
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  guestbookForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    playClickSound();

    const nameInput = document.getElementById('gb-name');
    const avatarInput = document.getElementById('gb-avatar');
    const messageInput = document.getElementById('gb-message');

    if (!nameInput || !messageInput) return;

    const newComment = {
      name: nameInput.value.trim(),
      avatar: avatarInput ? avatarInput.value : '👾',
      message: messageInput.value.trim(),
      time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    renderComment(newComment, true);

    const savedComments = JSON.parse(localStorage.getItem('nawwaspace_guestbook') || '[]');
    savedComments.unshift(newComment);
    localStorage.setItem('nawwaspace_guestbook', JSON.stringify(savedComments));

    nameInput.value = '';
    messageInput.value = '';
  });

  loadGuestbook();


  // ------------------------------------------------------------------------
  // 9. Mini Pixel Arcade Game (Star Catcher + Hitburst ONLY inside Arcade)
  // ------------------------------------------------------------------------
  const startGameBtn = document.getElementById('start-game-btn');
  const arcadeBox = document.getElementById('arcade-box');
  const arcadeOverlay = document.getElementById('arcade-overlay');
  const gameScoreEl = document.getElementById('game-score');
  const gameHighscoreEl = document.getElementById('game-highscore');

  let gameScore = 0;
  let gameHighscore = parseInt(localStorage.getItem('nawwaspace_highscore') || '0', 10);
  let isGameRunning = false;
  let spawnIntervalId = null;

  if (gameHighscoreEl) gameHighscoreEl.textContent = gameHighscore;

  startGameBtn?.addEventListener('click', () => {
    playClickSound();
    if (isGameRunning) return;

    isGameRunning = true;
    gameScore = 0;
    if (gameScoreEl) gameScoreEl.textContent = gameScore;
    if (arcadeOverlay) arcadeOverlay.style.display = 'none';

    spawnIntervalId = setInterval(() => {
      spawnArcadeStar();
    }, 800);

    setTimeout(() => {
      endArcadeGame();
    }, 15000);
  });

  function spawnArcadeStar() {
    if (!arcadeBox || !isGameRunning) return;

    const star = document.createElement('div');
    star.className = 'falling-star';
    star.textContent = ['⭐', '🌟', '👾', '✨'][Math.floor(Math.random() * 4)];
    const leftPos = Math.random() * (arcadeBox.clientWidth - 30);
    star.style.left = `${leftPos}px`;

    star.addEventListener('click', (e) => {
      if (!isGameRunning) return;
      gameScore += 100;
      if (gameScoreEl) gameScoreEl.textContent = gameScore;
      
      // Trigger Hitburst text ONLY inside the arcade box!
      triggerArcadeHitburst(e.clientX, e.clientY);
      star.remove();
    });

    arcadeBox.appendChild(star);
    setTimeout(() => star.remove(), 2000);
  }

  function endArcadeGame() {
    isGameRunning = false;
    clearInterval(spawnIntervalId);

    if (gameScore > gameHighscore) {
      gameHighscore = gameScore;
      localStorage.setItem('nawwaspace_highscore', gameHighscore.toString());
      if (gameHighscoreEl) gameHighscoreEl.textContent = gameHighscore;
    }

    if (arcadeOverlay) {
      arcadeOverlay.style.display = 'flex';
      arcadeOverlay.innerHTML = `<p>Time's Up! 🎉<br>Your Score: <strong>${gameScore}</strong><br>Click "Start Game" to play again!</p>`;
    }
  }


  // ------------------------------------------------------------------------
  // 10. Modals for Top Projects & Info Cards
  // ------------------------------------------------------------------------
  const projectModal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const projectDetails = {
    sentra: {
      title: "SentRa: Bilingual Sentiment Analysis System",
      images: [
        { src: './images/sentra.png', caption: 'SentRa Dashboard' }
      ],
      html: `
        <p><strong>Category:</strong> Final Year Project (2025/2026)</p>
        <p><strong>Scope:</strong> Developed a machine learning and opinion mining tool that processes student evaluation text in both Malay and English.</p>
        <ul style="padding-left: 20px; margin: 10px 0;">
          <li>Automated lexicon creation and NLP preprocessing pipeline.</li>
          <li>Classifies sentiment into Positive, Neutral, and Negative polarity.</li>
          <li>Provides actionable insights for university faculty evaluations.</li>
        </ul>
        <p><strong>Tech Stack:</strong> Python, NLTK, Lexicon Mining, PHP, MySQL, Vercel.</p>
      `
    },
    smartmirror: {
      title: "S.M.A.R.T. Mirror Concept & Prototype",
      images: [
        { src: './images/smartmirror.png', caption: 'SMART Mirror Prototype' }
      ],
      html: `
        <p><strong>Award:</strong> InTeLex 2024 Silver Award Winner 🥈</p>
        <p><strong>Scope:</strong> Smart Ambient Mirror integrating facial recognition, daily productivity widgets, and real-time health metrics.</p>
        <ul style="padding-left: 20px; margin: 10px 0;">
          <li>Interactive widget dashboard displaying weather, schedule, and health tips.</li>
          <li>Recognized at InTeLex innovation showcase for human-computer interaction excellence.</li>
        </ul>
        <p><strong>Tech Stack:</strong> JavaScript, Python OpenCV, Figma UI/UX Prototype.</p>
      `
    },
    edag: {
      title: "EDAG Holding — Enterprise IT Internship",
      images: [],
      html: `
        <p><strong>Period:</strong> March 2026 – Present</p>
        <p><strong>Role &amp; Responsibilities:</strong></p>
        <ul style="padding-left: 20px; margin: 10px 0;">
          <li><strong>Active Directory:</strong> Identity provisioning, Group Policy, security permissions.</li>
          <li><strong>Systems Administration:</strong> Managing Windows 10/11, Ubuntu, Rocky Linux &amp; Kali Linux servers.</li>
          <li><strong>Service Desk:</strong> SLA-compliant incident resolution &amp; IT hardware troubleshooting.</li>
          <li><strong>Compliance:</strong> Evidence gathering for TISAX automotive security &amp; ISO 9001 quality audits.</li>
        </ul>
      `
    },
    leadership: {
      title: "UPNM DeSTeC Club & Event Leadership",
      images: [
        { src: './images/leadership.png', caption: 'DeSTeC Club Events' }
      ],
      html: `
        <p><strong>Roles:</strong> Secretary of DeSTeC Club (2024–2025) &amp; Vice Secretary of UPNM Chess Club.</p>
        <p><strong>Key Highlights:</strong></p>
        <ul style="padding-left: 20px; margin: 10px 0;">
          <li>Directed <em>MEPPS 2.0: Python Edition Programme</em> workshop for 100+ students.</li>
          <li>Co-organized Grandmasters Cup Chess Tournament.</li>
          <li>Deputy Secretary for MIACEP 2025 Malaysia-Indonesia Cultural Exchange.</li>
        </ul>
      `
    }
  };

  // Helper: build modal slideshow HTML
  function buildModalSlideshow(images) {
    if (!images || images.length === 0) return '';
    const imgs = images.map((img, i) =>
      `<img src="${img.src}" alt="${img.caption}" class="modal-slide-img${i === 0 ? ' active' : ''}" data-idx="${i}">`
    ).join('');
    const dots = images.length > 1 ? images.map((_, i) =>
      `<span class="slide-dot${i === 0 ? ' active' : ''}" data-idx="${i}"></span>`
    ).join('') : '';
    return `
      <div class="modal-slideshow" id="modal-ss">
        <div class="modal-slide-wrap">
          ${imgs}
        </div>
        ${images.length > 1 ? `
          <button class="slide-btn slide-prev" id="mss-prev">◀</button>
          <button class="slide-btn slide-next" id="mss-next">▶</button>
        ` : ''}
        <div class="slide-dots" style="justify-content:center;">${dots}</div>
        <div class="modal-slide-counter" id="mss-counter">${images.length > 0 ? '1 / ' + images.length : ''}</div>
      </div>
    `;
  }

  // Modal slideshow state
  let modalSsIdx = 0;
  let modalSsImages = [];

  function goModalSlide(dir) {
    if (modalSsImages.length < 2) return;
    const imgs = document.querySelectorAll('#modal-ss .modal-slide-img');
    const dots = document.querySelectorAll('#modal-ss .slide-dot');
    const counter = document.getElementById('mss-counter');
    imgs[modalSsIdx]?.classList.remove('active');
    dots[modalSsIdx]?.classList.remove('active');
    modalSsIdx = (modalSsIdx + dir + modalSsImages.length) % modalSsImages.length;
    imgs[modalSsIdx]?.classList.add('active');
    dots[modalSsIdx]?.classList.add('active');
    if (counter) counter.textContent = `${modalSsIdx + 1} / ${modalSsImages.length}`;
  }

  document.querySelectorAll('.view-project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      const key = btn.getAttribute('data-modal');
      const data = projectDetails[key];
      if (data && projectModal) {
        if (modalTitle) modalTitle.textContent = data.title;
        modalSsIdx = 0;
        modalSsImages = data.images || [];
        if (modalBody) {
          modalBody.innerHTML = buildModalSlideshow(modalSsImages) + data.html;
        }
        // Wire up modal slideshow controls
        document.getElementById('mss-prev')?.addEventListener('click', (e) => { e.stopPropagation(); playClickSound(); goModalSlide(-1); });
        document.getElementById('mss-next')?.addEventListener('click', (e) => { e.stopPropagation(); playClickSound(); goModalSlide(1); });
        document.querySelectorAll('#modal-ss .slide-dot').forEach(dot => {
          dot.addEventListener('click', () => {
            playClickSound();
            const targetIdx = parseInt(dot.getAttribute('data-idx'));
            goModalSlide(targetIdx - modalSsIdx);
          });
        });
        projectModal.classList.add('active');
      }
    });
  });

  modalCloseBtn?.addEventListener('click', () => {
    playClickSound();
    if (projectModal) projectModal.classList.remove('active');
  });

  projectModal?.addEventListener('click', (e) => {
    if (e.target === projectModal) {
      if (projectModal) projectModal.classList.remove('active');
    }
  });

  // ------------------------------------------------------------------------
  // 11. Interactive Buttons (Add Friend, Bookmark, Back to Top)
  // ------------------------------------------------------------------------
  document.getElementById('back-to-top-btn')?.addEventListener('click', () => {
    playClickSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('add-friend-btn')?.addEventListener('click', () => {
    playClickSound();
    alert("✨ Friend Request Sent to Nawwarah! You are now retro besties!");
  });

  document.getElementById('bookmark-btn')?.addEventListener('click', () => {
    playClickSound();
    alert("⭐ NawwaSpace profile bookmarked to your browser favorites!");
  });


  // ------------------------------------------------------------------------
  // 12. Gaming Hobby Slideshow Controller
  // ------------------------------------------------------------------------
  function initSlideshow(slideshowId, prevId, nextId, dotsId, captionId) {
    const wrap = document.querySelector(`#${slideshowId} .slide-img-wrap`);
    if (!wrap) return;

    const slides = wrap.querySelectorAll('.slide-img');
    const dots = document.querySelectorAll(`#${dotsId} .slide-dot`);
    const captionEl = document.getElementById(captionId);
    if (!slides.length) return;

    let current = 0;
    let autoTimer = null;

    function goTo(idx) {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
      if (captionEl) captionEl.textContent = slides[current].getAttribute('data-caption') || '';
    }

    function startAuto() {
      autoTimer = setInterval(() => goTo(current + 1), 3500);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    document.getElementById(prevId)?.addEventListener('click', () => {
      playClickSound(); goTo(current - 1); resetAuto();
    });

    document.getElementById(nextId)?.addEventListener('click', () => {
      playClickSound(); goTo(current + 1); resetAuto();
    });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        playClickSound();
        goTo(parseInt(dot.getAttribute('data-idx')));
        resetAuto();
      });
    });

    startAuto();
  }

  // Init the gaming hobby slideshow
  initSlideshow('gaming-slideshow', 'gaming-prev', 'gaming-next', 'gaming-dots', 'gaming-caption');


  // ------------------------------------------------------------------------
  // 13. Project Card Image Auto-Cycle (cycles through images[] from projectDetails)
  // ------------------------------------------------------------------------
  document.querySelectorAll('.friend-img-box[data-images]').forEach(box => {
    const key = box.closest('.top-friend-card')?.querySelector('.view-project-btn')?.getAttribute('data-modal');
    if (!key) return;
    const data = projectDetails[key];
    if (!data || !data.images || data.images.length < 2) return;

    // Build additional img elements for extra images
    data.images.forEach((imgData, i) => {
      if (i === 0) return; // first already exists in HTML
      const img = document.createElement('img');
      img.src = imgData.src;
      img.alt = imgData.caption;
      img.className = 'card-slide-img';
      box.appendChild(img);
    });

    const cardImgs = box.querySelectorAll('.card-slide-img');
    let cardIdx = 0;

    setInterval(() => {
      cardImgs[cardIdx].classList.remove('active');
      cardIdx = (cardIdx + 1) % cardImgs.length;
      cardImgs[cardIdx].classList.add('active');
    }, 2500);
  });

});
