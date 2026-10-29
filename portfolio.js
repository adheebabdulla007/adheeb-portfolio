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
mobile.addEventListener('change', () => { closeMenu(); });

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
  const project = document.getElementById(link.dataset.projectLink);
  const details = project.querySelector('details');
  details.open = true;
  history.replaceState(null, '', link.hash);
  details.querySelector('summary').focus({preventScroll:true});
  project.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
}));
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
document.querySelector('.contact-compose').hidden = false;
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
