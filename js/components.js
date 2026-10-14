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

/**
 * Cabeçalho clicável de cada passo. Extras não entram na contagem.
 * data-number e data-label (opcionais) trocam o número e o rótulo padrão.
 */
export function buildSteps(root) {
  let count = 0;

  root.querySelectorAll('.step').forEach((step) => {
    const isExtra = step.classList.contains('step--extra');
    const number = step.dataset.number ?? (isExtra ? '+' : String(++count));
    const label = step.dataset.label ?? (isExtra ? 'Extra' : `Passo ${number}`);

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
