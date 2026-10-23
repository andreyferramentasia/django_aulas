/* =========================================================
   Busca: filtra a página para mostrar só os passos de um tema.

   Se o termo bate com uma trilha de js/topics.js ("media",
   "list view"...), mostra os passos da trilha em ordem, com
   início, fim e navegação entre eles. Senão, mostra os passos
   cujo texto contém o termo.

   O filtro fica na URL (?busca=) e no navegador até ser limpo.
   ========================================================= */

import { el } from './components.js';
import { TOPICS } from './topics.js';

const PARAM = 'busca';
const STORAGE_KEY = 'tutorial-busca';
const HIDDEN = 'is-filtered-out';

/** "List View" -> "listview", "Migração" -> "migracao" */
function compact(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Texto sem acentos e em minúsculas, mantendo os espaços. */
function plain(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ');
}

function findTopic(query) {
  const q = compact(query);
  if (q.length < 2) return null;
  return TOPICS.find((topic) => topic.keywords.some((word) => {
    const k = compact(word);
    return k === q || (q.length >= 4 && k.startsWith(q));
  })) ?? null;
}

/* ---------- Destaque dos termos ---------- */

const ACCENTS = { a: '[aáàâã]', e: '[eéê]', i: '[ií]', o: '[oóôõ]', u: '[uú]', c: '[cç]' };

/**
 * Regex que acha os termos ignorando acento, maiúsculas e espaços.
 * wholeWords evita marcar pedaço de palavra ("image" dentro de "imagens").
 */
function termsRegex(terms, wholeWords) {
  const parts = [...terms]
    .sort((a, b) => b.length - a.length)
    .map((term) => [...plain(term).trim()].map((ch) => {
      if (ch === ' ') return '\\s*';
      return ACCENTS[ch] ?? ch.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    }).join(''));
  const pattern = parts.join('|');
  return wholeWords
    ? new RegExp(`(?<![\\p{L}\\d_])(${pattern})(?![\\p{L}\\d_])`, 'giu')
    : new RegExp(`(${pattern})`, 'gi');
}

function highlight(root, regex) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (node.parentElement.closest('mark, script, style')
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    const text = node.nodeValue;
    regex.lastIndex = 0;
    if (!regex.test(text)) continue;

    const fragment = document.createDocumentFragment();
    let last = 0;
    regex.lastIndex = 0;
    for (const match of text.matchAll(regex)) {
      if (match.index > last) fragment.append(text.slice(last, match.index));
      fragment.append(el('mark', 'search-hit', match[0]));
      last = match.index + match[0].length;
    }
    fragment.append(text.slice(last));
    node.replaceWith(fragment);
  }
}

function clearHighlights(root) {
  root.querySelectorAll('mark.search-hit').forEach((mark) => {
    const parent = mark.parentNode;
    mark.replaceWith(mark.textContent);
    parent.normalize();
  });
}

/* ---------- Guardar o filtro ---------- */

function readSaved() {
  const fromUrl = new URLSearchParams(location.search).get(PARAM);
  if (fromUrl !== null) return fromUrl;
  try { return localStorage.getItem(STORAGE_KEY) ?? ''; } catch { return ''; }
}

function save(query) {
  const url = new URL(location.href);
  if (query) url.searchParams.set(PARAM, query);
  else url.searchParams.delete(PARAM);
  history.replaceState(null, '', url);
  try {
    if (query) localStorage.setItem(STORAGE_KEY, query);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* sem armazenamento, fica só na URL */ }
}

/* ---------- Mostrar um passo escondido pelo filtro ---------- */

/** Usado por links, pela âncora da URL e pelo feed de vídeos. */
export function reveal(target) {
  if (!target) return;
  target.closest('.part')?.classList.remove(HIDDEN);
  target.closest('.step')?.classList.remove(HIDDEN);
  target.classList.remove(HIDDEN);
}

/* ---------- Montagem ---------- */

