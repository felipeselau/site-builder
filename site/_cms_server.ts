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
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#f5f5f5}
.header{background:#4f46e5;color:white;padding:20px}
.tabs{display:flex;background:#e5e7eb;padding:0 20px}
.tab{padding:12px 24px;cursor:pointer;background:#e5e7eb;border:none;font-size:14px;font-weight:500;color:#6b7280}
.tab.active{background:white;color:#4f46e5;border-top:2px solid #4f46e5}
.tab-content{display:none}
.tab-content.active{display:block}
.container{max-width:900px;margin:40px auto;padding:0 20px}
.card{background:white;border-radius:8px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);margin-bottom:24px}
h2{margin-bottom:20px;color:#111}
h3{margin-bottom:16px;color:#374151;font-size:16px}
.field{margin-bottom:16px}
label{display:block;margin-bottom:6px;font-weight:500;color:#374151}
input,textarea,select{width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px}
input[type="checkbox"]{width:auto;margin-right:8px}
textarea{min-height:80px}
.btn{background:#4f46e5;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500}
.btn:hover{background:#4338ca}
.btn-secondary{background:#6b7280}
.btn-secondary:hover{background:#4b5563}
.block-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:24px}
.block-item{padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;text-align:center;transition:all 0.15s}
.block-item:hover{background:#4f46e5;color:white;border-color:#4f46e5}
.schema-settings{margin-top:24px}
.setting-row{padding:16px;background:#f9fafb;border-radius:8px;margin-bottom:12px}
.setting-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.setting-label{font-weight:500;color:#374151}
.setting-type{font-size:12px;color:#9ca3af;background:#e5e7eb;padding:2px 8px;border-radius:4px}
.info{font-size:12px;color:#9ca3af;margin-top:4px}
</style>
</head>
<body>
<div class="header"><h1>Site Builder CMS</h1></div>
<div class="tabs">
<button class="tab active" data-tab="page">Page Settings</button>
<button class="tab" data-tab="schemas">Schema Editor</button>
</div>

<div id="page" class="tab-content active">
<div class="container">
<div class="card">
<h2>Page Settings</h2>
<div class="field"><label>Page Title</label><input type="text" id="pageTitle"></div>
<div class="field"><label>SEO Title</label><input type="text" id="seoTitle"></div>
<div class="field"><label>SEO Description</label><textarea id="seoDescription"></textarea></div>
<button class="btn" onclick="savePage()">Save Page</button>
</div>
</div>
</div>

<div id="schemas" class="tab-content">
<div class="container">
<div class="card">
<h2>Block Schemas</h2>
<div class="block-list" id="blockList"></div>
</div>
<div id="schemaEditor" class="card" style="display:none;">
<h3 id="schemaTitle"></h3>
<div id="schemaSettings"></div>
<button class="btn" onclick="saveSchema()">Save Schema</button>
<button class="btn btn-secondary" onclick="resetSchema()">Reset to Default</button>
</div>
</div>
</div>

<script>
const defaultSchemas = {"hero":{"name":"Hero","settings":[{"id":"title","type":"text","label":"Title","default":"Welcome to Your Site"},{"id":"subtitle","type":"textarea","label":"Subtitle","default":"Build amazing websites with our site builder"},{"id":"backgroundImage","type":"image_picker","label":"Background Image"},{"id":"backgroundColor","type":"color","label":"Background Color","default":"#1a1a2e"},{"id":"textColor","type":"color","label":"Text Color","default":"#ffffff"},{"id":"ctaText","type":"text","label":"CTA Button Text","default":"Get Started"},{"id":"ctaLink","type":"url","label":"CTA Link","default":"#"},{"id":"ctaStyle","type":"select","label":"CTA Style","default":"primary","options":[{"value":"primary","label":"Primary"},{"value":"secondary","label":"Secondary"},{"value":"outline","label":"Outline"}]}]},"content":{"name":"Content","settings":[{"id":"heading","type":"text","label":"Heading","default":"About Us"},{"id":"content","type":"richtext","label":"Content","default":"Add your content here."},{"id":"alignment","type":"select","label":"Alignment","default":"left","options":[{"value":"left","label":"Left"},{"value":"center","label":"Center"},{"value":"right","label":"Right"}]},{"id":"contentWidth","type":"select","label":"Content Width","default":"medium","options":[{"value":"narrow","label":"Narrow"},{"value":"medium","label":"Medium"},{"value":"wide","label":"Wide"}]}]},"features":{"name":"Features","settings":[{"id":"title","type":"text","label":"Section Title","default":"Features"},{"id":"columns","type":"range","label":"Number of Columns","default":3,"min":1,"max":4,"step":1},{"id":"features","type":"textarea","label":"Features (one per line)","default":"Feature One\nFeature Two\nFeature Three"},{"id":"iconStyle","type":"select","label":"Icon Style","default":"check","options":[{"value":"check","label":"Checkmark"},{"value":"star","label":"Star"},{"value":"arrow","label":"Arrow"}]},{"id":"backgroundColor","type":"color","label":"Background Color","default":"#f9fafb"}]},"image-text":{"name":"Image with Text","settings":[{"id":"image","type":"image_picker","label":"Image"},{"id":"heading","type":"text","label":"Heading","default":"Image Section"},{"id":"content","type":"richtext","label":"Content","default":"Describe your image content here."},{"id":"imagePosition","type":"select","label":"Image Position","default":"left","options":[{"value":"left","label":"Left"},{"value":"right","label":"Right"}]},{"id":"ctaText","type":"text","label":"CTA Text","default":"Learn More"},{"id":"ctaLink","type":"url","label":"CTA Link","default":"#"},{"id":"imageOverlay","type":"checkbox","label":"Add Image Overlay","default":false},{"id":"overlayOpacity","type":"range","label":"Overlay Opacity","default":0,"min":0,"max":100,"step":10}]},"cta":{"name":"Call to Action","settings":[{"id":"title","type":"text","label":"Title","default":"Ready to get started?"},{"id":"subtitle","type":"textarea","label":"Subtitle","default":"Join thousands of satisfied customers today."},{"id":"buttonText","type":"text","label":"Button Text","default":"Sign Up Now"},{"id":"buttonLink","type":"url","label":"Button Link","default":"#"},{"id":"backgroundColor","type":"color","label":"Background Color","default":"#4f46e5"},{"id":"textColor","type":"color","label":"Text Color","default":"#ffffff"},{"id":"buttonStyle","type":"select","label":"Button Style","default":"light","options":[{"value":"light","label":"Light"},{"value":"dark","label":"Dark"},{"value":"outline","label":"Outline"}]},{"id":"fullWidth","type":"checkbox","label":"Full Width Button","default":false}]}};

let currentBlock = null;
let schemas = {};

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

async function loadPage(){
  const res=await fetch('/api/pages');
  const data=await res.json();
  document.getElementById('pageTitle').value=data.title||'';
  document.getElementById('seoTitle').value=data.seo?.title||'';
  document.getElementById('seoDescription').value=data.seo?.description||'';
}

async function savePage(){
  const data={title:document.getElementById('pageTitle').value,seo:{title:document.getElementById('seoTitle').value,description:document.getElementById('seoDescription').value}};
  await fetch('/api/pages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  alert('Saved!');
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
  Object.keys(schemas).forEach(key=>{
    const block=document.createElement('div');
    block.className='block-item';
    block.textContent=schemas[key].name||key;
    block.onclick=()=>editBlock(key);
    list.appendChild(block);
  });
}

function editBlock(blockType){
  currentBlock=blockType;
  document.getElementById('schemaTitle').textContent=schemas[blockType].name||blockType;
  document.getElementById('schemaEditor').style.display='block';
  renderSettings(blockType);
}

function renderSettings(blockType){
  const container=document.getElementById('schemaSettings');
  container.innerHTML='';
  const settings=schemas[blockType].settings||[];
  settings.forEach((setting,idx)=>{
    const row=document.createElement('div');
    row.className='setting-row';
    let input='';
    if(setting.type==='text'||setting.type==='url'){
      input=\`<input type="text" id="setting_\${setting.id}" value="\${setting.default||''}" placeholder="\${setting.placeholder||''}">\`;
    }else if(setting.type==='textarea'){
      input=\`<textarea id="setting_\${setting.id}" placeholder="\${setting.placeholder||''}">\${setting.default||''}</textarea>\`;
    }else if(setting.type==='number'||setting.type==='range'){
      input=\`<input type="number" id="setting_\${setting.id}" value="\${setting.default||0}" \${setting.min!==undefined?'min="'+setting.min+'"':''} \${setting.max!==undefined?'max="'+setting.max+'"':''} \${setting.step?'step="'+setting.step+'"':''}>\`;
    }else if(setting.type==='color'){
      input=\`<input type="color" id="setting_\${setting.id}" value="\${setting.default||'#000000'}">\`;
    }else if(setting.type==='checkbox'){
      input=\`<input type="checkbox" id="setting_\${setting.id}" \${setting.default?'checked':''}>\`;
    }else if(setting.type==='select'){
      input=\`<select id="setting_\${setting.id}">\`+(setting.options||[]).map(o=>\`<option value="\${o.value}" \${o.value===setting.default?'selected':''}>\${o.label}</option>\`).join('')+\`</select>\`;
    }else if(setting.type==='richtext'){
      input=\`<textarea id="setting_\${setting.id}" placeholder="\${setting.placeholder||''}">\${setting.default||''}</textarea>\`;
    }else if(setting.type==='image_picker'){
      input=\`<input type="text" id="setting_\${setting.id}" value="\${setting.default||''}" placeholder="Image URL">\`;
    }
    row.innerHTML=\`<div class="setting-header"><span class="setting-label">\${setting.label}</span><span class="setting-type">\${setting.type}</span></div>\${input}\${setting.info?'<div class="info">'+setting.info+'</div>':''}\`;
    container.appendChild(row);
  });
}

async function saveSchema(){
  if(!currentBlock)return;
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
  alert('Schema saved!');
}

function resetSchema(){
  if(!currentBlock)return;
  schemas[currentBlock]=JSON.parse(JSON.stringify(defaultSchemas[currentBlock]));
  renderSettings(currentBlock);
}

loadPage();
loadSchemas();
</script>
</body></html>`;

serve(handler);