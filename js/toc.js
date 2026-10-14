/* =========================================================
   Sumário: gerado a partir das partes e passos já montados.
   Nada para manter à mão, basta criar o passo em partes/*.html.
   ========================================================= */

const VARIANTS = ['front', 'extra'];

function tocItem(step) {
  const li = document.createElement('li');
  li.className = 'toc__item';

  for (const variant of VARIANTS) {
    if (step.classList.contains(`step--${variant}`)) li.classList.add(`toc__item--${variant}`);
  }

  const link = document.createElement('a');
  link.href = `#${step.id}`;
  link.textContent = step.dataset.title;
  li.append(link);
  return li;
}

function tocSection(part) {
  const section = document.createElement('details');
  section.className = 'toc__section';
  section.open = true;

  const summary = document.createElement('summary');
  summary.className = 'toc__part';
  const roman = document.createElement('span');
  roman.className = 'toc__roman';
  roman.textContent = part.dataset.roman;
  summary.append(roman, ` ${part.dataset.title}`);

  const list = document.createElement('ol');
  list.className = 'toc__list';
  list.append(...[...part.querySelectorAll('.step')].map(tocItem));

  section.append(summary, list);
  return section;
}

export function buildToc(target, root) {
  target.replaceChildren(...[...root.querySelectorAll('.part')].map(tocSection));
}
