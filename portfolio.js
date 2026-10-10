document.documentElement.classList.add('js');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const cinematic=matchMedia('(min-width: 1100px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)');
const menuButton=document.querySelector('.menu-toggle'),menu=document.querySelector('#mobile-menu');
menuButton.hidden=false;
function closeMenu(restore=false){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');if(restore)menuButton.focus();}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menu.hidden=open;menuButton.setAttribute('aria-expanded',String(!open));});
menu.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden)closeMenu(true);});
document.addEventListener('click',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!menuButton.contains(event.target))closeMenu();});
matchMedia('(min-width:768px)').addEventListener('change',()=>closeMenu());
document.querySelector('#year').textContent=new Date().getFullYear();
const stories={"erp":{"label":"01 / LOGIOLOGY · COMPANY WORK","title":"Connected records. Clear contribution.","html":"<p>Work across Nebu, Ouro, E-Smith and Profit24 using C#, .NET, .NET Framework, WPF, WCF and SQL Server.</p><h3>What I worked on</h3><ul><li>Sales, purchase, customer savings plans, calculations and reports.</li><li>Changed 14 master-data paths to load when opened.</li><li>Worked across connected business rules and records.</li></ul><h3>What the evidence means</h3><p>The 14-path change describes a loading strategy. No measured startup-speed improvement is claimed. The workflow drawing illustrates relationships; it is not a screenshot of a company product.</p><h3>Source access</h3><p>Company source is private. Public implementation details are limited to the contribution described here.</p>"},"gcc":{"label":"02 / GCC DATA ONBOARDING","title":"Ownership, with a precise boundary.","html":"<p>Logiology’s first GCC client: 13 branches and one head office. More than 130,000 records were involved at one point during the work.</p><h3>My responsibility</h3><p>I owned the onboarding application, its deadlines and the outcome. The wider customer delivery was a team effort.</p><ul><li>Mapped unfamiliar source structures.</li><li>Handled sales, purchase, schemes, inventory and accounting records.</li><li>Worked through failures, retries, reconciliation and verification.</li><li>Supported onboarding while the business continued operating.</li></ul><h3>Scope</h3><p>This was business-data onboarding. The scale is a historical snapshot, not a current usage count. Company source and customer records are private.</p>"},"pursuit":{"label":"03 / PERSONAL PRODUCT · PRIVATE SOURCE","title":"Pursuit: the complete hiring journey.","html":"<p>An actively developed hiring product with role-aware job management, job search, résumé applications, application history, employer review, status changes and administrator controls.</p><h3>Verified snapshot — 8 October 2026</h3><ul><li>Backend build and integration tests passed.</li><li>Frontend lint, 83 tests and production build passed.</li><li>The employer-to-job-seeker browser journey passed in Chromium, Firefox and WebKit.</li></ul><p>Evidence reference: committed revision 29415e2; CI run 37641412173. These are dated checks, not a claim of current deployment or production usage.</p><h3>Engineering boundaries</h3><p>Tenant-aware backend behavior is part of the committed scope. Transactional outbox, deployment migrations, dependency readiness, resource limits and query growth remain engineering work.</p><h3>Private repository</h3><p>The source is private, so there is no public repository or live-demo link. Local experiments are not presented as shipped features.</p>"},"ai":{"label":"04 / RESEARCH EXPERIENCE","title":"Working through the model lifecycle.","html":"<h3>College project</h3><p>Abusive-language detection: convert speech to text, classify with an SVM, and work through training, testing and evaluation.</p><h3>Healthcare R&D — Heveahill</h3><p>Trainee work included healthcare data preparation, model research and selection, training and evaluation, and research into appointment-conversation flows. Retell AI and Hugging Face were among the explored tools.</p><h3>Scope</h3><p>No accuracy figure, dataset size, production deployment or patient outcome is claimed. No customer or patient data is shown.</p>"}};
const dialog=document.querySelector('#case-dialog');let opener;
document.querySelectorAll('[data-case]').forEach(button=>button.addEventListener('click',()=>{const story=stories[button.dataset.case];if(!story)return;opener=button;document.querySelector('#case-label').textContent=story.label;document.querySelector('#case-title').textContent=story.title;document.querySelector('#case-content').innerHTML=story.html;dialog.showModal();dialog.scrollTop=0;document.body.classList.add('modal-open');dialog.querySelector('.dialog-close').focus();}));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});});
const portrait=document.querySelector('.portrait-story'),approach=document.querySelector('.approach'),hero=document.querySelector('.hero'),atmosphere=document.querySelector('.hero-atmosphere');
let frame=0;const active=new Set();const clamp=value=>Math.min(1,Math.max(0,value));
function update(){frame=0;if(document.hidden||!cinematic.matches)return;if(active.has(portrait)){const rect=portrait.getBoundingClientRect(),travel=Math.max(1,portrait.offsetHeight-innerHeight),progress=clamp((-rect.top/travel-.08)/.75);portrait.style.setProperty('--portrait-progress',progress.toFixed(4));}if(active.has(approach)){const rect=approach.getBoundingClientRect(),progress=clamp((innerHeight-rect.top)/(innerHeight+rect.height));approach.style.setProperty('--ribbon-shift',((1-progress)*80).toFixed(2)+'px');}}
function schedule(){if(!frame&&cinematic.matches&&!document.hidden)frame=requestAnimationFrame(update);}
function configure(){document.documentElement.classList.toggle('motion',cinematic.matches);if(!cinematic.matches){portrait.style.removeProperty('--portrait-progress');approach.style.removeProperty('--ribbon-shift');}else{active.add(portrait);active.add(approach);schedule();}}
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.isIntersecting?active.add(entry.target):active.delete(entry.target);if(entry.target===hero)atmosphere.style.animationPlayState=entry.isIntersecting&&!document.hidden?'running':'paused';}schedule();},{rootMargin:'100px'});[portrait,approach,hero].forEach(el=>observer.observe(el));}
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});cinematic.addEventListener('change',configure);reduced.addEventListener('change',configure);document.addEventListener('visibilitychange',()=>{atmosphere.style.animationPlayState=!document.hidden&&active.has(hero)?'running':'paused';schedule();});configure();
// Resolve anchor positions from normal flow, including cards already in a sticky stack.
function goToSection(hash,behavior='smooth'){
 const target=document.getElementById(hash.slice(1));if(!target)return;
 document.documentElement.classList.add('measuring');
 const top=target.getBoundingClientRect().top+scrollY-24;
 document.documentElement.classList.remove('measuring');
 window.scrollTo({top,behavior:reduced.matches?'instant':behavior});
}
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
 if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 event.preventDefault();const hash=link.getAttribute('href');
 if(location.hash!==hash)history.pushState(null,'',hash);
 goToSection(hash);
 const target=document.getElementById(hash.slice(1));
 if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
}));
window.addEventListener('popstate',()=>goToSection(location.hash||'#home','instant'));
if(location.hash)requestAnimationFrame(()=>goToSection(location.hash,'instant'));
document.addEventListener('focusin',event=>{
 if(!cinematic.matches||dialog.open)return;
 if(event.target.closest('.about-copy')&&Number(getComputedStyle(document.querySelector('.about-copy')).opacity)<1){
  window.scrollTo({top:portrait.offsetTop+portrait.offsetHeight-innerHeight,behavior:'instant'});schedule();
 }
 const card=event.target.closest('.project');
 if(card&&event.target.matches('button,a')){
  const r=event.target.getBoundingClientRect(),front=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
  if(front&&!event.target.contains(front))goToSection('#'+card.id,'instant');
 }
});
