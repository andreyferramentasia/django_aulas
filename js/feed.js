/* =========================================================
   Feed de vídeos no estilo TikTok: um botão flutuante abre
   todos os vídeos da página em tela cheia, um por tela,
   rolando para cima e para baixo.

   Só o vídeo da tela atual recebe o src, os outros ficam
   sem baixar nada.
   ========================================================= */

import { el, stopPlaying } from './components.js';
import { reveal } from './search.js';

/**
 * Seção que o vídeo explica: data-target da figure, ou o primeiro passo
 * depois do passo do vídeo (o vídeo fica logo antes do conteúdo).
 */
function findTarget(box, step) {
  if (box.dataset.target) return document.getElementById(box.dataset.target);

  let next = step?.nextElementSibling;
  while (next && (!next.matches('.step') || next.matches('.step--video'))) next = next.nextElementSibling;
  return next ?? step;
}

/** Lê os vídeos da página, na ordem, com título, parte e seção. */
function collectVideos(root) {
  return [...root.querySelectorAll('.video[data-src]')].map((box) => {
    const step = box.closest('.step');
    const part = box.closest('.part');
    return {
      src: box.dataset.src,
      title: step?.dataset.title ?? box.dataset.title ?? 'Vídeo',
      part: part ? `Parte ${part.dataset.roman} · ${part.dataset.title}` : '',
      target: findTarget(box, step),
    };
  });
}

/** Abre o passo (se for <details>) e rola até ele. */
function goToSection(target) {
  reveal(target); // pode estar escondido pela busca
  if (target.tagName === 'DETAILS') target.open = true;
  history.replaceState(null, '', `#${target.id}`);
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Para o vídeo e cancela o download. */
function unload(video) {
  video.pause();
  if (video.hasAttribute('src')) {
    video.removeAttribute('src');
    video.load();
  }
}

function buildSlide(item, onSection) {
  const video = document.createElement('video');
  video.dataset.src = item.src;
  video.controls = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('controlslist', 'nofullscreen'); // o feed já ocupa a tela

  const info = el('div', 'feed__info');
  info.append(el('p', 'eyebrow feed__part', item.part), el('h3', 'feed__title', item.title));

  const frame = el('div', 'feed__frame');
  frame.append(video, info);

  if (item.target) {
    const button = el('button', 'feed__section');
    button.type = 'button';
    button.append(el('span', 'feed__section-label', 'Ir para a seção'), el('span', '', item.target.dataset.title ?? ''));
    button.addEventListener('click', () => onSection(item.target));
    frame.append(button);
  }

  const slide = el('section', 'feed__slide');
  slide.append(frame);
  return slide;
}

function iconButton(className, label) {
  const button = el('button', `feed__button ${className}`);
  button.type = 'button';
  button.setAttribute('aria-label', label);
  return button;
}

function openFeed(videos, trigger) {
  stopPlaying();

  const dialog = el('dialog', 'feed');
  dialog.setAttribute('aria-label', 'Vídeos do tutorial');

  // a rolagem até a seção espera o feed fechar e a página destravar
  let pendingTarget = null;
  const onSection = (target) => { pendingTarget = target; dialog.close(); };

  const track = el('div', 'feed__track');
  const slides = videos.map((item) => buildSlide(item, onSection));
  track.append(...slides);

  const close = iconButton('feed__close', 'Fechar');
  const up = iconButton('feed__nav feed__nav--up', 'Vídeo anterior');
  const down = iconButton('feed__nav feed__nav--down', 'Próximo vídeo');
  const nav = el('div', 'feed__navs');
  nav.append(up, down);

  const go = (direction) => track.scrollBy({ top: direction * track.clientHeight, behavior: 'smooth' });
  close.addEventListener('click', () => dialog.close());
  up.addEventListener('click', () => go(-1));
  down.addEventListener('click', () => go(1));

  // tela que ficou visível: carrega e toca, descarrega as outras
  let current = -1;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.find((entry) => entry.isIntersecting);
    if (!visible) return;
    const index = slides.indexOf(visible.target);
    if (index === current) return;

    slides.forEach((slide, i) => { if (i !== index) unload(slide.querySelector('video')); });
    const video = slides[index].querySelector('video');
    video.src = video.dataset.src;
    video.play().catch(() => {}); // sem autoplay permitido, o usuário aperta o play

    current = index;
    up.disabled = index === 0;
    down.disabled = index === slides.length - 1;
  }, { root: track, threshold: 0.6 });
  slides.forEach((slide) => observer.observe(slide));

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); go(1); }
    if (event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); go(-1); }
  });

  dialog.addEventListener('close', () => {
    observer.disconnect();
    slides.forEach((slide) => unload(slide.querySelector('video')));
    dialog.remove();
    document.documentElement.classList.remove('feed-is-open');
    trigger.focus({ preventScroll: true });
    if (pendingTarget) goToSection(pendingTarget);
  });

  dialog.append(track, close, nav);
  document.body.append(dialog);
  document.documentElement.classList.add('feed-is-open');
  dialog.showModal();
}

/** Botão flutuante que abre o feed. Some se a página não tiver vídeos. */
export function buildFeed(root) {
  const videos = collectVideos(root);
  if (!videos.length) return;

  const button = el('button', 'feed-open');
  button.type = 'button';
  button.append(el('span', 'feed-open__icon'), 'Vídeos', el('span', 'feed-open__count', String(videos.length)));
  button.addEventListener('click', () => openFeed(videos, button));
  document.body.append(button);
}
