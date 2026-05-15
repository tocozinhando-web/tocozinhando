/**
 * search.js — Engine de busca de receitas
 * Tô Cozinhando v1.1 MVP
 *
 * Suporta o campo origin.country (modelo oficial) com retrocompatibilidade
 * para o campo country flat.
 *
 * Pontuação por campo:
 *   título            → 10   (máxima relevância)
 *   ingredientes       →  8   (intenção "tenho X")
 *   país/cultura       →  8   (intenção "comida mexicana")
 *   tags               →  6
 *   categorias         →  6
 *   subtítulo          →  5
 *   área               →  4
 *   dietary            →  4
 *   descrição          →  3
 *   dificuldade        →  3
 *   jurema_quote       →  2
 */

class RecipeSearch {
  constructor() {
    this.recipes = [];
    this.loaded  = false;
    this.loading = false;
  }

  /* --------------------------------------------------------
     PÚBLICO: carrega o JSON de receitas
  -------------------------------------------------------- */
  async load(path = 'data/receitas.json') {
    if (this.loaded || this.loading) return;
    this.loading = true;

    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.recipes = await res.json();
      this.loaded  = true;
    } catch (err) {
      console.warn('[RecipeSearch] Erro ao carregar receitas:', err.message);
      if (window.RECEITAS_DATA) {
        this.recipes = window.RECEITAS_DATA;
        this.loaded  = true;
      }
    } finally {
      this.loading = false;
    }

    return this.loaded;
  }

  /* --------------------------------------------------------
     PÚBLICO: busca por query (texto livre)
     Retorna array de receitas ordenadas por relevância.
  -------------------------------------------------------- */
  search(query) {
    if (!this.loaded || !query?.trim()) return [];

    const terms = this._tokenize(query);
    if (terms.length === 0) return [];

    return this.recipes
      .map(recipe => ({ recipe, score: this._score(recipe, terms) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.recipe);
  }

  /* --------------------------------------------------------
     PÚBLICO: busca por tag ou área específica (quick tags)
  -------------------------------------------------------- */
  searchByTag(tag) {
    if (!this.loaded) return [];
    const t = this._normalize(tag);
    return this.recipes.filter(r =>
      (r.tags || []).some(tag => this._normalize(tag).includes(t)) ||
      this._normalize(r.categories?.primary || '').includes(t) ||
      this._normalize(r.area || '').includes(t) ||
      this._normalize(r.origin?.country || r.country || '').includes(t)
    );
  }

  /* --------------------------------------------------------
     PÚBLICO: retorna receitas de uma área específica
  -------------------------------------------------------- */
  getByArea(area, limit = 99) {
    if (!this.loaded) return [];
    return this.recipes
      .filter(r => r.area === area)
      .slice(0, limit);
  }

  /* --------------------------------------------------------
     PÚBLICO: receitas em destaque (mistura de áreas)
  -------------------------------------------------------- */
  getFeatured(limit = 8) {
    if (!this.loaded) return [];
    const seen = new Set();
    const out  = [];
    // Primeiro: 1 de cada área
    for (const area of ['pra-ja', 'pelo-mundo', 'familia', 'leve', 'mini-chef']) {
      const r = this.recipes.find(r => r.area === area && !seen.has(r.id));
      if (r) { out.push(r); seen.add(r.id); }
    }
    // Completa até o limite
    for (const r of this.recipes) {
      if (out.length >= limit) break;
      if (!seen.has(r.id)) { out.push(r); seen.add(r.id); }
    }
    return out.slice(0, limit);
  }

  /* --------------------------------------------------------
     PÚBLICO: busca por slug (receita individual)
  -------------------------------------------------------- */
  getBySlug(slug) {
    return this.recipes.find(r => r.slug === slug) || null;
  }

  /* --------------------------------------------------------
     PÚBLICO: retorna todas as receitas
  -------------------------------------------------------- */
  getAll() {
    return [...this.recipes];
  }

  /* --------------------------------------------------------
     PÚBLICO: receitas relacionadas por slugs
  -------------------------------------------------------- */
  getRelated(slugs = []) {
    if (!slugs.length) return [];
    return slugs
      .map(s => this.getBySlug(s))
      .filter(Boolean)
      .slice(0, 4);
  }

  /* --------------------------------------------------------
     PRIVADO: tokeniza a query em termos úteis
  -------------------------------------------------------- */
  _tokenize(query) {
    return query
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .split(/[\s,;+]+/)
      .filter(t => t.length > 1)
      .map(t => t.trim());
  }

  /* --------------------------------------------------------
     PRIVADO: calcula pontuação de uma receita para os termos
     Suporta origin.country (novo) e country flat (retrocompat.)
  -------------------------------------------------------- */
  _score(recipe, terms) {
    let score = 0;

    // Resolve país de forma compatível com ambos os schemas
    const country = recipe.origin?.country || recipe.country || '';

    const fields = {
      title:       this._normalize(recipe.title || ''),
      subtitle:    this._normalize(recipe.subtitle || ''),
      description: this._normalize(recipe.description || ''),
      country:     this._normalize(country),
      area:        this._normalize(recipe.area || ''),
      primary:     this._normalize(recipe.categories?.primary || ''),
      secondary:   this._normalize((recipe.categories?.secondary || []).join(' ')),
      tags:        this._normalize((recipe.tags || []).join(' ')),
      ingredients: this._normalize((recipe.ingredients || []).map(i => i.name).join(' ')),
      difficulty:  this._normalize(recipe.difficulty || ''),
      dietary:     this._normalize((recipe.dietary || []).join(' ')),
      jurema:      this._normalize(recipe.jurema_quote || '')
    };

    const weights = {
      title: 10, ingredients: 8, country: 8,
      tags: 6, primary: 6, secondary: 5, subtitle: 5,
      area: 4, dietary: 4, description: 3,
      difficulty: 3, jurema: 2
    };

    for (const term of terms) {
      for (const [field, value] of Object.entries(fields)) {
        if (value.includes(term)) {
          const w = weights[field] || 1;
          const exact = new RegExp(`\\b${term}\\b`).test(value);
          score += exact ? w * 1.5 : w;
        }
      }
    }

    // Bônus: todos os termos presentes em qualquer campo
    const allText = Object.values(fields).join(' ');
    if (terms.length > 1 && terms.every(t => allText.includes(t))) {
      score *= 1.3;
    }

    return Math.round(score * 10) / 10;
  }

  /* --------------------------------------------------------
     PRIVADO: normaliza texto (lowercase + sem acentos)
  -------------------------------------------------------- */
  _normalize(text) {
    return String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}

window.RecipeSearch = RecipeSearch;
