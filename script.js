// ==========================================
// 1. ELEMENTS & SELECTIONS
// ==========================================
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const navLinkItems = document.querySelectorAll(".nav-link");
const revealElements = document.querySelectorAll(".reveal");
const typingText = document.getElementById("typingText");
const themeToggle = document.getElementById("themeToggle");
const sections = document.querySelectorAll("section, header");
const progressBar = document.getElementById("progressBar");
const backToTop = document.getElementById("backToTop");
const navbar = document.getElementById("navbar");
const orbs = document.querySelectorAll(".bg-orb");
const projectsContainer = document.getElementById("projectsContainer");
const filterButtons = document.querySelectorAll(".filter-btn");

// ==========================================
// 2. DYNAMIC GITHUB PROJECTS FETCHING WITH LINK LOGIC
// ==========================================
let projects = []; 

async function fetchGitHubProjects() {
  const username = "Adel06Galal";
  const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;
  
  try {
    if (projectsContainer) {
      projectsContainer.innerHTML = `
        <p style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 20px;">
          جاري تحميل المشاريع الحية من GitHub...
        </p>
      `;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch repositories");
    
    const repos = await response.json();
    
    // تصفية واستبعاد الريبوهات الخاصة بالواجهة
    const myOwnRepos = repos.filter(repo => {
      const repoName = repo.name.toLowerCase();
      return !repo.fork && 
             repoName !== "adel06galal.github.io" && 
             repoName !== "adel06galal";
    });

    projects = myOwnRepos.map(repo => {
      const lang = repo.language ? repo.language.toLowerCase() : "";
      const topics = repo.topics || [];
      
      let projectType = "web"; 
      
      if (lang === "c++" || lang === "cpp" || topics.includes("cpp") || topics.includes("cplusplus")) {
        projectType = "cpp";
      } else if (lang === "python" || topics.includes("python") || topics.includes("machine-learning") || topics.includes("ml")) {
        projectType = "PY";
      } else if (["javascript", "html", "css", "typescript"].includes(lang) || topics.includes("web")) {
        projectType = "web";
      }

      const cleanTitle = repo.name
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());

      const projectTags = repo.language ? [repo.language] : [];
      if (topics.length > 0) projectTags.push(...topics.slice(0, 2));

      // منطق ذكي لتحديد رابط التفاصيل أو العرض الحي
      let liveUrl = "";
      if (repo.homepage) {
        liveUrl = repo.homepage; // لو كاتب رابط في الـ About بتاع الريبو
      } else if (projectType === "web" && repo.has_pages) {
        liveUrl = `https://${username}.github.io/${repo.name}`; // رابط جيت هاب بيجز التلقائي لمشاريع الويب
      }

      return {
        title: cleanTitle,
        type: projectType,
        desc: repo.description || "No description provided for this repository yet.",
        tags: projectTags.length > 0 ? projectTags : ["Project"],
        github: repo.html_url,
        live: liveUrl // حفظ الرابط الحي إن وجد
      };
    });

    renderProjects("all");

  } catch (error) {
    console.error("Error loading GitHub projects:", error);
    if (projectsContainer) {
      projectsContainer.innerHTML = `
        <p style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 20px;">
          عذراً، حدث خطأ أثناء جلب المشاريع الحية. يمكنك تصفح المستودعات مباشرة على GitHub.
        </p>
      `;
    }
  }
}

