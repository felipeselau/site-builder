import { serve } from "https://deno.land/std@0.213.0/http/server.ts";
import { join } from "https://deno.land/std@0.213.0/path/mod.ts";
import { emptyDir, copy } from "https://deno.land/std@0.213.0/fs/mod.ts";

const DATA_DIR = "./_data";
const PAGES_FILE = join(DATA_DIR, "home.json");
const SCHEMAS_FILE = join(DATA_DIR, "schemas.json");
const SITE_DIR = "./_site";

async function readJson(path: string): Promise<unknown> {
  const text = await Deno.readTextFile(path);
  return JSON.parse(text);
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
}

async function getPageData() {
  try {
    return await readJson(PAGES_FILE);
  } catch {
    return { title: "Home", slug: "home", seo: { title: "", description: "" }, sections: [] };
  }
}

async function savePageData(data: unknown) {
  await writeJson(PAGES_FILE, data);
}

async function getSchemas() {
  try {
    return await readJson(SCHEMAS_FILE);
  } catch {
    return {};
  }
}

async function saveSchemasData(data: unknown) {
  await writeJson(SCHEMAS_FILE, data);
}

async function rebuildSite() {
  const process = Deno.run({
    cmd: ["deno", "task", "build"],
    cwd: Deno.cwd(),
  });
  const status = await process.status();
  return status.success;
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === "/api/pages" && req.method === "GET") {
    const data = await getPageData();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  }
  
  if ((url.pathname === "/api/pages" || url.pathname === "/api/save") && req.method === "POST") {
    const data = await req.json();
    await savePageData(data);
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  }
  
  if (url.pathname === "/api/rebuild" && req.method === "POST") {
    const success = await rebuildSite();
    return new Response(JSON.stringify({ success }), { headers: { "Content-Type": "application/json" } });
  }
  
  if (url.pathname === "/api/pages/home" && req.method === "GET") {
    const data = await getPageData();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  }
  
  if (url.pathname === "/api/schemas" && req.method === "GET") {
    const data = await getSchemas();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  }
  
  if (url.pathname === "/api/schemas" && req.method === "POST") {
    const data = await req.json();
    await saveSchemasData(data);
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  }
  
  if (url.pathname === "/admin") {
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }
  
  return new Response("Not Found", { status: 404 });
}

