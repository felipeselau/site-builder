import { serve } from "https://deno.land/std@0.213.0/http/server.ts";
import { join } from "https://deno.land/std@0.213.0/path/mod.ts";
import { emptyDir, copy } from "https://deno.land/std@0.213.0/fs/mod.ts";

const DATA_DIR = "./_data";
const PAGES_FILE = join(DATA_DIR, "home.json");
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
  
  if (url.pathname === "/admin") {
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }
  
  return new Response("Not Found", { status: 404 });
}

const html = `<!DOCTYPE html>
<html>
<head><title>Site Builder CMS</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#f5f5f5}.header{background:#4f46e5;color:white;padding:20px}.container{max-width:900px;margin:40px auto;padding:0 20px}.card{background:white;border-radius:8px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1)}h2{margin-bottom:20px;color:#111}.field{margin-bottom:16px}label{display:block;margin-bottom:6px;font-weight:500;color:#374151}input,textarea{width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px}textarea{min-height:80px}.btn{background:#4f46e5;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer}.btn:hover{background:#4338ca}</style>
</head>
<body><div class="header"><h1>Site Builder CMS</h1></div>
<div class="container"><div class="card"><h2>Page Settings</h2>
<div class="field"><label>Page Title</label><input type="text" id="pageTitle"></div>
<div class="field"><label>SEO Title</label><input type="text" id="seoTitle"></div>
<div class="field"><label>SEO Description</label><textarea id="seoDescription"></textarea></div>
<button class="btn" onclick="savePage()">Save Page</button></div></div>
<script>async function loadPage(){const res=await fetch('/api/pages');const data=await res.json();document.getElementById('pageTitle').value=data.title||'';document.getElementById('seoTitle').value=data.seo?.title||'';document.getElementById('seoDescription').value=data.seo?.description||''}async function savePage(){const data={title:document.getElementById('pageTitle').value,seo:{title:document.getElementById('seoTitle').value,description:document.getElementById('seoDescription').value}};await fetch('/api/pages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)};alert('Saved!')}loadPage();</script>
</body></html>`;

serve(handler);