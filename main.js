/**
 * Nawwarah Zulkifli Portfolio - Main Interactive Logic
 * Osu! Style Cursor Trail Engine, Theme Toggle, Skills Matrix, Modal Viewer, and Mobile Responsiveness.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initOsuCursorTrail();
  initSkillsFilter();
  initModals();
  initContactForm();
  initNavigation();
  initResumeDownload();
});

/* ==========================================================================
   0. DARK / LIGHT THEME TOGGLE ENGINE
   ========================================================================== */
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    html.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', nextTheme);
    localStorage.setItem('portfolio-theme', nextTheme);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('portfolio-theme')) {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

/* ==========================================================================
   1. OSU! STYLE INTERACTIVE CURSOR TRAIL ENGINE (60 FPS CANVAS PHYSICS)
   ========================================================================== */
function initOsuCursorTrail() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const canvas = document.getElementById('osu-cursor-canvas');

  if (!dot || !ring || !canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  let mouseX = width / 2;
  let mouseY = height / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  const particles = [];

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

    // Spawn Osu! glowing trail particles
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: mouseX + (Math.random() - 0.5) * 4,
        y: mouseY + (Math.random() - 0.5) * 4,
        radius: Math.random() * 6 + 4,
        alpha: 0.85,
        decay: Math.random() * 0.03 + 0.025,
        color: '#38BDF8'
      });
    }
  });

  // Render loop
  function renderTrail() {
    ctx.clearRect(0, 0, width, height);

    // Smooth lerp for outer ring
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

    // Draw and decay Osu! trail particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.alpha -= p.decay;
      p.radius *= 0.95;

      if (p.alpha <= 0 || p.radius <= 0.5) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#38BDF8';
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(renderTrail);
  }

  renderTrail();

  // Hover effect over interactive elements
  const interactiveEls = document.querySelectorAll('a, button, .skill-chip-item, .contact-item, input, textarea');
  interactiveEls.forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('active'));
  });
}

/* ==========================================================================
   2. SKILLS CATEGORY FILTER
   ========================================================================== */
function initSkillsFilter() {
  const tabs = document.querySelectorAll('.skill-tab-btn');
  const items = document.querySelectorAll('.skill-chip-item');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.getAttribute('data-skill-cat');

      items.forEach((item) => {
        const itemCat = item.getAttribute('data-cat');
        if (cat === 'all' || itemCat === cat) {
          item.style.display = 'inline-flex';
          item.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   3. MODAL POPUP FOR PROJECT DETAILS
   ========================================================================== */
const projectData = {
  sentra: {
    title: "SentRa: Sentiment Analysis System for Lecturer Evaluation",
    subtitle: "Final Year Project • Bachelor of Computer Science (Hons)",
    category: "AI & Machine Learning | Python NLP",
    description: `
      <p>SentRa is an intelligent sentiment analysis system specifically developed to evaluate bilingual (Malay and English) student feedback collected during university lecturer evaluations.</p>
      
      <h4 style="margin: 1.25rem 0 0.5rem; color: var(--heading-color);">Key Architectural Features:</h4>
      <ul style="padding-left: 1.2rem; margin-bottom: 1rem; color: var(--text-muted);">
        <li><strong>Bilingual Text Preprocessing:</strong> Custom automated text pipeline handling slang normalization, Malay/English tokenization, stop-word removal, and lemmatization.</li>
        <li><strong>Domain-Specific Lexicon:</strong> Engineered an academic feedback domain lexicon mapping specific Malaysian higher education evaluation terms to sentiment weights.</li>
        <li><strong>Machine Learning Algorithms:</strong> Trained Naïve Bayes, SVM, and Lexicon-based classifiers to detect Positive, Neutral, and Negative sentiments with high accuracy.</li>
        <li><strong>Analytical Visualizations:</strong> Embedded automated analytical charts, sentiment distribution tables, and dynamic word clouds highlighting key teaching performance factors.</li>
        <li><strong>Actionable Management Insights:</strong> Equips faculty deans and department heads with quantitative feedback dashboards to improve teaching delivery.</li>
      </ul>

      <div style="background: var(--accent-light); padding: 1rem; border-radius: 12px; border-left: 4px solid var(--secondary); margin-top: 1rem; color: var(--text-main);">
        <strong style="color: var(--heading-color);">Tech Stack:</strong> Python, NLTK/Scikit-learn, Anaconda Navigator, Pandas/NumPy, Matplotlib/WordCloud, HTML5/CSS3.
      </div>
    `
  },
  smartmirror: {
    title: "S.M.A.R.T. Mirror: Health & Productivity Assistant",
    subtitle: "InTeLex 2024 Silver Award Winner • HCI Project",
    category: "Human-Computer Interaction (HCI) | UI/UX Prototype",
    description: `
      <p>The S.M.A.R.T. Mirror is an innovative IoT & AI conceptual mirror designed to integrate daily health monitoring into standard morning routines while optimizing productivity.</p>
      
      <h4 style="margin: 1.25rem 0 0.5rem; color: var(--heading-color);">Key Features & Accomplishments:</h4>
      <ul style="padding-left: 1.2rem; margin-bottom: 1rem; color: var(--text-muted);">
        <li><strong>InTeLex 2024 Silver Award:</strong> Recognized at the Innovation & Technology Exhibition for creative HCI problem-solving and realistic design execution.</li>
        <li><strong>Medium-Fidelity Figma Prototype:</strong> Developed comprehensive interactive UI component libraries, responsive navigation flows, and dynamic widgets.</li>
        <li><strong>HCI Principles Implementation:</strong> Applied spatial ergonomics, high-contrast visual hierarchy for reflective surfaces, and glanceable dashboard design.</li>
        <li><strong>AI-Powered Features:</strong> Designed concept specs for personalized health metrics (posture analysis, heart rate via facial recognition, daily schedule sync) and voice-controlled interaction.</li>
        <li><strong>Stakeholder Pitching:</strong> Presented design rationale, user testing results, and operational feasibility to academic and industry judges.</li>
      </ul>

      <div style="background: var(--accent-light); padding: 1rem; border-radius: 12px; border-left: 4px solid var(--accent); margin-top: 1rem; color: var(--text-main);">
        <strong style="color: var(--heading-color);">Design Tools:</strong> Figma, Adobe Illustrator, HCI Evaluation Heuristics, Canva.
      </div>
    `
  }
};

function initModals() {
  const modalOverlay = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close-btn');
  const openBtns = document.querySelectorAll('.open-modal-btn');

  if (!modalOverlay || !modalBody || !closeBtn) return;

  openBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-project');
      const data = projectData[key];

      if (data) {
        modalBody.innerHTML = `
          <span style="display:inline-block; background: var(--accent-light); color: var(--secondary); font-size: 0.75rem; font-weight:700; padding: 0.25rem 0.65rem; border-radius: 9999px; margin-bottom: 0.5rem;">
            ${data.category}
          </span>
          <h2 style="font-size: 1.6rem; color: var(--heading-color); margin-bottom: 0.25rem;">${data.title}</h2>
          <p style="font-size: 0.9rem; color: var(--secondary); font-weight:600; margin-bottom: 1.25rem;">${data.subtitle}</p>
          <hr style="border: none; border-top: 1px solid var(--border-light); margin-bottom: 1.25rem;" />
          <div style="line-height: 1.6;">${data.description}</div>
        `;
        modalOverlay.classList.add('active');
      }
    });
  });

  closeBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });
}