function stepLabel(step) {
  return step.querySelector('.step__label')?.textContent ?? '';
}

/** Painel no topo do conteúdo: a sequência inteira, do início ao fim. */
function buildPanel(query, topic, matches, onClear) {
  const panel = el('section', 'trail');
  panel.setAttribute('aria-label', 'Resultado da busca');

  const head = el('div', 'trail__head');
  const text = el('div');
  text.append(
    el('p', 'eyebrow trail__kicker', topic ? 'Trilha' : 'Busca'),
    el('h2', 'trail__title', topic ? topic.title : `"${query}"`),
    el('p', 'trail__count', matches.length
      ? `${matches.length} ${matches.length === 1 ? 'passo' : 'passos'}, em ordem. Só eles estão aparecendo na página.`
      : 'Nenhum passo encontrado.'),
  );
  const clear = el('button', 'trail__clear', 'Limpar filtro');
  clear.type = 'button';
  clear.addEventListener('click', onClear);
  head.append(text, clear);
  panel.append(head);

  if (!matches.length) return panel;

  const list = el('ol', 'trail__list');
  matches.forEach(({ step, note }, i) => {
    const li = el('li', 'trail__item');
    if (i === 0) li.classList.add('trail__item--start');
    if (i === matches.length - 1) li.classList.add('trail__item--end');

    const link = el('a', 'trail__link');
    link.href = `#${step.id}`;
    link.append(el('span', 'trail__step', stepLabel(step)), el('span', 'trail__name', step.dataset.title));
    if (note) link.append(el('span', 'trail__note', note));

    const badges = [];
    if (i === 0) badges.push('Início');
    if (i === matches.length - 1) badges.push('Fim');
    badges.forEach((badge) => link.append(el('span', 'trail__badge', badge)));

    li.append(link);
    list.append(li);
  });
  panel.append(list);
  return panel;
}

/** Etiqueta acima de cada passo: posição na trilha, início/fim e navegação. */
function buildTag(title, matches, i) {
  const tag = el('nav', 'trail-tag');
  tag.setAttribute('aria-label', `Posição na busca ${title}`);

  let position = `${title} · ${i + 1} de ${matches.length}`;
  if (i === 0) position += ' · Início';
  if (i === matches.length - 1) position += ' · Fim';
  tag.append(el('span', 'trail-tag__position', position));

  const links = el('span', 'trail-tag__links');
  const add = (index, text) => {
    if (index < 0 || index >= matches.length) return;
    const a = el('a', 'trail-tag__link', text);
    a.href = `#${matches[index].step.id}`;
    links.append(a);
  };
  add(i - 1, '← anterior');
  add(i + 1, 'próximo →');
  tag.append(links);
  return tag;
}

