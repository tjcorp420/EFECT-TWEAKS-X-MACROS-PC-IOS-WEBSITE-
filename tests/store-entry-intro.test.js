const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'store-entry-intro.js'), 'utf8');
function harness(options = {}) {
  const nodes = {};
  for (const id of ['store-entry-intro', 'store-intro-video', 'store-intro-skip', 'store-intro-play', 'main', 'header']) {
    nodes[id] = {hidden:true, inert:false, events:{}, addEventListener(k, f){this.events[k]=f;}, focus(){}, contains(){return false;}, querySelector(){return null;}, pause(){}, play(){return options.reject ? Promise.reject(new Error('autoplay')) : Promise.resolve();}};
  }
  let timeout;
  vm.runInNewContext(source, {
    document: {getElementById:id=>nodes[id], querySelector:s=>nodes[s==='main'?'main':'header'], referrer:options.internal?'https://emxtweaks.com/products.html':'', documentElement:{classList:{add(){},remove(){}}}},
    location:{origin:'https://emxtweaks.com',hash:options.hash||'',search:''},
    performance:{getEntriesByType:()=>[{type:options.reload?'reload':'navigate'}]},
    matchMedia:()=>({matches:!!options.reduced}), URL, URLSearchParams,
    setTimeout:f=>{timeout=f;return 1;},clearTimeout(){},
  });
  return {nodes, timeout};
}
test('direct entrance plays muted and completion restores the shop',()=>{
  const {nodes}=harness();
  assert.equal(nodes['store-entry-intro'].hidden,false);
  assert.equal(nodes['store-intro-video'].muted,true);
  assert.equal(nodes.main.inert,true);
  nodes['store-intro-video'].events.ended();
  assert.equal(nodes.main.inert,false);
  assert.equal(nodes['store-entry-intro'].hidden,true);
});
test('skip, video errors and stalled loading all release the store',()=>{
  for(const action of ['skip','error','timeout']){
    const h=harness();
    if(action==='skip') h.nodes['store-intro-skip'].events.click();
    else if(action==='error') h.nodes['store-intro-video'].events.error();
    else h.timeout();
    assert.equal(h.nodes.main.inert,false);
    assert.equal(h.nodes['store-entry-intro'].hidden,true);
  }
});
test('internal navigation, anchor destinations and reduced motion skip entrance; reload replays',()=>{
  for(const options of [{internal:true},{hash:'#emx-hub'},{reduced:true}]) assert.equal(harness(options).nodes['store-entry-intro'].hidden,true);
  assert.equal(harness({internal:true,reload:true}).nodes['store-entry-intro'].hidden,false);
});
test('blocked autoplay exposes play and retains skip recovery',async()=>{
  const {nodes}=harness({reject:true});
  await Promise.resolve();
  assert.equal(nodes['store-intro-play'].hidden,false);
  nodes['store-intro-skip'].events.click();
  assert.equal(nodes.main.inert,false);
});