function renderProjects(filter = "all") {
  if (!projectsContainer) return;
  
  projectsContainer.innerHTML = "";
  let cardsHTML = "";

  const filtered = projects.filter(p => filter === "all" || p.type === filter);

  if (filtered.length === 0) {
    projectsContainer.innerHTML = `
      <p style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 20px;">
        لا توجد مشاريع عامة في هذا القسم حالياً.
      </p>
    `;
    return;
  }

  filtered.forEach(project => {
    // تشكيل رابط الديتيلز: لو فيه رابط لايف يروحله، لو مفيش يروح لسكشن الـ README على جيت هاب
    const projectPages = {
      "clinic-system": "projects/clinic-system.html",
      "digital-image-processing-gui": "projects/digital-image-processing-gui.html",
      "machine-learning-model": "projects/machine-learning-model.html"
    };
    const repoSlug = project.github.split("/").pop().toLowerCase();
    const detailsLink = projectPages[repoSlug] || (project.live ? project.live : `${project.github}#readme`);
    const detailsText = projectPages[repoSlug] ? "Project details" : (project.live ? '<i class="fa-solid fa-rocket"></i> Live Demo' : 'Details');

    cardsHTML += `
      <article class="project-card">
        <div class="project-label">
          ${project.type.toUpperCase()}
        </div>
        <h3>${project.title}</h3>
        <p>
          ${project.desc}
        </p>
        <div class="project-tags">
          ${project.tags.map(tag => `<span>${tag}</span>`).join("")}
        </div>
        <div class="project-actions">
          <a href="${project.github}" target="_blank" rel="noopener noreferrer">
            <i class="fa-brands fa-github"></i> GitHub
          </a>
          <a href="${detailsLink}" target="_blank" rel="noopener noreferrer">
            ${detailsText}
          </a>
        </div>
      </article>
    `;
  });

  projectsContainer.innerHTML = cardsHTML;
}

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProjects(btn.dataset.filter);
  });
});

// ==========================================
// 3. MOBILE MENU
// ==========================================
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navLinks.classList.toggle("active");
  });

  navLinkItems.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });

  document.addEventListener("click", (e) => {
    if (
      navLinks.classList.contains("active") &&
      !navLinks.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      navLinks.classList.remove("active");
    }
  });
}

// ==========================================
// 4. REVEAL ON SCROLL
// ==========================================
function revealOnScroll() {
  const triggerBottom = window.innerHeight - 90;

  revealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < triggerBottom) {
      el.classList.add("active");
    }
  });
}

// ==========================================
// 5. TYPING EFFECT
// ==========================================
const phrases = [
  "AI Student",
  "C++ Learner",
  "Problem Solver",
  "Future Software Engineer"
];

let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function typeEffect() {
  if (!typingText) return;

  const currentPhrase = phrases[phraseIndex];

  if (!deleting) {
    typingText.textContent = currentPhrase.slice(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentPhrase.length) {
      deleting = true;
      setTimeout(typeEffect, 1300);
      return;
    }
  } else {
    typingText.textContent = currentPhrase.slice(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }

  setTimeout(typeEffect, deleting ? 45 : 85);
}

// ==========================================
// 6. THEME TOGGLE
// ==========================================
function updateThemeIcon() {
  if (!themeToggle) return;
  const icon = themeToggle.querySelector("i");
  if (!icon) return;

  if (document.body.classList.contains("light")) {
    icon.className = "fa-solid fa-moon";
  } else {
    icon.className = "fa-solid fa-sun";
  }
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }

  updateThemeIcon();
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    updateThemeIcon();
  });
}

// ==========================================
// 7. ACTIVE NAV LINK ON SCROLL
// ==========================================
function updateActiveLink() {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 160;
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute("id");
    }
  });

  navLinkItems.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
}

// ==========================================
// 8. SCROLL PROGRESS BAR
// ==========================================
function updateProgressBar() {
  if (!progressBar) return;

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  progressBar.style.width = `${progress}%`;
}

