/**
 * jurema.js — Mascote Jurema (estática + remoção de fundo preto)
 * Tô Cozinhando v1.4 MVP
 *
 * Sem animação por enquanto — usa IMG_6910.PNG como imagem fixa.
 * Remove o fundo preto automaticamente via Canvas API,
 * permitindo que a Jurema apareça limpa sobre qualquer fundo.
 *
 * Quando novas poses chegarem:
 *   → substitua o valor de this.staticImg
 *   → reative o flipbook comentado no final do arquivo
 */

class Jurema {
  constructor(options = {}) {
    this.img      = document.getElementById('jurema-img');
    this.fallback = document.getElementById('jurema-fallback');
    this.poseTxt  = document.getElementById('jurema-pose');
    this.speechEl = document.getElementById('jurema-speech-text');

    this.currentState = 'idle';
    this.basePath     = 'assets/imagens/jurema/';

    // ── IMAGEM ESTÁTICA ATUAL ────────────────────────────────────
    // Quando tiver as outras poses, troque este nome e reative o flipbook
    this.staticImg = 'IMG_6910.PNG';
    // ────────────────────────────────────────────────────────────

    // Falas por estado (para quando o usuário interagir com a busca)
    this.speeches = {
      idle:      'Me conta o que tem aí. Eu farejo uma boa ideia.',
      hover:     'O que você quer cozinhar hoje?',
      focus:     'O que você tem em casa?',
      typing:    'Estou prestando atenção…',
      loading:   'Tô farejando uma ideia boa.',
      success:   'Achei! Olha o que encontrei.',
      empty:     'Não achei, mas tenho ideias parecidas.',
      completed: 'Pronto. Agora pode dizer: eu que fiz.',
    };

    this._init();
    this._bindHeroEvents();
  }

  /* ============================================================
     PRIVADO: inicializa — carrega imagem e remove fundo preto
  ============================================================ */
  _init() {
    if (!this.img) return;

    const src = this.basePath + this.staticImg;

    // Cria imagem auxiliar para processar via Canvas
    const loader = new Image();
    loader.crossOrigin = 'anonymous';

    loader.onload = () => {
      // Remove o fundo preto via Canvas e substitui o src
      const cleanSrc = this._removeBlackBackground(loader, 40);
      if (cleanSrc) {
        this.img.src = cleanSrc;
        this.img.style.display = 'block';
        if (this.fallback) this.fallback.style.display = 'none';
      } else {
        // Canvas falhou — usa imagem original mesmo
        this.img.src = src;
        this.img.style.display = 'block';
        if (this.fallback) this.fallback.style.display = 'none';
      }
    };

    loader.onerror = () => {
      // Imagem não encontrada — mostra fallback CSS
      console.warn('[Jurema] Imagem não encontrada:', src);
      if (this.img)     this.img.style.display     = 'none';
      if (this.fallback) this.fallback.style.display = 'flex';
    };

    loader.src = src + '?v=' + Date.now(); // evita cache de versão anterior
  }

  /* ============================================================
     PRIVADO: remove fundo preto via Canvas
     threshold: 0-255, pixels com R,G,B abaixo disso viram transparentes
  ============================================================ */
  _removeBlackBackground(imgEl, threshold = 40) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width  = imgEl.naturalWidth;
      canvas.height = imgEl.naturalHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Pixel é fundo preto se todos os canais estão abaixo do threshold
        if (r < threshold && g < threshold && b < threshold) {
          data[i + 3] = 0; // transparente
        }
      }

      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL('image/png');

    } catch (e) {
      // CORS ou outro erro — retorna null para usar imagem original
      console.warn('[Jurema] Canvas falhou:', e.message);
      return null;
    }
  }

  /* ============================================================
     PÚBLICO: muda estado (fala + texto de pose)
     Sem troca de imagem por enquanto — só muda o balão
  ============================================================ */
  setState(state) {
    if (this.currentState === state) return;
    this.currentState = state;

    const fala = this.speeches[state] || this.speeches.idle;
    this._updateSpeech(fala);

    document.dispatchEvent(new CustomEvent('jurema:stateChange', {
      detail: { state }
    }));
  }

  getState() { return this.currentState; }

  /* ============================================================
     PRIVADO: atualiza balão de fala com fade suave
  ============================================================ */
  _updateSpeech(text) {
    if (!this.speechEl) return;
    this.speechEl.style.opacity = '0';
    setTimeout(() => {
      this.speechEl.textContent = text;
      this.speechEl.style.opacity = '1';
    }, 150);
  }

  /* ============================================================
     PRIVADO: hover no wrapper do hero
  ============================================================ */
  _bindHeroEvents() {
    const wrapper = document.getElementById('jurema-wrapper');
    if (!wrapper) return;
    wrapper.addEventListener('mouseenter', () => {
      if (this.currentState === 'idle') this.setState('hover');
    });
    wrapper.addEventListener('mouseleave', () => {
      if (this.currentState === 'hover') this.setState('idle');
    });
  }
}

window.Jurema = Jurema;

/* ================================================================
   FLIPBOOK — desativado por enquanto
   Para reativar quando tiver as poses todas:

   1. Substitua this.staticImg por um array de frames
   2. Descomente o bloco abaixo
   3. Chame this._startIdleLoop() no final de _init()
   ================================================================

  _startIdleLoop() {
    this.idleTimer = setInterval(() => {
      this.idleFrame = (this.idleFrame + 1) % this.idleFrames.length;
      if (this.img && this.currentState === 'idle') {
        this.img.src = this.basePath + this.idleFrames[this.idleFrame];
      }
    }, 250);
  }

  _stopIdleLoop() {
    if (this.idleTimer) { clearInterval(this.idleTimer); this.idleTimer = null; }
  }
*/
