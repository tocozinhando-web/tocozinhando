/**
 * jurema.js — Máquina de estados da mascote Jurema
 * Tô Cozinhando v1.0 MVP
 *
 * Responsabilidade: gerenciar os estados visuais e falas da Jurema.
 * Separado do app.js para manter responsabilidades claras.
 *
 * Estados disponíveis:
 *   idle      → observando, posição padrão
 *   hover     → olha para a busca
 *   focus     → curiosa, barra de busca ativa
 *   typing    → animada enquanto usuário digita
 *   loading   → farejando durante a busca
 *   success   → feliz com resultados encontrados
 *   empty     → pensativa quando não encontra resultado
 *   completed → comemora quando receita é concluída
 */

class Jurema {
  constructor(options = {}) {
    // Elementos do DOM
    this.img       = document.getElementById('jurema-img');
    this.fallback  = document.getElementById('jurema-fallback');
    this.poseTxt   = document.getElementById('jurema-pose');
    this.speechEl  = document.getElementById('jurema-speech-text');

    // Estado atual e controle de cooldown
    this.currentState = 'idle';
    this.lastChange   = 0;
    this.cooldown     = options.cooldown || 350; // ms mínimo entre mudanças
    this.transitionMs = 180;

    // Caminho base dos assets
    this.basePath = options.basePath || 'assets/images/jurema/';

    // Configuração dos estados
    this.states = {
      idle: {
        img:    'jurema-3-4.png',
        pose:   '3/4 sentada',
        speech: 'Me conta o que tem aí. Eu farejo uma boa ideia.'
      },
      hover: {
        img:    'jurema-orgulhosa.png',
        pose:   'orgulhosa',
        speech: 'O que você quer cozinhar hoje?'
      },
      focus: {
        img:    'jurema-farejando.png',
        pose:   'farejando',
        speech: 'O que você tem em casa?'
      },
      typing: {
        img:    'jurema-apontando.png',
        pose:   'apontando',
        speech: 'Estou prestando atenção…'
      },
      loading: {
        img:    'jurema-farejando.png',
        pose:   'farejando',
        speech: 'Tô farejando uma ideia boa.'
      },
      success: {
        img:    'jurema-orgulhosa.png',
        pose:   'orgulhosa',
        speech: 'Achei! Olha o que encontrei.'
      },
      empty: {
        img:    'jurema-observando.png',
        pose:   'observando',
        speech: 'Não achei, mas tenho ideias parecidas.'
      },
      completed: {
        img:    'jurema-comemorando.png',
        pose:   'comemorando',
        speech: 'Pronto. Agora pode dizer: eu que fiz.'
      }
    };

    // Inicializa e configura tratamento de erro de imagem
    this._setupImageFallback();
    this._bindHeroEvents();
  }

  /* --------------------------------------------------------
     PÚBLICO: muda o estado da Jurema
  -------------------------------------------------------- */
  setState(state) {
    const now = Date.now();

    // Respeita cooldown para evitar piscadas excessivas
    if (now - this.lastChange < this.cooldown) return;

    // Não troca se já está no mesmo estado
    if (this.currentState === state) return;

    const config = this.states[state];
    if (!config) {
      console.warn(`[Jurema] Estado desconhecido: "${state}"`);
      return;
    }

    this.currentState = state;
    this.lastChange   = now;

    this._transitionImage(config);
    this._updateSpeech(config.speech);
    this._updatePose(config.pose);

    // Emite evento customizado para outros módulos ouvirem
    document.dispatchEvent(new CustomEvent('jurema:stateChange', {
      detail: { state, config }
    }));
  }

  /* Retorna o estado atual */
  getState() {
    return this.currentState;
  }

  /* --------------------------------------------------------
     PRIVADO: transição suave da imagem
  -------------------------------------------------------- */
  _transitionImage(config) {
    if (!this.img) return;

    // Fade out
    this.img.style.opacity   = '0';
    this.img.style.transform = 'translateY(6px) scale(0.97)';

    setTimeout(() => {
      this.img.src = this.basePath + config.img;

      // Fade in após trocar src
      requestAnimationFrame(() => {
        this.img.style.opacity   = '1';
        this.img.style.transform = 'translateY(0) scale(1)';
      });
    }, this.transitionMs);
  }

  /* --------------------------------------------------------
     PRIVADO: atualiza o balão de fala
  -------------------------------------------------------- */
  _updateSpeech(text) {
    if (!this.speechEl) return;

    this.speechEl.style.opacity = '0';
    setTimeout(() => {
      this.speechEl.textContent = text;
      this.speechEl.style.opacity = '1';
    }, this.transitionMs);
  }

  /* --------------------------------------------------------
     PRIVADO: atualiza texto de pose no fallback
  -------------------------------------------------------- */
  _updatePose(pose) {
    if (this.poseTxt) this.poseTxt.textContent = pose;
  }

  /* --------------------------------------------------------
     PRIVADO: configura fallback visual quando PNG não carrega
  -------------------------------------------------------- */
  _setupImageFallback() {
    if (!this.img) return;

    // Estilo de transição inline para a imagem
    this.img.style.transition = `opacity ${this.transitionMs}ms ease, transform ${this.transitionMs}ms ease`;

    this.img.addEventListener('error', () => {
      this.img.style.display = 'none';
      if (this.fallback) {
        this.fallback.style.display = 'flex';
      }
    });

    this.img.addEventListener('load', () => {
      this.img.style.display = 'block';
      if (this.fallback) {
        this.fallback.style.display = 'none';
      }
    });
  }

  /* --------------------------------------------------------
     PRIVADO: vincula estados ao hover sobre a barra de busca
     (events de search são vinculados pelo app.js)
  -------------------------------------------------------- */
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

// Expõe globalmente
window.Jurema = Jurema;
