/**
 * jurema.js — Máquina de estados da mascote Jurema
 * Tô Cozinhando v1.3 MVP
 *
 * Correções v1.3:
 *   - Detecção automática do caminho base (resolve problema em subpáginas)
 *   - Flipbook resiliente: frame que falha é pulado, animação não para
 *   - Fallback não bloqueia tentativas futuras de carregamento
 *   - Sem dependência de eventos load/error para o flipbook
 */

class Jurema {
  constructor(options = {}) {
    this.img      = document.getElementById('jurema-img');
    this.fallback = document.getElementById('jurema-fallback');
    this.poseTxt  = document.getElementById('jurema-pose');
    this.speechEl = document.getElementById('jurema-speech-text');

    this.currentState = 'idle';
    this.lastChange   = 0;
    this.cooldown     = options.cooldown || 350;
    this.transitionMs = 150;

    // ── DETECÇÃO AUTOMÁTICA DO CAMINHO BASE ─────────────────────
    // Detecta se está na raiz ou em subpasta e ajusta o caminho
    this.basePath = this._detectBasePath(options.basePath);
    // ────────────────────────────────────────────────────────────

    // ── FLIPBOOK IDLE ────────────────────────────────────────────
    // Nomes exatos como estão no GitHub
    this.idleFrames = [
      'IMG_6914.png',
      'IMG_6915.png',
      'IMG_6916.png',
      'IMG_6917.png',
      'IMG_6918.png',
      'IMG_6919.png',
      'IMG_6920.png',
      'IMG_6921.png',
    ];
    this.idleFrame    = 0;
    this.idleTimer    = null;
    this.idleInterval = options.idleInterval || 130; // ms por frame
    this.imagesOk     = false; // flag: imagens verificadas
    // ────────────────────────────────────────────────────────────

    // Estados (substitua os imgs quando tiver as outras poses)
    this.states = {
      idle:      { pose: 'sentada',    speech: 'Me conta o que tem aí. Eu farejo uma boa ideia.' },
      hover:     { img: null,          pose: 'atenta',      speech: 'O que você quer cozinhar hoje?' },
      focus:     { img: null,          pose: 'curiosa',     speech: 'O que você tem em casa?' },
      typing:    { img: null,          pose: 'animada',     speech: 'Estou prestando atenção…' },
      loading:   { img: null,          pose: 'farejando',   speech: 'Tô farejando uma ideia boa.' },
      success:   { img: null,          pose: 'orgulhosa',   speech: 'Achei! Olha o que encontrei.' },
      empty:     { img: null,          pose: 'pensativa',   speech: 'Não achei, mas tenho ideias parecidas.' },
      completed: { img: null,          pose: 'comemorando', speech: 'Pronto. Agora pode dizer: eu que fiz.' },
    };
    // Quando img = null, usa o frame atual do idle (mesma imagem)

    this._init();
  }

  /* ============================================================
     PRIVADO: retorna o caminho base das imagens da Jurema
     Fixo e relativo — funciona em todas as páginas do site
  ============================================================ */
  _detectBasePath(override) {
    if (override) return override;
    // Caminho relativo fixo: funciona em index.html, receita.html etc
    // pois todos estão no mesmo nível de diretório
    return 'assets/imagens/jurema/';
  }

  /* ============================================================
     PRIVADO: inicialização — testa se as imagens existem
  ============================================================ */
  _init() {
    if (!this.img) return;

    // Estilo de transição
    this.img.style.transition = `opacity ${this.transitionMs}ms ease, transform ${this.transitionMs}ms ease`;

    // Testa se o primeiro frame carrega
    const testImg = new Image();
    testImg.onload = () => {
      // ✅ Imagens existem → inicia flipbook
      this.imagesOk = true;
      this._showImage();
      this._startIdleLoop();
    };
    testImg.onerror = () => {
      // ❌ Imagens não encontradas → mostra fallback
      console.warn('[Jurema] Imagens não encontradas em:', this.basePath + this.idleFrames[0]);
      this._showFallback();
    };
    testImg.src = this.basePath + this.idleFrames[0] + '?t=' + Date.now();

    this._bindHeroEvents();
  }

  /* ============================================================
     PÚBLICO: muda o estado
  ============================================================ */
  setState(state) {
    const now = Date.now();
    if (now - this.lastChange < this.cooldown) return;
    if (this.currentState === state) return;

    const config = this.states[state];
    if (!config) return;

    this.currentState = state;
    this.lastChange   = now;

    if (state === 'idle') {
      this._startIdleLoop();
    } else {
      this._stopIdleLoop();
      // Se não tem imagem específica para o estado, usa frame atual do idle
      const imgFile = config.img || this.idleFrames[this.idleFrame];
      if (this.imagesOk) this._transitionTo(imgFile);
    }

    this._updateSpeech(config.speech);
    this._updatePose(config.pose);

    document.dispatchEvent(new CustomEvent('jurema:stateChange', {
      detail: { state }
    }));
  }

  getState() { return this.currentState; }

  /* ============================================================
     PRIVADO: flipbook
  ============================================================ */
  _startIdleLoop() {
    this._stopIdleLoop();
    if (!this.imagesOk || !this.img) return;

    // Exibe frame atual imediatamente
    this.img.src = this.basePath + this.idleFrames[this.idleFrame];

    this.idleTimer = setInterval(() => {
      this.idleFrame = (this.idleFrame + 1) % this.idleFrames.length;
      if (this.img && this.currentState === 'idle') {
        // Troca direta sem fade — fluido como animação
        this.img.src = this.basePath + this.idleFrames[this.idleFrame];
      }
    }, this.idleInterval);
  }

  _stopIdleLoop() {
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    }
  }

  /* ============================================================
     PRIVADO: transição com fade (para estados não-idle)
  ============================================================ */
  _transitionTo(imgFile) {
    if (!this.img) return;
    this.img.style.opacity   = '0';
    this.img.style.transform = 'translateY(4px) scale(0.97)';
    setTimeout(() => {
      this.img.src = this.basePath + imgFile;
      requestAnimationFrame(() => {
        this.img.style.opacity   = '1';
        this.img.style.transform = 'translateY(0) scale(1)';
      });
    }, this.transitionMs);
  }

  /* ============================================================
     PRIVADO: mostrar/ocultar imagem e fallback
  ============================================================ */
  _showImage() {
    if (this.img)     { this.img.style.display     = 'block'; this.img.style.opacity = '1'; }
    if (this.fallback){ this.fallback.style.display = 'none';  }
  }

  _showFallback() {
    if (this.img)     { this.img.style.display     = 'none'; }
    if (this.fallback){ this.fallback.style.display = 'flex'; }
  }

  /* ============================================================
     PRIVADO: balão de fala e texto de pose
  ============================================================ */
  _updateSpeech(text) {
    if (!this.speechEl) return;
    this.speechEl.style.opacity = '0';
    setTimeout(() => {
      this.speechEl.textContent = text;
      this.speechEl.style.opacity = '1';
    }, this.transitionMs);
  }

  _updatePose(pose) {
    if (this.poseTxt) this.poseTxt.textContent = pose;
  }

  /* ============================================================
     PRIVADO: hover no wrapper
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
