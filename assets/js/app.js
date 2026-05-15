/**
 * app.js — Home page: inicialização e integração
 * Tô Cozinhando v1.1 MVP
 *
 * Depende de: search.js → jurema.js → utils.js (carregados antes)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { esc, renderRecipeCard, initHeaderScroll, initMobileNav, initScrollReveal } = window.TC;

  /* ============================================================
     1. INSTÂNCIAS
  ============================================================ */
  const jurema = new Jurema();
  const search = new RecipeSearch();
  await search.load();

  /* ============================================================
     2. INFRA DE PÁGINA
  ============================================================ */
  initHeaderScroll();
  initMobileNav();
  initScrollReveal();

  /* ============================================================
     3. ÁREAS
  ============================================================ */
  const AREAS = [
    { slug: 'pra-ja',    cls: 'card-area--pra-ja',    icon: '⚡', name: 'Pra Já',
      desc: 'De 15 a 40 minutos. Sem drama, sem frescura, sem passar fome.' },
    { slug: 'mini-chef', cls: 'card-area--mini-chef',  icon: '👧', name: 'Mini Chef',
      desc: 'Para cozinhar junto com crianças. Aprender misturado com diversão.' },
    { slug: 'leve',      cls: 'card-area--leve',       icon: '🥗', name: 'Leve de Verdade',
      desc: 'Nutritiva, saborosa e sem discurso de dieta. Leve do jeito certo.' },
    { slug: 'pelo-mundo',cls: 'card-area--mundo',      icon: '🌍', name: 'Pelo Mundo',
      desc: 'Sabores de outros países com ingredientes do seu mercado.' },
    { slug: 'familia',   cls: 'card-area--familia',    icon: '🏠', name: 'Receitas de Família',
      desc: 'Clássicos afetivos. Do arroz com feijão ao pudim da vovó.' },
    { slug: 'cardapios', cls: 'card-area--cardapios',  icon: '📅', name: 'Cardápios da Semana',
      desc: 'Planejamento semanal para facilitar sua vida na cozinha.' }
  ];

  const areasGrid = document.getElementById('areas-grid');
  if (areasGrid) {
    areasGrid.innerHTML = AREAS.map(area => `
      <a href="receitas.html?area=${area.slug}" class="card-area ${area.cls}"
         aria-label="Área: ${area.name}">
        <span class="card-area__icon" aria-hidden="true">${area.icon}</span>
        <span class="card-area__name">${area.name}</span>
        <p class="card-area__desc">${area.desc}</p>
      </a>
    `).join('');
  }

  /* ============================================================
     4. RECEITAS EM DESTAQUE
  ============================================================ */
  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid && search.loaded) {
    const featured = search.getFeatured(8);
    featuredGrid.innerHTML = featured.length
      ? featured.map(renderRecipeCard).join('')
      : '<p style="color:var(--taupe);grid-column:1/-1">Carregando receitas…</p>';

    featuredGrid.querySelectorAll('.card-recipe').forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (!['loading','success','empty','typing'].includes(jurema.getState())) {
          jurema.setState('hover');
        }
      });
      card.addEventListener('mouseleave', () => {
        if (jurema.getState() === 'hover') jurema.setState('idle');
      });
    });
  }

  /* ============================================================
     5. BUSCA
  ============================================================ */
  const searchForm     = document.getElementById('search-form');
  const searchInput    = document.getElementById('search-input');
  const resultsSection = document.getElementById('results-section');
  const resultsGrid    = document.getElementById('results-grid');
  const resultsSummary = document.getElementById('results-summary');
  const resultsClose   = document.getElementById('results-close');

  let typingTimer;

  searchInput?.addEventListener('focus', () => jurema.setState('focus'));

  searchInput?.addEventListener('input', () => {
    clearTimeout(typingTimer);
    const val = searchInput.value.trim();
    if (!val) { jurema.setState('focus'); hideResults(); return; }
    jurema.setState('typing');
    typingTimer = setTimeout(() => { if (val.length >= 2) runSearch(val); }, 750);
  });

  searchInput?.addEventListener('blur', () => {
    setTimeout(() => {
      const s = jurema.getState();
      if ((s === 'focus' || s === 'typing') && !searchInput.value.trim()) {
        jurema.setState('idle');
      }
    }, 300);
  });

  searchForm?.addEventListener('submit', e => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q) runSearch(q);
  });

  resultsClose?.addEventListener('click', () => {
    hideResults();
    jurema.setState('idle');
    searchInput.value = '';
    document.querySelectorAll('.quick-tag').forEach(b => b.classList.remove('active'));
  });

  /* ============================================================
     6. QUICK TAGS
  ============================================================ */
  document.querySelectorAll('.quick-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q || btn.textContent.replace(/[^\w\sÀ-ú]/g, '').trim();
      document.querySelectorAll('.quick-tag').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (searchInput) searchInput.value = q;
      runSearch(q);
    });
  });

  /* ============================================================
     7. NEWSLETTER
  ============================================================ */
  const newsletterForm = document.getElementById('newsletter-form');
  newsletterForm?.addEventListener('submit', e => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const btn        = newsletterForm.querySelector('button[type="submit"]');
    const email      = emailInput?.value.trim();
    if (!email || !email.includes('@')) { emailInput?.focus(); return; }

    if (btn) { btn.textContent = 'Jurema recebeu! 🐾'; btn.disabled = true; }
    jurema.setState('completed');

    setTimeout(() => {
      if (btn) { btn.textContent = 'Quero receber'; btn.disabled = false; }
      if (emailInput) emailInput.value = '';
      jurema.setState('idle');
    }, 4500);
  });

  /* ============================================================
     FUNÇÕES INTERNAS
  ============================================================ */

  function runSearch(query) {
    jurema.setState('loading');
    clearTimeout(typingTimer);
    setTimeout(() => {
      const results = search.search(query);
      if (results.length) { jurema.setState('success'); renderResults(results, query); }
      else                { jurema.setState('empty');   renderEmpty(query); }
    }, 420);
  }

  function renderResults(results, query) {
    if (!resultsSection || !resultsGrid) return;
    resultsSummary.innerHTML =
      `<span>${results.length} receita${results.length !== 1 ? 's' : ''}</span> para &ldquo;${esc(query)}&rdquo;`;
    resultsGrid.innerHTML = results.map(renderRecipeCard).join('');
    resultsSection.removeAttribute('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderEmpty(query) {
    if (!resultsSection || !resultsGrid) return;
    resultsSummary.innerHTML = `Nenhuma receita para &ldquo;${esc(query)}&rdquo;`;
    resultsGrid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state__icon">🐾</div>
        <h3>A Jurema farejou muito, mas não encontrou nada.</h3>
        <p>Tente ingredientes diferentes ou explore as áreas abaixo.</p>
      </div>`;
    resultsSection.removeAttribute('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideResults() {
    resultsSection?.setAttribute('hidden', '');
    if (resultsGrid) resultsGrid.innerHTML = '';
  }

}); // DOMContentLoaded