export function buildSearch(target, content, toc) {
  const input = el('input', 'search__input');
  input.type = 'search';
  input.placeholder = 'Buscar: media, list view, login...';
  input.setAttribute('aria-label', 'Buscar no tutorial');

  // pesquisas prontas: lista suspensa que só aparece com o campo em foco
  const menu = el('div', 'search__menu');
  menu.append(el('p', 'search__menu-title', 'Pesquisas prontas'));
  const options = TOPICS.map((topic) => {
    const option = el('button', 'search__option', topic.title);
    option.type = 'button';
    option.addEventListener('click', () => {
      input.value = topic.keywords[0];
      input.blur(); // fecha a lista
      run(true);
    });
    menu.append(option);
    return { option, words: compact([topic.title, ...topic.keywords].join(' ')) };
  });

  /** Enquanto digita, a lista mostra só os temas que combinam. */
  function filterMenu() {
    const q = compact(input.value);
    let visible = 0;
    options.forEach(({ option, words }) => {
      option.hidden = Boolean(q) && !words.includes(q);
      if (!option.hidden) visible++;
    });
    menu.hidden = visible === 0;
  }

  // o foco fica no campo ao clicar na lista, senão ela some antes do clique
  menu.addEventListener('mousedown', (event) => event.preventDefault());
  // ao entrar no campo, mostra todos os temas
  input.addEventListener('focus', () => {
    options.forEach(({ option }) => { option.hidden = false; });
    menu.hidden = false;
  });

  const label = el('label', 'search__label');
  label.append(el('span', 'eyebrow', 'Buscar'), input);
  target.append(label, menu);

  const steps = [...content.querySelectorAll('.step')];
  const parts = [...content.querySelectorAll('.part')];
  const texts = new Map(steps.map((step) => [step, plain(step.textContent)]));
  const compacts = new Map(steps.map((step) => [step, compact(step.textContent)]));
  let opened = []; // passos que a busca abriu, fechados de novo ao limpar

  function reset() {
    content.querySelectorAll('.trail, .trail-tag').forEach((node) => node.remove());
    content.querySelectorAll(`.${HIDDEN}`).forEach((node) => node.classList.remove(HIDDEN));
    toc.querySelectorAll(`.${HIDDEN}`).forEach((node) => node.classList.remove(HIDDEN));
    clearHighlights(content);
    opened.forEach((step) => { step.open = false; });
    opened = [];
  }

  function apply(query) {
    reset();
    query = query.trim();
    save(query);
    if (query.length < 2) return null;

    const topic = findTopic(query);
    let matches;
    let terms;
    if (topic) {
      matches = topic.steps
        .map(([id, note]) => ({ step: document.getElementById(id), note }))
        .filter(({ step }) => step);
      terms = topic.highlight;
    } else {
      const q = plain(query).trim();
      const c = compact(query);
      matches = steps
        .filter((step) => texts.get(step).includes(q) || compacts.get(step).includes(c))
        .map((step) => ({ step, note: '' }));
      terms = [query];
    }

    const shown = new Set(matches.map(({ step }) => step));
    steps.forEach((step) => { if (!shown.has(step)) step.classList.add(HIDDEN); });
    parts.forEach((part) => {
      if (!part.querySelector(`.step:not(.${HIDDEN})`)) part.classList.add(HIDDEN);
    });

    toc.querySelectorAll('.toc__item').forEach((item) => {
      const step = document.getElementById(item.querySelector('a').hash.slice(1));
      if (!shown.has(step)) item.classList.add(HIDDEN);
    });
    toc.querySelectorAll('.toc__section').forEach((section) => {
      if (!section.querySelector(`.toc__item:not(.${HIDDEN})`)) section.classList.add(HIDDEN);
    });

    const regex = termsRegex(terms, Boolean(topic));
    const title = topic ? topic.title : `"${query}"`;
    matches.forEach(({ step }, i) => {
      if (!step.open) { step.open = true; opened.push(step); }
      highlight(step, regex);
      step.before(buildTag(title, matches, i));
    });

    const panel = buildPanel(query, topic, matches, () => { input.value = ''; run(true); });
    content.prepend(panel);
    return panel;
  }

  // no celular a busca fica acima do conteúdo: rolar a cada tecla tiraria o campo da tela
  const wide = window.matchMedia('(min-width: 821px)');
  function run(scroll) {
    const panel = apply(input.value);
    if (panel && (scroll || wide.matches)) panel.scrollIntoView({ block: 'start' });
  }

  let timer;
  input.addEventListener('input', () => {
    filterMenu();
    clearTimeout(timer);
    timer = setTimeout(() => run(false), 200);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { clearTimeout(timer); input.blur(); run(true); }
    if (event.key === 'Escape') { input.value = ''; filterMenu(); run(false); }
  });

  // link para um passo fora do filtro: mostra o passo em vez de não fazer nada
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    reveal(document.getElementById(decodeURIComponent(link.hash.slice(1))));
  });

  input.value = readSaved();
  if (input.value) apply(input.value);
}
