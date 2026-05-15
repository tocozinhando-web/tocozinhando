/**
 * receitas.js — Página de listagem de receitas
 * Tô Cozinhando v1.0 MVP
 *
 * Depende de: search.js → jurema.js → utils.js (carregados antes)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { esc, renderRecipeCard, initHeaderScroll, initMobileNav,
          initScrollReveal, getParam, AREA_LABEL } = window.TC;

  const jurema = new Jurema();
  const search = new RecipeSearch();
  await search.load();

  initHeaderScroll();
  initMobileNav();
  initScrollReveal();

  /* ============================================================
     ESTADO INICIAL — lê parâmetros da URL
  ============================================================ */
  let activeArea = getParam('area') || '';
  let activeTag  = getParam('tag')  || '';
  let activeQ    = getParam('q')    || '';

  /* ============================================================
     REFS DO DOM
  ============================================================ */
  const grid         = document.getElementById('receitas-grid');
  const searchInput  = document.getElementById('receitas-search');
  const searchForm   = document.getElementById('receitas-search-form');
  const pageTitle    = document.getElementById('receitas-title');
  const pageCount    = document.getElementById('receitas-count');
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const tagFilter    = document.getElementById('tag-filter');
  const clearBtn     = document.getElementById('filter-clear');

  /* ============================================================
     RENDERIZAÇÃO PRINCIPAL
  ============================================================ */
  function render() {
    if (!grid || !search.loaded) return;

    let results = search.getAll();

    // Filtra por área
    if (activeArea) {
      results = results.filter(r => r.area === activeArea);
    }

    // Filtra por tag
    if (activeTag) {
      const t = activeTag.toLowerCase();
      results = results.filter(r =>
        (r.tags || []).some(tag => tag.toLowerCase().includes(t))
      );
    }

    // Filtra por busca textual
    if (activeQ.trim().length >= 2) {
      const searchResults = search.search(activeQ);
      const slugSet = new Set(searchResults.map(r => r.slug));
      results = results.filter(r => slugSet.has(r.slug));
    }

    // Atualiza título e contagem
    if (pageTitle) {
      if (activeArea && AREA_LABEL[activeArea]) {
        pageTitle.textContent = AREA_LABEL[activeArea].replace(/^.+?\s/, ''); // remove emoji
      } else if (activeTag) {
        pageTitle.textContent = `Tag: ${activeTag}`;
      } else if (activeQ) {
        pageTitle.textContent = `Busca: "${activeQ}"`;
      } else {
        pageTitle.textContent = 'Todas as receitas';
      }
    }

    if (pageCount) {
      pageCount.textContent = `${results.length} receita${results.length !== 1 ? 's' : ''}`;
    }

    // Renderiza grid
    if (!results.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state__icon">🐾</div>
          <h3>Nenhuma receita encontrada</h3>
          <p>A Jurema não encontrou nada com esses filtros.<br>Tente uma combinação diferente.</p>
          <button class="btn btn-secondary" id="clear-all-btn">Limpar filtros</button>
        </div>`;
      document.getElementById('clear-all-btn')?.addEventListener('click', clearAll);
      jurema.setState('empty');
    } else {
      grid.innerHTML = results.map(renderRecipeCard).join('');
      jurema.setState('idle');
    }

    // Marca filtros ativos nos botões
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.area === activeArea);
    });

    // Atualiza URL sem recarregar
    const params = new URLSearchParams();
    if (activeArea) params.set('area', activeArea);
    if (activeTag)  params.set('tag', activeTag);
    if (activeQ)    params.set('q', activeQ);
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    history.replaceState(null, '', newUrl);

    // Mostra/esconde botão "Limpar"
    const hasFilter = activeArea || activeTag || activeQ;
    if (clearBtn) clearBtn.style.display = hasFilter ? 'inline-flex' : 'none';
  }

  /* ============================================================
     FILTROS POR ÁREA
  ============================================================ */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const area = btn.dataset.area || '';
      activeArea = (activeArea === area) ? '' : area; // toggle
      activeTag  = '';
      render();
    });
  });

  /* ============================================================
     BUSCA TEXTUAL
  ============================================================ */
  let searchTimer;

  if (searchInput) {
    // Preenche com query da URL
    if (activeQ) searchInput.value = activeQ;

    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      const val = searchInput.value.trim();
      searchTimer = setTimeout(() => {
        activeQ = val;
        render();
      }, 500);
    });

    searchInput.addEventListener('focus', () => jurema.setState('focus'));
    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (jurema.getState() === 'focus') jurema.setState('idle');
      }, 300);
    });
  }

  searchForm?.addEventListener('submit', e => {
    e.preventDefault();
    clearTimeout(searchTimer);
    activeQ = searchInput?.value.trim() || '';
    render();
  });

  /* ============================================================
     LIMPAR FILTROS
  ============================================================ */
  function clearAll() {
    activeArea = '';
    activeTag  = '';
    activeQ    = '';
    if (searchInput) searchInput.value = '';
    render();
  }

  clearBtn?.addEventListener('click', clearAll);

  /* ============================================================
     RENDER INICIAL
  ============================================================ */
  render();

}); // DOMContentLoaded