// ==========================================
// 9. BACK TO TOP
// ==========================================
function toggleBackToTop() {
  if (!backToTop) return;

  if (window.scrollY > 500) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
}

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// ==========================================
// 10. NAVBAR SCROLL STYLE
// ==========================================
function updateNavbarState() {
  if (!navbar) return;

  if (window.scrollY > 30) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

// ==========================================
// 11. BACKGROUND PARALLAX
// ==========================================
function updateParallax() {
  if (!orbs.length) return;

  const y = window.scrollY;

  orbs.forEach((orb, index) => {
    const speed = (index + 1) * 0.08;
    orb.style.transform = `translateY(${y * speed}px)`;
  });
}

// ==========================================
// 12. COMBINED SCROLL HANDLER
// ==========================================
function handleScroll() {
  revealOnScroll();
  updateActiveLink();
  updateProgressBar();
  toggleBackToTop();
  updateNavbarState();
  updateParallax();
}

// ==========================================
// 13. INIT RUNNERS
// ==========================================
window.addEventListener("scroll", handleScroll);

window.addEventListener("load", () => {
  fetchGitHubProjects(); 
  applySavedTheme();
  revealOnScroll();
  updateActiveLink();
  updateProgressBar();
  toggleBackToTop();
  updateNavbarState();
  updateParallax();
  typeEffect();
});

// ==========================================
// 14. COMMAND PALETTE
// ==========================================
const commandTrigger = document.getElementById("commandTrigger");
const commandOverlay = document.getElementById("commandOverlay");
const commandInput = document.getElementById("commandInput");
const commandList = document.getElementById("commandList");
let selectedCommand = 0;

const paletteCommands = [
  { title: "Go to Home", detail: "Jump to the hero section", icon: "fa-house", action: () => goToSection("home") },
  { title: "About me", detail: "Learn more about Adel", icon: "fa-user", action: () => goToSection("about") },
  { title: "Current Focus", detail: "What I’m working on right now", icon: "fa-bullseye", action: () => goToSection("focus") },
  { title: "Skills", detail: "Explore my technical skills", icon: "fa-code", action: () => goToSection("skills") },
  { title: "Projects", detail: "Browse my GitHub projects", icon: "fa-folder-open", action: () => goToSection("projects") },
  { title: "Learning Journey", detail: "See my learning path", icon: "fa-route", action: () => goToSection("journey") },
  { title: "Contact", detail: "Get in touch", icon: "fa-envelope", action: () => goToSection("contact") },
  { title: "Open Terminal", detail: "Try the interactive portfolio terminal", icon: "fa-terminal", action: openTerminal },
  { title: "GitHub Profile", detail: "Open github.com/Adel06Galal", icon: "fa-brands fa-github", action: () => window.open("https://github.com/Adel06Galal", "_blank", "noopener") },
  { title: "Toggle Theme", detail: "Switch between dark and light mode", icon: "fa-circle-half-stroke", action: () => themeToggle?.click() }
];

function goToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function openCommandPalette() {
  if (!commandOverlay) return;
  commandOverlay.classList.add("open");
  commandOverlay.setAttribute("aria-hidden", "false");
  commandInput.value = "";
  selectedCommand = 0;
  renderPaletteCommands();
  setTimeout(() => commandInput.focus(), 50);
}

function closeCommandPalette() {
  commandOverlay?.classList.remove("open");
  commandOverlay?.setAttribute("aria-hidden", "true");
  commandTrigger?.focus();
}

function renderPaletteCommands() {
  if (!commandList) return;
  const query = commandInput.value.trim().toLowerCase();
  const matches = paletteCommands.filter(command => `${command.title} ${command.detail}`.toLowerCase().includes(query));
  selectedCommand = Math.min(selectedCommand, Math.max(matches.length - 1, 0));
  commandList.innerHTML = matches.length ? matches.map((command, index) => `
    <button class="command-item ${index === selectedCommand ? "selected" : ""}" role="option" aria-selected="${index === selectedCommand}" data-command-index="${paletteCommands.indexOf(command)}">
      <span class="command-item-icon"><i class="fa-solid ${command.icon}"></i></span>
      <span class="command-item-copy"><strong>${command.title}</strong><small>${command.detail}</small></span>
      ${index === selectedCommand ? "<kbd>↵</kbd>" : ""}
    </button>
  `).join("") : `<div class="command-empty">No commands found for “${escapeHTML(query)}”</div>`;

  commandList.querySelectorAll(".command-item").forEach(item => {
    item.addEventListener("mouseenter", () => {
      selectedCommand = [...commandList.querySelectorAll(".command-item")].indexOf(item);
      renderPaletteCommands();
    });
    item.addEventListener("click", () => runPaletteCommand(Number(item.dataset.commandIndex)));
  });
}

function runPaletteCommand(index) {
  const command = paletteCommands[index];
  if (!command) return;
  closeCommandPalette();
  command.action();
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

commandTrigger?.addEventListener("click", openCommandPalette);
commandInput?.addEventListener("input", () => { selectedCommand = 0; renderPaletteCommands(); });
commandInput?.addEventListener("keydown", event => {
  const items = commandList?.querySelectorAll(".command-item") || [];
  if (event.key === "ArrowDown") { event.preventDefault(); selectedCommand = Math.min(selectedCommand + 1, items.length - 1); renderPaletteCommands(); }
  if (event.key === "ArrowUp") { event.preventDefault(); selectedCommand = Math.max(selectedCommand - 1, 0); renderPaletteCommands(); }
  if (event.key === "Enter" && items.length) { event.preventDefault(); runPaletteCommand(Number(items[selectedCommand]?.dataset.commandIndex)); }
  if (event.key === "Escape") closeCommandPalette();
});
commandOverlay?.addEventListener("click", event => { if (event.target === commandOverlay) closeCommandPalette(); });

// ==========================================
// 15. INTERACTIVE TERMINAL
// ==========================================
const terminalLauncher = document.getElementById("terminalLauncher");
const terminalWindow = document.getElementById("terminalWindow");
const terminalClose = document.getElementById("terminalClose");
const terminalForm = document.getElementById("terminalForm");
const terminalInput = document.getElementById("terminalInput");
const terminalOutput = document.getElementById("terminalOutput");
const terminalHistory = [];
let historyPosition = 0;

function openTerminal() {
  terminalWindow?.classList.add("open");
  terminalWindow?.setAttribute("aria-hidden", "false");
  setTimeout(() => terminalInput?.focus(), 100);
}

function closeTerminal() {
  terminalWindow?.classList.remove("open");
  terminalWindow?.setAttribute("aria-hidden", "true");
  terminalLauncher?.focus();
}

function terminalPrint(text, className = "") {
  const line = document.createElement("p");
  if (className) line.className = className;
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function terminalLink(label, href) {
  const line = document.createElement("p");
  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.className = "terminal-highlight";
  line.appendChild(link);
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function runTerminalCommand(rawCommand) {
  const command = rawCommand.trim().toLowerCase();
  if (!command) return;
  terminalPrint(`adel@portfolio ~ $ ${rawCommand}`, "terminal-command-line");
  terminalHistory.push(rawCommand);
  historyPosition = terminalHistory.length;

  switch (command) {
    case "help":
      terminalPrint("Available commands:");
      terminalPrint("  help      Show this command list");
      terminalPrint("  about     About Adel Galal");
      terminalPrint("  skills    Show technical skills");
      terminalPrint("  projects  Jump to the projects section");
      terminalPrint("  contact   Jump to contact information");
      terminalPrint("  github    Open my GitHub profile");
      terminalPrint("  linkedin  Open my LinkedIn profile");
      terminalPrint("  resume    Download my CV (if available)");
      terminalPrint("  clear     Clear terminal output");
      terminalPrint("  exit      Close the terminal");
      break;
    case "about":
      terminalPrint("I'm Adel Galal, an AI student focused on software engineering, problem solving, and building practical projects.", "terminal-success");
      break;
    case "skills":
      terminalPrint("C++ | Python | AI | Data Structures & Algorithms | SQL | HTML | CSS | JavaScript", "terminal-success");
      goToSection("skills");
      break;
    case "projects":
      terminalPrint("Opening the projects section...", "terminal-success");
      goToSection("projects");
      break;
    case "contact":
      terminalPrint("Opening contact section...", "terminal-success");
      goToSection("contact");
      break;
    case "github":
      terminalLink("GitHub: github.com/Adel06Galal", "https://github.com/Adel06Galal");
      break;
    case "linkedin":
      terminalLink("LinkedIn: linkedin.com/in/adelgalal06", "https://www.linkedin.com/in/adelgalal06");
      break;
    case "resume": {
      const cvLink = document.querySelector('a[href="Adel-Galal-CV.pdf"]');
      if (cvLink) { terminalPrint("Starting CV download...", "terminal-success"); cvLink.click(); }
      else terminalPrint("CV file isn't linked on this site yet.", "terminal-error");
      break;
    }
    case "clear":
      terminalOutput.innerHTML = "";
      break;
    case "exit":
      closeTerminal();
      break;
    default:
      terminalPrint(`Command not found: ${rawCommand}. Type "help" to see commands.`, "terminal-error");
  }
}

terminalLauncher?.addEventListener("click", openTerminal);
terminalClose?.addEventListener("click", closeTerminal);
terminalWindow?.addEventListener("click", event => { if (event.target === terminalWindow) closeTerminal(); });
terminalForm?.addEventListener("submit", event => {
  event.preventDefault();
  const value = terminalInput.value;
  terminalInput.value = "";
  runTerminalCommand(value);
});
terminalInput?.addEventListener("keydown", event => {
  if (event.key === "ArrowUp") { event.preventDefault(); historyPosition = Math.max(0, historyPosition - 1); terminalInput.value = terminalHistory[historyPosition] || ""; }
  if (event.key === "ArrowDown") { event.preventDefault(); historyPosition = Math.min(terminalHistory.length, historyPosition + 1); terminalInput.value = terminalHistory[historyPosition] || ""; }
});

// Global shortcuts: Ctrl/Cmd + K opens the palette; Escape closes overlays.
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCommandPalette();
  }
  if (event.key === "Escape") {
    if (commandOverlay?.classList.contains("open")) closeCommandPalette();
    else if (terminalWindow?.classList.contains("open")) closeTerminal();
  }
});

// Inside the Mind intro sequence and archive navigation
(() => {
  const intro = document.getElementById('mindIntro');
  const enter = document.getElementById('enterMind');
  const index = document.getElementById('mindIndex');
  if (intro && enter) {
    document.body.classList.add('intro-active');
    enter.addEventListener('click', () => {
      intro.classList.add('is-exiting');
      setTimeout(() => {
        intro.classList.add('is-gone');
        document.body.classList.remove('intro-active');
        if (index) index.classList.add('index-visible');
        window.scrollTo({top: 0, behavior: 'smooth'});
      }, 850);
    });
  }
  document.querySelectorAll('.mind-index a').forEach(link => {
    link.addEventListener('click', () => {
      if (intro && !intro.classList.contains('is-gone')) {
        intro.classList.add('is-gone');
        document.body.classList.remove('intro-active');
      }
    });
  });
})();


/* Mind Dimension interaction layer */
(() => {
  const stage = document.querySelector('.mind-stage');
  const core = document.getElementById('mindCore');
  if (stage && core && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stage.addEventListener('mousemove', (event) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      core.style.animationPlayState = 'paused';
      core.style.transform = `translate3d(${x * 18}px, ${y * 18}px, 0) rotateX(${-y * 12}deg) rotateY(${x * 14}deg)`;
    });
    stage.addEventListener('mouseleave', () => {
      core.style.animationPlayState = 'running';
      core.style.transform = '';
    });
  }

  // Randomized tiny editorial offset for the floating words (subtle, not distracting).
  document.querySelectorAll('.floating-word').forEach((word, i) => {
    word.style.animation = `wordDrift ${5 + i * 1.8}s ease-in-out ${i * .4}s infinite alternate`;
  });
})();
