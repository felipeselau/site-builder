# Site Builder - Shopify Theme Editor Implementation Plan

## Current State

The project has:
- **Lume + Liquid** static site with 5 block templates (hero, content, features, image-text, cta)
- **SolidJS Builder Admin** with BlockPicker, LayersPanel, Inspector, Canvas
- **CMS Server** (Deno) with basic `/api/pages` GET/POST endpoints
- **start.sh** script to run both servers

## Problem Analysis

The current implementation differs from Shopify Theme Editor in these ways:

| Aspect | Current | Shopify Theme Editor |
|--------|---------|---------------------|
| Preview | Placeholder only | Live iframe with actual site |
| API | `/api/pages` only | `/api/save`, `/api/pages/:slug`, etc |
| Auto-rebuild | None | Rebuild on save, refresh preview |
| Block rendering | Hardcoded case statements | Dynamic includes |
| Data sync | Not connected | Builder loads from CMS on init |

## Implementation Plan

### Phase 1: Fix CMS Server API (Priority: Critical)

**Goal:** Match the API endpoints used by the builder store

**Changes to `site/_cms_server.ts`:**

```
Current endpoints:
- GET  /api/pages          → returns page data
- POST /api/pages          → saves page data

Required endpoints:
- GET  /api/pages         → returns page data (keep)
- POST /api/pages         → saves page data (keep)  
- GET  /api/pages/:slug   → returns specific page (alias for /api/pages)
- POST /api/save          → saves page data (alias for POST /api/pages)
- POST /api/rebuild       → triggers Lume rebuild
```

### Phase 2: Connect Builder to CMS (Priority: Critical)

**Goal:** Builder loads data from CMS on startup, saves to CMS

**Changes to `builder-admin/src/stores/builder.ts`:**

1. `loadPage()` - change from `/api/pages/${slug}` to `/api/pages`
2. `savePage()` - change from `/api/save` to `/api/pages` (POST)
3. Add auto-load on store initialization

**Changes to `builder-admin/vite.config.ts`:**

```typescript
export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000',  // proxy to CMS server
    },
  },
});
```

### Phase 3: Add Live Preview (Priority: High)

**Goal:** Show actual site in iframe, not placeholder

**Changes to `builder-admin/src/App.tsx`:**

1. Replace preview placeholder with iframe
2. Iframe src: `http://localhost:3001` (Lume dev server port)
3. Add auto-refresh on save (call rebuild endpoint, then refresh iframe)

### Phase 4: Implement Auto-Rebuild (Priority: High)

**Goal:** Rebuild Lume after saving, refresh preview

**Changes to `site/_cms_server.ts`:**

Add endpoint:
```typescript
if (url.pathname === "/api/rebuild" && req.method === "POST") {
  const process = Deno.run({ cmd: ["deno", "task", "build"], cwd: "./site" });
  await process.status();
  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
}
```

**Changes to `builder-admin/src/stores/builder.ts`:**

After `savePage()`, call rebuild API and refresh preview.

### Phase 5: Add Remaining Block Templates (Priority: Medium)

**Goal:** Implement features and image-text blocks in index.liquid

**Current:** index.liquid only has hero, content, cta
**Needed:** Add features and image-text case statements

### Phase 6: Theme/Theme Editor Support (Priority: Future)

**Goal:** Support multiple themes like Shopify

Future enhancements:
- Multiple theme directories (themes/default, themes/modern, etc)
- Theme selector in builder
- Theme-specific block overrides

## File Changes Summary

| File | Changes |
|------|---------|
| `site/_cms_server.ts` | Add `/api/pages/:slug`, `/api/save`, `/api/rebuild` endpoints |
| `builder-admin/vite.config.ts` | Add proxy to CMS server |
| `builder-admin/src/stores/builder.ts` | Fix API calls, add rebuild trigger |
| `builder-admin/src/App.tsx` | Replace placeholder with iframe preview |
| `site/index.liquid` | Add features and image-text blocks |

## Updated start.sh

Update script to:
1. Run CMS server on port 8000
2. Run Lume on port 3001 (builder uses 3000)
3. Run builder dev server on port 3000

```bash
#!/bin/bash
set -e

cd "$(dirname "$0")/site"

echo "Starting CMS server on port 8000..."
deno run -A _cms_server.ts &
CMS_PID=$!

sleep 2

echo "Starting Lume dev server on port 3001..."
deno task dev &
LUME_PID=$!

cd ../builder-admin

echo "Starting Builder on port 3000..."
npm run dev &
BUILDER_PID=$!

trap "kill $CMS_PID $LUME_PID $BUILDER_PID 2>/dev/null" EXIT

wait
```

## Execution Order

1. Phase 1: Fix CMS server API
2. Phase 2: Connect builder to CMS  
3. Phase 3: Add live preview
4. Phase 4: Implement auto-rebuild
5. Phase 5: Add remaining blocks
6. Test full flow
