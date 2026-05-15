# Tô Cozinhando 🐾

> **Receitas para se orgulhar.**

Site MVP do ecossistema culinário brasileiro Tô Cozinhando.  
Busca inteligente, mascote viva e receitas com alma — sem framework, sem backend.

---

## O que é isso

O Tô Cozinhando não é um blog de receitas.  
É uma **experiência de descoberta culinária** guiada pela Jurema — uma salsichinha preta com bandana terracota que reage ao que você faz, sugere receitas e comemora quando você termina.

A jornada completa:

```
"O que eu faço hoje?"  →  "Já sei. Tô cozinhando."  →  "Ficou bom. Eu que fiz."
```

---

## Tecnologia

Stack intencional e simples:

- **HTML semântico** — sem framework
- **CSS puro** — design tokens com variáveis CSS, mobile-first
- **JavaScript vanilla** — sem dependências
- **JSON local** — banco de receitas em `data/receitas.json`

Preparado para evoluir para CMS (Sanity) + API na Fase 2.

---

## Estrutura

```
tocozinhando/
├── index.html          # Home — busca + Jurema + destaques
├── receita.html        # Receita individual + Modo Cozinha
├── receitas.html       # Listagem com filtros por área
├── sobre.html          # Sobre a marca e a Jurema
├── 404.html            # Página de erro com Jurema
│
├── assets/
│   ├── css/
│   │   └── style.css           # Design system completo (2500+ linhas)
│   └── js/
│       ├── search.js            # Engine de busca com pontuação
│       ├── jurema.js            # Máquina de estados da mascote (8 estados)
│       ├── utils.js             # Utilitários compartilhados
│       ├── app.js               # Home page
│       ├── recipe.js            # Receita individual
│       └── receitas.js          # Listagem + filtros
│
├── data/
│   └── receitas.json            # 20 receitas com metadados completos
│
└── assets/images/
    ├── jurema/                  # PNGs da mascote (adicionar após gerar)
    │   ├── jurema-3-4.png       # idle / hover
    │   ├── jurema-farejando.png # focus / loading
    │   ├── jurema-apontando.png # typing
    │   ├── jurema-orgulhosa.png # success
    │   ├── jurema-observando.png# empty / observando
    │   ├── jurema-comemorando.png # completed
    │   ├── jurema-perfil.png    # sobre.html
    │   └── jurema-cozinhando.png# hero alternativo
    ├── receitas/                # Fotos das receitas (WebP preferido)
    └── brand/                   # Logo, favicon, og-image
```

---

## Como rodar localmente

O site usa `fetch()` para carregar o JSON — precisa de servidor HTTP (não funciona via `file://`).

```bash
# Opção 1 — Node.js
npx serve .

# Opção 2 — Python
python3 -m http.server 8080

# Opção 3 — PHP
php -S localhost:8080
```

Acesse: `http://localhost:8080`

---

## Jurema — estados da mascote

A Jurema opera em 8 estados com transição suave:

| Estado | Gatilho | Frase |
|---|---|---|
| `idle` | Página carregada | "Me conta o que tem aí." |
| `hover` | Mouse sobre a busca | "O que você quer cozinhar?" |
| `focus` | Click na barra de busca | "O que você tem em casa?" |
| `typing` | Usuário digitando | "Estou prestando atenção…" |
| `loading` | Submit da busca | "Tô farejando uma ideia boa." |
| `success` | Resultados encontrados | "Achei! Olha o que encontrei." |
| `empty` | Sem resultados | "Não achei, mas tenho ideias." |
| `completed` | Receita finalizada | "Pronto. Agora pode dizer: eu que fiz." |

**Os PNGs da Jurema precisam ser adicionados** em `assets/images/jurema/`. Enquanto não existem, o fallback CSS (silhueta + bandana) é exibido automaticamente.

---

## Busca inteligente

A engine busca em 10 dimensões com pontuação ponderada:

```
Título (10) · Ingredientes (8) · País/cultura (8)
Tags (6) · Categorias (6) · Subtítulo (5)
Área (4) · Dietary (4) · Descrição (3)
Dificuldade (3) · Jurema quote (2)
```

Suporta linguagem natural: `"tenho frango e arroz"`, `"bolo sem leite"`, `"comida mexicana rápida"`.

---

## Adicionar receitas

Edite `data/receitas.json` seguindo o modelo oficial.  
Todo campo obrigatório está documentado em `docs/AGENTE_FAREJADOR.md`.

Para produção, usar o **Agente Farejador** (ver `docs/`) para gerar JSONs via prompts de IA, sempre com revisão humana antes de publicar.

---

## Páginas e funcionalidades

| Página | URL | O que faz |
|---|---|---|
| Home | `/` ou `index.html` | Busca central, Jurema, destaques, áreas |
| Receita | `receita.html?slug=SLUG` | Ingredientes, preparo, Modo Cozinha |
| Listagem | `receitas.html?area=AREA` | Grid com filtros por área e busca |
| Sobre | `sobre.html` | Jurema, marca, pilares |
| 404 | `404.html` | Página de erro com Jurema observando |

### Modo Cozinha

Na `receita.html`, o botão "📱 Modo Cozinha" abre um overlay fullscreen com:
- Passo a passo em texto grande
- Navegação por botão e swipe
- Teclado: `→` próximo, `←` anterior, `Esc` fechar
- Wake Lock API (mantém tela acesa quando disponível)
- Jurema reage ao progresso e comemora no último passo

---

## Domínios

- [tocozinhando.com](https://tocozinhando.com)
- [tocozinhando.com.br](https://tocozinhando.com.br)
- tocozinhandoreceitas@gmail.com

---

## Próximos passos

- [ ] Adicionar PNGs da Jurema em `assets/images/jurema/`
- [ ] Adicionar fotos das receitas em `assets/images/receitas/`
- [ ] Criar logo SVG em `assets/images/brand/`
- [ ] Configurar domínio e hospedagem (Netlify, Vercel ou GitHub Pages)
- [ ] Produzir mais receitas com o Agente Farejador (ver `docs/`)
- [ ] Integrar newsletter (Mailchimp ou Brevo)
- [ ] Criar perfil no Instagram com a Jurema

---

*Tô Cozinhando — MVP v1.1 — 2025*  
*A IA fareja. O humano aprova. A Jurema apresenta. 🐾*
