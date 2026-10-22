/* =========================================================
   Componentes: transforma a marcação enxuta de partes/*.html
   na marcação completa que o CSS espera.

   <section class="part" data-title="...">   -> cabeçalho "Parte I"
   <details class="step" data-title="...">   -> <summary> com número
   <div class="terminal" data-title="...">   -> barra de janela escura
   <figure class="screenshot" data-title=""> -> barra de navegador
   ========================================================= */

/** Cria um elemento com classe e texto opcionais. */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** 1 -> "I", 14 -> "XIV" */
export function toRoman(n) {
  const table = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
                 [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [value, symbol] of table) {
    while (n >= value) { out += symbol; n -= value; }
  }
  return out;
}

/** Cabeçalho de cada parte, numerado pela ordem no documento. */
export function buildParts(root) {
  root.querySelectorAll('.part').forEach((part, i) => {
    const roman = toRoman(i + 1);
    part.dataset.roman = roman;

    const header = el('header', 'part__header');
    header.append(
      el('p', 'eyebrow part__label', `Parte ${roman}`),
      el('h2', 'part__title', part.dataset.title),
    );
    part.prepend(header);
  });
}

/** Número e rótulo padrão dos passos que não entram na contagem. */
const UNCOUNTED = {
  'step--extra': ['+', 'Extra'],
  'step--video': ['', 'Vídeo'], // o triângulo é desenhado em CSS
};

/**
 * Cabeçalho clicável de cada passo. Extras e vídeos não entram na contagem.
 * data-number e data-label (opcionais) trocam o número e o rótulo padrão.
 */
export function buildSteps(root) {
  let count = 0;

  root.querySelectorAll('.step').forEach((step) => {
    const variant = Object.keys(UNCOUNTED).find((name) => step.classList.contains(name));
    const [defaultNumber, defaultLabel] = variant ? UNCOUNTED[variant] : [];
    const number = step.dataset.number ?? defaultNumber ?? String(++count);
    const label = step.dataset.label ?? defaultLabel ?? `Passo ${number}`;

    const text = el('div');
    text.append(
      el('p', 'eyebrow step__label', label),
      el('h3', 'step__title', step.dataset.title),
    );

    const summary = el('summary', 'step__header');
    summary.append(el('span', 'step__number', number), text);
    step.prepend(summary);
  });
}

/**
 * Vídeo que só baixa ao clicar. Antes disso é só um botão de play,
 * e apenas um vídeo toca por vez.
 */
let playing = null;

function stopVideo(box) {
  const video = box.querySelector('video');
  if (video) {
    video.pause();
    video.removeAttribute('src');
    video.load(); // encerra o download em andamento
    video.remove();
  }
  box.classList.remove('is-playing');
  if (playing === box) playing = null;
}

function playVideo(box) {
  if (playing) stopVideo(playing);

  const video = document.createElement('video');
  video.src = box.dataset.src;
  video.controls = true;
  video.playsInline = true;
  video.autoplay = true;
  box.querySelector('.video__frame').append(video);
  box.classList.add('is-playing');
  playing = box;
}

export function buildVideos(root) {
  root.querySelectorAll('.video[data-src]').forEach((box) => {
    const button = el('button', 'video__play');
    button.type = 'button';
    button.append(
      el('span', 'video__icon'),
      el('span', '', box.dataset.title ?? 'Assistir'),
      el('span', 'video__hint', 'clique para carregar'),
    );
    button.addEventListener('click', () => playVideo(box));

    const frame = el('div', 'video__frame');
    frame.append(button);
    box.prepend(frame);
  });

  // fechar o passo para o vídeo que está dentro dele (toggle não sobe, por isso a captura)
  root.addEventListener('toggle', (event) => {
    if (!event.target.open && playing && event.target.contains(playing)) stopVideo(playing);
  }, true);
}

/** Barra de janela (três bolinhas + título) em terminais e capturas. */
export function buildWindowBars(root) {
  root.querySelectorAll('.terminal[data-title], .screenshot[data-title]').forEach((box) => {
    const bar = el('div', 'window-bar');
    if (box.classList.contains('terminal')) bar.classList.add('window-bar--dark');

    for (let i = 0; i < 3; i++) bar.append(el('span', 'window-bar__dot'));
    bar.append(el('p', 'window-bar__title', box.dataset.title));
    box.prepend(bar);
  });
}
