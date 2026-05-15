# README — Agente Farejador
## Tô Cozinhando — Documento Oficial do Agente de IA Editorial

---

> **"A IA fareja. O humano aprova. A Jurema apresenta."**

---

## O que é o Agente Farejador?

O Agente Farejador é o sistema de inteligência artificial editorial do **Tô Cozinhando** — o ecossistema digital culinário brasileiro com o slogan *"Receitas para se orgulhar."*

Ele opera nos bastidores: invisível para o usuário final, mas essencial para o editor. Sua função é pesquisar ideias de receitas, estruturar rascunhos completos em JSON, preencher metadados e tags, sugerir textos editoriais, otimizar SEO e autoavaliar a qualidade antes de entregar ao editor humano.

**O Agente Farejador nunca publica sozinho. Toda receita passa por revisão humana.**

---

## Como usar o arquivo AGENTE_FAREJADOR.md

O documento é um manual operacional completo. Ele contém:

| Seção | Para usar quando... |
|---|---|
| Seção 7 — Modo MVP | Quiser entender como usar o agente agora, hoje |
| Seção 8 — Prompts Operacionais | Quiser copiar um prompt e operar o agente |
| Seção 9 — Checklist de Revisão | For revisar uma receita antes de publicar |
| Seção 12 — Tom de Voz | Tiver dúvida sobre como escrever um texto |
| Seção 14 — Modelo JSON | For validar a estrutura de uma receita gerada |
| Seção 15 — Jurema | Quiser entender a relação agente ↔ mascote |

---

## Fluxo MVP (Como usar agora)

O Agente Farejador é operado manualmente nesta fase:

```
1. Editor pede ideias           → Prompt 01 (FAREJAR)
2. Editor escolhe uma ideia     → Decisão humana
3. Agente gera a receita        → Prompt 02 (ESTRUTURAR)
                                   + Prompt 03 (ESCREVER)
                                   + Prompt 04 (OTIMIZAR SEO)
                                   ou Prompt 07 (GERAR JSON FINAL)
4. Agente autoavalia            → Prompt 06 (AUTOAVALIAR)
5. Humano revisa                → Checklist da Seção 9
6. Receita entra no receitas.json → Ação humana manual
7. Nada é publicado sozinho     → Regra inegociável
```

**Ferramentas:** Claude.ai, ChatGPT ou Gemini para os prompts. VS Code para editar o JSON. Planilha para controlar o status das receitas.

---

## Os três papéis do ecossistema

| Papel | Quem | O que faz |
|---|---|---|
| **Agente Farejador** | IA editorial | Pesquisa, estrutura, sugere, autoavalia — nos bastidores |
| **Editor humano** | Equipe | Revisa, corrige, aprova — a etapa que não pode ser pulada |
| **Jurema** | Mascote pública | Apresenta as receitas aprovadas de forma afetiva ao usuário |

---

## Regra principal

> **A IA fareja. O humano aprova. A Jurema apresenta.**

Essa frase define tudo:

- O agente pesquisa e estrutura, mas não decide o que vai ao ar.
- O editor humano é a última barreira antes da publicação.
- A Jurema é a face pública — ela nunca representa o agente, ela representa a marca.

---

## Arquivos neste pacote

| Arquivo | Descrição |
|---|---|
| `AGENTE_FAREJADOR.md` | Manual operacional completo (18 seções + 2 apêndices) |
| `README_AGENTE_FAREJADOR.md` | Este arquivo — guia de uso rápido |

---

## Sobre o Tô Cozinhando

- **Site:** tocozinhando.com.br
- **Slogan:** Receitas para se orgulhar.
- **Mascote:** Jurema — cadelinha salsichinha preta com bandana terracota
- **E-mail:** tocozinhandoreceitas@gmail.com
- **Versão do documento:** 1.1 — 2025

---

*Jurema aprova. 🐾*
