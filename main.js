/* ==========================================================================
   nawwaSpace - Interactive JS Engine
   Handles: 3s Boot Loader, OSU Custom Cursor, Chiptune Audio Synthesizer,
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
  // 3. Smooth Palette Gradient Cursor Trail Engine & Hitbursts
  // Inspired by: https://i.ytimg.com/vi/5icFcPkVzMg/maxresdefault.jpg
  // ------------------------------------------------------------------------
  const trailContainer = document.getElementById('osu-trail-container');
  const hitburstContainer = document.getElementById('hitburst-container');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let lastTrailTime = 0;
  let colorIndex = 0;

  // Spectrum gradient colors from the user palette
  const paletteGradientColors = [
    '#FF758F', // Neon Pink
    '#FF9F1C', // Sunset Orange/Peach
    '#FFE66D', // Butter Yellow
    '#57CC99', // Mint Green
    '#2EC4B6', // Electric Cyan
    '#A663CC'  // Vivid Purple
  ];

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const now = Date.now();
    if (now - lastTrailTime > 20) { // High frequency smooth trail
      spawnGradientTrail(mouseX, mouseY);
      lastTrailTime = now;
    }
  });

  function spawnGradientTrail(x, y) {
    if (!trailContainer) return;
    const dot = document.createElement('div');
    dot.className = 'gradient-trail-particle';
    
    // Cycle through palette gradient colors
    const currentColor = paletteGradientColors[colorIndex % paletteGradientColors.length];
    colorIndex++;

    const size = Math.floor(Math.random() * 6) + 8; // 8px to 14px smooth glowing dots
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.backgroundColor = currentColor;
    dot.style.color = currentColor;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;

    trailContainer.appendChild(dot);
    setTimeout(() => dot.remove(), 500);
  }

  const hitburstTexts = ['300!', '300!', 'PERFECT!', '100!', 'GREAT!', '300!'];

  document.addEventListener('mousedown', (e) => {
    if (cursorRing) cursorRing.classList.add('clicking');
    playClickSound();

    // Spawn hitburst text
    if (hitburstContainer) {
      const text = document.createElement('div');
      text.className = 'hitburst-text';
      text.textContent = hitburstTexts[Math.floor(Math.random() * hitburstTexts.length)];
      text.style.left = `${e.clientX}px`;
      text.style.top = `${e.clientY}px`;
      hitburstContainer.appendChild(text);
      playHitburstSound();
      setTimeout(() => text.remove(), 600);
    }
  });

  document.addEventListener('mouseup', () => {
    if (cursorRing) cursorRing.classList.remove('clicking');
  });


  // ------------------------------------------------------------------------
  // 4. Theme Toggler (Light / Dark Mode)
  // ------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  const htmlEl = document.documentElement;

  // Saved theme or default to light
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
  // 5. Interactive Chiptune Audio Player (Web Audio API Synthesized Music)
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
  // 6. Mood Switcher Widget
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
  // 7. Interactive Guestbook (LocalStorage Persistence)
  // ------------------------------------------------------------------------
  const guestbookForm = document.getElementById('guestbook-form');
  const guestbookList = document.getElementById('guestbook-list');

  // Load stored comments
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

    // Save to localStorage
    const savedComments = JSON.parse(localStorage.getItem('nawwaspace_guestbook') || '[]');
    savedComments.unshift(newComment);
    localStorage.setItem('nawwaspace_guestbook', JSON.stringify(savedComments));

    // Reset form
    nameInput.value = '';
    messageInput.value = '';
  });

  loadGuestbook();


  // ------------------------------------------------------------------------
  // 8. Mini Pixel Arcade Game (Pixel Star Catcher)
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

    // Spawn star every 800ms for 15 seconds
    spawnIntervalId = setInterval(() => {
      spawnArcadeStar();
    }, 800);

    setTimeout(() => {
      endArcadeGame();
    }, 15000); // 15 second round
  });

  function spawnArcadeStar() {
    if (!arcadeBox || !isGameRunning) return;

    const star = document.createElement('div');
    star.className = 'falling-star';
    star.textContent = ['⭐', '🌟', '👾', '✨'][Math.floor(Math.random() * 4)];
    const leftPos = Math.random() * (arcadeBox.clientWidth - 30);
    star.style.left = `${leftPos}px`;

    star.addEventListener('click', () => {
      if (!isGameRunning) return;
      gameScore += 100;
      if (gameScoreEl) gameScoreEl.textContent = gameScore;
      playTone(1000, 0.08, 'square', 0.15);
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
  // 9. Modals for Top Projects & Info Cards
  // ------------------------------------------------------------------------
  const projectModal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const projectDetails = {
    sentra: {
      title: "SentRa: Bilingual Sentiment Analysis System",
      html: `
        <div style="text-align: center; margin-bottom: 12px;">
          <img src="./images/sentra.png" style="width: 100%; max-height: 220px; object-fit: cover; border: 2px solid var(--border-color);" alt="SentRa">
        </div>
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
      html: `
        <div style="text-align: center; margin-bottom: 12px;">
          <img src="./images/smartmirror.png" style="width: 100%; max-height: 220px; object-fit: cover; border: 2px solid var(--border-color);" alt="SMART Mirror">
        </div>
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
      html: `
        <div style="text-align: center; margin-bottom: 12px; font-family: 'Press Start 2P'; font-size: 24px; color: var(--accent-cyan);">
          EDAG HOLDING
        </div>
        <p><strong>Period:</strong> March 2026 – Present</p>
        <p><strong>Role & Responsibilities:</strong></p>
        <ul style="padding-left: 20px; margin: 10px 0;">
          <li><strong>Active Directory:</strong> Identity provisioning, Group Policy, security permissions.</li>
          <li><strong>Systems Administration:</strong> Managing Windows 10/11, Ubuntu, Rocky Linux & Kali Linux servers.</li>
          <li><strong>Service Desk:</strong> SLA-compliant incident resolution & IT hardware troubleshooting.</li>
          <li><strong>Compliance:</strong> Evidence gathering for TISAX automotive security & ISO 9001 quality audits.</li>
        </ul>
      `
    },
    leadership: {
      title: "UPNM DeSTeC Club & Event Leadership",
      html: `
        <div style="text-align: center; margin-bottom: 12px;">
          <img src="./images/leadership.png" style="width: 100%; max-height: 220px; object-fit: cover; border: 2px solid var(--border-color);" alt="Leadership">
        </div>
        <p><strong>Roles:</strong> Secretary of DeSTeC Club (2024–2025) & Vice Secretary of UPNM Chess Club.</p>
        <p><strong>Key Highlights:</strong></p>
        <ul style="padding-left: 20px; margin: 10px 0;">
          <li>Directed <em>MEPPS 2.0: Python Edition Programme</em> workshop for 100+ students.</li>
          <li>Co-organized Grandmasters Cup Chess Tournament.</li>
          <li>Deputy Secretary for MIACEP 2025 Malaysia-Indonesia Cultural Exchange.</li>
        </ul>
      `
    }
  };

  document.querySelectorAll('.view-project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      const key = btn.getAttribute('data-modal');
      const data = projectDetails[key];
      if (data && projectModal) {
        if (modalTitle) modalTitle.textContent = data.title;
        if (modalBody) modalBody.innerHTML = data.html;
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
  // 10. Interactive Buttons (Add Friend, Bookmark)
  // ------------------------------------------------------------------------
  document.getElementById('add-friend-btn')?.addEventListener('click', () => {
    playClickSound();
    alert("✨ Friend Request Sent to Nawwarah! You are now retro besties!");
  });

  document.getElementById('bookmark-btn')?.addEventListener('click', () => {
    playClickSound();
    alert("⭐ NawwaSpace profile bookmarked to your browser favorites!");
  });

});
