/**
 * jurema.js — Máquina de estados da mascote Jurema
 * Tô Cozinhando v1.2 MVP
 *
 * Estados:
 *   idle      → cicla pelos 8 frames idle_sentada_01..08.png (flipbook)
 *   hover     → olha para a busca
 *   focus     → curiosa, barra de busca ativa
 *   typing    → animada enquanto o usuário digita
 *   loading   → farejando durante a busca
 *   success   → feliz com os resultados
 *   empty     → pensativa, sem resultados
 *   completed → comemora quando a receita é finalizada
 *
 * Nomes dos arquivos idle (exatamente como estão na pasta):
 *   idle_sentada_01.png … idle_sentada_08.png
 */

class Jurema {
  constructor(options = {}) {
    // Elementos do DOM
    this.img      = document.getElementById('jurema-img');
    this.fallback = document.getElementById('jurema-fallback');
    this.poseTxt  = document.getElementById('jurema-pose');
    this.speechEl = document.getElementById('jurema-speech-text');

    // Controle de estado
    this.currentState = 'idle';
    this.lastChange   = 0;
    this.cooldown     = options.cooldown || 350;
    this.transitionMs = 150;

    // Caminho base
    this.basePath = options.basePath || 'assets/images/jurema/';

    // ── FLIPBOOK IDLE ──────────────────────────────────────────
    // Frames exatamente com os nomes que estão na pasta
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
    this.idleFrame    = 0;   // frame atual
    this.idleTimer    = null; // setInterval do flipbook
    this.idleInterval = options.idleInterval || 120; // ms por frame (~8fps)
    // ────────────────────────────────────────────────────────────

    // Configuração dos outros estados
    // (quando você tiver as poses específicas, troque os nomes aqui)
    this.states = {
      idle: {
        pose:   'sentada',
        speech: 'Me conta o que tem aí. Eu farejo uma boa ideia.'
      },
      hover: {
        img:    'idle_sentada_01.png', // substitua por jurema-orgulhosa.png quando tiver
        pose:   'atenta',
        speech: 'O que você quer cozinhar hoje?'
      },
      focus: {
        img:    'idle_sentada_01.png', // substitua por jurema-farejando.png quando tiver
        pose:   'curiosa',
        speech: 'O que você tem em casa?'
      },
      typing: {
        img:    'idle_sentada_01.png', // substitua por jurema-apontando.png quando tiver
        pose:   'animada',
        speech: 'Estou prestando atenção…'
      },
      loading: {
        img:    'idle_sentada_01.png', // substitua por jurema-farejando.png quando tiver
        pose:   'farejando',
        speech: 'Tô farejando uma ideia boa.'
      },
      success: {
        img:    'idle_sentada_01.png', // substitua por jurema-orgulhosa.png quando tiver
        pose:   'orgulhosa',
        speech: 'Achei! Olha o que encontrei.'
      },
      empty: {
        img:    'idle_sentada_01.png', // substitua por jurema-observando.png quando tiver
        pose:   'pensativa',
        speech: 'Não achei, mas tenho ideias parecidas.'
      },
      completed: {
        img:    'idle_sentada_01.png', // substitua por jurema-comemorando.png quando tiver
        pose:   'comemorando',
        speech: 'Pronto. Agora pode dizer: eu que fiz.'
      }
    };

    this._setupImageFallback();
    this._bindHeroEvents();

    // Inicia o flipbook idle imediatamente
    this._startIdleLoop();
  }

  /* ============================================================
     PÚBLICO: muda o estado da Jurema
  ============================================================ */
  setState(state) {
    const now = Date.now();
    if (now - this.lastChange < this.cooldown) return;
    if (this.currentState === state) return;

    const config = this.states[state];
    if (!config) {
      console.warn(`[Jurema] Estado desconhecido: "${state}"`);
      return;
    }

    this.currentState = state;
    this.lastChange   = now;

    if (state === 'idle') {
      // Volta para o flipbook
      this._startIdleLoop();
    } else {
      // Para o flipbook e exibe a imagem fixa do estado
      this._stopIdleLoop();
      this._transitionImage(config.img);
    }

    this._updateSpeech(config.speech);
    this._updatePose(config.pose);

    document.dispatchEvent(new CustomEvent('jurema:stateChange', {
      detail: { state, config }
    }));
  }

  getState() {
    return this.currentState;
  }

  /* ============================================================
     PRIVADO: flipbook idle
  ============================================================ */
  _startIdleLoop() {
    this._stopIdleLoop(); // garante que não há loop duplo

    // Mostra o primeiro frame imediatamente (sem fade para não piscar)
    if (this.img) {
      this.img.src = this.basePath + this.idleFrames[this.idleFrame];
    }

    this.idleTimer = setInterval(() => {
      this.idleFrame = (this.idleFrame + 1) % this.idleFrames.length;
      if (this.img) {
        // Troca direta de src sem fade — cria fluidez de animação
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
     PRIVADO: transição suave para estados não-idle
  ============================================================ */
  _transitionImage(imgFile) {
    if (!this.img || !imgFile) return;

    this.img.style.opacity   = '0';
    this.img.style.transform = 'translateY(6px) scale(0.97)';

    setTimeout(() => {
      this.img.src = this.basePath + imgFile;
      requestAnimationFrame(() => {
        this.img.style.opacity   = '1';
        this.img.style.transform = 'translateY(0) scale(1)';
      });
    }, this.transitionMs);
  }

  /* ============================================================
     PRIVADO: balão de fala
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
     PRIVADO: fallback CSS quando PNG não carrega
  ============================================================ */
  _setupImageFallback() {
    if (!this.img) return;

    this.img.style.transition = `opacity ${this.transitionMs}ms ease, transform ${this.transitionMs}ms ease`;

    this.img.addEventListener('error', () => {
      // Para o loop se a imagem não existir
      this._stopIdleLoop();
      this.img.style.display = 'none';
      if (this.fallback) this.fallback.style.display = 'flex';
    });

    this.img.addEventListener('load', () => {
      this.img.style.display = 'block';
      if (this.fallback) this.fallback.style.display = 'none';
    });
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
