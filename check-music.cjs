const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/dist/index.html','utf8');const code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
async function run(reject=false){let a;const events={},messages=[],span={},small={};const frame={contentWindow:{postMessage:s=>messages.push(s)},addEventListener(){}};const checkpoint={classList:{toggle(){}},querySelector:s=>s==='span'?span:small,setAttribute(){}};
class Audio{constructor(){a=this;this.paused=true;this.currentTime=0;this.duration=190;this.handlers={};this.attempts=0}addEventListener(n,f){this.handlers[n]=f}async play(){this.attempts++;if(reject){const e=new Error();e.name='NotAllowedError';throw e}this.paused=false;this.handlers.play?.()}pause(){this.paused=true;this.handlers.pause?.()}}
const document={querySelector:s=>s.includes('iframe')?frame:checkpoint,addEventListener(){}};vm.runInNewContext(code,{Audio,document,location:{origin:'https://test'},window:{addEventListener:(n,f)=>events[n]=f}});
events['ttspot-music-checkpoint']();await new Promise(r=>setImmediate(r));assert.equal(a.attempts,1);
if(reject){assert.equal(messages.at(-1).blocked,true);assert.equal(small.textContent,'TAP TO PLAY');return}
assert.equal(messages.at(-1).playing,true);events['ttspot-music-toggle']();assert.equal(a.paused,true);events['ttspot-music-checkpoint']();assert.equal(a.attempts,1);
const send=(action,value)=>events.message({origin:'https://test',source:frame.contentWindow,data:{type:'ttspot-audio-command',action,value}});send('seek',44);assert.equal(a.currentTime,44);send('toggle');await new Promise(r=>setImmediate(r));assert.equal(a.paused,false);send('restart');assert.equal(a.currentTime,0);
events.message({origin:'https://evil',source:frame.contentWindow,data:{type:'ttspot-audio-command',action:'seek',value:90}});assert.equal(a.currentTime,0);
}
(async()=>{await run();await run(true);assert(!fs.readFileSync(__dirname+'/dist/carplay.html','utf8').includes('createOscillator'));assert(html.includes(fs.readFileSync(__dirname+'/dist/continuous-highway.js','utf8')));console.log('PASS: checkpoint playback, pause intent, seek, restart, blocked-autoplay fallback, origin guard, inline road synchronization');})();
