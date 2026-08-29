(() => {
  "use strict";
  const internal = (() => { try { return document.referrer && new URL(document.referrer).origin === location.origin; } catch (error) { return false; } })();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  async function loadJson(url, fallback) { try { const response=await fetch(url,{cache:"no-store"}); if(!response.ok)throw new Error(); return await response.json(); } catch(error){return fallback;} }
  function eligible(settings) { if (!settings.introEnabled || internal || reduced || settings.replayMode === "never") return false; if(settings.replayMode === "always")return true; const key=settings.replayMode === "hours"?"emx_intro_last":"emx_intro_session"; const storage=settings.replayMode === "hours"?localStorage:sessionStorage; const last=Number(storage.getItem(key)||0); return !last || (settings.replayMode === "hours" && Date.now()-last>settings.replayHours*3600000); }
  function remember(settings) { try { (settings.replayMode === "hours" ? localStorage : sessionStorage).setItem(settings.replayMode === "hours" ? "emx_intro_last" : "emx_intro_session", String(Date.now())); } catch(error){} }
  function image(product) { return product.previewSrc || product.image || "emx-logo-v2.png"; }
  async function run() {
    const [settingsResponse,catalogResponse]=await Promise.all([loadJson("/api/site-settings",{settings:{introEnabled:true,introDurationMs:7600,replayMode:"session",replayHours:24,allowSkip:true,tagline:"ENGINEERED FOR YOUR SETUP",animationIntensity:"balanced"}}),loadJson("/api/products",window.EMX_PRODUCTS||[])]);
    const settings=settingsResponse.settings||settingsResponse;
    if(!eligible(settings))return;
    const products=(Array.isArray(catalogResponse)?catalogResponse:[]).filter(item=>item.visible!==false&&item.publishStatus!=="draft"&&item.publishStatus!=="archived"&&item.showInIntro!==false).sort((a,b)=>Number(a.introOrder||99)-Number(b.introOrder||99)).slice(0,5);
    if(!products.length)return;
    remember(settings);
    const intro=document.createElement("div");intro.className=`emx-cinematic intensity-${settings.animationIntensity||"balanced"}`;intro.setAttribute("role","dialog");intro.setAttribute("aria-label","EMX product introduction");
    intro.innerHTML=`<div class="cinematic-grid"></div><button class="cinematic-skip" type="button" ${settings.allowSkip===false?"hidden":""}>Skip intro</button><div class="cinematic-brand"><img src="emx-logo-v2.png" alt=""><span>EMX TWEAKS</span><small>${String(settings.tagline||"").replace(/[<>]/g,"")}</small></div><div class="cinematic-products">${products.map((product,index)=>`<article style="--i:${index}"><img src="${String(image(product)).replace(/[\"<>]/g,"")}" alt=""><div><span>${String(product.category||product.eyebrow||"EMX SOFTWARE").replace(/[<>]/g,"")}</span><strong>${String(product.title||"EMX Product").replace(/[<>]/g,"")}</strong><small>${Number(product.price||0)===0?"FREE":new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(product.price))}</small></div></article>`).join("")}</div><div class="cinematic-finale"><img src="emx-logo-v2.png" alt=""><strong>BUILD YOUR EMX SETUP</strong><span>Real software. Clear requirements. Direct support.</span></div><div class="cinematic-progress"><i></i></div>`;
    document.body.appendChild(intro);document.documentElement.classList.add("intro-active");requestAnimationFrame(()=>intro.classList.add("play"));
    let finished=false;const finish=()=>{if(finished)return;finished=true;intro.classList.add("exit");document.documentElement.classList.remove("intro-active");setTimeout(()=>intro.remove(),650)};intro.querySelector("button").onclick=finish;setTimeout(finish,Number(settings.introDurationMs||7600));
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();
