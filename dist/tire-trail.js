/* Lightweight twin tire tracks. No pointer interception or idle animation. */
(()=>{
 const fine=matchMedia('(hover: hover) and (pointer: fine)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const tablet=!!document.querySelector('.device'),regions=document.querySelector('#regions'),journey=document.querySelector('.road-journey'),spacing=8,limit=160;let lifetime=tablet?130:650,regionBox=null;
 let canvas,ctx,frame=0,last=null,marks=[],width=0,height=0,zone=null;
 function clear(){last=null;marks=[];cancelAnimationFrame(frame);frame=0;if(ctx)ctx.clearRect(0,0,width,height);}
 function resize(){if(!canvas)return;clear();width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
 function create(){if(canvas)return;canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');canvas.className='tt-tire-trail';canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90;contain:strict;';ctx=canvas.getContext('2d');if(!ctx){canvas=null;return;}document.body.append(canvas);resize();}
 function draw(now){frame=0;ctx.clearRect(0,0,width,height);marks=marks.filter(mark=>now-mark.time<lifetime+(mark.smoke?300:0));
  for(const mark of marks){const age=now-mark.time;const alpha=.42*Math.pow(Math.max(0,1-age/lifetime),1.5);ctx.save();ctx.translate(mark.x,mark.y);ctx.rotate(mark.angle);ctx.globalAlpha=alpha;
   for(const offset of [-14,14]){
    ctx.fillStyle='#ee0029';ctx.fillRect(-4,offset-4,8,8);
    ctx.strokeStyle='#000';ctx.lineWidth=.85;ctx.beginPath();
    // Twin longitudinal grooves and swept shoulder cuts, like a tire tread.
    for(const side of [-1,1]){ctx.moveTo(-4,offset+side);ctx.lineTo(4,offset+side);ctx.moveTo(-3,offset+side*4);ctx.lineTo(-1,offset+side*1.5);ctx.moveTo(1,offset+side*4);ctx.lineTo(3,offset+side*1.5);}
    ctx.stroke();
   }
   ctx.restore();
   if(mark.smoke&&age>lifetime*.45){const progress=(age-lifetime*.45)/(lifetime*.55+300),radius=4+progress*13;ctx.save();ctx.globalAlpha=.13*Math.sin(Math.PI*progress);const puff=ctx.createRadialGradient(mark.x,mark.y-progress*12,0,mark.x,mark.y-progress*12,radius);puff.addColorStop(0,'rgba(210,210,210,.7)');puff.addColorStop(1,'rgba(160,160,160,0)');ctx.fillStyle=puff;ctx.fillRect(mark.x-radius,mark.y-progress*12-radius,radius*2,radius*2);ctx.restore();}
  }
  if(regionBox)ctx.clearRect(regionBox.left,regionBox.top,regionBox.width,regionBox.height);
  if(marks.length)frame=requestAnimationFrame(draw);
 }
 function move(event){regionBox=null;if(regions){const r=regions.getBoundingClientRect(),bottom=Math.min(r.bottom,journey?journey.getBoundingClientRect().top:r.bottom,innerHeight),top=Math.max(0,r.top);if(bottom>top)regionBox={left:r.left,top,width:r.width,height:bottom-top};}const nextZone=event.target?.closest?.('#regions')?'regions':tablet||event.target?.closest?.('#live-map')?'map':'page';if(nextZone!==zone){clear();zone=nextZone;lifetime=zone==='map'?130:650;}if(zone==='regions'){clear();return;}if(!fine.matches||reduced.matches||event.pointerType!=='mouse')return;create();if(!ctx)return;const now=performance.now(),point={x:event.clientX,y:event.clientY,time:now};
  if(!last||now-last.time>160){last=point;return;}
  const dx=point.x-last.x,dy=point.y-last.y,distance=Math.hypot(dx,dy);if(distance>180){last=point;return;}if(distance<spacing)return;
  const angle=Math.atan2(dy,dx),count=Math.floor(distance/spacing);
  for(let i=1;i<=count;i++)marks.push({x:last.x+dx*i*spacing/distance,y:last.y+dy*i*spacing/distance,angle,time:now,smoke:zone==='page'&&i%3===0});
  last={x:last.x+dx*count*spacing/distance,y:last.y+dy*count*spacing/distance,time:now};if(marks.length>limit)marks.splice(0,marks.length-limit);if(!frame)frame=requestAnimationFrame(draw);
 }
 document.addEventListener('pointermove',move,{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{last=null;},{passive:true});
 window.addEventListener('blur',clear);window.addEventListener('resize',resize,{passive:true});window.addEventListener('scroll',clear,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 for(const preference of [fine,reduced])preference.addEventListener('change',()=>{clear();if(canvas){canvas.remove();canvas=null;ctx=null;}});
})();
