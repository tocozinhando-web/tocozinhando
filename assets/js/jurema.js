/**
 * jurema.js — Mascote Jurema v1.6
 * Tô Cozinhando MVP
 *
 * Usa flood fill BFS a partir das bordas para remover o fundo preto
 * sem afetar o pelo escuro da Jurema (que não está conectado às bordas).
 */

class Jurema {
  constructor() {
    this.img      = document.getElementById('jurema-img');
    this.fallback = document.getElementById('jurema-fallback');
    this.speechEl = document.getElementById('jurema-speech-text');
    this.currentState = 'idle';
    this.imgPath = 'assets/imagens/jurema/IMG_6910.PNG';

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

  _carregar() {
    if (!this.img) return;
    this.img.style.display = 'none';
    if (this.fallback) this.fallback.style.display = 'none';

    const loader = new Image();
    loader.onload = () => {
      const limpa = this._floodFill(loader, 8);
      this.img.src = limpa || this.imgPath;
      this.img.style.display = 'block';
      if (this.fallback) this.fallback.style.display = 'none';
    };
    loader.onerror = () => {
      if (this.fallback) this.fallback.style.display = 'flex';
    };
    loader.src = this.imgPath;
  }

  /* ── FLOOD FILL BFS ─────────────────────────────────────────
     Começa pelas 4 bordas da imagem e remove apenas pixels
     CONECTADOS à borda que sejam escuros (fundo preto).
     O pelo escuro da Jurema, por estar isolado no interior,
     nunca é tocado.
  ──────────────────────────────────────────────────────────── */
  _floodFill(imgEl, threshold = 8) {
    try {
      const W = imgEl.naturalWidth, H = imgEl.naturalHeight;
      if (!W || !H) return null;

      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0);

      const id  = ctx.getImageData(0, 0, W, H);
      const px  = id.data;
      const vis = new Uint8Array(W * H);
      const q   = new Int32Array(W * H);
      let head = 0, tail = 0;

      const dark = (i4) =>
        px[i4] < threshold && px[i4+1] < threshold && px[i4+2] < threshold;

      const push = (x, y) => {
        const i = y * W + x;
        if (vis[i]) return;
        if (!dark(i * 4)) return;
        vis[i] = 1;
        q[tail++] = i;
      };

      /* Semeia as bordas */
      for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
      for (let y = 1; y < H - 1; y++) { push(0, y); push(W - 1, y); }

      /* BFS */
      while (head < tail) {
        const i = q[head++];
        px[i * 4 + 3] = 0; // transparente
        const x = i % W, y = (i / W) | 0;
        if (x > 0)   push(x - 1, y);
        if (x < W-1) push(x + 1, y);
        if (y > 0)   push(x, y - 1);
        if (y < H-1) push(x, y + 1);
      }

      ctx.putImageData(id, 0, 0);
      return canvas.toDataURL('image/png');
    } catch (e) {
      console.warn('[Jurema] Canvas flood fill falhou:', e.message);
      return null;
    }
  }

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
