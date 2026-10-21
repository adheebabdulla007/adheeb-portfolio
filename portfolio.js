document.documentElement.classList.add('js');
const iconPaths = {"out":"M5 19 19 5M5 5h14v14","plus":"M12 5v14M5 12h14","close":"m6 6 12 12M6 18 18 6"};
function uiIcon(name) {
  return `<svg class="ui-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="${iconPaths[name]}"/></svg>`;
}
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 767px)');
const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.mobile-nav');
menuButton.hidden = false;
function closeMenu(restore = false) {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.innerHTML = 'Menu ' + uiIcon('plus');
  if (restore) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.innerHTML = open ? 'Close ' + uiIcon('close') : 'Menu ' + uiIcon('plus');
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
  portraitToggle.innerHTML = uiIcon(open ? 'close' : 'plus');
  captionToggle.innerHTML = (open ? 'Back to portrait ' : 'More about me ') + uiIcon('out');
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

// Native disclosures remain usable without JavaScript and on small screens.
const toolNav = document.querySelector('.tool-nav');
const toolButtons = [...toolNav.querySelectorAll('[data-tool]')];
const toolCategories = [...document.querySelectorAll('.tool-category')];
toolNav.hidden = false;
let selectedTool = 'backend';
function selectTool(id) {
  selectedTool = id;
  toolCategories.forEach(item => { item.open = item.id === 'tools-' + id; });
  toolButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tool === id)));
}
toolButtons.forEach(button => button.addEventListener('click', () => selectTool(button.dataset.tool)));
toolCategories.forEach(item => item.querySelector('summary').addEventListener('click', event => {
  event.preventDefault();
  if (item.open) item.open = false;
  else selectTool(item.id.slice(6));
}));
toolCategories.forEach(item => item.addEventListener('toggle', () => {
  if (item.open && selectedTool !== item.id.slice(6)) selectTool(item.id.slice(6));
}));
mobile.addEventListener('change', () => selectTool(selectedTool));

document.querySelectorAll('[data-close-project]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', () => {
    const details = document.getElementById(button.dataset.closeProject);
    details.open = false;
    details.querySelector('summary').focus({preventScroll:true});
    details.scrollIntoView({block:'nearest',behavior:reduced.matches?'instant':'smooth'});
  });
});
document.querySelectorAll('[data-project-link]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  filters.querySelector('[data-filter="all"]').click();
  const project = document.getElementById(link.dataset.projectLink);
  const details = project.querySelector('details');
  details.open = true;
  history.replaceState(null, '', link.hash);
  details.querySelector('summary').focus({preventScroll:true});
  if (mobile.matches) {
    const left = projectGrid.scrollLeft + project.getBoundingClientRect().left - projectGrid.getBoundingClientRect().left;
    projectGrid.scrollTo({left,behavior:'instant'});
  }
  window.scrollTo({top:scrollY + project.getBoundingClientRect().top - 100,behavior:reduced.matches?'instant':'smooth'});
}));
const experienceEntries = [...document.querySelectorAll('.experience-list details')];
const routeItems = [...document.querySelectorAll('.experience-route li')];
function selectExperience(entry) {
  experienceEntries.forEach(item => { if (item !== entry) item.open = false; });
  routeItems.forEach((item,index) => {
    const active = index === 2 - experienceEntries.indexOf(entry);
    item.classList.toggle('current',active);
    if(active) item.setAttribute('aria-current','step'); else item.removeAttribute('aria-current');
  });
}
experienceEntries.forEach(entry => entry.addEventListener('toggle', () => {
  if (entry.open) selectExperience(entry);
  else if (!experienceEntries.some(item => item.open)) routeItems.forEach(item => {
    item.classList.remove('current'); item.removeAttribute('aria-current');
  });
}));
selectExperience(experienceEntries[0]);

let frame = 0;
const progress = document.querySelector('.read-progress');
const sections = [...document.querySelectorAll('main>section[id]')];
const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const navIndicator = document.createElement('span');
navIndicator.className = 'nav-indicator';
navIndicator.setAttribute('aria-hidden','true');
document.querySelector('.desktop-nav').append(navIndicator);
function updateReading() {
  frame = 0;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
  let active = 'home';
  for (const section of sections) if (section.getBoundingClientRect().top < innerHeight * .4) active = section.id;
  navLinks.forEach(link => { const selected = link.hash === '#' + active; link.classList.toggle('active', selected); if (selected) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
  const current = navLinks.find(link => link.classList.contains('active'));
  navIndicator.style.opacity = current ? '1' : '0';
  if(current) {
    navIndicator.style.width = current.offsetWidth + 'px';
    navIndicator.style.transform = `translateX(${current.offsetLeft}px)`;
  }
}
addEventListener('resize', updateReading, {passive:true});
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
const contactForm = document.querySelector('.contact-form');
const draftPanel = document.querySelector('.email-draft');
const formStatus = document.querySelector('.form-status');
contactForm.addEventListener('input', () => {
  draftPanel.hidden = true;
  formStatus.textContent = '';
});
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const name = contactForm.elements.name.value.trim();
  const from = contactForm.elements.email.value.trim();
  const message = contactForm.elements.message.value.trim();
  if (!name || !message) { formStatus.textContent = 'Please enter your name and message.'; return; }
  const subject = `Portfolio enquiry from ${name}`;
  const body = `${message}\n\nFrom: ${name}\nReply to: ${from}`;
  document.querySelector('.draft-subject').textContent = `Subject: ${subject}`;
  document.querySelector('.draft-mailto').href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmail = new URL('https://mail.google.com/mail/');
  gmail.search = new URLSearchParams({view:'cm',fs:'1',to:email,su:subject,body}).toString();
  document.querySelector('.draft-gmail').href = gmail.href;
  document.querySelector('#draft-preview').value = `To: ${email}\nSubject: ${subject}\n\n${body}`;
  draftPanel.hidden = false;
  formStatus.textContent = 'Email prepared. Choose how to open it, then press Send in your email service.';
  document.querySelector('.draft-gmail').focus({preventScroll:true});
  draftPanel.scrollIntoView({block:'nearest',behavior:reduced.matches?'instant':'smooth'});
});
document.querySelector('.copy-draft').addEventListener('click', async () => {
  const preview = document.querySelector('#draft-preview');
  try { await navigator.clipboard.writeText(preview.value); formStatus.textContent = 'Email copied. Paste it into your email service and send it to the address shown.'; }
  catch { preview.focus(); preview.select(); formStatus.textContent = 'Copy the selected email, then paste it into your email service.'; }
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
