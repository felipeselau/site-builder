Architecture Overview — Site Builder com LumeCMS + Liquid

🎯 Objetivo

Construir um site builder block-based com geração de HTML estático, preview em tempo real, temas reutilizáveis e evolução natural para SaaS multi-tenant.

⸻

🏗️ Visão Macro

Builder UI (SolidJS)
        ↓
JSON Block Schema
        ↓
LumeCMS (storage + edição)
        ↓
Liquid Templates
        ↓
Lume Static Generation
        ↓
Deploy (Cloudflare/Vercel)

A arquitetura é schema-first:

O editor manipula JSON estruturado, nunca HTML diretamente.

Isso garante:
	•	alta reutilização
	•	multi-theme
	•	SEO
	•	preview rápido
	•	versionamento
	•	facilidade para IA gerar páginas

⸻

📁 Estrutura de Pastas

site-builder/
 ├── site/
 │   ├── _config.ts
 │   ├── _cms.ts
 │   ├── content/
 │   │   └── pages/
 │   ├── _includes/
 │   │   ├── layouts/
 │   │   ├── sections/
 │   │   └── snippets/
 │   ├── _data/
 │   └── assets/
 │
 ├── builder-admin/
 │   └── src/
 │       ├── components/
 │       ├── stores/
 │       └── pages/
 │
 ├── shared/
 │   ├── block-registry.ts
 │   └── theme-schema.ts
 │
 └── themes/
     └── default/


⸻

🧱 Core Concepts

1) Block Registry

Fonte única de verdade para todos os blocos.

Responsável por:
	•	definir fields
	•	labels
	•	defaults
	•	validações
	•	compatibilidade com temas

Exemplo:

export const blockRegistry = {
  hero: {
    label: "Hero",
    fields: [
      { key: "title", type: "text" },
      { key: "subtitle", type: "textarea" },
      { key: "ctaText", type: "text" },
    ],
  },
};


⸻

2) Page Schema

Cada página é um JSON serializável.

{
  "url": "/",
  "seo": {
    "title": "Minha Landing"
  },
  "sections": [
    {
      "type": "hero",
      "props": {
        "title": "Build faster"
      }
    }
  ]
}


⸻

3) Liquid Rendering

Cada bloco é renderizado por um template Liquid.

{% for section in sections %}
  {% include "sections/" + section.type + ".liquid" section=section %}
{% endfor %}


⸻

🧠 Camadas do Sistema

A) Render Engine (site/)

Responsável por:
	•	geração estática
	•	layouts
	•	includes
	•	SEO
	•	assets
	•	páginas finais

Tecnologias:
	•	Lume
	•	Liquid
	•	TypeScript
	•	Deno

⸻

B) CMS Layer (_cms.ts)

Responsável por:
	•	edição de páginas
	•	collections
	•	media
	•	preview live
	•	persistência inicial em arquivos

Evolução futura:
	•	GitHub-backed storage
	•	Deno KV drafts
	•	Supabase

⸻

C) Builder Admin (builder-admin/)

Editor visual semelhante a Shopify Sections.

Módulos
	•	Sidebar → lista de blocos
	•	Canvas → iframe preview
	•	Inspector → props do bloco
	•	Layers → árvore da página
	•	Theme panel → tokens visuais

Stack sugerida:
	•	SolidJS
	•	TanStack Query
	•	Zustand/MobX-like store
	•	dnd-kit

⸻

🎨 Sistema de Temas

Separar tema do core.

themes/
 └── default/
     ├── sections/
     ├── tokens.json
     └── theme.schema.ts

Cada tema define:
	•	sections suportadas
	•	design tokens
	•	tipografia
	•	cores
	•	spacing
	•	radius

Isso permite white-label e SaaS.

⸻

👀 Preview Architecture

Fluxo:

Inspector update
   ↓
Atualiza JSON local
   ↓
Salva draft
   ↓
Rebuild Lume
   ↓
Reload iframe

Preview pode ter 2 modos:

Draft local
	•	rápido
	•	autosave
	•	não publica

Published
	•	build final
	•	CDN
	•	domínio customizado

⸻

🚀 Pipeline de Publicação

Draft JSON
   ↓
Validation
   ↓
Theme binding
   ↓
Lume build
   ↓
Deploy adapter
   ↓
CDN/custom domain

Adaptadores:
	•	Cloudflare Pages
	•	Vercel
	•	Netlify
	•	S3 + CDN

⸻

🤖 Camada de IA (Futuro)

A IA deve gerar JSON blocks, nunca HTML.

Prompt
 ↓
AI Layout Planner
 ↓
JSON block tree
 ↓
Preview
 ↓
Publish

Possibilidades:
	•	landing pages automáticas
	•	geração de copy
	•	escolha de tema
	•	A/B sections
	•	SEO meta generation

⸻

📈 Roadmap de MVPs

MVP 1 — Engine
	•	5 blocos
	•	single page
	•	preview
	•	CMS
	•	1 tema

MVP 2 — Visual Builder
	•	drag and drop
	•	reorder
	•	duplicate
	•	multi-page

MVP 3 — SaaS
	•	multi-tenant
	•	auth
	•	billing
	•	domains
	•	templates marketplace

MVP 4 — AI Native
	•	prompt → página
	•	theme suggestion
	•	automated sections

⸻

🔥 Architectural Principles
	1.	Schema-first
	2.	Theme isolation
	3.	Static-first rendering
	4.	Composable sections
	5.	AI-ready JSON DSL
	6.	Storage abstraction

⸻

✅ Resumo Executivo

A arquitetura proposta maximiza:
	•	performance
	•	DX
	•	escalabilidade
	•	capacidade SaaS
	•	integração futura com IA

O maior diferencial é o pipeline:

Builder UI → JSON DSL → Liquid → Static HTML

Esse design reduz complexidade do editor, facilita preview e prepara o produto para evolução em direção a um Webflow/Shopify-like builder AI-native.
