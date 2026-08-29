const test = require("node:test");
const assert = require("node:assert/strict");
const analytics = require("../api/_lib/affiliate-analytics");

function memoryDb(seed = {}) {
  const root = structuredClone(seed);
  const parts = path => String(path || "").split("/").filter(Boolean);
  const get = path => parts(path).reduce((value,key)=>value?.[key],root);
  const put = (path,value) => { const keys=parts(path); let node=root; keys.slice(0,-1).forEach(key=>node=node[key]||(node[key]={})); if(!keys.length){Object.keys(root).forEach(key=>delete root[key]);Object.assign(root,value||{});} else if(value===null)delete node[keys.at(-1)];else node[keys.at(-1)]=structuredClone(value); };
  const snap = (value,key="") => ({ key, val:()=>structuredClone(value), exists:()=>value!==undefined&&value!==null, forEach:callback=>{Object.entries(value||{}).forEach(([childKey,child])=>callback(snap(child,childKey)));} });
  const ref = path => ({ child: child => ref(`${path}/${child}`), once: async()=>snap(get(path),parts(path).at(-1)), set: async value=>put(path,value), update: async updates=>{if(path){const current=get(path)||{};put(path,{...current,...updates});}else Object.entries(updates).forEach(([key,value])=>put(key,value));}, transaction: async callback=>{const current=get(path),next=callback(structuredClone(current));if(next===undefined)return{committed:false,snapshot:snap(current)};put(path,next);return{committed:true,snapshot:snap(next)};}, orderByChild(){return this;},equalTo(){return this;},limitToLast(){return this;} });
  return { ref, root };
}

test("free downloads are idempotent real conversions with zero revenue", async () => {
  const db=memoryDb({affiliateProgram:{indexByCode:{tester:"aff-1"},affiliates:{"aff-1":{id:"aff-1",code:"tester",status:"active",rateBps:2000,stats:{}}}}});
  const input={code:"tester",visitorId:"visitor-123456789",sessionId:"session-123456789",productId:"window_deck"};
  const first=await analytics.recordFreeDownloadConversion(db,input),duplicate=await analytics.recordFreeDownloadConversion(db,input);
  assert.equal(first.tracked,true);assert.equal(first.conversion.type,"free_download");assert.equal(first.conversion.grossCents,0);assert.equal(first.conversion.commissionCents,0);assert.equal(duplicate.duplicate,true);assert.equal(db.root.affiliateProgram.affiliates["aff-1"].stats.conversions,1);assert.equal(db.root.affiliateProgram.affiliates["aff-1"].stats.freeConversions,1);
});

test("suspended affiliates cannot receive event or download attribution", async () => {
  const db=memoryDb({affiliateProgram:{indexByCode:{stopped:"aff-2"},affiliates:{"aff-2":{id:"aff-2",code:"stopped",status:"suspended",stats:{}}}}});
  const input={code:"stopped",visitorId:"visitor-123456789",productId:"window_deck"};
  assert.equal((await analytics.recordAffiliateEvent(db,{...input,type:"referral_click"})).tracked,false);assert.equal((await analytics.recordFreeDownloadConversion(db,input)).tracked,false);
});

test("product views are daily deduplicated per visitor and product", async () => {
  const db=memoryDb({affiliateProgram:{indexByCode:{tester:"aff-1"},affiliates:{"aff-1":{id:"aff-1",code:"tester",status:"active",stats:{}}}}});
  const input={type:"product_view",code:"tester",visitorId:"visitor-123456789",productId:"volt"};
  assert.equal((await analytics.recordAffiliateEvent(db,input)).tracked,true);assert.equal((await analytics.recordAffiliateEvent(db,input)).duplicate,true);assert.equal(db.root.affiliateProgram.affiliates["aff-1"].stats.productViews,1);
});
