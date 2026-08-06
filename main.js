/**
 * Nawwarah Zulkifli Portfolio - Main Interactive Logic
 * Cursor Tracking, 3D Card Tilt, Project Filters, Modal Viewer, and Supabase Integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initCursorTracker();
  init3DTilt();
  initProjectFilters();
  initModals();
  initContactForm();
  initNavigation();
  initResumeDownload();
});

/* ==========================================================================
   0. DARK / LIGHT THEME TOGGLE
   ========================================================================== */
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Determine initial theme: localStorage > system preference
  const saved = localStorage.getItem('portfolio-theme');
  if (saved) {
    html.setAttribute('data-theme', saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });

  // Also listen for OS-level changes (if user hasn't manually toggled)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('portfolio-theme')) {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

/* ==========================================================================
   1. CURSOR TRACKER & SPOTLIGHT ENGINE (60 FPS LERP PHYSICS)
   ========================================================================== */
function initCursorTracker() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const spotlight = document.getElementById('cursor-spotlight');

  if (!dot || !ring || !spotlight) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
    spotlight.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // Smooth lerp for ring
  function animateRing() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate(${ringX - 19}px, ${ringY - 19}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Interactive elements — activate Apple Glass state
  const interactiveEls = document.querySelectorAll(
    'a, button, .tilt-card, input, textarea, .tab-btn, .programme-chip, .skill-badge, .contact-item'
  );

  interactiveEls.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('active');
      dot.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('active');
      dot.classList.remove('active');
    });
  });
}

/* ==========================================================================
   2. 3D PERSPECTIVE CARD TILT EFFECT
   ========================================================================== */
function init3DTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach((card) => {
    if (card.hasAttribute('data-tilt-disabled')) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8; // Max 8 deg rotation
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

/* ==========================================================================
   3. PROJECT FILTER TABS
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-tabs .tab-btn');
  const projectCards = document.querySelectorAll('.projects-grid .project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Remove active from all
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. MODAL POPUP FOR PROJECT DETAILS
   ========================================================================== */
const projectData = {
  sentra: {
    title: "SentRa: Sentiment Analysis System for Lecturer Evaluation",
    subtitle: "Final Year Project • Bachelor of Computer Science (Hons)",
    category: "AI & Machine Learning | Python NLP",
    description: `
      <p>SentRa is an intelligent sentiment analysis system specifically developed to evaluate bilingual (Malay and English) student feedback collected during university lecturer evaluations.</p>
      
      <h4 style="margin: 1.25rem 0 0.5rem; color: #1E3A8A;">Key Architectural Features:</h4>
      <ul style="padding-left: 1.2rem; margin-bottom: 1rem; color: #4B5563;">
        <li><strong>Bilingual Text Preprocessing:</strong> Custom automated text pipeline handling slang normalization, Malay/English tokenization, stop-word removal, and lemmatization.</li>
        <li><strong>Domain-Specific Lexicon:</strong> Engineered an academic feedback domain lexicon mapping specific Malaysian higher education evaluation terms to sentiment weights.</li>
        <li><strong>Machine Learning Algorithms:</strong> Trained Naïve Bayes, SVM, and Lexicon-based classifiers to detect Positive, Neutral, and Negative sentiments with high accuracy.</li>
        <li><strong>Analytical Visualizations:</strong> Embedded automated analytical charts, sentiment distribution tables, and dynamic word clouds highlighting key teaching performance factors.</li>
        <li><strong>Actionable Management Insights:</strong> Equips faculty deans and department heads with quantitative feedback dashboards to improve teaching delivery.</li>
      </ul>

      <div style="background: #F1F5F9; padding: 1rem; border-radius: 12px; border-left: 4px solid #3B82F6; margin-top: 1rem;">
        <strong style="color: #1E3A8A;">Tech Stack:</strong> Python, NLTK/Scikit-learn, Anaconda Navigator, Pandas/NumPy, Matplotlib/WordCloud, HTML5/CSS3.
      </div>
    `
  },
  smartmirror: {
    title: "S.M.A.R.T. Mirror: Health & Productivity Assistant",
    subtitle: "InTeLex 2024 Silver Award Winner • HCI Project",
    category: "Human-Computer Interaction (HCI) | UI/UX Prototype",
    description: `
      <p>The S.M.A.R.T. Mirror is an innovative IoT & AI conceptual mirror designed to integrate daily health monitoring into standard morning routines while optimizing productivity.</p>
      
      <h4 style="margin: 1.25rem 0 0.5rem; color: #1E3A8A;">Key Features & Accomplishments:</h4>
      <ul style="padding-left: 1.2rem; margin-bottom: 1rem; color: #4B5563;">
        <li><strong>InTeLex 2024 Silver Award:</strong> Recognized at the Innovation & Technology Exhibition for creative HCI problem-solving and realistic design execution.</li>
        <li><strong>Medium-Fidelity Figma Prototype:</strong> Developed comprehensive interactive UI component libraries, responsive navigation flows, and dynamic widgets.</li>
        <li><strong>HCI Principles Implementation:</strong> Applied spatial ergonomics, high-contrast visual hierarchy for reflective surfaces, and glanceable dashboard design.</li>
        <li><strong>AI-Powered Features:</strong> Designed concept specs for personalized health metrics (posture analysis, heart rate via facial recognition, daily schedule sync) and voice-controlled interaction.</li>
        <li><strong>Stakeholder Pitching:</strong> Presented design rationale, user testing results, and operational feasibility to academic and industry judges.</li>
      </ul>

      <div style="background: #F1F5F9; padding: 1rem; border-radius: 12px; border-left: 4px solid #38BDF8; margin-top: 1rem;">
        <strong style="color: #1E3A8A;">Design Tools:</strong> Figma, Adobe Illustrator, HCI Evaluation Heuristics, Canva.
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
          <span style="display:inline-block; background: #E0F2FE; color: #1E3A8A; font-size: 0.75rem; font-weight:700; padding: 0.25rem 0.65rem; border-radius: 9999px; margin-bottom: 0.5rem;">
            ${data.category}
          </span>
          <h2 style="font-size: 1.6rem; color: #1E3A8A; margin-bottom: 0.25rem;">${data.title}</h2>
          <p style="font-size: 0.9rem; color: #3B82F6; font-weight:600; margin-bottom: 1.25rem;">${data.subtitle}</p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin-bottom: 1.25rem;" />
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
   5. CONTACT FORM & SUPABASE READY HANDLING
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const subject = document.getElementById('form-subject').value;
    const message = document.getElementById('form-message').value;

    // Button loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending...</span>`;

    // Simulated network delay & Supabase payload log
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
   6. MOBILE NAVIGATION & SCROLL OBSERVER
   ========================================================================== */
function initNavigation() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navbar = document.getElementById('navbar');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking links
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // Sticky Navbar style on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   7. RESUME CV DOWNLOAD & PRINT
   ========================================================================== */
function initResumeDownload() {
  const cvBtn = document.getElementById('download-cv-btn');
  if (!cvBtn) return;

  cvBtn.addEventListener('click', () => {
    // Open print preview window formatted nicely for Nawwarah's resume
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
