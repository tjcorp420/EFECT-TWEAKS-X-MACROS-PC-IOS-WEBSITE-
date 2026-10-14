const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'store-entry-intro.js'), 'utf8');
function harness(options = {}) {
  const nodes = {};
  for (const id of ['store-entry-intro', 'store-intro-video', 'store-intro-skip', 'store-intro-play', 'store-intro-sound', 'main', 'header']) {
    nodes[id] = {hidden:true, inert:false, muted:true, events:{}, attributes:{}, addEventListener(k, f){this.events[k]=f;}, setAttribute(k,v){this.attributes[k]=v;}, focus(){}, contains(){return false;}, querySelector(){return null;}, pause(){}, play(){return options.reject ? Promise.reject(new Error('autoplay')) : Promise.resolve();}};
  }
  let timeout;
  vm.runInNewContext(source, {
    document: {getElementById:id=>nodes[id], querySelector:s=>nodes[s==='main'?'main':'header'], referrer:options.internal?'https://emxtweaks.com/products.html':'', activeElement:null, body:{}, documentElement:{classList:{add(){},remove(){}}}},
    location:{origin:'https://emxtweaks.com',hash:options.hash||'',search:options.search||''},
    matchMedia:()=>({matches:!!options.reduced}), URL, URLSearchParams,
    setTimeout:f=>{timeout=f;return 1;},clearTimeout(){},
  });
  return {nodes, timeout};
}
test('direct entrance plays muted and completion restores the shop',()=>{
  const {nodes}=harness({search:'?entry=bio'});
  assert.equal(nodes['store-entry-intro'].hidden,false);
  assert.equal(nodes['store-intro-video'].muted,true);
  assert.equal(nodes.main.inert,true);
  nodes['store-intro-video'].events.ended();
  assert.equal(nodes.main.inert,false);
  assert.equal(nodes['store-entry-intro'].hidden,true);
});
test('skip, video errors and stalled loading all release the store',()=>{
  for(const action of ['skip','error','timeout']){
    const h=harness({search:'?entry=bio'});
    if(action==='skip') h.nodes['store-intro-skip'].events.click();
    else if(action==='error') h.nodes['store-intro-video'].events.error();
    else h.timeout();
    assert.equal(h.nodes.main.inert,false);
    assert.equal(h.nodes['store-entry-intro'].hidden,true);
  }
});
test('only the bio entry or explicit preview opens the intro',()=>{
  for(const options of [{},{search:'?entry=bio',internal:true},{search:'?entry=bio',hash:'#emx-hub'},{search:'?entry=bio',reduced:true},{search:'?entry=bio&free=1'}]) assert.equal(harness(options).nodes['store-entry-intro'].hidden,true);
  assert.equal(harness({search:'?entry=bio'}).nodes['store-entry-intro'].hidden,false);
  assert.equal(harness({search:'?intro=1',internal:true}).nodes['store-entry-intro'].hidden,false);
});
test('blocked autoplay exposes play and retains skip recovery',async()=>{
  const {nodes}=harness({search:'?entry=bio',reject:true});
  await Promise.resolve();
  assert.equal(nodes['store-intro-play'].hidden,false);
  nodes['store-intro-skip'].events.click();
  assert.equal(nodes.main.inert,false);
});
test('sound control starts muted and allows user initiated audio',()=>{
  const {nodes}=harness({search:'?entry=bio'});
  assert.equal(nodes['store-intro-video'].muted,true);
  nodes['store-intro-sound'].events.click();
  assert.equal(nodes['store-intro-video'].muted,false);
  assert.equal(nodes['store-intro-sound'].attributes['aria-pressed'],'true');
});