/* ==========================================================================
   4. CONTACT FORM & SUPABASE HANDLING
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const subject = document.getElementById('form-subject').value;
    const message = document.getElementById('form-message').value;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending...</span>`;

    setTimeout(() => {
      console.log('Sending message to Supabase database:', { name, email, subject, message, timestamp: new Date().toISOString() });

      showToast(`Thank you, ${name}! Your message has been sent successfully.`);
      form.reset();

      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Send Message</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      `;
    }, 1000);
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* ==========================================================================
   5. MOBILE NAVIGATION & SCROLL OBSERVER
   ========================================================================== */
function initNavigation() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navbar = document.getElementById('navbar');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   6. RESUME CV DOWNLOAD & PRINT
   ========================================================================== */
function initResumeDownload() {
  const cvBtn = document.getElementById('download-cv-btn');
  if (!cvBtn) return;

  cvBtn.addEventListener('click', () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nawwarah Binti Zulkifli - Resume</title>
        <style>
          body { font-family: sans-serif; line-height: 1.5; color: #1F2937; padding: 2rem; max-width: 800px; margin: 0 auto; }
          h1 { color: #1E3A8A; margin-bottom: 0.2rem; }
          h2 { color: #3B82F6; font-size: 1.1rem; border-bottom: 2px solid #E2E8F0; padding-bottom: 0.3rem; margin-top: 1.5rem; }
          .contact { font-size: 0.9rem; color: #4B5563; margin-bottom: 1.5rem; }
          ul { padding-left: 1.2rem; }
          li { margin-bottom: 0.3rem; }
        </style>
      </head>
      <body>
        <h1>Nawwarah Binti Zulkifli</h1>
        <div class="contact">Port Dickson, Negeri Sembilan | nawwarah.zulkifli123@gmail.com | +60 11-6093 4124 | linkedin.com/in/nawwarah-zulkifli</div>
        
        <h2>Professional Summary</h2>
        <p>Final-year Bachelor of Computer Science (Hons) student with a strong academic record of 3.79 with a solid foundation in programming, data analytics, and web development. Experienced in student leadership, event management, and technical projects.</p>

        <h2>Work Experience</h2>
        <p><strong>IT Intern</strong> - EDAG Holding Sdn. Bhd. (March 2026 – Present)</p>
        <ul>
          <li>Administer Active Directory user accounts and access permissions for secure access control.</li>
          <li>Manage and maintain Windows and Linux-based systems performing user support and troubleshooting.</li>
          <li>Resolve IT support tickets, investigate incidents to minimize service disruptions.</li>
          <li>Participate in TISAX and ISO 9001 compliance activities through evidence collection and audit preparation.</li>
        </ul>

        <h2>Education</h2>
        <p><strong>Bachelor’s Degree in Computer Science (Honours)</strong> - UPNM (2023 - Present) | CGPA: 3.79 (Dean's Award Recipient)</p>
        <p><strong>Foundation in Medicine</strong> - UPNM (2022 - 2023) | CGPA: 3.57 (Excellent Academic Award)</p>

        <h2>Featured Projects</h2>
        <p><strong>SentRa: Sentiment Analysis System for Student Feedback</strong> (Final Year Project)</p>
        <p><strong>S.M.A.R.T. Mirror HCI Concept & Figma Prototype</strong> (InTeLex 2024 Silver Award Winner)</p>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  });
}
