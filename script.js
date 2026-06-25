// ==========================================
// 1. ELEMENTS & SELECTIONS[cite: 1]
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
// 2. DYNAMIC GITHUB PROJECTS FETCHING WITH IGNORE LOGIC
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
    
    // التعديل السحري هنا: تصفية المستودعات واستبعاد المنسوخة، وريبو المحفظة، وريبو الريدمي الشخصي
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
      } else if (lang === "python" || topics.includes("ai") || topics.includes("machine-learning") || topics.includes("ml")) {
        projectType = "ai";
      } else if (["javascript", "html", "css", "typescript"].includes(lang) || topics.includes("web")) {
        projectType = "web";
      }

      const cleanTitle = repo.name
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());

      const projectTags = repo.language ? [repo.language] : [];
      if (topics.length > 0) projectTags.push(...topics.slice(0, 2));

      return {
        title: cleanTitle,
        type: projectType,
        desc: repo.description || "No description provided for this repository yet.",
        tags: projectTags.length > 0 ? projectTags : ["Project"],
        github: repo.html_url
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
          <a href="${project.github}" target="_blank" rel="noopener noreferrer">
            Details
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
// 3. MOBILE MENU[cite: 1]
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
// 4. REVEAL ON SCROLL[cite: 1]
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
// 5. TYPING EFFECT[cite: 1]
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
// 6. THEME TOGGLE[cite: 1]
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
// 7. ACTIVE NAV LINK ON SCROLL[cite: 1]
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
// 8. SCROLL PROGRESS BAR[cite: 1]
// ==========================================
function updateProgressBar() {
  if (!progressBar) return;

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  progressBar.style.width = `${progress}%`;
}

// ==========================================
// 9. BACK TO TOP[cite: 1]
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
// 10. NAVBAR SCROLL STYLE[cite: 1]
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
// 11. BACKGROUND PARALLAX[cite: 1]
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
// 12. COMBINED SCROLL HANDLER[cite: 1]
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
// 13. INIT RUNNERS[cite: 1]
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