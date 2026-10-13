document.documentElement.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 767px)');
const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.mobile-nav');
menuButton.hidden = false;
function closeMenu(restore = false) {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.innerHTML = 'Menu <span>＋</span>';
  if (restore) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.innerHTML = open ? 'Close <span>×</span>' : 'Menu <span>＋</span>';
});
menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!menu.hidden) closeMenu(true); if (!context.hidden) setContext(false); } });
document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.header')) closeMenu(); });
mobile.addEventListener('change', () => { closeMenu(); updateCarousel(); });

const context = document.querySelector('.portrait-context');
const portraitToggle = document.querySelector('.portrait-toggle');
const captionToggle = document.querySelector('.portrait-caption-toggle');
portraitToggle.hidden = captionToggle.hidden = false;
function setContext(open) {
  context.hidden = !open;
  portraitToggle.setAttribute('aria-expanded', String(open));
  portraitToggle.setAttribute('aria-label', open ? 'Close personal context' : 'Read a little context about Adheeb');
  portraitToggle.textContent = open ? '×' : '＋';
  captionToggle.innerHTML = open ? 'Back to portrait <span>↗</span>' : 'More about me <span>↗</span>';
}
portraitToggle.addEventListener('click', () => setContext(context.hidden));
captionToggle.addEventListener('click', () => setContext(context.hidden));

const filters = document.querySelector('.filters');
const projects = [...document.querySelectorAll('.project')];
const projectGrid = document.querySelector('.project-grid');
const count = document.querySelector('.project-count');
const controls = document.querySelector('.carousel-controls');
const previous = document.querySelector('.previous');
const next = document.querySelector('.next');
filters.hidden = false;
function visibleProjects() { return projects.filter(p => !p.hidden); }
function updateCarousel() {
  const visible = visibleProjects();
  controls.hidden = !mobile.matches || visible.length < 2;
  projectGrid.classList.toggle('single', visible.length === 1);
  previous.disabled = projectGrid.scrollLeft <= 2;
  next.disabled = projectGrid.scrollLeft >= projectGrid.scrollWidth - projectGrid.clientWidth - 3;
}
filters.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  const category = button.dataset.filter;
  filters.querySelectorAll('button').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  projects.forEach(p => { p.hidden = category !== 'all' && p.dataset.category !== category; });
  const amount = visibleProjects().length;
  count.textContent = `${String(amount).padStart(2, '0')} ${amount === 1 ? 'project' : 'projects'}`;
  projectGrid.hidden = visibleProjects().length === 0;
  projectGrid.scrollTo({ left: 0, behavior: 'instant' });
  updateCarousel();
});
function moveCarousel(direction) {
  const visible = visibleProjects();
  const step = visible[0]?.getBoundingClientRect().width + 18 || projectGrid.clientWidth;
  projectGrid.scrollBy({ left: direction * step, behavior: reduced.matches ? 'instant' : 'smooth' });
}
previous.addEventListener('click', () => moveCarousel(-1));
next.addEventListener('click', () => moveCarousel(1));
projectGrid.addEventListener('scroll', updateCarousel, { passive: true });
addEventListener('resize', updateCarousel, { passive: true });
updateCarousel();
document.querySelectorAll('[data-open]').forEach(button => {
  const details = document.getElementById(button.dataset.open);
  button.addEventListener('click', () => {
    details.open = !details.open;
    if (details.open) details.scrollIntoView({block:'nearest',behavior:reduced.matches?'instant':'smooth'});
  });
  details.addEventListener('toggle', () => button.setAttribute('aria-expanded', String(details.open)));
});

const technology = document.querySelector('.technology');
const track = document.querySelector('.technology-track');
const copy = track.firstElementChild.cloneNode(true);
copy.setAttribute('aria-hidden', 'true');
track.append(copy);
const motionButton = document.querySelector('.motion-button');
motionButton.hidden = false;
motionButton.addEventListener('click', () => {
  const paused = technology.classList.toggle('paused');
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Resume motion ▶' : 'Pause motion Ⅱ';
});
let technologyVisible = false;
function syncTechnology() { technology.classList.toggle('in-view', technologyVisible && !document.hidden); }
new IntersectionObserver(entries => { technologyVisible = entries[0].isIntersecting; syncTechnology(); }, { rootMargin: '60px' }).observe(technology);
document.addEventListener('visibilitychange', syncTechnology);

let frame = 0;
const progress = document.querySelector('.read-progress');
const sections = [...document.querySelectorAll('main>section[id]')];
const navLinks = [...document.querySelectorAll('.desktop-nav a')];
function updateReading() {
  frame = 0;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
  let active = 'home';
  for (const section of sections) if (section.getBoundingClientRect().top < innerHeight * .4) active = section.id;
  navLinks.forEach(link => { const selected = link.hash === '#' + active; link.classList.toggle('active', selected); if (selected) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
}
addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateReading); }, { passive: true });
updateReading();

const email = 'adheebabdullavp@gmail.com';
const copyEmail = document.querySelector('.copy-email');
copyEmail.hidden = false;
copyEmail.addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try { await navigator.clipboard.writeText(email); status.textContent = 'Email address copied.'; }
  catch { status.textContent = 'Select the email address above to copy it, or click it to open your email app.'; }
});
document.querySelector('.contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const name = form.elements.name.value.trim();
  const from = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  if (!name || !message) { document.querySelector('.form-status').textContent = 'Please enter your name and message.'; return; }
  const subject = `Portfolio enquiry from ${name}`;
  const body = `${message}\n\nFrom: ${name}\nReply to: ${from}`;
  location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.querySelector('.form-status').textContent = 'Your email app should open with a draft. If it does not, use the email address shown here.';
});
document.querySelector('#year').textContent = new Date().getFullYear();

const trophyStage = document.querySelector('.trophy-stage');
const trophyToggle = document.querySelector('.trophy-toggle');
trophyToggle.hidden = false;
trophyToggle.addEventListener('click', () => {
  const inspecting = trophyStage.classList.toggle('inspecting');
  trophyToggle.setAttribute('aria-pressed', String(inspecting));
  trophyToggle.textContent = inspecting ? 'Return to full view' : 'Take a closer look';
});
let trophyFrame = 0;
function resetTrophy() {
  cancelAnimationFrame(trophyFrame);
  trophyStage.style.setProperty('--tilt-x', '0deg');
  trophyStage.style.setProperty('--tilt-y', '0deg');
}
trophyStage.addEventListener('pointermove', event => {
  if (reduced.matches || event.pointerType !== 'mouse') return;
  const rect = trophyStage.getBoundingClientRect();
  const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
  const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
  cancelAnimationFrame(trophyFrame);
  trophyFrame = requestAnimationFrame(() => {
    trophyStage.style.setProperty('--tilt-x', `${-y * 5}deg`);
    trophyStage.style.setProperty('--tilt-y', `${x * 7}deg`);
  });
});
trophyStage.addEventListener('pointerleave', resetTrophy);
trophyStage.addEventListener('pointercancel', resetTrophy);
reduced.addEventListener('change', resetTrophy);

// One gentle entrance per section; never hide content or intercept scrolling.
if ('IntersectionObserver' in window) {
  const entrances = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!reduced.matches) {
        entry.target.classList.add('chapter-arrival');
        const heading = entry.target.querySelector('.section-heading, .about-intro, .experience-grid, .contact-grid') || entry.target;
        heading.classList.add('section-arrival');
        heading.addEventListener('animationend', () => heading.classList.remove('section-arrival'), { once: true });
      }
      entrances.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
  document.querySelectorAll('main > section:not(.hero), .recognition').forEach(section => entrances.observe(section));
}
