/**
 * jurema.js — Mascote Jurema (imagem estática)
 * Tô Cozinhando v1.5 MVP
 *
 * Carrega IMG_6910.PNG e remove o fundo preto via Canvas.
 * Sem crossOrigin — funciona corretamente no GitHub Pages (same-origin).
 * Sem animação por enquanto.
 */

class Jurema {
  constructor() {
    this.img      = document.getElementById('jurema-img');
    this.fallback = document.getElementById('jurema-fallback');
    this.speechEl = document.getElementById('jurema-speech-text');
    this.bubble   = document.querySelector('.hero-v2__bubble');

    this.currentState = 'idle';
    this.imgPath      = 'assets/imagens/jurema/IMG_6910.PNG';

    this.falas = {
      idle:      'Me conta o que tem aí. Eu farejo uma boa ideia.',
      hover:     'O que você quer cozinhar hoje?',
      focus:     'O que você tem em casa?',
      typing:    'Estou prestando atenção…',
      loading:   'Tô farejando uma ideia boa.',
      success:   'Achei! Olha o que encontrei.',
      empty:     'Não achei, mas tenho ideias parecidas.',
      completed: 'Pronto. Agora pode dizer: eu que fiz.',
    };

    this._carregar();
  }

  /* ============================================================
     Carrega a imagem e tenta remover o fundo preto via Canvas
  ============================================================ */
  _carregar() {
    if (!this.img) return;

    // Esconde tudo até carregar
    this.img.style.display = 'none';
    if (this.fallback) this.fallback.style.display = 'none';
    if (this.bubble)   this.bubble.style.display   = 'none';

    const loader = new Image();
    // SEM crossOrigin — imagens do mesmo domínio não precisam

    loader.onload = () => {
      // Tenta remover fundo preto via Canvas
      const limpa = this._removerFundoPreto(loader, 35);

      if (limpa) {
        this.img.src = limpa;
      } else {
        // Canvas falhou — usa imagem direta (pode ter fundo preto visível)
        this.img.src = this.imgPath;
      }

      this.img.style.display = 'block';
      if (this.fallback) this.fallback.style.display = 'none';
      if (this.bubble)   this.bubble.style.display   = 'block';
    };

    loader.onerror = () => {
      // Imagem não encontrada no servidor
      console.warn('[Jurema] Arquivo não encontrado:', this.imgPath);
      console.warn('[Jurema] Faça o upload de IMG_6910.PNG em assets/imagens/jurema/');
      // Mostra fallback CSS
      if (this.fallback) this.fallback.style.display = 'flex';
      if (this.bubble)   this.bubble.style.display   = 'block';
    };

    loader.src = this.imgPath;
  }

  /* ============================================================
     Remove pixels pretos (ou próximos de preto) deixando transparentes
     threshold: 0–255 (35 é um bom valor para fundos puros)
  ============================================================ */
  _removerFundoPreto(imgEl, threshold) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width  = imgEl.naturalWidth;
      canvas.height = imgEl.naturalHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0);

      // getImageData lança SecurityError se tainted (cross-origin)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const px = imageData.data;

      for (let i = 0; i < px.length; i += 4) {
        if (px[i] < threshold && px[i+1] < threshold && px[i+2] < threshold) {
          px[i+3] = 0; // transparente
        }
      }

      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL('image/png');

    } catch (e) {
      // Canvas tainted ou não suportado
      return null;
    }
  }

  /* ============================================================
     Muda o estado (só atualiza a fala — sem trocar imagem por ora)
  ============================================================ */
  setState(state) {
    if (this.currentState === state) return;
    this.currentState = state;

    const fala = this.falas[state] || this.falas.idle;
    if (this.speechEl) {
      this.speechEl.style.opacity = '0';
      setTimeout(() => {
        this.speechEl.textContent = fala;
        this.speechEl.style.opacity = '1';
      }, 150);
    }

    document.dispatchEvent(new CustomEvent('jurema:stateChange', { detail: { state } }));
  }

  getState() { return this.currentState; }
}

window.Jurema = Jurema;
