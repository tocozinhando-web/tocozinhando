/**
 * utils.js — Utilitários compartilhados
 * Tô Cozinhando v1.0 MVP
 *
 * Carregado antes de app.js, recipe.js e receitas.js.
 * Expõe window.TC com funções e constantes reutilizáveis.
 */

(function () {
  'use strict';

  /* ============================================================
     CONSTANTES DE ÁREA
  ============================================================ */
  const AREA_LABEL = {
    'pra-ja':     '⚡ Pra Já',
    'mini-chef':  '👧 Mini Chef',
    'leve':       '🥗 Leve',
    'pelo-mundo': '🌍 Pelo Mundo',
    'familia':    '🏠 Família'
  };

  const AREA_CLS = {
    'pra-ja':     'badge-pra-ja',
    'mini-chef':  'badge-mini-chef',
    'leve':       'badge-leve',
    'pelo-mundo': 'badge-pelo-mundo',
    'familia':    'badge-familia'
  };

  const AREA_EMOJI = {
    'pra-ja': '⚡', 'mini-chef': '👧', 'leve': '🥗',
    'pelo-mundo': '🌍', 'familia': '🏠'
  };

  const DIFF_DOT = {
    'iniciante': '🟢', 'fácil': '🟡',
    'intermediária': '🟠', 'avançada': '🔴'
  };

  const DIFF_LABEL = {
    'iniciante': 'Iniciante', 'fácil': 'Fácil',
    'intermediária': 'Intermediária', 'avançada': 'Avançada'
  };

  const COST_LABEL = {
    'muito baixo': '💚 Econômica', 'baixo': '💛 Baixo custo',
    'médio': '🟠 Custo médio', 'alto': '🔴 Custo alto'
  };

  /* ============================================================
     UTILITÁRIOS DE STRING
  ============================================================ */

  /** Escapa HTML para evitar XSS. */
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Retorna o país de uma receita (suporta ambos os schemas). */
  function getCountry(recipe) {
    return recipe?.origin?.country || recipe?.country || '';
  }

  /** Formata minutos em texto legível. */
  function fmtTime(min) {
    if (!min) return '—';
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

  /** Lê parâmetro da URL atual. */
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  /* ============================================================
     RENDERIZAÇÃO DE CARDS
  ============================================================ */

  /**
   * Gera o HTML completo de um card de receita.
   * Usado em home (destaque + resultados), receitas.html e receita.html (relacionadas).
   */
  function renderRecipeCard(recipe) {
    const imgSrc    = recipe.image?.thumb || '';
    const imgAlt    = recipe.image?.alt   || recipe.title;
    const areaLabel = AREA_LABEL[recipe.area] || recipe.area || '';
    const areaCls   = AREA_CLS[recipe.area]   || '';
    const diffDot   = DIFF_DOT[recipe.difficulty]   || '';
    const diffLabel = DIFF_LABEL[recipe.difficulty]  || recipe.difficulty || '';
    const totalTime = recipe.time?.total || '';
    const servings  = recipe.servings || '';
    const topTags   = (recipe.tags || []).slice(0, 2)
      .map(t => `<span class="tag">${esc(t)}</span>`).join('');

    const imgHtml = imgSrc
      ? `<img class="card-recipe__img" src="${esc(imgSrc)}" alt="${esc(imgAlt)}" loading="lazy">`
      : `<div class="card-recipe__img-placeholder" aria-hidden="true">
           <span>${AREA_EMOJI[recipe.area] || '🍳'}</span>
         </div>`;

    return /* html */`
      <a href="receita.html?slug=${esc(recipe.slug)}" class="card-recipe" aria-label="${esc(recipe.title)}">
        <div class="card-recipe__img-wrap">
          ${imgHtml}
          <span class="badge ${esc(areaCls)}">${esc(areaLabel)}</span>
        </div>
        <div class="card-recipe__body">
          <h3 class="card-recipe__title">${esc(recipe.title)}</h3>
          <p class="card-recipe__desc">${esc(recipe.description || '')}</p>
          ${topTags ? `<div class="card-recipe__tags">${topTags}</div>` : ''}
          <div class="card-recipe__meta">
            <span class="card-recipe__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              ${fmtTime(totalTime)}
            </span>
            <span class="card-recipe__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              ${esc(String(servings))} ${servings === 1 ? 'porção' : 'porções'}
            </span>
            ${diffDot ? `<span class="card-recipe__meta-item" title="${esc(diffLabel)}">${esc(diffDot)} ${esc(diffLabel)}</span>` : ''}
          </div>
        </div>
      </a>
    `;
  }

  /* ============================================================
     HEADER SCROLL HELPER
  ============================================================ */

  /** Ativa a classe 'scrolled' no header ao rolar a página. */
  function initHeaderScroll(headerId = 'header') {
    const header = document.getElementById(headerId);
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // checa estado inicial
  }

  /* ============================================================
     MOBILE NAV HELPER
  ============================================================ */

  /** Inicializa o toggle do menu mobile. */
  function initMobileNav(toggleId = 'nav-toggle', navId = 'nav-mobile') {
    const toggle = document.getElementById(toggleId);
    const nav    = document.getElementById(navId);
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      nav.setAttribute('aria-hidden', String(!isOpen));
    });

    // Fecha ao clicar em link do menu mobile
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ============================================================
     SCROLL REVEAL HELPER
  ============================================================ */

  /** Ativa animação de entrada nos elementos com classe 'reveal'. */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const delay = parseInt(entry.target.dataset.delay || '0', 10);
              setTimeout(() => entry.target.classList.add('visible'), delay);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );
      reveals.forEach(el => io.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('visible'));
    }
  }

  /* ============================================================
     INJECT JSON-LD (SEO)
  ============================================================ */

  /** Injeta o Schema.org/Recipe no <head> da página. */
  function injectJsonLd(schema) {
    if (!schema || typeof schema !== 'object') return;
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(s);
  }

  /* ============================================================
     EXPORTA
  ============================================================ */
  window.TC = {
    AREA_LABEL, AREA_CLS, AREA_EMOJI, DIFF_DOT, DIFF_LABEL, COST_LABEL,
    esc, getCountry, fmtTime, getParam,
    renderRecipeCard,
    initHeaderScroll, initMobileNav, initScrollReveal, injectJsonLd
  };

})();
