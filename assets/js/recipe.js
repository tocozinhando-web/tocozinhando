/**
 * recipe.js — Página de receita individual
 * Tô Cozinhando v1.0 MVP
 *
 * Depende de: search.js → jurema.js → utils.js (carregados antes)
 *
 * Responsabilidades:
 *   - Ler slug da URL
 *   - Carregar e renderizar a receita completa
 *   - Modo Cozinha (passo a passo)
 *   - Jurema reativa na página
 *   - Injetar SEO Schema.org
 *   - Renderizar receitas relacionadas
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { esc, fmtTime, getCountry, renderRecipeCard,
          injectJsonLd, initHeaderScroll, initMobileNav,
          AREA_LABEL, AREA_CLS, DIFF_DOT, DIFF_LABEL, COST_LABEL,
          getParam } = window.TC;

  const jurema = new Jurema();
  const search = new RecipeSearch();
  await search.load();

  initHeaderScroll();
  initMobileNav();

  /* ============================================================
     1. IDENTIFICA A RECEITA
  ============================================================ */
  const slug = getParam('slug');
  const recipe = slug ? search.getBySlug(slug) : null;

  if (!recipe) {
    renderNotFound();
    return;
  }

  /* ============================================================
     2. METADADOS DA PÁGINA (title, description, JSON-LD)
  ============================================================ */
  document.title = recipe.seo?.title || `${recipe.title} — Tô Cozinhando`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', recipe.seo?.description || recipe.description || '');

  if (recipe.seo?.schema) injectJsonLd(recipe.seo.schema);

  /* ============================================================
     3. RENDER: HERO DA RECEITA
  ============================================================ */
  renderHero(recipe);

  /* ============================================================
     4. RENDER: INGREDIENTES
  ============================================================ */
  renderIngredients(recipe);

  /* ============================================================
     5. RENDER: MODO DE PREPARO
  ============================================================ */
  renderInstructions(recipe);

  /* ============================================================
     6. RENDER: DICA DA JUREMA
  ============================================================ */
  renderJuremaTip(recipe);

  /* ============================================================
     7. RENDER: RECEITAS RELACIONADAS
  ============================================================ */
  renderRelated(recipe, search);

  /* ============================================================
     8. MODO COZINHA
  ============================================================ */
  initModoCozinha(recipe, jurema);

  /* ============================================================
     9. JUREMA INICIAL
  ============================================================ */
  jurema.setState('idle');
  setTimeout(() => {
    // Após 1.5s, diz a jurema_quote da receita se estiver idle
    if (jurema.getState() === 'idle' && recipe.jurema_quote) {
      const speechEl = document.getElementById('jurema-speech-text');
      if (speechEl) {
        speechEl.style.opacity = '0';
        setTimeout(() => {
          speechEl.textContent = recipe.jurema_quote;
          speechEl.style.opacity = '1';
        }, 200);
      }
    }
  }, 1500);

  /* ============================================================
     RENDER: HERO
  ============================================================ */
  function renderHero(r) {
    const el = document.getElementById('recipe-hero');
    if (!el) return;

    const country   = getCountry(r);
    const areaLabel = AREA_LABEL[r.area] || r.area || '';
    const areaCls   = AREA_CLS[r.area]   || '';
    const diffDot   = DIFF_DOT[r.difficulty] || '';
    const diffLabel = DIFF_LABEL[r.difficulty] || r.difficulty || '';
    const costLabel = COST_LABEL[r.cost] || '';

    el.innerHTML = /* html */`
      <!-- IMAGEM HERO -->
      <div class="recipe-hero__img-wrap">
        ${r.image?.hero
          ? `<img class="recipe-hero__img" src="${esc(r.image.hero)}" alt="${esc(r.image.alt || r.title)}" loading="eager">`
          : `<div class="recipe-hero__img-placeholder" aria-hidden="true">🍳</div>`
        }
        <div class="recipe-hero__img-overlay"></div>
      </div>

      <!-- CONTEÚDO -->
      <div class="recipe-hero__content">
        <div class="container">
          <!-- Breadcrumb -->
          <nav class="recipe-breadcrumb" aria-label="Navegação estrutural">
            <a href="index.html">Início</a>
            <span aria-hidden="true">›</span>
            <a href="receitas.html">Receitas</a>
            <span aria-hidden="true">›</span>
            <a href="receitas.html?area=${esc(r.area)}">${esc(areaLabel)}</a>
          </nav>

          <!-- Badge de área -->
          <span class="badge ${esc(areaCls)}" style="margin-bottom:1rem;display:inline-flex;">
            ${esc(areaLabel)}
          </span>

          <!-- Título -->
          <h1 class="recipe-hero__title">${esc(r.title)}</h1>
          ${r.subtitle ? `<p class="recipe-hero__subtitle">${esc(r.subtitle)}</p>` : ''}

          <!-- Meta strip -->
          <div class="recipe-meta-strip">
            <div class="recipe-meta-item">
              <span class="recipe-meta-icon">⏱️</span>
              <div>
                <span class="recipe-meta-label">Tempo total</span>
                <span class="recipe-meta-value">${fmtTime(r.time?.total)}</span>
              </div>
            </div>
            <div class="recipe-meta-item">
              <span class="recipe-meta-icon">👥</span>
              <div>
                <span class="recipe-meta-label">Porções</span>
                <span class="recipe-meta-value">${esc(String(r.servings || '—'))}</span>
              </div>
            </div>
            <div class="recipe-meta-item">
              <span class="recipe-meta-icon">${esc(diffDot)}</span>
              <div>
                <span class="recipe-meta-label">Dificuldade</span>
                <span class="recipe-meta-value">${esc(diffLabel)}</span>
              </div>
            </div>
            ${country ? `
            <div class="recipe-meta-item">
              <span class="recipe-meta-icon">🌍</span>
              <div>
                <span class="recipe-meta-label">Origem</span>
                <span class="recipe-meta-value">${esc(country)}</span>
              </div>
            </div>` : ''}
            ${costLabel ? `
            <div class="recipe-meta-item">
              <span class="recipe-meta-icon" aria-hidden="true"></span>
              <div>
                <span class="recipe-meta-label">Custo</span>
                <span class="recipe-meta-value">${esc(costLabel)}</span>
              </div>
            </div>` : ''}
          </div>

          <!-- Botão Modo Cozinha -->
          <button class="btn btn-primary" id="btn-modo-cozinha" type="button"
                  aria-label="Entrar no Modo Cozinha — passo a passo">
            📱 Modo Cozinha
          </button>
        </div>
      </div>
    `;
  }

  /* ============================================================
     RENDER: INGREDIENTES
  ============================================================ */
  function renderIngredients(r) {
    const el = document.getElementById('recipe-ingredients');
    if (!el) return;

    const main     = r.ingredients?.filter(i => !i.optional) || [];
    const optional = r.ingredients?.filter(i =>  i.optional) || [];

    const renderItem = i => `
      <li class="ingredient-item">
        <span class="ingredient-qty">${esc(i.quantity || '')} ${esc(i.unit || '')}</span>
        <span class="ingredient-name">${esc(i.name)}</span>
        ${i.substitutions?.length
          ? `<span class="ingredient-sub">ou: ${esc(i.substitutions.slice(0,2).join(', '))}</span>`
          : ''}
      </li>`;

    el.innerHTML = `
      <ul class="ingredients-list" aria-label="Ingredientes">
        ${main.map(renderItem).join('')}
      </ul>
      ${optional.length ? `
      <details class="ingredients-optional">
        <summary>Opcionais (${optional.length})</summary>
        <ul class="ingredients-list">
          ${optional.map(renderItem).join('')}
        </ul>
      </details>` : ''}
      ${r.equipment?.length ? `
      <div class="recipe-equipment">
        <p class="recipe-equipment__label">Você vai precisar de:</p>
        <p class="recipe-equipment__list">${r.equipment.map(e => esc(e)).join(' · ')}</p>
      </div>` : ''}
    `;
  }

  /* ============================================================
     RENDER: INSTRUÇÕES
  ============================================================ */
  function renderInstructions(r) {
    const el = document.getElementById('recipe-instructions');
    if (!el) return;

    const steps = r.instructions || [];

    el.innerHTML = `
      <ol class="instructions-list" aria-label="Modo de preparo">
        ${steps.map(s => `
          <li class="instruction-step" id="step-${s.step}">
            <span class="step-number" aria-hidden="true">${s.step.toString().padStart(2,'0')}</span>
            <div class="step-content">
              <p class="step-text">${esc(s.text)}</p>
              ${s.tip ? `<div class="step-tip"><span>💡</span><p>${esc(s.tip)}</p></div>` : ''}
            </div>
          </li>
        `).join('')}
      </ol>
      ${r.tips?.length ? `
      <div class="recipe-tips">
        <h3 class="recipe-tips__title">🐾 Dicas da Jurema</h3>
        <ul class="recipe-tips__list">
          ${r.tips.map(t => `<li>${esc(t)}</li>`).join('')}
        </ul>
      </div>` : ''}
      ${r.storage ? `
      <div class="recipe-storage">
        <p><strong>Como guardar:</strong> ${esc(r.storage)}</p>
        ${r.freezing ? `<p><strong>Congelamento:</strong> ${esc(r.freezing)}</p>` : ''}
      </div>` : ''}
    `;

    // Tags da receita
    const tagsEl = document.getElementById('recipe-tags');
    if (tagsEl && r.tags?.length) {
      tagsEl.innerHTML = r.tags
        .map(t => `<a href="receitas.html?tag=${encodeURIComponent(t)}" class="tag">${esc(t)}</a>`)
        .join('');
    }
  }

  /* ============================================================
     RENDER: DICA DA JUREMA
  ============================================================ */
  function renderJuremaTip(r) {
    const el = document.getElementById('jurema-tip-text');
    if (el && r.jurema_quote) {
      el.textContent = r.jurema_quote;
    }
    // Atualiza a fala da Jurema no widget
    const speech = document.getElementById('jurema-speech-text');
    if (speech && r.jurema_quote) {
      speech.textContent = r.jurema_quote;
    }
  }

  /* ============================================================
     RENDER: RECEITAS RELACIONADAS
  ============================================================ */
  function renderRelated(r, searchEngine) {
    const el = document.getElementById('related-grid');
    if (!el) return;

    const slugs   = r.related_recipes || [];
    const related = searchEngine.getRelated(slugs);

    // Se não tem relacionadas por slug, pega da mesma área
    const toShow = related.length
      ? related
      : searchEngine.getByArea(r.area, 5).filter(x => x.slug !== r.slug).slice(0, 4);

    if (!toShow.length) {
      el.closest('section')?.remove();
      return;
    }

    el.innerHTML = toShow.map(renderRecipeCard).join('');
  }

  /* ============================================================
     MODO COZINHA
  ============================================================ */
  function initModoCozinha(r, jurema) {
    const btnEnter = document.getElementById('btn-modo-cozinha');
    const overlay  = document.getElementById('modo-cozinha-overlay');
    const btnClose = document.getElementById('modo-close');
    const stepTitle= document.getElementById('modo-step-title');
    const stepText = document.getElementById('modo-step-text');
    const stepTip  = document.getElementById('modo-step-tip');
    const btnPrev  = document.getElementById('modo-prev');
    const btnNext  = document.getElementById('modo-next');
    const progress = document.getElementById('modo-progress');
    const counter  = document.getElementById('modo-counter');

    if (!overlay || !btnEnter) return;

    const steps = r.instructions || [];
    let current = 0;

    function updateStep() {
      const s = steps[current];
      if (!s) return;

      stepTitle.textContent = `Passo ${s.step} de ${steps.length}`;
      stepText.textContent  = s.text;

      if (stepTip) {
        stepTip.textContent = s.tip || '';
        stepTip.closest('.modo-tip-wrap')?.classList.toggle('hidden', !s.tip);
      }

      if (counter) counter.textContent = `${current + 1} / ${steps.length}`;

      // Barra de progresso
      if (progress) {
        progress.style.width = `${((current + 1) / steps.length) * 100}%`;
      }

      // Botões
      if (btnPrev) btnPrev.disabled = current === 0;
      if (btnNext) {
        if (current === steps.length - 1) {
          btnNext.textContent = '✅ Finalizar';
          btnNext.classList.add('btn-success');
        } else {
          btnNext.textContent = 'Próximo →';
          btnNext.classList.remove('btn-success');
        }
      }

      // Jurema no modo cozinha
      if (current === steps.length - 1) {
        jurema.setState('completed');
      } else if (current === 0) {
        jurema.setState('focus');
      }
    }

    function openModo() {
      current = 0;
      overlay.removeAttribute('hidden');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      updateStep();
      jurema.setState('focus');

      // Wake Lock — mantém tela acesa
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(() => {});
      }
    }

    function closeModo() {
      overlay.setAttribute('hidden', '');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      jurema.setState('idle');
    }

    btnEnter.addEventListener('click', openModo);
    btnClose?.addEventListener('click', closeModo);

    btnNext?.addEventListener('click', () => {
      if (current < steps.length - 1) {
        current++;
        updateStep();
      } else {
        closeModo();
        // Scroll até o topo da página para celebrar
        window.scrollTo({ top: 0, behavior: 'smooth' });
        jurema.setState('completed');
      }
    });

    btnPrev?.addEventListener('click', () => {
      if (current > 0) { current--; updateStep(); }
    });

    // Fecha com Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) closeModo();
      if (e.key === 'ArrowRight' && !overlay.hasAttribute('hidden')) btnNext?.click();
      if (e.key === 'ArrowLeft'  && !overlay.hasAttribute('hidden')) btnPrev?.click();
    });

    // Swipe mobile
    let touchStartX = 0;
    overlay.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    overlay.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 60) {
        if (diff > 0) btnNext?.click();
        else          btnPrev?.click();
      }
    }, { passive: true });
  }

  /* ============================================================
     RECEITA NÃO ENCONTRADA
  ============================================================ */
  function renderNotFound() {
    document.title = 'Receita não encontrada — Tô Cozinhando';
    const main = document.querySelector('main') || document.body;
    main.innerHTML = `
      <div style="min-height:80vh;display:flex;flex-direction:column;align-items:center;
                  justify-content:center;gap:1.5rem;text-align:center;padding:2rem;">
        <div style="font-size:4rem">🐾</div>
        <h1 style="font-family:var(--font-display);font-size:2rem;color:var(--espresso)">
          Receita não encontrada
        </h1>
        <p style="color:var(--taupe);max-width:360px">
          A Jurema farejou bastante mas não achou essa receita.<br>
          Tente buscar outra coisa.
        </p>
        <a href="index.html" class="btn btn-primary">Voltar ao início</a>
        <a href="receitas.html" class="btn-ghost">Ver todas as receitas</a>
      </div>`;
  }

}); // DOMContentLoaded
