'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px), (hover: none), (pointer: coarse)');
  const connection = navigator.connection;
  const constrained = () => connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const motionMode = () => reduced.matches ? 'reduced' : compact.matches || constrained() ? 'compact' : 'full';
  let mode = motionMode();
  function updateMotion() {
    mode = motionMode();
    document.documentElement.dataset.motion = mode;
    if (mode !== 'full') resetTrophy();
    if (mode === 'reduced') {
      $$('.reveal').forEach(node => node.classList.add('visible'));
      clearTrace();
    }
  }
  reduced.addEventListener('change', updateMotion);
  compact.addEventListener('change', updateMotion);
  connection?.addEventListener?.('change', updateMotion);

  const erpDescriptions = [
    'Calculation feeds the invoice, stock movement and financial records.',
    'The invoice records the sale and connects it to stock and accounts.',
    'Stock movement connects the sold item to the transaction and its financial records.',
    'Accounts holds the financial records connected to the sale.'
  ];
  $$('[data-erp]').forEach(button => button.addEventListener('click', () => {
    const step = Number(button.dataset.erp);
    $$('[data-erp]').forEach((node, index) => {
      node.setAttribute('aria-pressed', String(index === step));
      node.classList.toggle('is-active', index === step);
      node.classList.toggle('is-linked', index > step);
    });
    $('#erp-reading').textContent = erpDescriptions[step];
    $('.trace-marker').textContent = step === 3 ? '04' : '0' + (step + 1) + '—04';
  }));
  $$('.selectable button').forEach(button => button.addEventListener('click', () => {
    $$('.selectable button').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
    $('#load-status').textContent = 'Path ' + button.textContent + ' selected · loaded when opened';
  }));

  // These are diagrams of inspected source, not live backend operations.
  const traceTimers = new Set();
  const traceButton = $('#trace-request');
  const traceNodes = $$('.system-node');
  function clearTrace() {
    traceTimers.forEach(clearTimeout);
    traceTimers.clear();
    traceNodes.forEach(node => node.classList.remove('trace-active'));
    traceButton.disabled = false;
    $('#trace-status').textContent = 'Source-based diagram. Database and message writes are currently separate.';
  }
  traceButton.addEventListener('click', () => {
    clearTrace();
    if (mode === 'reduced') {
      traceNodes.forEach(node => node.classList.add('trace-active'));
      $('#trace-status').textContent = 'React → identity and ownership → résumé file, application record and background event. Database and message writes are separate.';
      return;
    }
    traceButton.disabled = true;
    const descriptions = ['React sends the résumé and job.', 'The API checks identity and ownership.', 'The résumé file goes to Blob Storage.', 'SQL Server stores the application.', 'RabbitMQ receives the background event. Database and message writes are separate.'];
    const interval = mode === 'compact' ? 150 : 420;
    traceNodes.forEach((node, index) => {
      const timer = setTimeout(() => {
        traceTimers.delete(timer);
        node.classList.add('trace-active');
        $('#trace-status').textContent = descriptions[index];
        if (index === traceNodes.length - 1) traceButton.disabled = false;
      }, interval * index);
      traceTimers.add(timer);
    });
  });
  $$('[data-proof]').forEach(button => button.addEventListener('click', () => {
    const tenant = button.dataset.proof === 'tenant';
    $$('[data-proof]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('#tenant-proof').hidden = !tenant;
    $('#rotation-proof').hidden = tenant;
    $('#proof-source-link').href = 'https://github.com/adheebabdulla007/pursuit/blob/5a6c4139adac69606f55811e3430d034b4234c73/tests/Pursuit.IntegrationTests/' + (tenant ? 'TenantIsolation/ApplicationTenantIsolationTests.cs' : 'Auth/AuthRefreshTokenTests.cs');
  }));
  const voiceDescriptions = {
    speech: 'Method illustration · training, testing and evaluation were part of my work.',
    transcript: 'Transcription turns audio into words. Errors here affect the classifier.',
    svm: 'SVM classifies the transcript. The points illustrate a boundary, not measured results.'
  };
  $$('[data-voice]').forEach(button => button.addEventListener('click', () => {
    $$('[data-voice]').forEach(item => {
      const active = item === button;
      item.setAttribute('aria-pressed', String(active));
      $('#' + item.dataset.voice + '-panel').hidden = !active;
    });
    $('#voice-caption').textContent = voiceDescriptions[button.dataset.voice];
  }));

  // Observe entry, not every scroll event. There are no pinned chapters or gesture intercepts.
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible', 'is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08 });
    $$('.reveal, .handoff').forEach(node => {
      if (reduced.matches || node.getBoundingClientRect().top < innerHeight * .9) node.classList.add('visible', 'is-visible');
      else {
        node.classList.add('ready');
        revealObserver.observe(node);
      }
    });
    const dock = $('.atlas-dock');
    new IntersectionObserver(entries => {
      const entry = entries[0];
      dock.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
    }).observe($('#home'));
    const chapters = new Map();
    // A shared observer tracks all four chapters, including direct hash navigation.
    const chapterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => chapters.set(entry.target.id, entry.isIntersecting));
      const current = [...chapters].find(([, visible]) => visible)?.[0];
      if (!current) return;
      $$('.atlas-dock a').forEach(link => {
        if (link.hash === '#' + current) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-12% 0px -55% 0px', threshold: 0 });
    $$('[data-chapter]').forEach(node => chapterObserver.observe(node));
  }

  const trophy = $('.trophy-button');
  const art = $('.trophy-art');
  let bounds = null, tiltFrame = 0, pointerX = 0, pointerY = 0;
  function resetTrophy() {
    cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
    bounds = null;
    art.style.removeProperty('--tilt-x');
    art.style.removeProperty('--tilt-y');
  }
  trophy.addEventListener('pointerenter', event => {
    if (mode === 'full' && event.pointerType !== 'touch') bounds = trophy.getBoundingClientRect();
  });
  trophy.addEventListener('pointermove', event => {
    if (!bounds || mode !== 'full') return;
    pointerX = event.clientX; pointerY = event.clientY;
    if (tiltFrame) return;
    tiltFrame = requestAnimationFrame(() => {
      tiltFrame = 0;
      if (!bounds) return;
      const x = Math.max(-.5, Math.min(.5, (pointerX - bounds.left) / bounds.width - .5));
      const y = Math.max(-.5, Math.min(.5, (pointerY - bounds.top) / bounds.height - .5));
      art.style.setProperty('--tilt-x', -y * 6 + 'deg');
      art.style.setProperty('--tilt-y', x * 10 + 'deg');
    });
  });
  trophy.addEventListener('pointerleave', resetTrophy);
  trophy.addEventListener('pointercancel', resetTrophy);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTrace(); resetTrophy(); } });
  updateMotion();

  // Native dialogs provide focus containment and Escape behavior.
  const dialogTriggers = new WeakMap();
  $$('[data-dialog]').forEach(button => button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.dialog);
    dialogTriggers.set(dialog, button);
    dialog.showModal();
  }));
  $$('dialog').forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => dialogTriggers.get(dialog)?.focus({ preventScroll: true }));
  });
  $$('[data-close-dialog]').forEach(link => link.addEventListener('click', () => link.closest('dialog').close()));
  function draft() {
    const name = $('#contact-name'), message = $('#contact-message');
    name.setCustomValidity(name.value.trim() ? '' : 'Please enter your name.');
    message.setCustomValidity(message.value.trim() ? '' : 'Please enter a message.');
    if (!$('#contact-form').reportValidity()) return null;
    return `Hello Adheeb,\n\n${message.value.trim()}\n\n${name.value.trim()}`;
  }
  $$('#contact-form input, #contact-form textarea').forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
  $('#contact-form').addEventListener('submit', event => {
    event.preventDefault();
    const body = draft();
    if (body) location.href = `mailto:adheebabdullavp@gmail.com?subject=${encodeURIComponent('A conversation from your portfolio')}&body=${encodeURIComponent(body)}`;
  });
  $('#whatsapp-draft').addEventListener('click', () => {
    const body = draft();
    if (body) window.open(`https://wa.me/919400727023?text=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
  });
  $('#copy-draft').addEventListener('click', async () => {
    const body = draft();
    if (!body) return;
    try {
      await navigator.clipboard.writeText(body);
      $('#form-status').textContent = 'Message copied. Paste it into your preferred app.';
    } catch {
      $('#form-status').textContent = 'Copy is unavailable here. You can select your message above or open an email draft.';
    }
  });
})();