const html = `<!DOCTYPE html>
<html>
<head>
<title>Site Builder CMS</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --primary:#4f46e5;--primary-hover:#4338ca;--primary-light:#e0e7ff;
  --bg:#f8fafc;--surface:#ffffff;--border:#e2e8f0;
  --text:#1e293b;--text-secondary:#64748b;--text-muted:#94a3b8;
  --success:#10b981;--error:#ef4444;--warning:#f59e0b;
  --shadow-sm:0 1px 2px rgba(0,0,0,0.05);--shadow-md:0 4px 6px rgba(0,0,0,0.07);--shadow-lg:0 10px 15px rgba(0,0,0,0.1);
  --radius-sm:6px;--radius-md:8px;--radius-lg:12px;
}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.5}
.app{display:flex;min-height:100vh}

/* Sidebar */
.sidebar{width:260px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column}
.sidebar-header{padding:20px;border-bottom:1px solid var(--border)}
.sidebar-header h1{font-size:18px;font-weight:700;color:var(--primary)}
.sidebar-header span{font-size:12px;color:var(--text-muted)}
.nav-item{display:flex;align-items:center;gap:12px;padding:12px 20px;color:var(--text-secondary);cursor:pointer;border:none;background:none;width:100%;text-align:left;font-size:14px;font-weight:500;transition:all 0.15s}
.nav-item:hover{background:var(--bg);color:var(--text)}
.nav-item.active{background:var(--primary-light);color:var(--primary);border-right:3px solid var(--primary)}
.nav-item svg{width:20px;height:20px}
.sidebar-footer{margin-top:auto;padding:20px;border-top:1px solid var(--border)}
.sidebar-footer a{color:var(--text-secondary);font-size:13px;text-decoration:none;display:flex;align-items:center;gap:6px}
.sidebar-footer a:hover{color:var(--primary)}

/* Main Content */
.main{flex:1;display:flex;flex-direction:column}
.topbar{height:64px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 24px}
.topbar-title{font-size:18px;font-weight:600}
.topbar-actions{display:flex;gap:12px}

/* Buttons */
.btn{padding:10px 20px;border-radius:var(--radius-md);font-size:14px;font-weight:500;cursor:pointer;transition:all 0.15s;border:none;display:inline-flex;align-items:center;gap:8px}
.btn-primary{background:var(--primary);color:white}
.btn-primary:hover{background:var(--primary-hover);transform:translateY(-1px);box-shadow:var(--shadow-md)}
.btn-secondary{background:var(--bg);color:var(--text);border:1px solid var(--border)}
.btn-secondary:hover{background:var(--border)}
.btn-danger{background:var(--error);color:white}
.btn-sm{padding:8px 16px;font-size:13px}
.btn:disabled{opacity:0.6;cursor:not-allowed}

/* Cards */
.card{background:var(--surface);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);border:1px solid var(--border)}
.card-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.card-title{font-size:16px;font-weight:600}
.card-body{padding:20px}
.card-footer{padding:16px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:12px}

/* Form Elements */
.form-group{margin-bottom:20px}
.form-label{display:block;font-size:13px;font-weight:500;color:var(--text);margin-bottom:6px}
.form-input{width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:var(--radius-md);font-size:14px;transition:all 0.15s;background:var(--surface)}
.form-input:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-light)}
.form-input::placeholder{color:var(--text-muted)}
.form-textarea{min-height:100px;resize:vertical}
.form-select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:40px}
.form-checkbox{display:flex;align-items:center;gap:10px;cursor:pointer}
.form-checkbox input{width:18px;height:18px;accent-color:var(--primary)}

/* Grid Layout */
.grid{display:grid;gap:20px}
.grid-2{grid-template-columns:repeat(2,1fr)}
.grid-3{grid-template-columns:repeat(3,1fr)}
.grid-4{grid-template-columns:repeat(4,1fr)}

/* Block List */
.blocks-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}
.block-card{padding:20px;background:var(--bg);border:2px solid transparent;border-radius:var(--radius-lg);cursor:pointer;transition:all 0.2s;text-align:center}
.block-card:hover{background:var(--primary-light);border-color:var(--primary);transform:translateY(-2px)}
.block-card.selected{background:var(--primary-light);border-color:var(--primary)}
.block-icon{width:48px;height:48px;margin:0 auto 12px;background:var(--surface);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:24px}
.block-name{font-weight:600;font-size:14px;color:var(--text)}
.block-count{font-size:12px;color:var(--text-muted);margin-top:4px}

/* Settings List */
.settings-list{display:flex;flex-direction:column;gap:16px}
.setting-item{background:var(--bg);padding:16px;border-radius:var(--radius-md)}
.setting-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
.setting-label{font-weight:600;font-size:14px}
.setting-type{font-size:11px;color:var(--text-muted);background:var(--surface);padding:4px 8px;border-radius:var(--radius-sm)}
.setting-info{font-size:12px;color:var(--text-muted);margin-top:8px}

/* Toast */
.toast-container{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:12px}
.toast{padding:14px 20px;background:var(--surface);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:12px;min-width:300px;transform:translateX(120%);transition:transform 0.3s ease}
.toast.show{transform:translateX(0)}
.toast-success{border-left:4px solid var(--success)}
.toast-error{border-left:4px solid var(--error)}
.toast-icon{width:20px;height:20px;flex-shrink:0}
.toast-message{font-size:14px}
.toast-close{background:none;border:none;margin-left:auto;cursor:pointer;color:var(--text-muted)}

/* Loading */
.loading-overlay{position:fixed;inset:0;background:rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;z-index:9998;opacity:0;visibility:hidden;transition:all 0.2s}
.loading-overlay.active{opacity:1;visibility:visible}
.spinner{width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* Empty State */
.empty-state{text-align:center;padding:60px 20px}
.empty-icon{font-size:48px;margin-bottom:16px;opacity:0.5}
.empty-title{font-size:18px;font-weight:600;margin-bottom:8px}
.empty-desc{color:var(--text-muted);font-size:14px}

/* Responsive */
@media(max-width:768px){
  .app{flex-direction:column}
  .sidebar{width:100%;flex-direction:row;height:auto}
  .sidebar-header{display:none}
  .grid-2,.grid-3,.grid-4{grid-template-columns:1fr}
}

/* Tabs */
.tabs{display:flex;gap:4px;background:var(--bg);padding:4px;border-radius:var(--radius-md)}
.tab{padding:8px 16px;border:none;background:none;font-size:13px;font-weight:500;color:var(--text-secondary);cursor:pointer;border-radius:var(--radius-sm);transition:all 0.15s}
.tab.active{background:var(--surface);color:var(--primary);box-shadow:var(--shadow-sm)}
</style>
</head>
<body>
<div class="app">
<aside class="sidebar">
<div class="sidebar-header">
<h1>Site Builder</h1>
<span>CMS v1.0</span>
</div>
<nav>
<button class="nav-item active" data-nav="page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Page Settings</button>
<button class="nav-item" data-nav="schemas"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>Schema Editor</button>
<button class="nav-item" data-nav="files"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Files</button>
<button class="nav-item" data-nav="theme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>Theme</button>
</nav>
<div class="sidebar-footer">
<a href="http://localhost:3001" target="_blank"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>View Site</a>
</div>
</aside>

<main class="main">
<div class="topbar">
<h2 class="topbar-title" id="pageTitleDisplay">Page Settings</h2>
<div class="topbar-actions">
<button class="btn btn-secondary" onclick="rebuildSite()">Rebuild Site</button>
<button class="btn btn-primary" id="saveBtn" onclick="saveCurrent()">Save Changes</button>
</div>
</div>

<div class="card" style="margin:24px;border-radius:12px;">
<!-- Page Settings -->
<div id="pageContent" class="card-body">
<div class="grid grid-2">
<div class="form-group">
<label class="form-label">Page Title</label>
<input type="text" class="form-input" id="pageTitle" placeholder="Enter page title">
</div>
<div class="form-group">
<label class="form-label">Slug</label>
<input type="text" class="form-input" id="pageSlug" placeholder="page-slug" readonly style="background:var(--bg)">
</div>
</div>
<div class="form-group">
<label class="form-label">SEO Title</label>
<input type="text" class="form-input" id="seoTitle" placeholder="SEO title for search engines">
</div>
<div class="form-group">
<label class="form-label">SEO Description</label>
<textarea class="form-input form-textarea" id="seoDescription" placeholder="Description for search engines"></textarea>
</div>
</div>

<!-- Schema Editor -->
<div id="schemasContent" class="card-body" style="display:none;">
<div class="grid" style="grid-template-columns:280px 1fr;">
<div class="blocks-sidebar">
<h4 style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">Available Blocks</h4>
<div id="blockList" class="blocks-grid" style="grid-template-columns:1fr;"></div>
</div>
<div class="settings-panel">
<div id="schemaEditor" style="display:none;">
<h3 id="schemaTitle" style="font-size:18px;font-weight:600;margin-bottom:20px;"></h3>
<div id="schemaSettings" class="settings-list"></div>
<div style="margin-top:20px;display:flex;gap:12px;">
<button class="btn btn-primary" onclick="saveSchema()">Save Schema</button>
<button class="btn btn-secondary" onclick="resetSchema()">Reset to Default</button>
</div>
</div>
<div id="noBlockSelected" class="empty-state">
<div class="empty-icon">📦</div>
<div class="empty-title">Select a Block</div>
<div class="empty-desc">Choose a block from the list to edit its schema settings</div>
</div>
</div>
</div>
</div>

<!-- Files -->
<div id="filesContent" class="card-body" style="display:none;">
<div class="empty-state">
<div class="empty-icon">📁</div>
<div class="empty-title">File Manager</div>
<div class="empty-desc">Upload and manage your site's media files</div>
</div>
</div>

<!-- Theme -->
<div id="themeContent" class="card-body" style="display:none;">
<div class="empty-state">
<div class="empty-icon">🎨</div>
<div class="empty-title">Theme Settings</div>
<div class="empty-desc">Customize your theme colors, fonts, and layout options</div>
</div>
</div>
</div>
</main>
</div>

<!-- Loading Overlay -->
<div class="loading-overlay" id="loadingOverlay">
<div class="spinner"></div>
</div>

<!-- Toast Container -->
<div class="toast-container" id="toastContainer"></div>

<script>
const defaultSchemas = {"hero":{"name":"Hero","settings":[{"id":"title","type":"text","label":"Title","default":"Welcome to Your Site"},{"id":"subtitle","type":"textarea","label":"Subtitle","default":"Build amazing websites with our site builder"},{"id":"backgroundImage","type":"image_picker","label":"Background Image"},{"id":"backgroundColor","type":"color","label":"Background Color","default":"#1a1a2e"},{"id":"textColor","type":"color","label":"Text Color","default":"#ffffff"},{"id":"ctaText","type":"text","label":"CTA Button Text","default":"Get Started"},{"id":"ctaLink","type":"url","label":"CTA Link","default":"#"},{"id":"ctaStyle","type":"select","label":"CTA Style","default":"primary","options":[{"value":"primary","label":"Primary"},{"value":"secondary","label":"Secondary"},{"value":"outline","label":"Outline"}]}]},"content":{"name":"Content","settings":[{"id":"heading","type":"text","label":"Heading","default":"About Us"},{"id":"content","type":"richtext","label":"Content","default":"Add your content here."},{"id":"alignment","type":"select","label":"Alignment","default":"left","options":[{"value":"left","label":"Left"},{"value":"center","label":"Center"},{"value":"right","label":"Right"}]},{"id":"contentWidth","type":"select","label":"Content Width","default":"medium","options":[{"value":"narrow","label":"Narrow"},{"value":"medium","label":"Medium"},{"value":"wide","label":"Wide"}]}]},"features":{"name":"Features","settings":[{"id":"title","type":"text","label":"Section Title","default":"Features"},{"id":"columns","type":"range","label":"Number of Columns","default":3,"min":1,"max":4,"step":1},{"id":"features","type":"textarea","label":"Features (one per line)","default":"Feature One\nFeature Two\nFeature Three"},{"id":"iconStyle","type":"select","label":"Icon Style","default":"check","options":[{"value":"check","label":"Checkmark"},{"value":"star","label":"Star"},{"value":"arrow","label":"Arrow"}]},{"id":"backgroundColor","type":"color","label":"Background Color","default":"#f9fafb"}]},"image-text":{"name":"Image with Text","settings":[{"id":"image","type":"image_picker","label":"Image"},{"id":"heading","type":"text","label":"Heading","default":"Image Section"},{"id":"content","type":"richtext","label":"Content","default":"Describe your image content here."},{"id":"imagePosition","type":"select","label":"Image Position","default":"left","options":[{"value":"left","label":"Left"},{"value":"right","label":"Right"}]},{"id":"ctaText","type":"text","label":"CTA Text","default":"Learn More"},{"id":"ctaLink","type":"url","label":"CTA Link","default":"#"},{"id":"imageOverlay","type":"checkbox","label":"Add Image Overlay","default":false},{"id":"overlayOpacity","type":"range","label":"Overlay Opacity","default":0,"min":0,"max":100,"step":10}]},"cta":{"name":"Call to Action","settings":[{"id":"title","type":"text","label":"Title","default":"Ready to get started?"},{"id":"subtitle","type":"textarea","label":"Subtitle","default":"Join thousands of satisfied customers today."},{"id":"buttonText","type":"text","label":"Button Text","default":"Sign Up Now"},{"id":"buttonLink","type":"url","label":"Button Link","default":"#"},{"id":"backgroundColor","type":"color","label":"Background Color","default":"#4f46e5"},{"id":"textColor","type":"color","label":"Text Color","default":"#ffffff"},{"id":"buttonStyle","type":"select","label":"Button Style","default":"light","options":[{"value":"light","label":"Light"},{"value":"dark","label":"Dark"},{"value":"outline","label":"Outline"}]},{"id":"fullWidth","type":"checkbox","label":"Full Width Button","default":false}]}};

let currentBlock = null;
let schemas = {};
let currentNav = 'page';

function showLoading(){document.getElementById('loadingOverlay').classList.add('active');}
function hideLoading(){document.getElementById('loadingOverlay').classList.remove('active');}

function showToast(message,type='success'){
  const container=document.getElementById('toastContainer');
  const toast=document.createElement('div');
  toast.className=\`toast toast-\${type}\`;
  toast.innerHTML=\`
    <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="\${type==='success'?'#10b981':'#ef4444'}" stroke-width="2">
      \${type==='success'?'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>':'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
    </svg>
    <span class="toast-message">\${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  \`;
  container.appendChild(toast);
  setTimeout(()=>toast.classList.add('show'),10);
  setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),300);},4000);
}

document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',()=>{
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
    item.classList.add('active');
    currentNav=item.dataset.nav;
    
    document.getElementById('pageTitleDisplay').textContent=item.textContent.trim();
    
    document.getElementById('pageContent').style.display='none';
    document.getElementById('schemasContent').style.display='none';
    document.getElementById('filesContent').style.display='none';
    document.getElementById('themeContent').style.display='none';
    document.getElementById(currentNav+'Content').style.display='block';
  });
});

async function loadPage(){
  const res=await fetch('/api/pages');
  const data=await res.json();
  document.getElementById('pageTitle').value=data.title||'';
  document.getElementById('pageSlug').value=data.slug||'';
  document.getElementById('seoTitle').value=data.seo?.title||'';
  document.getElementById('seoDescription').value=data.seo?.description||'';
}

async function savePage(){
  showLoading();
  const data={
    title:document.getElementById('pageTitle').value,
    slug:document.getElementById('pageSlug').value,
    seo:{title:document.getElementById('seoTitle').value,description:document.getElementById('seoDescription').value}
  };
  await fetch('/api/pages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  hideLoading();
  showToast('Page saved successfully!','success');
}

async function rebuildSite(){
  showLoading();
  await fetch('/api/rebuild',{method:'POST'});
  hideLoading();
  showToast('Site rebuilt successfully!','success');
}

async function loadSchemas(){
  const res=await fetch('/api/schemas');
  schemas=await res.json();
  if(Object.keys(schemas).length===0){
    schemas=JSON.parse(JSON.stringify(defaultSchemas));
  }
  renderBlockList();
}

function renderBlockList(){
  const list=document.getElementById('blockList');
  list.innerHTML='';
  const icons={'hero':'🎯','content':'📝','features':'✨','image-text':'🖼️','cta':'🔔'};
  Object.keys(schemas).forEach(key=>{
    const block=document.createElement('div');
    block.className='block-card';
    block.innerHTML=\`<div class="block-icon">\${icons[key]||'📦'}</div><div class="block-name">\${schemas[key].name||key}</div><div class="block-count">\${(schemas[key].settings||[]).length} settings</div>\`;
    block.onclick=()=>{document.querySelectorAll('.block-card').forEach(b=>b.classList.remove('selected'));block.classList.add('selected');editBlock(key);};
    list.appendChild(block);
  });
}

function editBlock(blockType){
  currentBlock=blockType;
  document.getElementById('schemaTitle').textContent=schemas[blockType].name||blockType;
  document.getElementById('schemaEditor').style.display='block';
  document.getElementById('noBlockSelected').style.display='none';
  renderSettings(blockType);
}

function renderSettings(blockType){
  const container=document.getElementById('schemaSettings');
  container.innerHTML='';
  const settings=schemas[blockType].settings||[];
  settings.forEach((setting,idx)=>{
    const item=document.createElement('div');
    item.className='setting-item';
    let input='';
    if(setting.type==='text'||setting.type==='url'){
      input=\`<input type="text" class="form-input" id="setting_\${setting.id}" value="\${setting.default||''}" placeholder="\${setting.placeholder||''}">\`;
    }else if(setting.type==='textarea'||setting.type==='richtext'){
      input=\`<textarea class="form-input form-textarea" id="setting_\${setting.id}" placeholder="\${setting.placeholder||''}">\${setting.default||''}</textarea>\`;
    }else if(setting.type==='number'||setting.type==='range'){
      input=\`<input type="number" class="form-input" id="setting_\${setting.id}" value="\${setting.default||0}" \${setting.min!==undefined?'min="'+setting.min+'"':''} \${setting.max!==undefined?'max="'+setting.max+'"':''} \${setting.step?'step="'+setting.step+'"':''}>\`;
    }else if(setting.type==='color'){
      input=\`<input type="color" id="setting_\${setting.id}" value="\${setting.default||'#000000'}" style="height:42px;padding:4px;">\`;
    }else if(setting.type==='checkbox'){
      input=\`<label class="form-checkbox"><input type="checkbox" id="setting_\${setting.id}" \${setting.default?'checked':''}><span>\${setting.label}</span></label>\`;
    }else if(setting.type==='select'){
      input=\`<select class="form-input form-select" id="setting_\${setting.id}">\`+(setting.options||[]).map(o=>\`<option value="\${o.value}" \${o.value===setting.default?'selected':''}>\${o.label}</option>\`).join('')+\`</select>\`;
    }else if(setting.type==='image_picker'){
      input=\`<input type="text" class="form-input" id="setting_\${setting.id}" value="\${setting.default||''}" placeholder="Image URL or upload">\`;
    }
    if(setting.type!=='checkbox'){
      item.innerHTML=\`<div class="setting-header"><span class="setting-label">\${setting.label}</span><span class="setting-type">\${setting.type}</span></div>\${input}\${setting.info?'<div class="setting-info">'+setting.info+'</div>':''}\`;
    }else{
      item.innerHTML=input;
    }
    container.appendChild(item);
  });
}

async function saveSchema(){
  if(!currentBlock)return;
  showLoading();
  const settings=schemas[currentBlock].settings||[];
  settings.forEach(setting=>{
    const el=document.getElementById('setting_'+setting.id);
    if(el){
      if(setting.type==='checkbox'){
        setting.default=el.checked;
      }else if(setting.type==='range'||setting.type==='number'){
        setting.default=parseFloat(el.value);
      }else{
        setting.default=el.value;
      }
    }
  });
  await fetch('/api/schemas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(schemas)});
  hideLoading();
  showToast('Schema saved successfully!','success');
}

function resetSchema(){
  if(!currentBlock)return;
  if(!confirm('Reset this schema to default values?'))return;
  schemas[currentBlock]=JSON.parse(JSON.stringify(defaultSchemas[currentBlock]));
  renderSettings(currentBlock);
  showToast('Schema reset to defaults','success');
}

function saveCurrent(){
  if(currentNav==='page')savePage();
  else if(currentNav==='schemas')saveSchema();
}

loadPage();
loadSchemas();
</script>
</body></html>`;

serve(handler);