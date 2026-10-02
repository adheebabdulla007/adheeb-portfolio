'use strict';
(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  // These controls explain repository behaviour; they never call a backend.
  let traceTimer;
  $('#trace-request').addEventListener('click', () => {
    const map = $('.system-map');
    clearTimeout(traceTimer);
    map.classList.remove('tracing');
    $('#trace-status').textContent = 'Request → identity checks → résumé, application and event.';
    if (!reduced.matches) requestAnimationFrame(() => requestAnimationFrame(() => map.classList.add('tracing')));
    traceTimer = setTimeout(() => {
      map.classList.remove('tracing');
      $('#trace-status').textContent = 'Source-based diagram. Database and message writes are currently separate.';
    }, 3400);
  });
  $$('[data-proof]').forEach(button => button.addEventListener('click', () => {
    const tenant = button.dataset.proof === 'tenant';
    $$('[data-proof]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('#tenant-proof').hidden = !tenant;
    $('#rotation-proof').hidden = tenant;
    $('#proof-source-link').href = 'https://github.com/adheebabdulla007/pursuit/blob/5a6c4139adac69606f55811e3430d034b4234c73/tests/Pursuit.IntegrationTests/' + (tenant ? 'TenantIsolation/ApplicationTenantIsolationTests.cs' : 'Auth/AuthRefreshTokenTests.cs');
  }));

  $$('.load-blocks').forEach(node => {
    for (let i = 0; i < 14; i++) {
      const block = document.createElement('i');
      block.setAttribute('aria-hidden', 'true');
      node.append(block);
    }
  });
  // Fixed, illustrative footprint. No branch-specific business data is represented.
  for (let i = 0; i < 13; i++) {
    const branch = document.createElement('div');
    branch.className = 'branch-building';
    branch.style.setProperty('--branch', i);
    branch.innerHTML = `<svg viewBox="0 0 40 38" aria-hidden="true"><path d="M7 34V12L20 4l13 8v22H7Z" fill="#2a402c" stroke="currentColor" stroke-width="1.1"/><path d="M7 12h26M20 4v8M13 18h4m6 0h4m-14 6h4m6 0h4M18 34v-5h5v5" fill="none" stroke="currentColor" stroke-width="1.1"/></svg><span>${String(i + 1).padStart(2, '0')}</span>`;
    $('#branch-field').append(branch);
  }
  for (let i = 0; i < 38; i++) {
    const bar = document.createElement('i');
    bar.style.setProperty('--height', `${18 + Math.abs(Math.sin(i * 1.27) * Math.cos(i * .32)) * 108}px`);
    $('#waveform').append(bar);
  }

  function select(group, attribute, callback) {
    const buttons = $$(group);
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      callback(button.dataset[attribute]);
    }));
  }
  const voices = {
    speech: ['∿', 'Spoken input starts the abusive-language detection workflow.'],
    transcript: ['Aa', 'Google Speech-to-Text produces the words. Transcription errors affect the next stage.'],
    svm: ['{ }', 'The SVM classifies the transcript. My work included training, testing and evaluation.']
  };
  select('[data-voice]', 'voice', key => {
    const [symbol, copy] = voices[key];
    $('.speech-study').dataset.mode = key;
    $('#voice-symbol').textContent = symbol;
    $('#voice-caption').textContent = copy;
  });
  const health = {
    data: ['{ }', 'Healthcare data', 'Healthcare dataset preparation for appointment-booking R&D.'],
    model: ['◇', 'Model selection', 'Research and compare approaches for an appointment-booking conversation.'],
    evaluate: ['↻', 'Training + evaluation', 'Train, test and evaluate models against the intended healthcare requests.'],
    flow: ['↳', 'Conversation flow', 'Understand what a caller needs and how the appointment conversation should progress.']
  };
  select('[data-health]', 'health', key => {
    const [icon, title, copy] = health[key];
    $('#health-icon').textContent = icon;
    $('#health-title').textContent = title;
    $('#health-copy').textContent = copy;
  });

  // Replays are finite CSS sequences. Scrolling and gestures remain browser-native.
  const replayTimers = new Map();
  function playScene(scene, button) {
    if (reduced.matches) return;
    scene.classList.remove('is-playing');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (reduced.matches) return;
      scene.classList.add('is-playing');
    }));
    if (!button) return;
    clearTimeout(replayTimers.get(button));
    button.disabled = true;
    button.innerHTML = 'Playing <span>↻</span>';
    replayTimers.set(button, setTimeout(() => {
      button.disabled = false;
      button.innerHTML = 'Replay <span>↻</span>';
      replayTimers.delete(button);
    }, 3900));
  }
  $$('[data-replay]').forEach(button => button.addEventListener('click', () => {
    playScene(document.querySelector(`[data-scene="${button.dataset.replay}"]`), button);
  }));

  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08 });
    if (!reduced.matches) $$('.reveal').forEach(node => {
      if (node.getBoundingClientRect().top > innerHeight * .9) {
        node.classList.add('ready');
        revealObserver.observe(node);
      }
    });
    const sceneObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target.matches('.award')) entry.target.classList.add('in-view');
        else playScene(entry.target);
        sceneObserver.unobserve(entry.target);
      });
    }, { threshold: .22 });
    $$('.scene, .award').forEach(node => sceneObserver.observe(node));
    // Tall phone layouts start each visual beat when it actually enters view.
    const beatObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-visible');
        beatObserver.unobserve(entry.target);
      });
    }, { threshold: .22 });
    $$('.transaction-stop, .source-records, .application-engine, .branch-destination, .candidate-side, .journey-bridge, .employer-side').forEach(node => beatObserver.observe(node));
    reduced.addEventListener('change', event => {
      if (!event.matches) return;
      $$('.reveal').forEach(node => node.classList.add('visible'));
      revealObserver.disconnect();
      $$('.scene').forEach(node => node.classList.remove('is-playing'));
      resetTrophy();
    });
  }

  // One frame per pointer change, only while the trophy is being inspected.
  const trophy = $('.trophy-button');
  const art = $('.trophy-art');
  let trophyBounds = null;
  let tiltFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  function resetTrophy() {
    cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
    trophyBounds = null;
    art.style.removeProperty('--tilt-x');
    art.style.removeProperty('--tilt-y');
  }
  trophy.addEventListener('pointerenter', event => {
    if (!finePointer.matches || reduced.matches || event.pointerType === 'touch') return;
    trophyBounds = trophy.getBoundingClientRect();
  });
  trophy.addEventListener('pointermove', event => {
    if (!trophyBounds || reduced.matches) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (tiltFrame) return;
    tiltFrame = requestAnimationFrame(() => {
      tiltFrame = 0;
      if (!trophyBounds) return;
      const x = Math.max(-.5, Math.min(.5, (pointerX - trophyBounds.left) / trophyBounds.width - .5));
      const y = Math.max(-.5, Math.min(.5, (pointerY - trophyBounds.top) / trophyBounds.height - .5));
      art.style.setProperty('--tilt-x', `${-y * 8}deg`);
      art.style.setProperty('--tilt-y', `${x * 12}deg`);
    });
  });
  trophy.addEventListener('pointerleave', resetTrophy);
  trophy.addEventListener('pointercancel', resetTrophy);

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
