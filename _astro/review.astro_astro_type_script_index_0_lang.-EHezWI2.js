import{t as e}from"./analytics.Cc9SHUse.js";import{n as t,r as n}from"./srs.DGVGs9o_.js";var r=`/learn-marathi/search-index.json`;function i(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}var a=null;async function o(){if(a)return a;a=new Map;try{let e=await fetch(r,{headers:{Accept:`application/json`}});if(!e.ok)return a;let t=await e.json();for(let e of t)e?.id?.startsWith(`word-`)&&a.set(e.id.slice(5),e)}catch{}return a}async function s(){let r=document.getElementById(`review-cards-container`),a=document.getElementById(`review-empty`),s=document.getElementById(`due-count`);if(!r||!a||!s)return;let c;try{c=await t()}catch{c=[]}let l=await o();try{e.reviewOpen(c.length)}catch{}if(s.textContent=String(c.length),c.length===0){r.innerHTML=``,a.hidden=!1;return}a.hidden=!0,r.innerHTML=c.map(e=>{let t=l.get(e.id),n=t?.title||e.id,r=t?.description||``,a=new Date(e.dueDate).toLocaleDateString(`en-IN`,{month:`short`,day:`numeric`});return`<div class="review-card" data-word-id="${i(e.id)}">
				<div class="review-word" lang="mr">${i(n)}</div>
				${r?`<div class="review-desc">${i(r)}</div>`:``}
				<div class="review-meta">
					<p>Due: <span>${i(a)}</span> · Reps: ${e.repetitions} · Ease: ${e.easeFactor.toFixed(2)}</p>
				</div>
				<div class="review-buttons" role="group" aria-label="Grade ${i(n)}">
					<button type="button" class="btn" data-grade="again">Again</button>
					<button type="button" class="btn ghost" data-grade="hard">Hard</button>
					<button type="button" class="btn ghost" data-grade="good">Good</button>
					<button type="button" class="btn ghost" data-grade="easy">Easy</button>
				</div>
			</div>`}).join(``),r.querySelectorAll(`.review-card`).forEach(t=>{let i=t.dataset.wordId;i&&t.querySelectorAll(`[data-grade]`).forEach(o=>{o.addEventListener(`click`,async()=>{let c=o.dataset.grade;try{await n(i,c),e.reviewGrade(i,c)}catch{}t.querySelectorAll(`button`).forEach(e=>{e.disabled=!0}),t.style.transition=`opacity 0.3s ease`,t.style.opacity=`0.2`,window.setTimeout(()=>{t.remove();let e=r.querySelectorAll(`.review-card`).length;s.textContent=String(e),e===0&&(a.hidden=!1)},300)})})})}function c(){if(window.__reviewInit){s();return}window.__reviewInit=!0,s()}c(),document.addEventListener(`astro:page-load`,()=>{s()});