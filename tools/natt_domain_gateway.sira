const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();
const PORT = Number(process.argv[2] || process.env.PORT || 8080);
const EXCLUDES = new Set([".git","node_modules","dist","build",".next",".nuxt","coverage",".cache",".turbo"]);
const AUDIT = [];
const SSE = new Set();

function exists(p){ try{return fs.existsSync(p)}catch{return false} }
function read(p){ try{return fs.readFileSync(p,"utf8")}catch{return ""} }
function esc(s){ return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;") }
function id(prefix){ return prefix + "_" + crypto.randomBytes(6).toString("hex") }

function routeKeyFromHost(host){
  const h = String(host || "").toLowerCase().split(":")[0];

  if (h.endsWith(".sira")) return h.replace(".sira", "");
  if (h.endsWith(".natt")) return h.replace(".natt", "");

  const first = h.split(".")[0];
  const allowed = new Set([
    "audit","tam","nauion","core","runtime","docs","anc",
    "mach","heyna","gate","sira","khai","bridge"
  ]);

  if (allowed.has(first)) return first;

  return h;
}

function now(){ return new Date().toISOString() }
function excluded(rel){ return rel.split(path.sep).some(x => EXCLUDES.has(x)); }

function walk(dir,out=[]){
  let items=[];
  try{ items=fs.readdirSync(dir,{withFileTypes:true}) }catch{ return out }
  for(const it of items){
    const full=path.join(dir,it.name);
    const rel=path.relative(ROOT,full);
    if(excluded(rel)) continue;
    if(it.isDirectory()) walk(full,out);
    else out.push(full);
  }
  return out;
}

function walkDirs(dir,out=[],depth=0){
  if(depth>6) return out;
  let items=[];
  try{ items=fs.readdirSync(dir,{withFileTypes:true}) }catch{ return out }
  for(const it of items){
    if(!it.isDirectory() || EXCLUDES.has(it.name)) continue;
    const full=path.join(dir,it.name);
    out.push(full);
    walkDirs(full,out,depth+1);
  }
  return out;
}

function findDir(names){
  for(const name of names){
    const p=path.join(ROOT,name);
    if(exists(p) && fs.statSync(p).isDirectory()) return p;
  }
  const all=walkDirs(ROOT).filter(d=>names.includes(path.basename(d)));
  all.sort((a,b)=>a.length-b.length);
  return all[0] || null;
}

function findAudit(){
  const preferred=path.join(ROOT,"docs","ui","NaU_audit.html");
  if(exists(preferred)) return preferred;
  for(const f of walk(ROOT)){
    if(!f.toLowerCase().endsWith(".html")) continue;
    const c=read(f);
    if(c.includes("SCAN CLIENT") && c.includes("FORCE SPEC COMPLIANCE")) return f;
  }
  return null;
}

const TAM = findDir(["nattos-server"]);
const NAUION = findDir(["NaUion-Server","Nauion-Server","nauion-server","nauion_server"]);
const AUDIT_HTML = findAudit();

function htmlFiles(base){
  if(!base) return [];
  return walk(base).filter(f=>f.toLowerCase().endsWith(".html")).sort();
}

function scoreMain(base,f){
  const rel=path.relative(base,f).replaceAll(path.sep,"/").toLowerCase();
  const name=path.basename(rel);
  let s=0;
  if(name.includes("v9")) s+=1000;
  if(name.includes("nauion")) s+=200;
  if(name.includes("index")) s+=100;
  return s;
}

function mainHtml(base){
  const files=htmlFiles(base);
  if(!files.length) return null;
  return files.map(f=>({f,s:scoreMain(base,f)})).sort((a,b)=>b.s-a.s || a.f.localeCompare(b.f))[0].f;
}

function mime(f){
  const e=path.extname(f).toLowerCase();
  return {
    ".html":"text/html; charset=utf-8",
    ".js":"text/javascript; charset=utf-8",
    ".css":"text/css; charset=utf-8",
    ".json":"application/json; charset=utf-8",
    ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",
    ".svg":"image/svg+xml",".ico":"image/x-icon"
  }[e] || "application/octet-stream";
}

function safe(base,urlPath){
  let d="";
  try{ d=decodeURIComponent(urlPath.split("?")[0]) }catch{ d=urlPath.split("?")[0] }
  d=d.replace(/^\/+/,"");
  if(!d) return null;
  const full=path.resolve(base,d);
  if(!full.startsWith(path.resolve(base))) return null;
  return full;
}

function sendJson(res,obj,code=200){
  const raw=Buffer.from(JSON.stringify(obj,null,2),"utf8");
  res.writeHead(code,{"Content-Type":"application/json; charset=utf-8","Content-Length":raw.length,"Cache-Control":"no-store"});
  res.end(raw);
}

function sendHtml(res,html){
  const raw=Buffer.from(html,"utf8");
  res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Content-Length":raw.length,"Cache-Control":"no-store"});
  res.end(raw);
}

function audit(row){
  const x={audit_id:id("audit"),timestamp:now(),...row};
  AUDIT.push(x);
  while(AUDIT.length>500) AUDIT.shift();
  for(const res of SSE){
    try{ res.write("data: "+JSON.stringify({type:"audit.appended",payload:x})+"\n\n") }catch{}
  }
  return x;
}

function inject(html,screen){
  if(html.includes("__NATT_DOMAIN_RUNTIME__")) return html;
  const inj = `<script>
(function(){
 if(window.__NATT_DOMAIN_RUNTIME__) return; window.__NATT_DOMAIN_RUNTIME__=true;
 const screen=${JSON.stringify(screen)};
 const box=document.createElement("div");
 box.style.cssText="position:fixed;right:16px;bottom:16px;z-index:999999;background:#020617;color:#e2e8f0;border:1px solid #a855f7;border-radius:14px;padding:10px;font:11px ui-monospace,monospace;box-shadow:0 0 25px #000;max-width:320px";
 box.innerHTML='<b style="color:#c084fc">NATT DOMAIN RUNTIME</b><br><span>'+screen+'</span><br><button id="ndrH">HEALTH</button> <button id="ndrE">EMIT</button> <button id="ndrA">AUDIT</button><pre id="ndrO" style="max-height:120px;overflow:auto;background:#000;padding:6px;border-radius:8px">attached</pre>';
 document.body.appendChild(box);
 const out=box.querySelector("#ndrO");
 async function get(p){const r=await fetch(p,{cache:"no-store"});return await r.json()}
 async function post(p,b){const r=await fetch(p,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});return await r.json()}
 function print(x){out.textContent=JSON.stringify(x,null,2)}
 box.querySelector("#ndrH").onclick=async()=>print(await get("/api/health"));
 box.querySelector("#ndrE").onclick=async()=>print(await post("/api/events/emit",{type:"screen.viewed",cell:"domain-ui-cell",payload:{screen,href:location.href}}));
 box.querySelector("#ndrA").onclick=async()=>print(await get("/api/audit?limit=20"));
})();
</script>`;
  return html.includes("</body>") ? html.replace("</body>", inj+"\n</body>") : html+inj;
}

function indexPage(base,title){
  const files=htmlFiles(base);
  const main=mainHtml(base);
  const links=files.map(f=>{
    const rel=path.relative(base,f).replaceAll(path.sep,"/");
    const isMain=main===f;
    return `<a style="display:block;padding:12px;margin:8px 0;border:1px solid ${isMain?"#fbbf24":"#334155"};border-radius:12px;color:#e2e8f0;text-decoration:none;background:#0f172a" href="/${encodeURI(rel)}" target="_blank"><b>${esc(path.basename(rel))}${isMain?" · MAIN":""}</b><br><code>${esc(rel)}</code></a>`;
  }).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title></head><body style="margin:0;background:#020617;color:#e2e8f0;font-family:Inter,system-ui;padding:24px"><h1 style="color:#c084fc">${esc(title)}</h1><p>Root: ${esc(base)} · Screens: ${files.length}</p><p><a style="color:#67e8f9" href="/">MAIN</a> · <a style="color:#67e8f9" href="/__screens">SCREENS</a> · <a style="color:#67e8f9" href="/api/health">HEALTH</a> · <a style="color:#67e8f9" href="/api/audit">AUDIT</a> · <a style="color:#67e8f9" href="/mach/heyna">SSE</a></p><input id="q" placeholder="search..." style="width:100%;padding:12px;background:#000;color:#fff;border:1px solid #334155;border-radius:10px"><div id="list">${links}</div><script>const q=document.getElementById("q");const a=[...document.querySelectorAll("#list a")];q.oninput=()=>{const s=q.value.toLowerCase();a.forEach(x=>x.style.display=x.textContent.toLowerCase().includes(s)?"block":"none")}</script></body></html>`;
}

function serveBase(req,res,base,title){
  const u=new URL(req.url,"http://local");
  const routeKey=routeKeyFromHost(host);
  if(u.pathname==="/api/screens") return sendJson(res,{ok:true,root:base,count:htmlFiles(base).length,screens:htmlFiles(base).map(f=>path.relative(base,f).replaceAll(path.sep,"/"))});
  if(u.pathname==="/__screens"||u.pathname==="/screens"||u.pathname==="/index") return sendHtml(res,indexPage(base,title));
  if(u.pathname==="/"||u.pathname==="/main"||u.pathname==="/v9"){
    const m=mainHtml(base);
    if(!m) return sendJson(res,{ok:false,error:"no html"},404);
    return sendHtml(res,inject(read(m),path.relative(base,m).replaceAll(path.sep,"/")));
  }
  const f=safe(base,u.pathname);
  if(!f||!exists(f)) return sendJson(res,{ok:false,error:"not found",path:u.pathname},404);
  if(fs.statSync(f).isDirectory()){
    const idx=path.join(f,"index.html");
    if(exists(idx)) return sendHtml(res,inject(read(idx),path.relative(base,idx).replaceAll(path.sep,"/")));
    return sendJson(res,{ok:false,error:"directory disabled"},403);
  }
  if(f.toLowerCase().endsWith(".html")) return sendHtml(res,inject(read(f),path.relative(base,f).replaceAll(path.sep,"/")));
  res.writeHead(200,{"Content-Type":mime(f),"Cache-Control":"no-store"});
  fs.createReadStream(f).pipe(res);
}

async function readBody(req){
  return new Promise(resolve=>{
    let s="";
    req.on("data",c=>s+=c);
    req.on("end",()=>{try{resolve(JSON.parse(s||"{}"))}catch{resolve({})}});
  });
}

http.createServer(async (req,res)=>{
  const host=(req.headers.host||"").split(":")[0].toLowerCase();
  const u=new URL(req.url,"http://local");
  const routeKey=routeKeyFromHost(host);

  if(u.pathname==="/favicon.ico"){res.writeHead(204);res.end();return}

  if(routeKey==="anc"){
    const ANC_MAP = {
      core: "http://core.sira",
      runtime: "http://runtime.sira",
      audit: "http://audit.sira",
      tam: "http://tam.sira",
      nauion: "http://nauion.sira",
      docs: "http://docs.sira",
      mach: "http://mach.sira/mach/heyna",
      heyna: "http://heyna.sira/mach/heyna",
      gate: "http://gate.sira",
      sira: "http://sira.sira",
      khai: "http://khai.sira",
      bridge: "http://bridge.sira"
    };

    function resolveAncUri(input){
      let raw = String(input || "").trim();
      if(!raw) return null;
      if(raw.startsWith("anc://")) raw = raw.slice("anc://".length);
      raw = raw.replace(/^\/+/, "").split(/[\/?#]/)[0].toLowerCase();
      raw = raw.replace(/\.natt$/, "");
      return ANC_MAP[raw] || null;
    }

    if(u.pathname==="/api/resolve" || u.pathname==="/resolve"){
      const uri = u.searchParams.get("uri") || u.searchParams.get("u") || "";
      const target = resolveAncUri(uri);
      return sendJson(res, {
        ok: !!target,
        uri,
        target,
        rule: "anc://<name> -> http://<name>.sira"
      }, target ? 200 : 404);
    }

    if(u.pathname.startsWith("/go/")){
      const key = decodeURIComponent(u.pathname.slice(4));
      const target = resolveAncUri(key);
      if(target){
        res.writeHead(302, {"Location": target});
        res.end();
        return;
      }
      return sendJson(res, {ok:false,error:"unknown anc uri", key}, 404);
    }

    if(u.pathname==="/" || u.pathname==="/index"){
      const rows = Object.entries(ANC_MAP).map(([k,v]) =>
        `<a style="display:block;margin:8px 0;padding:12px;border:1px solid #334155;border-radius:12px;background:#0f172a;color:#e2e8f0;text-decoration:none" href="/go/${k}">
          <b style="color:#c084fc">anc://${k}</b><br><code>${v}</code>
        </a>`
      ).join("");

      return sendHtml(res, `<!doctype html>
<html><head><meta charset="utf-8"><title>ANC Resolver</title></head>
<body style="margin:0;background:#020617;color:#e2e8f0;font-family:Inter,system-ui;padding:24px">
<h1 style="color:#c084fc">NATT-OS ANC Resolver</h1>
<p>Canonical namespace: <code>anc://</code>. HTTP remains transport.</p>
<p><a style="color:#67e8f9" href="/api/resolve?uri=anc://core">/api/resolve?uri=anc://core</a></p>
${rows}
</body></html>`);
    }

    return sendJson(res, {
      ok: true,
      host: "anc.natt",
      resolver: "ANC Resolver",
      examples: [
        "http://anc.sira/go/core",
        "http://anc.sira/go/audit",
        "http://anc.sira/api/resolve?uri=anc://nauion"
      ]
    });
  }


  if(u.pathname==="/mach/heyna"){
    res.writeHead(200,{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"no-cache","Connection":"keep-alive"});
    SSE.add(res);
    res.write("data: "+JSON.stringify({type:"mach.heyna.connected",payload:{host,at:now()}})+"\n\n");
    req.on("close",()=>SSE.delete(res));
    return;
  }

  if(u.pathname==="/api/health") return sendJson(res,{ok:true,host,root:ROOT,tam_root:TAM,nauion_root:NAUION,audit_html:AUDIT_HTML,tam_screens:TAM?htmlFiles(TAM).length:0,nauion_screens:NAUION?htmlFiles(NAUION).length:0,audit_events:AUDIT.length,time:now()});
  if(u.pathname==="/api/audit") return sendJson(res,{ok:true,total:AUDIT.length,events:AUDIT.slice(-Number(u.searchParams.get("limit")||50))});

  if(req.method==="POST" && (u.pathname==="/api/events/emit"||u.pathname==="/phat/nauion")){
    const b=await readBody(req);
    const evt={event_id:b.event_id||id("evt"),event_type:b.type||b.event_type||"domain.event",cell_id:b.cell||b.cell_id||"domain-cell",payload:b.payload||{},host,timestamp:now()};
    const row=audit({action:"event.emit",host,event_id:evt.event_id,cell_id:evt.cell_id,result:"ACCEPTED",payload_summary:evt.payload});
    for(const s of SSE){try{s.write("data: "+JSON.stringify({type:evt.event_type,payload:evt})+"\n\n")}catch{}}
    return sendJson(res,{ok:true,event:evt,audit:row});
  }

  if(routeKey==="audit"){
    if(!AUDIT_HTML) return sendJson(res,{ok:false,error:"audit html not found"},404);
    return serveBase(req,res,path.dirname(AUDIT_HTML),"NATT-OS AUDIT UI");
  }
  if(routeKey==="tam"){
    if(!TAM) return sendJson(res,{ok:false,error:"nattos-server not found"},404);
    return serveBase(req,res,TAM,"TÂM LUXURY APP");
  }
  if(["nauion","core","runtime","gate","sira","khai","bridge","mach","heyna"].includes(routeKey)){
    if(!NAUION) return sendJson(res,{ok:false,error:"NaUion-Server not found"},404);
    return serveBase(req,res,NAUION,"NATT-OS / NAUION SERVER");
  }
  if(routeKey==="docs"){
    const docs=path.join(ROOT,"docs");
    if(!exists(docs)) return sendJson(res,{ok:false,error:"docs not found"},404);
    return serveBase(req,res,docs,"NATT-OS DOCS");
  }

  return sendJson(res,{ok:true,message:"NATT Domain Gateway",host,routes:["audit.natt","tam.natt","nauion.natt","core.natt","docs.natt","mach.natt/mach/heyna"]});
}).listen(PORT,"0.0.0.0",()=>{
  audit({action:"gateway.boot",host:"127.0.0.1",result:"BOOTED",payload_summary:{PORT,TAM,NAUION,AUDIT_HTML}});
  console.log("");
  console.log("========================================================================================");
  console.log("NATT DOMAIN GATEWAY — LOCAL ROUTING");
  console.log("========================================================================================");
  console.log("ROOT       :", ROOT);
  console.log("PORT       :", PORT);
  console.log("AUDIT HTML :", AUDIT_HTML);
  console.log("TAM ROOT   :", TAM);
  console.log("NAUION ROOT:", NAUION);
  console.log("");
  console.log("OPEN:");
  console.log(`  http://audit.sira:${PORT}`);
  console.log(`  http://tam.sira:${PORT}`);
  console.log(`  http://nauion.sira:${PORT}`);
  console.log(`  http://core.sira:${PORT}`);
  console.log(`  http://docs.sira:${PORT}`);
  console.log(`  http://mach.sira:${PORT}/mach/heyna`);
  console.log("");
  console.log("Stop: Ctrl + C");
  console.log("========================================================================================");
  console.log("");
});
