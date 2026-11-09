let d=null;function p(){const e=localStorage.getItem("de_agent_user");e?(d=JSON.parse(e),m()):u()}function u(){const e=document.getElementById("dashboard-content");e&&(e.innerHTML=`
        <div class="card card-pad mount text-center py-12">
          <h2 class="text-xl mb-2">Welcome to Your Dashboard</h2>
          <p class="text-muted mb-4">Sign in to track your installed artifacts, ratings, reviews, and roadmap progress.</p>
          <button id="dashboard-signin-main" class="btn btn-accent">Sign In with GitHub</button>
        </div>
      `,document.getElementById("dashboard-signin-main")?.addEventListener("click",l),document.getElementById("dashboard-signin")?.addEventListener("click",l),b())}function l(){d={id:"user_"+Date.now(),login:"dataengineer123",name:"Data Engineer",avatar_url:"https://github.com/identicons/dataengineer123.png"},localStorage.setItem("de_agent_user",JSON.stringify(d)),m()}function v(){d=null,localStorage.removeItem("de_agent_user"),u()}function b(){document.getElementById("user-profile").innerHTML=`
        <div class="text-sm text-muted">Sign in to view your dashboard</div>
        <button id="dashboard-signin" class="btn btn-accent w-full">Sign In with GitHub</button>
      `,document.getElementById("dashboard-signin")?.addEventListener("click",l),document.getElementById("stats-card").style.display="none",document.getElementById("roadmap-progress-card").style.display="none"}async function m(){d&&(document.getElementById("user-profile").innerHTML=`
        <div class="flex items-center gap-3">
          <img src="${d.avatar_url}" alt="" class="w-10 h-10 rounded-full" />
          <div>
            <strong>${d.name??d.login}</strong>
            <div class="text-sm text-muted">@${d.login}</div>
          </div>
        </div>
        <button id="signout-btn" class="btn btn-ghost w-full text-left mt-2">Sign Out</button>
      `,document.getElementById("signout-btn")?.addEventListener("click",v),document.getElementById("stats-card").style.display="block",document.getElementById("roadmap-progress-card").style.display="block",await f())}async function f(){try{const t=await(await fetch("/de-agent/api/marketplace/user/installs?user_id="+d.id)).json(),n=await(await fetch("/de-agent/api/marketplace/user/ratings?user_id="+d.id)).json(),i=`
          <div><dt class="text-muted">Installs</dt><dd class="font-mono">${t.total??0}</dd></div>
          <div><dt class="text-muted">Ratings Given</dt><dd class="font-mono">${n.total??0}</dd></div>
          <div><dt class="text-muted">Resources Rated</dt><dd class="font-mono">${n.uniqueResources??0}</dd></div>
        `;document.getElementById("user-stats").innerHTML=i,await y(t.attempts??[]),h(t,n)}catch(e){console.error("Failed to load user data:",e)}}async function y(e){const a=e.map(s=>s.resource_id).map(s=>registry.resources.find(c=>c.id===s)).filter(Boolean),n=[...new Set(a.map(s=>s.stage).filter(Boolean))],i=registry.taxonomy.stages;let r="";for(const s of i){const c=n.includes(s.id),g=a.filter(o=>o.stage===s.id);r+=`
          <div class="flex items-center gap-3 p-2 ${c?"bg-accent/10":""} rounded">
            <span class="chip ${c?"chip-accent":"chip-dim"} text-xs">
              ${c?"✓":s.order}
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">${s.title}</div>
              <div class="text-2xs text-muted">${g.length} of ${registry.resources.filter(o=>o.stage===s.id).length} resources installed</div>
            </div>
          </div>
        `}document.getElementById("roadmap-progress").innerHTML=r}function h(e,t){const a=document.getElementById("dashboard-content");if(!a)return;const n=e.attempts??[],i=t.ratings??[];a.innerHTML=`
        <div class="space-y-6">
          <div class="flex gap-2 border-b border-line" role="tablist">
            <button role="tab" class="tab-btn active" data-tab="installs">My Installs (${n.length})</button>
            <button role="tab" class="tab-btn" data-tab="ratings">My Ratings (${i.length})</button>
            <button role="tab" class="tab-btn" data-tab="roadmap">Roadmap Progress</button>
          </div>

          <div role="tabpanel" id="tab-installs" class="tab-panel">
            ${x(n)}
          </div>
          <div role="tabpanel" id="tab-ratings" class="tab-panel hidden">
            ${$(i)}
          </div>
          <div role="tabpanel" id="tab-roadmap" class="tab-panel hidden">
            ${w()}
          </div>
        </div>
      `,document.querySelectorAll(".tab-btn").forEach(r=>{r.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(s=>s.classList.remove("active")),r.classList.add("active"),document.querySelectorAll(".tab-panel").forEach(s=>s.classList.add("hidden")),document.getElementById("tab-"+r.dataset.tab).classList.remove("hidden")})})}function x(e){return e.length===0?'<p class="text-muted text-center py-8">No installs yet. Browse the <a href="/de-agent/marketplace" class="link">Marketplace</a> to get started.</p>':`
        <div class="space-y-3">
          ${e.map(t=>{const a=registry.resources.find(n=>n.id===t.resource_id);return`
              <div class="card card-pad mount flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="chip">${a?.typeLabel??"Resource"}</span>
                  <div class="min-w-0">
                    <a href="${a?.url??"#"}" class="link font-medium truncate block">${a?.title??t.resource_id}</a>
                    <div class="text-sm text-muted">${t.backend} · ${t.success?"Success":"Failed"} · ${t.duration_ms}ms</div>
                  </div>
                </div>
                <div class="text-sm text-muted whitespace-nowrap">${new Date(t.requested_at).toLocaleDateString()}</div>
              </div>
            `}).join("")}
        </div>
      `}function $(e){return e.length===0?'<p class="text-muted text-center py-8">No ratings yet. Rate resources after installing them.</p>':`
        <div class="space-y-3">
          ${e.map(t=>{const a=registry.resources.find(i=>i.id===t.resource_id),n="★".repeat(t.rating)+"☆".repeat(5-t.rating);return`
              <div class="card card-pad mount">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="chip">${a?.typeLabel??"Resource"}</span>
                      <a href="${a?.url??"#"}" class="link font-medium">${a?.title??t.resource_id}</a>
                    </div>
                    <div class="text-lg text-accent">${n}</div>
                    ${t.review_text?`<p class="text-sm mt-2">${t.review_text}</p>`:""}
                    <div class="text-2xs text-muted mt-1">Verified install: ${t.is_verified_install?"Yes":"No"}</div>
                  </div>
                  <div class="text-sm text-muted whitespace-nowrap">${new Date(t.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            `}).join("")}
        </div>
      `}function w(){return document.getElementById("roadmap-progress")?.innerHTML??""}p();
