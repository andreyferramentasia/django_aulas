/* =========================================================
   Ponto de entrada: carrega as partes, monta os componentes
   e o sumário.

   Precisa de um servidor (fetch não funciona em file://).
   No VS Code: extensão Live Server, ou no terminal:
   python -m http.server
   ========================================================= */

import { buildParts, buildSteps, buildVideos, buildWindowBars } from './components.js';
import { buildFeed } from './feed.js';
import { buildToc } from './toc.js';

const content = document.querySelector('#content');
const toc = document.querySelector('#toc-list');

/** Troca cada <div data-include="arquivo.html"> pelo conteúdo do arquivo. */
async function loadIncludes(root) {
  const slots = [...root.querySelectorAll('[data-include]')];

  const htmls = await Promise.all(slots.map(async (slot) => {
    const response = await fetch(slot.dataset.include);
    if (!response.ok) throw new Error(`${response.status} ao carregar ${slot.dataset.include}`);
    return response.text();
  }));

  slots.forEach((slot, i) => { slot.outerHTML = htmls[i]; });
}

/** O conteúdo chega depois do carregamento, então a âncora da URL é aplicada à mão. */
function scrollToHash() {
  const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) target.scrollIntoView({ behavior: 'instant' });
}

function showError(error) {
  console.error(error);
  const message = document.createElement('p');
  message.className = 'load-error';
  message.textContent = 'Não foi possível carregar o conteúdo. Abra o site por um servidor local '
    + '(extensão Live Server do VS Code ou "python -m http.server"), e não direto pelo arquivo.';
  content.replaceChildren(message);
}

try {
  await loadIncludes(content);
  buildParts(content);
  buildSteps(content);
  buildWindowBars(content);
  buildVideos(content);
  buildFeed(content);
  buildToc(toc, content);
  await document.fonts.ready; // fontes mudam a altura do texto, espera antes de rolar
  scrollToHash();
} catch (error) {
  showError(error);
}
