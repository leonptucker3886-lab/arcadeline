const cv=document.getElementById('cv'),cx=cv.getContext('2d'),W=360,H=480;
const K={left:0,right:0,up:0,down:0,fire:0},PK={};let loop=null,G=null;
const KM={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',' ':'fire'};
addEventListener('keydown',e=>{const k=KM[e.key];if(k&&G){if(!K[k])PK[k]=1;K[k]=1;e.preventDefault()}});
addEventListener('keyup',e=>{const k=KM[e.key];if(k)K[k]=0});
document.querySelectorAll('#pad button').forEach(b=>{const k=b.dataset.k;
 b.addEventListener('pointerdown',e=>{e.preventDefault();K[k]=1;PK[k]=1});['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>K[k]=0))});
let tx=null,ty=null,drag=null;cv.style.touchAction='none';
cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();tx=e.clientX;ty=e.clientY;drag=(e.clientX-r.left)*W/r.width});
cv.addEventListener('pointermove',e=>{if(tx==null)return;const r=cv.getBoundingClientRect();drag=(e.clientX-r.left)*W/r.width});
cv.addEventListener('pointerup',e=>{if(tx==null)return;const dx=e.clientX-tx,dy=e.clientY-ty;
 if(Math.max(Math.abs(dx),Math.abs(dy))>25){const k=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');PK[k]=1}else PK.fire=1;tx=null;drag=null});
const take=k=>{const v=PK[k];PK[k]=0;return v};
const rnd=(a,b)=>a+Math.random()*(b-a);
function txt(s,x,y,c='#EDEDF5',sz=16){cx.fillStyle=c;cx.font=`bold ${sz}px system-ui`;cx.textAlign='center';cx.fillText(s,x,y)}
function clear(){cx.fillStyle='#0B0B14';cx.fillRect(0,0,W,H)}
function setScore(s){document.getElementById('score').textContent=s}
function stopGame(){if(loop)cancelAnimationFrame(loop);loop=null;G=null}
function gameErr(e){stopGame();const o=document.getElementById('overlay');if(o){o.hidden=false;o.innerHTML='<p>Game failed to start.</p><small>'+String(e&&e.message||e)+'</small><button onclick="location.reload()">Reload</button>'}}
function startGame(id,over){stopGame();for(const k in PK)PK[k]=0;if(!MAKERS[id])return gameErr('Missing game '+id+' (old cached files). Reload the page.');let g;try{g=MAKERS[id]()}catch(e){return gameErr(e)}G=g;const t0=performance.now();let last=t0;
 const end=()=>{const s=g.score;stopGame();over(s,(performance.now()-t0)/1000)};
 const f=now=>{try{fr(now)}catch(e){gameErr(e)}};const fr=now=>{if(G!==g)return;const dt=Math.min(.05,(now-last)/1000);last=now;g.step(dt,end);if(G!==g)return;clear();g.draw();setScore(g.score);loop=requestAnimationFrame(f)};
 loop=requestAnimationFrame(f)}
const MAKERS={};
MAKERS.snake=()=>{const N=18,C=W/N,R=Math.floor(H/C);let s=[{x:9,y:13},{x:9,y:14},{x:9,y:15}],d={x:0,y:-1},q=[],food=null,acc=0,spd=.14;
 const place=()=>{do food={x:Math.floor(rnd(0,N)),y:Math.floor(rnd(0,R))};while(s.some(p=>p.x===food.x&&p.y===food.y))};place();
 return{score:0,step(dt,end){for(const[k,v]of[['left',{x:-1,y:0}],['right',{x:1,y:0}],['up',{x:0,y:-1}],['down',{x:0,y:1}]])if(take(k))q.push(v);
  acc+=dt;if(acc<spd)return;acc=0;while(q.length){const v=q.shift();if(v.x!==-d.x||v.y!==-d.y){d=v;break}}
  const h={x:s[0].x+d.x,y:s[0].y+d.y};
  if(h.x<0||h.y<0||h.x>=N||h.y>=R||s.some(p=>p.x===h.x&&p.y===h.y))return end();s.unshift(h);
  if(h.x===food.x&&h.y===food.y){this.score+=10;spd=Math.max(.07,spd-.004);place()}else s.pop()},
  draw(){cx.strokeStyle='#2A2A44';cx.strokeRect(0,0,N*C,R*C);cx.fillStyle='#FF3DCB';cx.beginPath();cx.arc(food.x*C+C/2,food.y*C+C/2,C/3,0,7);cx.fill();
   s.forEach((p,i)=>{cx.fillStyle=i?'#3DF5FF':'#fff';cx.fillRect(p.x*C+1,p.y*C+1,C-2,C-2)})}}};
MAKERS.bricks=()=>{const cols=8,bw=W/cols;let bricks,lvl=1,px=W/2,pw=70,b,stuck=true,lives=3;
 const build=()=>{bricks=[];for(let r=0;r<5+Math.min(lvl,3);r++)for(let c=0;c<cols;c++)bricks.push({x:c*bw,y:50+r*18,r})};
 const reset=()=>{b={x:px,y:H-40,vx:0,vy:0};stuck=true};build();reset();
 return{score:0,step(dt,end){if(drag!=null)px=drag;px+=(K.right-K.left)*380*dt;px=Math.max(pw/2,Math.min(W-pw/2,px));
  if(stuck){b.x=px;b.y=H-40;if(take('fire')||take('up')){const sp=260+lvl*25;b.vx=rnd(-.5,.5)*sp;b.vy=-sp;stuck=false}return}
  b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<6||b.x>W-6){b.vx*=-1;b.x=Math.max(6,Math.min(W-6,b.x))}if(b.y<6)b.vy=Math.abs(b.vy);
  if(b.vy>0&&b.y>H-36&&b.y<H-22&&Math.abs(b.x-px)<pw/2+6){const sp=Math.hypot(b.vx,b.vy),a=(b.x-px)/(pw/2)*1.1;b.vx=sp*Math.sin(a);b.vy=-sp*Math.cos(a)}
  if(b.y>H){if(--lives<=0)return end();reset()}
  for(let i=0;i<bricks.length;i++){const k=bricks[i];if(b.x>k.x&&b.x<k.x+bw&&b.y>k.y-4&&b.y<k.y+22){bricks.splice(i,1);b.vy*=-1;this.score+=10;break}}
  if(!bricks.length){lvl++;this.score+=50;build();reset()}},
  draw(){const cl=['#FF3DCB','#C04DFF','#7B6CFF','#3DA8FF','#3DF5FF','#3DFFB0','#FFE03D','#FF8A3D'];bricks.forEach(k=>{cx.fillStyle=cl[k.r%8];cx.fillRect(k.x+2,k.y+2,bw-4,14)});
   cx.fillStyle='#fff';cx.fillRect(px-pw/2,H-30,pw,8);cx.beginPath();cx.arc(b.x,b.y,6,0,7);cx.fill();
   txt('♥'.repeat(lives),34,26,'#FF3DCB');txt('L'+lvl,W-24,26,'#9A9AB5');if(stuck)txt('Tap / space to launch',W/2,H/2+40,'#9A9AB5')}}};
MAKERS.rocks=()=>{let s={x:W/2,y:H/2,a:-Math.PI/2,vx:0,vy:0,inv:2},shots=[],rocks=[],cool=0,lives=3,wave=0;
 const spawn=()=>{wave++;for(let i=0;i<2+wave;i++){let x,y;do{x=rnd(0,W);y=rnd(0,H)}while(Math.hypot(x-s.x,y-s.y)<130);const a=rnd(0,7),v=rnd(30,55+wave*8);rocks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:34,sh:Array.from({length:9},()=>rnd(.75,1.15))})}};spawn();
 const wrap=o=>{o.x=(o.x+W)%W;o.y=(o.y+H)%H};
 return{score:0,step(dt,end){s.a+=(K.right-K.left)*4.2*dt;PK.left=PK.right=PK.up=0;
  if(K.up){s.vx+=Math.cos(s.a)*220*dt;s.vy+=Math.sin(s.a)*220*dt}s.vx*=.992;s.vy*=.992;s.x+=s.vx*dt;s.y+=s.vy*dt;wrap(s);s.inv-=dt;cool-=dt;
  if((K.fire||PK.fire)&&cool<=0){shots.push({x:s.x,y:s.y,vx:Math.cos(s.a)*420+s.vx,vy:Math.sin(s.a)*420+s.vy,t:.85});cool=.22;PK.fire=0}
  shots.forEach(o=>{o.x+=o.vx*dt;o.y+=o.vy*dt;o.t-=dt;wrap(o)});rocks.forEach(o=>{o.x+=o.vx*dt;o.y+=o.vy*dt;wrap(o)});
  for(const o of shots)for(let i=0;i<rocks.length;i++){const r=rocks[i];if(o.t>0&&Math.hypot(o.x-r.x,o.y-r.y)<r.r){o.t=0;rocks.splice(i,1);this.score+=r.r>30?20:r.r>15?50:100;
   if(r.r>12)for(let j=0;j<2;j++){const a=rnd(0,7),v=rnd(50,110);rocks.push({x:r.x,y:r.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:r.r/2,sh:r.sh})}break}}
  shots=shots.filter(o=>o.t>0);
  if(s.inv<=0)for(const r of rocks)if(Math.hypot(s.x-r.x,s.y-r.y)<r.r+8){if(--lives<=0)return end();s={x:W/2,y:H/2,a:-Math.PI/2,vx:0,vy:0,inv:2.5};break}
  if(!rocks.length)spawn()},
  draw(){cx.strokeStyle='#9A9AB5';cx.lineWidth=2;rocks.forEach(r=>{cx.beginPath();r.sh.forEach((m,i)=>{const a=i/9*6.283;cx.lineTo(r.x+Math.cos(a)*r.r*m,r.y+Math.sin(a)*r.r*m)});cx.closePath();cx.stroke()});
   cx.fillStyle='#3DF5FF';shots.forEach(o=>cx.fillRect(o.x-2,o.y-2,4,4));
   if(s.inv<=0||Math.floor(s.inv*8)%2){cx.save();cx.translate(s.x,s.y);cx.rotate(s.a);cx.strokeStyle='#FF3DCB';cx.beginPath();cx.moveTo(14,0);cx.lineTo(-10,-9);cx.lineTo(-6,0);cx.lineTo(-10,9);cx.closePath();cx.stroke();cx.restore()}
   txt('♥'.repeat(lives),34,26,'#FF3DCB');txt('W'+wave,W-24,26,'#9A9AB5')}}};
MAKERS.invaders=()=>{let px=W/2,shots=[],bombs=[],al=[],dir=1,spd=30,cool=0,lives=3,wave=0;
 const spawn=()=>{wave++;al=[];for(let r=0;r<4;r++)for(let c=0;c<7;c++)al.push({x:40+c*40,y:60+r*32,r});spd=28+wave*8};spawn();
 return{score:0,step(dt,end){if(drag!=null)px=drag;px+=(K.right-K.left)*260*dt;px=Math.max(16,Math.min(W-16,px));cool-=dt;
  if((K.fire||PK.fire)&&cool<=0){shots.push({x:px,y:H-44});cool=.4;PK.fire=0}
  shots.forEach(o=>o.y-=420*dt);bombs.forEach(o=>o.y+=(150+wave*15)*dt);
  const sp=spd*(1+(28-al.length)/14);let edge=false;al.forEach(a=>{a.x+=dir*sp*dt;if(a.x<16||a.x>W-16)edge=true});
  if(edge){dir*=-1;al.forEach(a=>{a.x+=dir*sp*dt*2;a.y+=14})}
  if(Math.random()<dt*(.8+wave*.3)&&al.length){const a=al[Math.floor(rnd(0,al.length))];bombs.push({x:a.x,y:a.y+10})}
  for(const o of shots)for(let i=0;i<al.length;i++){const a=al[i];if(Math.abs(o.x-a.x)<14&&Math.abs(o.y-a.y)<11){al.splice(i,1);o.y=-99;this.score+=(4-a.r)*10;break}}
  shots=shots.filter(o=>o.y>0);
  for(const o of bombs)if(Math.abs(o.x-px)<16&&o.y>H-48&&o.y<H-28){o.y=H+99;if(--lives<=0)return end()}
  bombs=bombs.filter(o=>o.y<H);if(al.some(a=>a.y>H-70))return end();if(!al.length){this.score+=100;spawn()}},
  draw(){const cl=['#FF3DCB','#C04DFF','#3DA8FF','#3DFFB0'],t=Math.floor(performance.now()/300)%2;al.forEach(a=>{cx.fillStyle=cl[a.r];
   cx.fillRect(a.x-11,a.y-6,22,10);cx.fillRect(a.x-(t?14:8),a.y+4,5,5);cx.fillRect(a.x+(t?9:3),a.y+4,5,5);cx.fillStyle='#0B0B14';cx.fillRect(a.x-6,a.y-3,4,4);cx.fillRect(a.x+2,a.y-3,4,4)});
   cx.fillStyle='#3DF5FF';shots.forEach(o=>cx.fillRect(o.x-1.5,o.y-8,3,10));cx.fillStyle='#FFE03D';bombs.forEach(o=>cx.fillRect(o.x-2,o.y-5,4,10));
   cx.fillStyle='#fff';cx.fillRect(px-16,H-36,32,8);cx.fillRect(px-3,H-44,6,8);
   txt('♥'.repeat(lives),34,26,'#FF3DCB');txt('W'+wave,W-24,26,'#9A9AB5')}}};
MAKERS.blocks=()=>{const C=20,COLS=10,ROWS=22,ox=40,oy=20;
 const SH=[[[0,1],[1,1],[2,1],[3,1]],[[1,0],[2,0],[1,1],[2,1]],[[1,0],[0,1],[1,1],[2,1]],[[0,0],[0,1],[1,1],[2,1]],[[2,0],[0,1],[1,1],[2,1]],[[1,0],[2,0],[0,1],[1,1]],[[0,0],[1,0],[1,1],[2,1]]];
 const CL=['#3DF5FF','#FFE03D','#C04DFF','#3DA8FF','#FF8A3D','#3DFFB0','#FF3DCB'];
 let grid=Array.from({length:ROWS},()=>Array(COLS).fill(0)),pc,nx=Math.floor(rnd(0,7)),acc=0,lines=0,lvl=1;
 const fits=(c,x,y)=>c.every(([a,b])=>{const X=x+a,Y=y+b;return X>=0&&X<COLS&&Y<ROWS&&(Y<0||!grid[Y][X])});
 const next=()=>{pc={t:nx,c:SH[nx].map(p=>[...p]),x:3,y:-1};nx=Math.floor(rnd(0,7));return fits(pc.c,pc.x,pc.y)};next();
 const rot=c=>pc.t===1?c:c.map(([a,b])=>[(pc.t===0?3:2)-b,a]);
 return{score:0,step(dt,end){const me=this;
  const place=()=>{pc.c.forEach(([a,b])=>{if(pc.y+b>=0)grid[pc.y+b][pc.x+a]=pc.t+1});let n=0;
   grid=grid.filter(r=>{if(r.every(v=>v)){n++;return false}return true});while(grid.length<ROWS)grid.unshift(Array(COLS).fill(0));
   me.score+=[0,40,100,300,800][n]*lvl;lines+=n;lvl=1+Math.floor(lines/10);if(!next())end()};
  if(take('left')&&fits(pc.c,pc.x-1,pc.y))pc.x--;if(take('right')&&fits(pc.c,pc.x+1,pc.y))pc.x++;
  if(take('up')){const r=rot(pc.c);for(const k of[0,-1,1,-2,2])if(fits(r,pc.x+k,pc.y)){pc.c=r;pc.x+=k;break}}
  if(take('fire')){while(fits(pc.c,pc.x,pc.y+1)){pc.y++;me.score+=1}place();return}PK.down=0;
  acc+=dt*(K.down?12:1);const iv=Math.max(.08,.8-(lvl-1)*.07);
  if(acc>=iv){acc=0;if(fits(pc.c,pc.x,pc.y+1)){pc.y++;if(K.down)me.score+=1}else place()}},
  draw(){cx.fillStyle='#151526';cx.fillRect(ox,oy,COLS*C,ROWS*C);
   const cell=(x,y,c)=>{cx.fillStyle=c;cx.fillRect(ox+x*C+1,oy+y*C+1,C-2,C-2)};
   grid.forEach((r,y)=>r.forEach((v,x)=>v&&cell(x,y,CL[v-1])));
   let gy=pc.y;while(fits(pc.c,pc.x,gy+1))gy++;cx.globalAlpha=.25;pc.c.forEach(([a,b])=>gy+b>=0&&cell(pc.x+a,gy+b,CL[pc.t]));cx.globalAlpha=1;
   pc.c.forEach(([a,b])=>pc.y+b>=0&&cell(pc.x+a,pc.y+b,CL[pc.t]));
   txt('NEXT',W-50,40,'#9A9AB5',13);SH[nx].forEach(([a,b])=>{cx.fillStyle=CL[nx];cx.fillRect(W-80+a*14,52+b*14,12,12)});
   txt('LINES',W-50,130,'#9A9AB5',13);txt(lines,W-50,152);txt('LEVEL',W-50,190,'#9A9AB5',13);txt(lvl,W-50,212)}}};
MAKERS.squad=()=>{
 const LVL=[
  {pat:4,bunk:1,ehp:2,spd:42,erate:1.15,bhp:22},
  {pat:6,bunk:2,ehp:3,spd:52,erate:.95,bhp:30},
  {pat:8,bunk:3,ehp:3,spd:62,erate:.78,bhp:38}];
 const CS=[['Sarge','#3DFFB0','asked for the glory tour'],['Vapors','#3DF5FF','went up in smoke'],['Brick','#FF8A3D','was built different'],['Ember','#FF3DCB','burned out early']];
 const SPD=150,RNG=175,FR=.4,ERNG=160;
 let lvl=0,soldiers=[],enemies=[],bunkers=[],shots=[],parts=[],fallen=[],trail=[],mt=null,seen=false,st='ready',stT=2.4;
 const alive=()=>soldiers.filter(s=>!s.dead);
 const mkSquad=()=>{fallen=[];soldiers=[0,1,2,3].map(i=>({x:W/2+(i-1.5)*14,y:H-70,hp:6,max:6,cd:rnd(0,.3),dead:false,cs:CS[i][0],c:CS[i][1],line:CS[i][2],a:-Math.PI/2}))};
 const mkLevel=()=>{const L=LVL[lvl];enemies=[];bunkers=[];trail=[];mt=null;
  for(let i=0;i<L.pat;i++){let x,y,n=0;do{x=rnd(30,W-30);y=rnd(50,H-250);n++}while(n<20&&Math.hypot(x-W/2,y-(H-70))<150);
   enemies.push({x,y,hp:L.ehp,max:L.ehp,cd:rnd(0,1),wx:x,wy:y,wt:0,a:Math.PI/2})}
  for(let i=0;i<L.bunk;i++)bunkers.push({x:(i+1)*W/(L.bunk+1)+rnd(-12,12),y:64+rnd(0,36),hp:L.bhp,max:L.bhp,cd:1.2});
  st='ready';stT=2.4};
 const puff=(x,y,c,n,v)=>{for(let i=0;i<n;i++){if(parts.length>70)break;const a=rnd(0,6.28),s=rnd(30,v);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:rnd(.25,.55),c})}};
 const nearT=(x,y,list,r)=>{let b=null,bd=r;for(const o of list){const d=Math.hypot(x-o.x,y-o.y);if(d<bd){bd=d;b=o}}return b};
 mkSquad();mkLevel();
 return{score:0,step(dt,end){const me=this,L=LVL[lvl];
  parts.forEach(p=>{p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt});parts=parts.filter(p=>p.t>0);
  if(st!=='play'){stT-=dt;if(stT<=0){if(st==='dead')return end();if(st==='win'){me.score+=1000;return end()}st='play'}return}
  // tap-to-move: shares the framework's pointer state (tx/ty + cv rect)
  if(tx!=null&&!seen){seen=true;const r=cv.getBoundingClientRect();mt={x:(tx-r.left)*W/r.width,y:(ty-r.top)*H/r.height,ttl:2.6}}
  if(tx==null)seen=false;
  const ld=alive()[0];if(!ld)return end();
  if(K.left||K.right||K.up||K.down)mt=null;
  let dx=K.right-K.left,dy=K.down-K.up;
  if(dx||dy){const m=Math.hypot(dx,dy);ld.a=Math.atan2(dy/m,dx/m);ld.x+=dx/m*SPD*dt;ld.y+=dy/m*SPD*dt}
  else if(mt){mt.ttl-=dt;const a=Math.atan2(mt.y-ld.y,mt.x-ld.x),d=Math.hypot(mt.x-ld.x,mt.y-ld.y);
   if(d<7||mt.ttl<=0)mt=null;else{ld.a=a;ld.x+=Math.cos(a)*SPD*dt;ld.y+=Math.sin(a)*SPD*dt}}
  ld.x=Math.max(10,Math.min(W-10,ld.x));ld.y=Math.max(30,Math.min(H-10,ld.y));
  trail.unshift({x:ld.x,y:ld.y});if(trail.length>300)trail.pop();
  // followers follow the leader's breadcrumb trail
  alive().forEach((s,i)=>{if(i===0)return;const tp=trail[Math.min(trail.length-1,i*16)];
   const d=Math.hypot(tp.x-s.x,tp.y-s.y);if(d>4){s.a=Math.atan2(tp.y-s.y,tp.x-s.x);const v=Math.min(SPD*1.25,d*6);s.x+=Math.cos(s.a)*v*dt;s.y+=Math.sin(s.a)*v*dt}});
  // squad auto-fire at nearest target in range
  alive().forEach(s=>{s.cd-=dt;const t=nearT(s.x,s.y,enemies,RNG)||nearT(s.x,s.y,bunkers,RNG);
   if(t&&s.cd<=0){const a=Math.atan2(t.y-s.y,t.x-s.x);s.a=a;s.cd=FR;
    shots.push({x:s.x+Math.cos(a)*9,y:s.y+Math.sin(a)*9,vx:Math.cos(a)*360,vy:Math.sin(a)*360,t:1,f:1})}});
  // enemy patrols: wander until the squad is spotted (250px), close in, and stand and shoot in range
  enemies.forEach(e=>{e.cd-=dt;const s0=nearT(e.x,e.y,alive(),ERNG);
   if(s0){e.a=Math.atan2(s0.y-e.y,s0.x-e.x);
    if(e.cd<=0){e.cd=L.erate;shots.push({x:e.x+Math.cos(e.a)*9,y:e.y+Math.sin(e.a)*9,vx:Math.cos(e.a)*175,vy:Math.sin(e.a)*175,t:1.8,f:0,dmg:1})}}
   else{const s1=nearT(e.x,e.y,alive(),250);
    if(s1){const a=Math.atan2(s1.y-e.y,s1.x-e.x);e.a=a;e.x+=Math.cos(a)*L.spd*1.15*dt;e.y+=Math.sin(a)*L.spd*1.15*dt}
    else{e.wt-=dt;const d=Math.hypot(e.wx-e.x,e.wy-e.y);
     if(d<8||e.wt<=0){e.wx=rnd(30,W-30);e.wy=rnd(50,H-240);e.wt=rnd(1,3)}
     const a=Math.atan2(e.wy-e.y,e.wx-e.x);e.a=a;e.x+=Math.cos(a)*L.spd*dt;e.y+=Math.sin(a)*L.spd*dt}}});
  // enemy separation
  for(let i=0;i<enemies.length;i++)for(let j=i+1;j<enemies.length;j++){const a=enemies[i],b=enemies[j],d=Math.hypot(a.x-b.x,a.y-b.y);
   if(d<14&&d>0){const p=(14-d)*dt*2,ax=(a.x-b.x)/d,ay=(a.y-b.y)/d;a.x+=ax*p;a.y+=ay*p;b.x-=ax*p;b.y-=ay*p}}
  // bunkers fire slow heavy shells
  bunkers.forEach(b=>{b.cd-=dt;const s0=nearT(b.x,b.y,alive(),260);
   if(s0&&b.cd<=0){b.cd=2.4;const a=Math.atan2(s0.y-b.y,s0.x-b.x);
    shots.push({x:b.x+Math.cos(a)*16,y:b.y+Math.sin(a)*16,vx:Math.cos(a)*130,vy:Math.sin(a)*130,t:2.6,f:0,dmg:2})}});
  // move shots and resolve hits
  shots.forEach(o=>{o.x+=o.vx*dt;o.y+=o.vy*dt;o.t-=dt});
  for(const o of shots){if(o.t<=0)continue;
   if(o.f){
    for(let i=0;i<enemies.length;i++){const e=enemies[i];
     if(Math.hypot(o.x-e.x,o.y-e.y)<9){o.t=0;e.hp--;puff(o.x,o.y,'#FFE03D',4,120);
      if(e.hp<=0){enemies.splice(i,1);me.score+=25;puff(e.x,e.y,'#FF5A5A',10,170)}break}}
    if(o.t>0)for(let i=0;i<bunkers.length;i++){const b=bunkers[i];
     if(Math.hypot(o.x-b.x,o.y-b.y)<17){o.t=0;b.hp--;puff(o.x,o.y,'#3DF5FF',4,120);
      if(b.hp<=0){bunkers.splice(i,1);me.score+=150;puff(b.x,b.y,'#FFE03D',16,220)}break}}}
   else{for(const s of alive()){if(Math.hypot(o.x-s.x,o.y-s.y)<8){o.t=0;s.hp-=o.dmg;puff(o.x,o.y,'#FF3D5A',5,140);
     if(s.hp<=0){s.dead=true;fallen.push(s);puff(s.x,s.y,'#9A9AB5',12,180)}
     break}}}}
  shots=shots.filter(o=>o.t>0&&o.x>-10&&o.x<W+10&&o.y>-10&&o.y<H+10);
  if(shots.length>60)shots.splice(0,shots.length-60);
  if(!alive().length){st='dead';stT=2;return}
  if(!enemies.length&&!bunkers.length){me.score+=500*(lvl+1);lvl++;if(lvl>=LVL.length){st='win';stT=2.6}else mkLevel()}},
 draw(){
  bunkers.forEach(b=>{cx.fillStyle='#22223A';cx.fillRect(b.x-14,b.y-14,28,28);
   cx.strokeStyle='#3DF5FF';cx.lineWidth=2;cx.strokeRect(b.x-14,b.y-14,28,28);
   cx.strokeStyle='#FF5A5A';cx.beginPath();cx.moveTo(b.x-6,b.y-6);cx.lineTo(b.x+6,b.y+6);cx.moveTo(b.x+6,b.y-6);cx.lineTo(b.x-6,b.y+6);cx.stroke();
   cx.fillStyle='#151526';cx.fillRect(b.x-14,b.y-22,28,5);cx.fillStyle='#FFE03D';cx.fillRect(b.x-14,b.y-22,28*Math.max(0,b.hp/b.max),5)});
  enemies.forEach(e=>{cx.fillStyle='#5A1E24';cx.beginPath();cx.arc(e.x,e.y,6,0,7);cx.fill();
   cx.fillStyle='#8A2A33';cx.beginPath();cx.arc(e.x,e.y-2,4.5,Math.PI,0);cx.fill();
   cx.strokeStyle='#FF8A5A';cx.lineWidth=3;cx.beginPath();cx.moveTo(e.x,e.y);cx.lineTo(e.x+Math.cos(e.a)*11,e.y+Math.sin(e.a)*11);cx.stroke()});
  alive().forEach((s,i)=>{cx.fillStyle=s.c;cx.beginPath();cx.arc(s.x,s.y,6,0,7);cx.fill();
   cx.fillStyle=s.c;cx.beginPath();cx.arc(s.x,s.y-2,4.4,Math.PI,0);cx.fill();
   cx.fillStyle='#0B0B14';cx.beginPath();cx.arc(s.x,s.y-2,3.4,Math.PI,0);cx.fill();
   cx.strokeStyle='#EDEDF5';cx.lineWidth=2.5;cx.beginPath();cx.moveTo(s.x,s.y);cx.lineTo(s.x+Math.cos(s.a)*10,s.y+Math.sin(s.a)*10);cx.stroke();
   cx.fillStyle='#151526';cx.fillRect(s.x-8,s.y-13,16,3);cx.fillStyle=s.c;cx.fillRect(s.x-8,s.y-13,16*Math.max(0,s.hp/s.max),3);
   if(i===0)txt('▼',s.x,s.y-20,'#FFE03D',9)});
  if(mt){cx.strokeStyle='#3DF5FF';cx.lineWidth=1.5;cx.strokeRect(mt.x-5,mt.y-5,10,10)}
  shots.forEach(o=>{if(o.f){cx.strokeStyle='#FFE03D';cx.lineWidth=2;const m=8/Math.hypot(o.vx,o.vy)||0;
   cx.beginPath();cx.moveTo(o.x-o.vx*m,o.y-o.vy*m);cx.lineTo(o.x,o.y);cx.stroke()}
   else{cx.fillStyle=o.dmg>1?'#FF3DCB':'#FF5A5A';cx.fillRect(o.x-2,o.y-2,4,4)}});
  parts.forEach(p=>{cx.globalAlpha=Math.max(0,Math.min(1,p.t*2.4));cx.fillStyle=p.c;cx.fillRect(p.x-1.5,p.y-1.5,3,3)});cx.globalAlpha=1;
  cx.textAlign='left';cx.font='bold 12px system-ui';cx.fillStyle='#9A9AB5';cx.fillText('MISSION '+(lvl+1)+'/3',10,20);
  alive().forEach((s,i)=>{cx.fillStyle=s.c;cx.fillRect(10+i*16,28,12,8)});
  cx.textAlign='right';cx.fillStyle='#FF8A5A';cx.fillText(enemies.length+' patrol · '+bunkers.length+' bunk',W-10,20);
  if(fallen.length){cx.textAlign='left';cx.font='11px system-ui';cx.fillStyle='#9A9AB5';
   fallen.slice(-3).forEach((s,i)=>cx.fillText('☠ '+s.cs+' — '+s.line,10,H-8-(2-i)*15))}
  if(st==='ready')txt('MISSION '+(lvl+1)+' — READY',W/2,H/2,'#FFD23D',20);
  if(st==='dead')txt('SQUAD WIPED',W/2,H/2,'#FF3D5A',22);
  if(st==='win')txt('MISSION COMPLETE',W/2,H/2,'#3DFFB0',20)}}};
MAKERS.boxing=()=>{
 const OPP=[
  {n:'Rosa "Rookie" Vega',c:'#FF7A59',hair:'#3A1F12',skin:'#E0A27A',hp:80,idle:[1.4,2.4],tell:.85,dmg:9,blk:.1,feint:0,combo:1,sp:.15,spn:'Haymaker'},
  {n:'Mei "Lightning" Tan',c:'#3DF5FF',hair:'#111111',skin:'#F1C9A0',hp:95,idle:[.7,1.4],tell:.55,dmg:7,blk:.15,feint:.05,combo:3,sp:.2,spn:'Lightning Flurry'},
  {n:'Brigid "The Wall" O\'Hara',c:'#7CFF6B',hair:'#C2461E',skin:'#F3D2BE',hp:140,idle:[1.2,2],tell:.75,dmg:14,blk:.45,feint:.05,combo:1,sp:.25,spn:'Wall Crusher'},
  {n:'Zara "Mirage" Okafor',c:'#B07CFF',hair:'#1A0F0A',skin:'#8A5A3C',hp:110,idle:[.8,1.6],tell:.6,dmg:10,blk:.2,feint:.35,combo:2,sp:.2,spn:'Mirage Hook',dodge:.3},
  {n:'Valka "Iron" Petrova',c:'#FF3D5A',hair:'#E8E0C8',skin:'#F0D0B8',hp:150,idle:[1,1.8],tell:.65,dmg:12,blk:.25,feint:.1,combo:2,sp:.25,spn:'Iron Rage',rage:.35},
  {n:'Queen Seraphine',c:'#FFD23D',hair:'#2B1640',skin:'#C98E6A',hp:190,idle:[.6,1.3],tell:.5,dmg:13,blk:.3,feint:.25,combo:3,sp:.3,spn:'Royal Decree',dodge:.2,rage:.3}];
 let oi=0,o,eh,ph=100,stars=0,st,t,atk=null,queue=0,fx=[],msg='',mt=0,pose='idle',pt=0,fightT=0,shake=0,combo=0,clock=0,ih=0,punish=0;
 const say=(m,d=1)=>{msg=m;mt=d};
 const hitfx=(x,y,c,s)=>{fx.push({x,y,c,s,t:.6});const n=c==='#9A9AB5'?5:14;for(let i=0;i<n;i++){const a=rnd(0,6.28),v=rnd(60,240);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,r:rnd(1.5,4),c:i%3?c:'#FFFFFF',t:rnd(.3,.7)})}if(y<270&&c!=='#9A9AB5'&&c!=='#B07CFF'&&s!=='MISS'){hflash=.25;hsnap=x<W/2?1:-1}};
 let parts=[],flashes=[],hflash=0,hsnap=0;
 const shade=(h,p)=>{const n=parseInt(h.slice(1),16);let r=n>>16,g2=n>>8&255,b2=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(p<0?v*(1+p):v+(255-v)*p)));return'#'+((1<<24)|(f(r)<<16)|(f(g2)<<8)|f(b2)).toString(16).slice(1)};
 const crowd=[];for(let row=0;row<4;row++)for(let i=0;i<16;i++)crowd.push({x:i*24+(row%2)*12-6+rnd(-4,4),y:70+row*26,r:7+row*1.3,c:`hsl(${265+rnd(-15,15)},40%,${8+row*3}%)`,s:rnd(2,5),p:rnd(0,6),a:rnd(1,3)});
 const raging=()=>!!o.rage&&eh<o.hp*o.rage;
 const begin=()=>{o=OPP[oi];eh=o.hp;st='intro';t=2.4;fightT=0;atk=null;queue=0;combo=0;ih=0;punish=0};
 const nextIdle=()=>{st='idle';t=rnd(o.idle[0],o.idle[1])*.7*(raging()?.6:1)};
 const newAtk=()=>{const sp=Math.random()<o.sp*(raging()?1.8:1);
  atk={k:sp?'U':(Math.random()<.5?'L':'R'),feint:!sp&&Math.random()<o.feint};
  st='tell';t=(sp?o.tell*1.5:o.tell)*(raging()?.8:1)*(punish?.7:1);atk.T=t;punish=0;ih=0;if(sp)say(o.spn+'!',1)};
 begin();
 return{score:0,step(dt,end){const me=this;clock+=dt;mt-=dt;shake=Math.max(0,shake-dt*20);
  fx.forEach(f=>{f.t-=dt;f.y-=30*dt});fx=fx.filter(f=>f.t>0);parts.forEach(p=>{p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt});parts=parts.filter(p=>p.t>0);hflash=Math.max(0,hflash-dt);hsnap*=Math.max(0,1-dt*8);
  if(st==='intro'){t-=dt;for(const k in PK)PK[k]=0;if(t<=0){nextIdle();say('FIGHT!',.8)}return}
  if(st==='ko'){t-=dt;for(const k in PK)PK[k]=0;if(t<=0){oi++;if(oi>=OPP.length){me.score+=2000;return end()}ph=Math.min(100,ph+50);begin()}return}
  if(st==='down'){t-=dt;for(const k in PK)PK[k]=0;if(t<=0)return end();return}
  fightT+=dt;
  const ko=()=>{eh=0;st='ko';t=2.8;me.score+=300+Math.round(ph*3)+Math.max(0,Math.round((90-fightT)*3));say('K.O.!',2.6);shake=8};
  const punch=(m,kind)=>{const x=W/2+(kind==='lo'?rnd(-10,10):rnd(-25,25)),y=kind==='lo'?250:185;
   if(st==='idle'||st==='stun'){
    if(st==='idle'&&kind!=='star'&&Math.random()<(o.dodge||0)+ih*.08){hitfx(x,y,'#B07CFF','SLIP');combo=0;pt=.55;punish=1;t=Math.min(t,.12);return}
    if(st==='idle'&&kind!=='star'&&Math.random()<Math.min(.92,o.blk+.15+ih*.22)){hitfx(x,y,'#9A9AB5','BLOCK');combo=0;pt=.5;ih++;if(ih>=2){punish=1;t=Math.min(t,.15);say('Counter-attack!',.6)}return}
    const v=(st==='stun'?1.6:(kind==='star'?1:.45))*m*(kind==='lo'?5:6);if(st==='idle'&&kind!=='star'){ih++;if(ih>=(oi<2?3:2)){punish=1;t=Math.min(t,.1)}}eh-=v;combo++;me.score+=Math.round(v*2)+(st==='stun'?15:0)+Math.min(combo,10)*2;
    hitfx(x,y,kind==='star'?'#FFD23D':'#FFFFFF',kind==='star'?'STAR PUNCH!':String(Math.round(v)));shake=kind==='star'?7:2;
    if(kind==='star')me.score+=100;
    }
   else if(st==='tell'&&!atk.feint&&(t>atk.T*.45||atk.k==='U')){hitfx(x,y,'#9A9AB5',atk.k==='U'?'NO COUNTER':'TOO EARLY');combo=0;pt=.5}
   else if(st==='tell'&&!atk.feint){const v=m*9;eh-=v;combo++;me.score+=30+Math.round(v*2);
    hitfx(x,y,'#FFD23D','COUNTER!');shake=4;if(stars<3){stars++;say('\u2b50 Star earned',.8)}st='stun';t=1;queue=0}
   else if(st==='tell'&&atk.feint){hitfx(x,y,'#B07CFF','FEINT!');combo=0;pt=.5;atk.feint=false;t=Math.min(t,.2);atk.T=t}
   else{hitfx(x,y,'#9A9AB5','MISS');combo=0;pt=.45}
   if(eh<=0)ko()};
  pt-=dt;const guard=!!K.down;
  if(pt<=0){pose=guard?'guard':'idle';
   if(take('left')){pose='dl';pt=.42}else if(take('right')){pose='dr';pt=.42}
   else{const hi=take('up'),lo=take('fire');
    if(hi&&guard&&stars>0){pose='star';pt=.45;stars--;punch(3,'star')}
    else if(hi){pose='ph';pt=.24;punch(1,'hi')}else if(lo){pose='pl';pt=.24;punch(1,'lo')}}}
  else{take('left');take('right');take('up');take('fire')}
  if(st==='ko')return;
  t-=dt;
  if(st==='idle'&&t<=0){queue=Math.floor(rnd(1,o.combo+1));newAtk()}
  else if(st==='tell'&&t<=0){
   if(atk.feint){say('Feint!',.5);atk.feint=false;t=o.tell*.45;return}
   st='strike';t=.2;
   const dl=pose==='dl',dr=pose==='dr';
   const dodged=(atk.k==='L'&&dr)||(atk.k==='R'&&dl)||(atk.k==='U'&&(dl||dr));
   const wrong=(atk.k==='L'&&dl)||(atk.k==='R'&&dr);
   const blocked=pose==='guard'&&atk.k!=='U';
   const d=o.dmg*1.7*(atk.k==='U'?2:1)*(raging()?1.3:1);
   if(dodged){me.score+=10;hitfx(W/2,300,'#3DF5FF','DODGE')}
   else if(blocked){ph-=d*.35;hitfx(W/2,320,'#9A9AB5','BLOCK');shake=1}
   else{ph-=d*(wrong?1.2:1);hitfx(W/2,330,'#FF3D5A','-'+Math.round(d));shake=5;combo=0}
   if(ph<=0){ph=0;st='down';t=2.4;say('DOWN!',2.4)}}
  else if(st==='strike'&&t<=0){if(--queue>0)newAtk();else{st='stun';t=.7}}
  else if(st==='stun'&&t<=0)nextIdle()},
  draw(){const sx=shake?rnd(-shake,shake):0,sy=shake?rnd(-shake,shake):0;cx.save();cx.translate(sx,sy);
   const rg=raging(),tell=st==='tell',stun=st==='stun',koed=st==='ko';
   let g=cx.createLinearGradient(0,0,0,300);g.addColorStop(0,'#05030C');g.addColorStop(.5,'#170A2C');g.addColorStop(1,'#2A0F3D');cx.fillStyle=g;cx.fillRect(-10,-10,W+20,320);
   for(const c of crowd){const b=Math.sin(clock*c.s+c.p)*c.a*(koed?3:1);cx.fillStyle=c.c;cx.beginPath();cx.arc(c.x,c.y+b,c.r,0,7);cx.fill();cx.beginPath();cx.ellipse(c.x,c.y+c.r*2.2+b,c.r*1.6,c.r*1.4,0,0,7);cx.fill();
    if(Math.random()<.0015*(koed?8:1))flashes.push({x:c.x,y:c.y+b,t:.18})}
   flashes=flashes.filter(f=>(f.t-=1/60)>0);flashes.forEach(f=>{const r=cx.createRadialGradient(f.x,f.y,0,f.x,f.y,14);r.addColorStop(0,'rgba(255,255,255,.95)');r.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=r;cx.fillRect(f.x-14,f.y-14,28,28)});
   cx.globalCompositeOperation='lighter';[[60,'255,61,203'],[W-60,'61,245,255'],[W/2,'255,240,200']].forEach(([x,c],i)=>{const sw=Math.sin(clock*.7+i*2)*30;const lg=cx.createLinearGradient(0,0,0,320);lg.addColorStop(0,`rgba(${c},.26)`);lg.addColorStop(1,`rgba(${c},0)`);cx.fillStyle=lg;cx.beginPath();cx.moveTo(x-8,-10);cx.lineTo(x+8,-10);cx.lineTo(W/2+sw+70,320);cx.lineTo(W/2+sw-70,320);cx.fill()});cx.globalCompositeOperation='source-over';
   g=cx.createLinearGradient(0,280,0,H);g.addColorStop(0,'#3B1D6E');g.addColorStop(1,'#120826');cx.fillStyle=g;cx.beginPath();cx.moveTo(20,282);cx.lineTo(W-20,282);cx.lineTo(W+40,H+10);cx.lineTo(-40,H+10);cx.fill();
   cx.strokeStyle='rgba(255,61,203,.35)';cx.lineWidth=2;cx.beginPath();cx.ellipse(W/2,380,120,40,0,0,7);cx.stroke();
   cx.fillStyle='rgba(255,61,203,.18)';cx.font='900 38px system-ui';cx.textAlign='center';cx.fillText('KQ',W/2,394);
   [[14,'#FF3DCB'],[W-14,'#3DF5FF']].forEach(([x,c])=>{const pg=cx.createLinearGradient(x-6,0,x+6,0);pg.addColorStop(0,'#555');pg.addColorStop(.5,'#DDD');pg.addColorStop(1,'#444');cx.fillStyle=pg;cx.fillRect(x-5,196,10,92);cx.fillStyle=c;cx.fillRect(x-7,192,14,10)});
   ['#FF3DCB','#F5F5FF','#3DF5FF'].forEach((c,i)=>{const y=206+i*26;cx.strokeStyle=c;cx.shadowColor=c;cx.shadowBlur=8;cx.lineWidth=3.5;cx.beginPath();cx.moveTo(14,y);cx.quadraticCurveTo(W/2,y+7+Math.sin(clock*2+i)*1.5,W-14,y);cx.stroke()});cx.shadowBlur=0;
   let ox=W/2,oy=koed?60*Math.min(1,(2.8-t)):0;
   if(st==='idle')ox+=Math.sin(clock*3.5)*10;
   if(stun)ox+=Math.sin(clock*30)*3;
   const bob=Math.sin(clock*5)*3;
   cx.fillStyle='rgba(0,0,0,.45)';cx.beginPath();cx.ellipse(ox,300,58,10,0,0,7);cx.fill();
   cx.save();cx.translate(ox,150+bob+oy);if(koed)cx.rotate(Math.min(1,(2.8-t))*.55);
   const lean=tell&&atk?(atk.k==='L'?-.08:atk.k==='R'?.08:0):st==='strike'&&atk?(atk.k==='L'?.1:atk.k==='R'?-.1:0):0;cx.rotate(lean);
   if(rg){cx.shadowColor='#FF3D5A';cx.shadowBlur=30+Math.sin(clock*12)*10}
   const sk=o.skin,dk=shade(o.skin,-.28),cc=o.c;
   cx.fillStyle=dk;cx.beginPath();cx.moveTo(-30,140);cx.lineTo(-24,200);cx.lineTo(-8,200);cx.lineTo(-4,140);cx.fill();cx.beginPath();cx.moveTo(30,140);cx.lineTo(24,200);cx.lineTo(8,200);cx.lineTo(4,140);cx.fill();
   g=cx.createLinearGradient(-40,0,40,0);g.addColorStop(0,shade(cc,-.45));g.addColorStop(.5,shade(cc,-.15));g.addColorStop(1,shade(cc,-.5));cx.fillStyle=g;
   cx.beginPath();cx.moveTo(-33,100);cx.lineTo(33,100);cx.lineTo(40,150);cx.lineTo(4,152);cx.lineTo(0,140);cx.lineTo(-4,152);cx.lineTo(-40,150);cx.closePath();cx.fill();
   cx.fillStyle='#F5F5FF';cx.fillRect(-33,100,66,7);cx.fillStyle=cc;cx.fillRect(-38,124,4,26);cx.fillRect(34,124,4,26);
   g=cx.createLinearGradient(-42,0,42,0);g.addColorStop(0,dk);g.addColorStop(.45,sk);g.addColorStop(1,dk);cx.fillStyle=g;
   cx.beginPath();cx.moveTo(-10,36);cx.quadraticCurveTo(-44,40,-42,58);cx.quadraticCurveTo(-36,80,-30,102);cx.lineTo(30,102);cx.quadraticCurveTo(36,80,42,58);cx.quadraticCurveTo(44,40,10,36);cx.closePath();cx.fill();
   cx.strokeStyle=shade(sk,-.4);cx.lineWidth=1.2;cx.globalAlpha=.5;cx.beginPath();cx.moveTo(0,86);cx.lineTo(0,100);cx.moveTo(-9,90);cx.lineTo(-8,99);cx.moveTo(9,90);cx.lineTo(8,99);cx.stroke();cx.globalAlpha=1;
   g=cx.createLinearGradient(0,52,0,84);g.addColorStop(0,shade(cc,.2));g.addColorStop(1,shade(cc,-.35));cx.fillStyle=g;
   cx.beginPath();cx.moveTo(-38,58);cx.quadraticCurveTo(-20,50,0,62);cx.quadraticCurveTo(20,50,38,58);cx.lineTo(34,84);cx.lineTo(-34,84);cx.closePath();cx.fill();
   cx.fillStyle='rgba(255,255,255,.25)';cx.fillRect(-34,80,68,3);
   cx.fillStyle=dk;cx.fillRect(-8,26,16,14);
   cx.save();cx.translate(hsnap*8,0);cx.rotate(hsnap*.25);
   const hs=oi%3;cx.fillStyle=o.hair;
   if(hs===0){cx.beginPath();cx.ellipse(0,8,27,30,0,0,7);cx.fill();cx.beginPath();cx.moveTo(14,-6);cx.quadraticCurveTo(48+Math.sin(clock*6)*6,0,36,46);cx.quadraticCurveTo(30,20,10,6);cx.fill()}
   else if(hs===1){cx.beginPath();cx.ellipse(0,10,28,30,0,0,7);cx.fill();cx.fillRect(-28,10,14,40);cx.fillRect(14,10,14,40)}
   else{cx.beginPath();cx.ellipse(0,6,27,29,0,0,7);cx.fill();cx.beginPath();cx.arc(0,-26,13,0,7);cx.fill()}
   g=cx.createRadialGradient(-6,6,4,0,14,30);g.addColorStop(0,shade(sk,.12));g.addColorStop(1,dk);cx.fillStyle=g;cx.beginPath();cx.ellipse(0,14,20,25,0,0,7);cx.fill();
   cx.fillStyle=o.hair;cx.beginPath();cx.moveTo(-21,8);cx.quadraticCurveTo(-24,-14,0,-12);cx.quadraticCurveTo(24,-14,21,8);cx.quadraticCurveTo(10,-2,-2,2);cx.quadraticCurveTo(-12,-2,-21,8);cx.fill();
   cx.fillStyle=cc;cx.fillRect(-21,-3,42,5);
   if(oi===5){g=cx.createLinearGradient(0,-40,0,-16);g.addColorStop(0,'#FFF3A0');g.addColorStop(1,'#C9961A');cx.fillStyle=g;cx.beginPath();cx.moveTo(-16,-14);cx.lineTo(-12,-32);cx.lineTo(-5,-20);cx.lineTo(0,-38);cx.lineTo(5,-20);cx.lineTo(12,-32);cx.lineTo(16,-14);cx.closePath();cx.fill()}
   const angry=tell||rg||st==='strike';
   if(stun||koed){cx.strokeStyle='#1A0B2E';cx.lineWidth=2;[-8,8].forEach(x=>{cx.beginPath();cx.moveTo(x-4,9);cx.lineTo(x+4,16);cx.moveTo(x+4,9);cx.lineTo(x-4,16);cx.stroke()})}
   else{[-8,8].forEach(x=>{cx.fillStyle='#FFF';cx.beginPath();cx.ellipse(x,13,5,3.4,0,0,7);cx.fill();cx.fillStyle='#2A1408';cx.beginPath();cx.arc(x,14,2.4,0,7);cx.fill()});
    cx.strokeStyle=o.hair;cx.lineWidth=2.2;cx.beginPath();cx.moveTo(-13,angry?6:7);cx.lineTo(-4,angry?9:6);cx.moveTo(13,angry?6:7);cx.lineTo(4,angry?9:6);cx.stroke()}
   cx.strokeStyle=shade(sk,-.35);cx.lineWidth=1.3;cx.beginPath();cx.moveTo(0,15);cx.lineTo(-2,22);cx.lineTo(1,23);cx.stroke();
   cx.fillStyle='#C2405A';cx.beginPath();if(angry||stun)cx.ellipse(0,30,4.5,3,0,0,7);else cx.ellipse(0,29.5,6,2,0,0,7);cx.fill();
   if(hflash>0){cx.globalAlpha=Math.min(1,hflash*2.5);cx.fillStyle='#FFF';cx.beginPath();cx.ellipse(0,14,21,26,0,0,7);cx.fill();cx.globalAlpha=1}
   if(stun){for(let i=0;i<3;i++){const a=clock*5+i*2.1;txt('*',Math.cos(a)*24,-16+Math.sin(a)*6,'#FFD23D',18)}}
   cx.restore();
   let lg=[-30,42],rgv=[30,44];
   if(st==='idle'){lg=[-30+Math.sin(clock*5)*3,40];rgv=[30-Math.sin(clock*5)*3,44]}
   if(tell&&atk){const k=atk.k,p=Math.sin(clock*25)*2;if(k==='L')lg=[-72+p,6];else if(k==='R')rgv=[72+p,6];else{lg=[-34,96];rgv=[34,96]}
    if(!atk.feint||Math.random()<.5){const ex=k==='L'?-72:k==='R'?72:0,col=k==='U'?'#FFD23D':'#FF3D5A';cx.shadowColor=col;cx.shadowBlur=18;txt('!',ex,-30,col,30);cx.shadowBlur=0}}
   if(st==='strike'&&atk){if(atk.k==='L')lg=[-10,118];else if(atk.k==='R')rgv=[10,118];else{lg=[-10,124];rgv=[10,124]}}
   const arm=(s,gx,gy,sd)=>{cx.lineCap='round';cx.strokeStyle=dk;cx.lineWidth=15;cx.beginPath();cx.moveTo(s,50);cx.quadraticCurveTo(s+sd*16,(50+gy)/2+18,gx,gy);cx.stroke();cx.strokeStyle=sk;cx.lineWidth=9;cx.beginPath();cx.moveTo(s,48);cx.quadraticCurveTo(s+sd*14,(50+gy)/2+16,gx,gy);cx.stroke()};
   const glove=(x,y,s,sd)=>{cx.fillStyle='#F5F5FF';cx.beginPath();cx.ellipse(x,y+s*.8,s*.7,s*.35,0,0,7);cx.fill();
    const gr=cx.createRadialGradient(x-s*.35,y-s*.4,s*.1,x,y,s*1.1);gr.addColorStop(0,'#FF7F9C');gr.addColorStop(.55,rg?'#FF2448':'#D3133D');gr.addColorStop(1,'#5A0418');cx.fillStyle=gr;cx.beginPath();cx.arc(x,y,s,0,7);cx.fill();
    cx.beginPath();cx.ellipse(x+sd*s*.7,y+s*.1,s*.38,s*.5,0,0,7);cx.fill();cx.fillStyle='rgba(255,255,255,.5)';cx.beginPath();cx.ellipse(x-s*.35,y-s*.45,s*.32,s*.18,-.5,0,7);cx.fill()};
   const gs=st==='strike'?26:18;arm(-36,lg[0],lg[1],-1);arm(36,rgv[0],rgv[1],1);glove(lg[0],lg[1],gs,-1);glove(rgv[0],rgv[1],gs,1);
   cx.shadowBlur=0;cx.restore();
   let px=W/2,py=H+6;if(pose==='dl')px-=72;if(pose==='dr')px+=72;if(pose==='guard')py+=12;
   cx.save();cx.translate(px,py);const ps='#8A5636',pd='#5E3520';
   g=cx.createLinearGradient(-52,0,52,0);g.addColorStop(0,pd);g.addColorStop(.5,ps);g.addColorStop(1,pd);cx.fillStyle=g;
   cx.beginPath();cx.moveTo(-14,-130);cx.quadraticCurveTo(-56,-124,-54,-100);cx.lineTo(-38,-20);cx.lineTo(38,-20);cx.lineTo(54,-100);cx.quadraticCurveTo(56,-124,14,-130);cx.closePath();cx.fill();
   cx.strokeStyle='rgba(40,18,8,.45)';cx.lineWidth=2;cx.beginPath();cx.moveTo(0,-118);cx.lineTo(0,-30);cx.moveTo(-26,-104);cx.quadraticCurveTo(-18,-86,-28,-70);cx.moveTo(26,-104);cx.quadraticCurveTo(18,-86,28,-70);cx.stroke();
   cx.fillStyle='#3DF5FF';cx.fillRect(-40,-82,80,16);cx.beginPath();cx.moveTo(-6,-82);cx.lineTo(-22,-126);cx.lineTo(-14,-128);cx.lineTo(0,-90);cx.lineTo(14,-128);cx.lineTo(22,-126);cx.lineTo(6,-82);cx.fill();
   g=cx.createLinearGradient(0,-28,0,10);g.addColorStop(0,'#FF3DCB');g.addColorStop(1,'#7A1060');cx.fillStyle=g;cx.fillRect(-42,-28,84,40);cx.fillStyle='#F5F5FF';cx.fillRect(-42,-28,84,6);
   cx.fillStyle=pd;cx.fillRect(-9,-142,18,16);
   cx.fillStyle='#1B0F0A';cx.beginPath();cx.ellipse(0,-158,23,26,0,0,7);cx.fill();
   cx.beginPath();cx.moveTo(-6,-140);cx.quadraticCurveTo(10+Math.sin(clock*4)*4,-110,2,-84);cx.lineTo(-4,-86);cx.quadraticCurveTo(2,-112,-8,-138);cx.fill();
   cx.fillStyle='#FF3DCB';cx.fillRect(-23,-170,46,6);
   const parm=(s,gx,gy,sd)=>{cx.lineCap='round';cx.strokeStyle=pd;cx.lineWidth=20;cx.beginPath();cx.moveTo(s,-112);cx.quadraticCurveTo(s+sd*20,(gy-112)/2,gx,gy);cx.stroke();cx.strokeStyle=ps;cx.lineWidth=12;cx.beginPath();cx.moveTo(s,-114);cx.quadraticCurveTo(s+sd*18,(gy-114)/2,gx,gy);cx.stroke()};
   const pg=(x,y,s,gl)=>{if(gl){cx.shadowColor='#FFD23D';cx.shadowBlur=30}const gr=cx.createRadialGradient(x-s*.3,y-s*.4,s*.1,x,y,s*1.1);gr.addColorStop(0,gl?'#FFF6B0':'#B8FCFF');gr.addColorStop(.55,gl?'#FFD23D':'#18C8E0');gr.addColorStop(1,gl?'#8A6000':'#06505E');cx.fillStyle=gr;cx.beginPath();cx.arc(x,y,s,0,7);cx.fill();cx.shadowBlur=0;cx.fillStyle='rgba(255,255,255,.45)';cx.beginPath();cx.ellipse(x-s*.3,y-s*.45,s*.3,s*.17,-.5,0,7);cx.fill()};
   let L=[-48,-118],R=[48,-118],Rs=24,gl=false;
   if(pose==='ph'){R=[16,-250];Rs=18}else if(pose==='pl'){R=[14,-195];Rs=19}else if(pose==='star'){R=[0,-262];gl=true}else if(pose==='guard'){L=[-20,-160];R=[20,-160]}
   parm(-44,L[0],L[1],-1);parm(44,R[0],R[1],1);pg(L[0],L[1],24,false);pg(R[0],R[1],Rs,gl);
   cx.restore();
   cx.globalCompositeOperation='lighter';parts.forEach(p=>{cx.globalAlpha=Math.max(0,Math.min(1,p.t*2));cx.fillStyle=p.c;cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill()});cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
   fx.forEach(f=>{cx.globalAlpha=Math.min(1,f.t*2);const sz=Math.round((f.s.length>6?18:24)*(1+Math.max(0,f.t-.45)*2));cx.font=`900 ${sz}px system-ui`;cx.textAlign='center';cx.lineWidth=4;cx.strokeStyle='#0B0B14';cx.strokeText(f.s,f.x,f.y);cx.fillStyle=f.c;cx.fillText(f.s,f.x,f.y)});cx.globalAlpha=1;
   cx.restore();
   const vg=cx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,ph<30?`rgba(160,0,30,${.35+.15*Math.sin(clock*8)})`:'rgba(0,0,0,.55)');cx.fillStyle=vg;cx.fillRect(0,0,W,H);
   const rr=(x,y,w,h,r)=>{cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()};
   const bar=(x,v,mx,c,lbl,al)=>{rr(x,10,150,13,6);cx.fillStyle='rgba(10,8,24,.85)';cx.fill();const w=Math.max(0,146*v/mx);if(w>1){const bg=cx.createLinearGradient(0,12,0,21);bg.addColorStop(0,'#FFF');bg.addColorStop(.25,c);bg.addColorStop(1,shade(c,-.4));cx.fillStyle=bg;cx.shadowColor=c;cx.shadowBlur=8;rr(al?x+148-w:x+2,12,w,9,4);cx.fill();cx.shadowBlur=0}cx.strokeStyle='rgba(255,255,255,.25)';rr(x,10,150,13,6);cx.stroke();cx.fillStyle='#EDEDF5';cx.font='bold 11px system-ui';cx.textAlign=al?'right':'left';cx.fillText(lbl,al?x+150:x,37)};
   bar(10,ph,100,'#3DF5FF','YOU',false);bar(W-160,eh,o.hp,raging()?'#FF3D5A':o.c,o.n,true);
   cx.textAlign='left';cx.font='bold 15px system-ui';cx.fillStyle='#FFD23D';cx.shadowColor='#FFD23D';cx.shadowBlur=10;cx.fillText('\u2605'.repeat(stars),10,57);cx.shadowBlur=0;
   cx.fillStyle='#9A9AB5';cx.font='bold 11px system-ui';cx.textAlign='right';cx.fillText('BOUT '+(oi+1)+'/6'+(raging()?'  \u00b7 RAGE':''),W-10,56);
   if(combo>2){cx.textAlign='left';txt(combo+'x COMBO',60,80,'#FF3DCB',14)}
   if(st==='intro'){const a=Math.min(1,(2.4-t)*3);cx.globalAlpha=a;const ig=cx.createLinearGradient(0,165,0,295);ig.addColorStop(0,'rgba(60,10,90,.92)');ig.addColorStop(1,'rgba(11,11,20,.92)');cx.fillStyle=ig;cx.fillRect(0,165,W,130);cx.fillStyle=o.c;cx.fillRect(0,165,W,3);cx.fillRect(0,292,W,3);
    txt('BOUT '+(oi+1)+(oi===5?' \u00b7 TITLE FIGHT':''),W/2,200,'#FF3DCB',15);cx.shadowColor=o.c;cx.shadowBlur=16;txt(o.n,W/2-(1-a)*80,240,o.c,23);cx.shadowBlur=0;txt('Special: '+o.spn,W/2,270,'#C9C9E0',13);cx.globalAlpha=1}
   if(mt>0&&st!=='intro'){const big=msg.startsWith('K.O')||msg==='DOWN!'||msg==='FIGHT!';cx.shadowColor=big?'#FFD23D':'#FF3DCB';cx.shadowBlur=20;cx.font=`900 ${msg.length<8?44:20}px system-ui`;cx.textAlign='center';cx.lineWidth=5;cx.strokeStyle='#0B0B14';cx.strokeText(msg,W/2,120);cx.fillStyle=big?'#FFD23D':'#FF3DCB';cx.fillText(msg,W/2,120);cx.shadowBlur=0}}}};
MAKERS.maze=()=>{
 const M=['###################','#o.......#.......o#','#.##.###.#.###.##.#','#.................#','#.##.#.#####.#.##.#','#....#...#...#....#','####.###.#.###.####','   #.#.......#.#   ','####.#.##-##.#.####','.......#GGG#.......','####.#.#####.#.####','   #.#.......#.#   ','####.#.#####.#.####','#........#........#','#.##.###.#.###.##.#','#o.#.....P.....#.o#','##.#.#.#####.#.#.##','#....#...#...#....#','#.######.#.######.#','#.................#','###################'];
 const COLS=19,ROWS=M.length,C=18,ox=(W-COLS*C)/2,oy=50;
 const NM=[['Byte','#FF3D5A'],['Flicker','#FF8ADF'],['Static','#3DF5FF'],['Fuzz','#FFA43D']];
 const D={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]},DL=Object.values(D);
 let grid,dots,pl,en,lives=3,lvl=1,fright=0,st,stT,clock=0,chain=0,fx=[];
 const cell=(x,y)=>y<0||y>=ROWS?'#':grid[y][(x+COLS)%COLS];
 const open=(x,y,g)=>{const c=cell(x,y);return c!=='#'&&(c!=='-'||g)};
 function reset(full){if(full){grid=M.map(r=>r.split(''));dots=0;grid.forEach(r=>r.forEach(c=>{if(c==='.'||c==='o')dots++}))}
  pl={x:9,y:15,d:[0,0],nd:[0,0],p:0};
  en=NM.map((n,i)=>({x:8+(i%3),y:9,d:[0,0],p:0,n:n[0],c:n[1],wait:i*1.5,eaten:0}));
  fright=0;st='ready';stT=1.6}
 reset(true);
 const spd=()=>5+lvl*.35;
 const pos=e=>[e.x+e.d[0]*e.p,e.y+e.d[1]*e.p];
 function choose(e,i){const g=true;let L=DL.filter(d=>open(e.x+d[0],e.y+d[1],g)&&!(d[0]===-e.d[0]&&d[1]===-e.d[1]));
  if(!L.length)L=DL.filter(d=>open(e.x+d[0],e.y+d[1],g));if(!L.length){e.d=[0,0];return}
  const inHouse=cell(e.x,e.y)==='G'||cell(e.x,e.y)==='-';
  let tx=pl.x,ty=pl.y;
  if(e.eaten){tx=9;ty=9}else if(inHouse){tx=9;ty=7}else if(fright>0){e.d=L[Math.floor(Math.random()*L.length)];return}
  else if(i===1){tx=pl.x+pl.d[0]*4;ty=pl.y+pl.d[1]*4}else if(i===2){tx=2*pl.x-en[0].x;ty=2*pl.y-en[0].y}else if(i===3&&Math.hypot(pl.x-e.x,pl.y-e.y)<6){tx=1;ty=19}
  if(!e.eaten&&!inHouse)L=L.filter(d=>cell(e.x+d[0],e.y+d[1])!=='-')||L;if(!L.length)L=[e.d];
  L.sort((a,b)=>Math.hypot(e.x+a[0]-tx,e.y+a[1]-ty)-Math.hypot(e.x+b[0]-tx,e.y+b[1]-ty));e.d=L[0];
  if(e.eaten&&e.x===9&&e.y===9)e.eaten=0}
 function advance(e,s,dt,onCell){e.p+=s*dt;let n=0;while(e.p>=1&&n++<3){e.p-=1;e.x=(e.x+e.d[0]+COLS)%COLS;e.y+=e.d[1];onCell(e)}}
 return{score:0,step(dt,end){clock+=dt;fx=fx.filter(f=>(f.t-=dt)>0);
  for(const k in D)if(take(k)||K[k])pl.nd=D[k];
  if(st!=='play'){stT-=dt;if(stT>0)return;if(st==='dead'){if(lives<=0)return end();reset(false)}else if(st==='clear'){lvl++;reset(true)}st='play';return}
  if(fright>0)fright-=dt;
  const me=this;
  if(pl.nd[0]===-pl.d[0]&&pl.nd[1]===-pl.d[1]&&pl.p>0){pl.x=(pl.x+pl.d[0]+COLS)%COLS;pl.y+=pl.d[1];pl.p=1-pl.p;pl.d=pl.nd}
  const turn=e=>{if(open(e.x+e.nd[0],e.y+e.nd[1],false))e.d=e.nd;if(!open(e.x+e.d[0],e.y+e.d[1],false)){e.d=[0,0];e.p=0}};
  if(pl.p===0)turn(pl);
  advance(pl,spd(),dt,e=>{const c=grid[e.y][e.x];
   if(c==='.'){grid[e.y][e.x]=' ';me.score+=10;dots--}else if(c==='o'){grid[e.y][e.x]=' ';me.score+=50;dots--;fright=Math.max(3,8-lvl*.6);chain=0}
   turn(e)});
  if(dots<=0){st='clear';stT=2;this.score+=500*lvl;return}
  const [px,py]=pos(pl);
  en.forEach((e,i)=>{if(e.wait>0){e.wait-=dt;return}
   if(e.d[0]===0&&e.d[1]===0)choose(e,i);
   const s=e.eaten?10:fright>0?spd()*.5:spd()*Math.min(.95,.8+lvl*.03);
   advance(e,s,dt,q=>choose(q,i));
   const [gx,gy]=pos(e);
   if(!e.eaten&&Math.hypot(gx-px,gy-py)<.65){if(fright>0){e.eaten=1;chain++;const v=200*Math.pow(2,chain-1);me.score+=v;fx.push({x:gx,y:gy,s:'+'+v,t:1})}else if(st==='play'){lives--;st='dead';stT=1.6}}})},
 draw(){const X=x=>ox+x*C+C/2,Y=y=>oy+y*C+C/2;
  const ln=(a,b,c,d)=>{cx.beginPath();cx.moveTo(ox+a*C,oy+b*C);cx.lineTo(ox+c*C,oy+d*C);cx.stroke()};
  cx.strokeStyle='#7B5BFF';cx.lineWidth=2;
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const c=grid[y][x];
   if(c==='#'){cx.fillStyle='#16123A';cx.fillRect(ox+x*C,oy+y*C,C,C);
    if(cell(x,y-1)!=='#')ln(x,y,x+1,y);if(cell(x,y+1)!=='#')ln(x,y+1,x+1,y+1);if(x>0&&cell(x-1,y)!=='#')ln(x,y,x,y+1);if(x<COLS-1&&cell(x+1,y)!=='#')ln(x+1,y,x+1,y+1)}
   else if(c==='-'){cx.fillStyle='#FF3DCB';cx.fillRect(ox+x*C,oy+y*C+C/2-1,C,3)}
   else if(c==='.'){cx.fillStyle='#FFE9A8';cx.fillRect(X(x)-2,Y(y)-2,4,4)}
   else if(c==='o'){cx.fillStyle='#3DFFB0';cx.beginPath();cx.arc(X(x),Y(y),5+Math.sin(clock*6)*1.5,0,7);cx.fill()}}
  const [ppx,ppy]=pos(pl),px=X(ppx),py=Y(ppy);
  cx.fillStyle='#BFFBFF';cx.beginPath();cx.arc(px,py,C*.36,0,7);cx.fill();
  cx.strokeStyle='#3DF5FF';cx.lineWidth=2.5;cx.beginPath();cx.arc(px,py,C*.5,clock*8,clock*8+4.2);cx.stroke();
  en.forEach(e=>{const [a,b]=pos(e),gx=X(a),gy=Y(b),s=C*.42;
   if(e.eaten){cx.fillStyle='#EDEDF5';cx.fillRect(gx-5,gy-3,3,3);cx.fillRect(gx+2,gy-3,3,3);return}
   const blue=fright>0&&(fright>2||Math.floor(clock*8)%2);cx.fillStyle=blue?'#3D5BFF':e.c;
   for(let k=0;k<3;k++){const j=Math.sin(clock*20+k*2+gx)*2;cx.fillRect(gx-s+j,gy-s+k*s*2/3,s*2,s*2/3+1)}
   cx.fillStyle='#0B0B14';cx.fillRect(gx-5,gy-4,4,4);cx.fillRect(gx+1,gy-4,4,4)});
  fx.forEach(f=>txt(f.s,X(f.x),Y(f.y),'#FFD23D',13));
  cx.font='bold 12px system-ui';cx.textAlign='left';cx.fillStyle='#9A9AB5';cx.fillText('LEVEL '+lvl,ox,32);
  cx.textAlign='right';cx.fillStyle='#3DF5FF';cx.fillText('LIVES '+'\u25cf'.repeat(Math.max(0,lives)),W-ox,32);
  if(st==='ready')txt(lvl===1?'READY':'LEVEL '+lvl,W/2,Y(11)+5,'#FFD23D',18);
  if(st==='dead')txt(lives>0?'ZAPPED!':'GAME OVER',W/2,Y(11)+5,'#FF3D5A',18);
  if(st==='clear')txt('MAZE CLEAR!',W/2,Y(11)+5,'#3DFFB0',18)}}};

// ============================================================================
// ARCADELINE WAVE 1 — games-wave1.js
// Six vanilla-JS ports registered as MAKERS.<id> for the Arcadeline runtime.
// Mechanics faithfully adapted from sausi-7/games (MIT, Copyright (c) 2026
// Saurabh Singh); all code here is rewritten into the MAKERS shape.
// Attribution to ship with the games:
//   "Portions adapted from sausi-7/games, MIT licensed, (c) 2026 Saurabh Singh."
// Canvas contract: 360x480 portrait (cv, cx, W=360, H=480), shared input via
// K/PK/take()/drag, helpers rnd/txt/clear, score via setScore, end() to finish.
// Each MAKER returns {score, step(dt,end), draw()}.
// STAGING ONLY — not deployed, not integrated.
// ============================================================================
/* MAKERS declared above (live games.js) */

// ---------------------------------------------------------------------------
// Swipe Assassin — ported from sausi-7/games (MIT). Mechanics faithful; code rewritten.
// ---------------------------------------------------------------------------
MAKERS.swipe=()=>{
 const G=6,T=48,ox=(W-G*T)/2,oy=104;
 const wall=[[0,0,0,0,0,0],[0,1,1,0,1,0],[0,0,0,0,1,0],[0,1,0,0,0,0],[0,1,0,1,1,0],[0,0,0,0,0,0]];
 const dirs=["up","down","left","right"];
 let P,E,wave,t,streak,fx,dead;
 const free=(x,y)=>!(x<0||y<0||x>=G||y>=G||wall[y][x]);
 const behind=(e,px,py)=>(e.d==="up"&&py>e.y)||(e.d==="down"&&py<e.y)||(e.d==="left"&&px>e.x)||(e.d==="right"&&px<e.x);
 const cell=(x,y)=>({x:ox+x*T+T/2,y:oy+y*T+T/2});
 function spawn(){
  P={x:0,y:0,d:"right"};E=[];t=0;streak=0;fx=[];dead=false;
  const spots=[[5,1],[3,4],[1,5],[4,0],[2,2],[5,5],[0,5],[4,4]];
  const n=Math.min(2+wave,spots.length);
  for(let i=0;i<n;i++)E.push({x:spots[i][0],y:spots[i][1],d:dirs[i%4],a:1});
 }
 wave=1;spawn();
 function face(c,d,fn){
  cx.save();cx.translate(c.x,c.y);
  cx.rotate(d==="up"?0:d==="right"?Math.PI/2:d==="down"?Math.PI:-Math.PI/2);fn();cx.restore();
 }
 function move(d){
  if(dead)return;
  let x=P.x,y=P.y;
  if(d==="up")y--;if(d==="down")y++;
  if(d==="left")x--;if(d==="right")x++;
  if(!free(x,y))return;
  P.d=d;
  const hit=E.find(e=>e.a&&e.x===x&&e.y===y);
  if(hit){
   if(behind(hit,P.x,P.y)){hit.a=0;fx.push({x,y,k:0});streak=t<3?streak+1:1;t=0;g.score+=100*streak;}
   else{dead=true;return;}
  }
  P.x=x;P.y=y;
  E.forEach(e=>{
   if(!e.a)return;
   let ex=e.x,ey=e.y;
   if(e.d==="up")ey--;if(e.d==="down")ey++;
   if(e.d==="left")ex--;if(e.d==="right")ex++;
   if(!free(ex,ey)){e.d=dirs[(Math.random()*4)|0];return;}
   e.x=ex;e.y=ey;
   if(ex===P.x&&ey===P.y)dead=true;
  });
  if(E.every(e=>!e.a)){wave++;spawn();}
 }
 const g={
  score:0,
  step(dt,end){
   t+=dt;
   fx.forEach(f=>f.k+=dt);fx=fx.filter(f=>f.k<0.35);
   for(const d of dirs)if(take(d))move(d);
   if(dead)end();
  },
  draw(){
   clear();
   txt("SWIPE ASSASSIN",W/2,30,"#38bdf8",20);
   txt("wave "+wave+"   score "+g.score,W/2,52,"#94a3b8",14);
   cx.strokeStyle="#334155";cx.lineWidth=1;
   for(let i=0;i<=G;i++){
    cx.beginPath();cx.moveTo(ox+i*T,oy);cx.lineTo(ox+i*T,oy+G*T);cx.stroke();
    cx.beginPath();cx.moveTo(ox,oy+i*T);cx.lineTo(ox+G*T,oy+i*T);cx.stroke();
   }
   for(let y=0;y<G;y++)for(let x=0;x<G;x++)if(wall[y][x]){
    cx.fillStyle="#475569";cx.fillRect(ox+x*T+9,oy+y*T+9,T-18,T-18);
   }
   E.forEach(e=>{
    if(!e.a)return;const c=cell(e.x,e.y);
    cx.fillStyle="#f87171";cx.beginPath();cx.arc(c.x,c.y,15,0,7);cx.fill();
    face(c,e.d,()=>{cx.fillStyle="#fecaca";cx.beginPath();cx.moveTo(0,-16);cx.lineTo(-8,-4);cx.lineTo(8,-4);cx.fill();});
   });
   const c=cell(P.x,P.y);
   cx.fillStyle="#38bdf8";cx.beginPath();cx.arc(c.x,c.y,15,0,7);cx.fill();
   face(c,P.d,()=>{cx.fillStyle="#fff";cx.beginPath();cx.moveTo(0,-16);cx.lineTo(-8,-4);cx.lineTo(8,-4);cx.fill();});
   fx.forEach(f=>{
    const c2=cell(f.x,f.y);cx.strokeStyle="rgba(255,255,255,"+(1-f.k/0.35)+")";cx.lineWidth=4;
    cx.beginPath();cx.moveTo(c2.x-14,c2.y-14);cx.lineTo(c2.x+14,c2.y+14);cx.stroke();
    cx.beginPath();cx.moveTo(c2.x+14,c2.y-14);cx.lineTo(c2.x-14,c2.y+14);cx.stroke();
   });
   if(streak>1)txt("COMBO x"+streak,W/2,oy+G*T+26,"#fbbf24",16);
   txt("swipe or arrows - strike from behind",W/2,H-16,"#64748b",12);
  }
 };
 return g;
};

// ---------------------------------------------------------------------------
// Hex Puzzle — ported from sausi-7/games (MIT). Mechanics faithful; code rewritten.
// ---------------------------------------------------------------------------
MAKERS.hex=()=>{
const SZ=21,R=4,BX=180,BY=190,TY=410,SQ3=Math.sqrt(3),MS=15;
const key=(q,r)=>q+','+r;
const COLS=['#22c55e','#38bdf8','#f97316','#e879f9','#facc15','#fb7185','#a78bfa'];
const SH=[[[0,0]],[[0,0],[1,0]],[[0,0],[0,1]],[[0,0],[-1,1]],[[0,0],[1,0],[0,1]],[[0,0],[-1,0],[1,0]],[[0,0],[0,-1],[0,1]],[[0,0],[1,0],[2,0]],[[0,0],[0,1],[0,2]],[[0,0],[-1,1],[-2,2]],[[0,0],[1,0],[0,1],[-1,1]],[[0,0],[1,0],[0,1],[0,2]],[[0,0],[-1,0],[0,1],[1,0]]];
const board=new Map(),LQ={},LR={},LS={};
for(let q=-R;q<=R;q++)for(let r=-R;r<=R;r++){if(Math.abs(q+r)>R)continue;const k=key(q,r);board.set(k,null);(LQ[q]=LQ[q]||[]).push(k);(LR[r]=LR[r]||[]).push(k);(LS[q+r]=LS[q+r]||[]).push(k);}
const LINES=[...Object.values(LQ),...Object.values(LR),...Object.values(LS)];
const hp=(q,r,s)=>{s=s||SZ;return[BX+s*SQ3*(q+r/2),BY+s*1.5*r];};
function ph(x,y){const px=(x-BX)/SZ,py=(y-BY)/SZ;const fq=SQ3/3*px-py/3,fr=2/3*py,fs=-fq-fr;let q=Math.round(fq),r=Math.round(fr);const s=Math.round(fs),dq=Math.abs(q-fq),dr=Math.abs(r-fr),ds=Math.abs(s-fs);if(dq>dr&&dq>ds)q=-r-s;else if(dr>ds)r=-q-s;return{q,r};}
function hx(x,y,s,fill,al,lw){cx.beginPath();for(let i=0;i<6;i++){const an=Math.PI/6+Math.PI/3*i,X=x+s*Math.cos(an),Y=y+s*Math.sin(an);i?cx.lineTo(X,Y):cx.moveTo(X,Y);}cx.closePath();cx.globalAlpha=al==null?1:al;cx.fillStyle=fill;cx.fill();cx.globalAlpha=1;if(lw){cx.lineWidth=lw;cx.strokeStyle='#fff';cx.stroke();}}
const XS=[64,180,296];
let tray=[],sel=0,cur={q:0,r:0},trayMode=false,svCur=null,pd=null,downP=null,fx=[],over=false,ended=false,swallow=false;
function newTray(){tray=[];for(let i=0;i<3;i++)tray.push({b:SH[(rnd(0,SH.length))|0],c:COLS[(rnd(0,COLS.length))|0],x:XS[i],y:TY,hx:XS[i],hy:TY});sel=0;}
function cells(b,oq,or){const t=[];for(const d of b){const k=key(oq+d[0],or+d[1]);if(!board.has(k)||board.get(k))return null;t.push(k);}return t;}
function clearLines(){let n=0;for(const L of LINES){let f=true;for(const k of L)if(!board.get(k)){f=false;break;}if(f){n++;for(const k of L){board.set(k,null);const p=k.split(','),xy=hp(+p[0],+p[1]);fx.push({x:xy[0],y:xy[1],t:0});}}}return n;}
function anyMove(){for(const t of tray)for(const k of board.keys()){const p=k.split(',');if(cells(t.b,+p[0],+p[1]))return true;}return false;}
function place(t,oq,or){const ts=cells(t.b,oq,or);if(!ts)return false;for(const k of ts)board.set(k,t.c);g.score+=ts.length+10*clearLines();tray.splice(tray.indexOf(t),1);if(!tray.length)newTray();else if(sel>=tray.length)sel=0;if(!anyMove())over=true;return true;}
function mv(dq,dr){if(board.has(key(cur.q+dq,cur.r+dr)))cur={q:cur.q+dq,r:cur.r+dr};}
function pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
function onDown(e){const p=pos(e);downP=p;for(let i=0;i<tray.length;i++){const t=tray[i],dx=p.x-t.x,dy=p.y-t.y;if(dx*dx+dy*dy<1936){pd={i};sel=i;e.preventDefault();return;}}}
function onMove(e){if(!pd)return;const p=pos(e),t=tray[pd.i];t.x=p.x;t.y=p.y;}
function onUp(e){const p=pos(e);if(pd){const t=tray[pd.i];pd=null;swallow=true;if(downP&&Math.hypot(p.x-downP.x,p.y-downP.y)<8){t.x=t.hx;t.y=t.hy;downP=null;return;}const o=ph(t.x,t.y);if(!place(t,o.q,o.r)){t.x=t.hx;t.y=t.hy;}downP=null;return;}if(downP&&Math.hypot(p.x-downP.x,p.y-downP.y)<8){swallow=true;const o=ph(p.x,p.y);if(board.has(key(o.q,o.r))){cur=o;trayMode=false;}}downP=null;}
function cleanup(){cv.removeEventListener('pointerdown',onDown);cv.removeEventListener('pointermove',onMove);cv.removeEventListener('pointerup',onUp);cv.removeEventListener('pointercancel',onUp);}
cv.addEventListener('pointerdown',onDown);cv.addEventListener('pointermove',onMove);cv.addEventListener('pointerup',onUp);cv.addEventListener('pointercancel',onUp);
newTray();
const g={score:0,
step(dt,end){if(over&&!ended){ended=true;cleanup();end();return;}
for(const f of fx)f.t+=dt*2.5;fx=fx.filter(f=>f.t<1);
if(take('left')){if(trayMode)sel=(sel+2)%3;else mv(-1,0);}
if(take('right')){if(trayMode)sel=(sel+1)%3;else mv(1,0);}
if(take('up')){if(trayMode){trayMode=false;cur=svCur||cur;}else mv(0,-1);}
if(take('down')){if(trayMode)sel=(sel+1)%3;else if(board.has(key(cur.q,cur.r+1)))mv(0,1);else{trayMode=true;svCur=cur;}}
if(take('fire')){if(swallow)swallow=false;else if(trayMode){trayMode=false;cur=svCur||cur;}else{const t=tray[sel];if(t)place(t,cur.q,cur.r);}}},
draw(){clear();txt('SCORE '+g.score,180,26,'#ffffff',20);
for(const e of board){const p=e[0].split(','),xy=hp(+p[0],+p[1]);hx(xy[0],xy[1],SZ-1.5,e[1]||'#182a44');}
for(const f of fx)hx(f.x,f.y,(SZ-1.5)*(1+f.t*0.35),'#ffffff',(1-f.t)*0.7);
if(pd){const t=tray[pd.i],o=ph(t.x,t.y),ok=cells(t.b,o.q,o.r);
for(const d of t.b){const xy=hp(o.q+d[0],o.r+d[1]);hx(xy[0],xy[1],SZ-2,t.c,ok?0.6:0.22);}
if(!ok){const xy=hp(o.q,o.r);hx(xy[0],xy[1],SZ-1.5,'#ef4444',0.3,2);}}
for(let i=0;i<tray.length;i++){const t=tray[i];if(pd&&tray[pd.i]===t)continue;
for(const d of t.b)hx(t.x+MS*SQ3*(d[0]+d[1]/2),t.y+MS*1.5*d[1],MS-1.5,t.c);
if(i===sel)hx(t.x,t.y,MS*2.4,'rgba(0,0,0,0)',0,2);}
if(pd){const t=tray[pd.i];for(const d of t.b){const xy=hp(d[0],d[1]);hx(t.x+xy[0]-BX,t.y+xy[1]-BY,SZ-2,t.c);}}
if(trayMode)hx(XS[sel],TY,MS*2.4,'rgba(0,0,0,0)',0,2);
else{const xy=hp(cur.q,cur.r);hx(xy[0],xy[1],SZ-1.5,'rgba(0,0,0,0)',0,2);}
txt('drag pieces onto the board - fill a line to clear',180,466,'#7d8fb0',11);}};
return g;};
// Line Trap — ported from sausi-7/games (MIT). Mechanics faithful; code rewritten.
MAKERS.linetrap=()=>{
const TAU=Math.PI*2,CX=W/2,CY=H/2;
let lines=[],enemies=[],kills=0,wave=0,waveT=0,over=false;
let sx=0,sy=0,px=0,py=0,down=false;
let cur={x:CX,y:CY},anchor=null;
function hit(l,e){
  const ax=l.x1,ay=l.y1,bx=l.x2,by=l.y2;
  const len=Math.hypot(bx-ax,by-ay);
  if(len<1)return false;
  const dx=(bx-ax)/len,dy=(by-ay)/len;
  const t=Math.max(0,Math.min(len,dx*(e.x-ax)+dy*(e.y-ay)));
  return Math.hypot(ax+dx*t-e.x,ay+dy*t-e.y)<=e.r;
}
function spawn(){
  const n=4+2*wave;
  for(let i=0;i<n;i++){
    const edge=(Math.random()*4)|0;let x,y;
    if(edge===0){x=rnd(0,W);y=-14;}else if(edge===1){x=W+14;y=rnd(0,H);}
    else if(edge===2){x=rnd(0,W);y=H+14;}else{x=-14;y=rnd(0,H);}
    enemies.push({x,y,r:9,sp:(30+9*wave)*rnd(.8,1.3),d:rnd(0,1+.4*wave)});
  }
}
function nextWave(){wave++;waveT=0;enemies=[];spawn();}
nextWave();
function pos(e){const r=cv.getBoundingClientRect();
  return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
const pd=e=>{const p=pos(e);down=true;sx=px=p.x;sy=py=p.y;e.preventDefault();};
const pm=e=>{if(!down)return;const p=pos(e);px=p.x;py=p.y;e.preventDefault();};
const pu=e=>{if(!down)return;down=false;e.preventDefault();
  if(Math.hypot(px-sx,py-sy)>15)lines.push({x1:sx,y1:sy,x2:px,y2:py,t:0});};
cv.addEventListener('pointerdown',pd);cv.addEventListener('pointermove',pm);
cv.addEventListener('pointerup',pu);cv.addEventListener('pointercancel',pu);
function cleanup(){cv.removeEventListener('pointerdown',pd);
  cv.removeEventListener('pointermove',pm);cv.removeEventListener('pointerup',pu);
  cv.removeEventListener('pointercancel',pu);}
function step(dt,end){
  const fin=()=>{cleanup();end();};
  if(over)return;
  const s=260*dt;
  if(K.left)cur.x-=s;if(K.right)cur.x+=s;if(K.up)cur.y-=s;if(K.down)cur.y+=s;
  cur.x=Math.max(0,Math.min(W,cur.x));cur.y=Math.max(0,Math.min(H,cur.y));
  if(take('fire')){
    if(anchor&&Math.hypot(cur.x-anchor.x,cur.y-anchor.y)>15){
      lines.push({x1:anchor.x,y1:anchor.y,x2:cur.x,y2:cur.y,t:0});anchor=null;}
    else anchor={x:cur.x,y:cur.y};
  }
  waveT+=dt;
  for(const l of lines)l.t+=dt;
  lines=lines.filter(l=>l.t<2);
  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i];
    if(e.d>0){e.d-=dt;continue;}
    const dx=CX-e.x,dy=CY-e.y,d=Math.hypot(dx,dy)||1;
    e.x+=dx/d*e.sp*dt;e.y+=dy/d*e.sp*dt;
    if(d<16){over=true;fin();return;}
    for(const l of lines)if(hit(l,e)){enemies.splice(i,1);kills++;g.score+=10;break;}
  }
  if(!enemies.length){
    g.score+=250+Math.max(0,200-Math.floor(waveT)*10);
    if(wave>=5){over=true;fin();return;}
    nextWave();
  }
}
function draw(){
  clear();
  cx.save();cx.shadowColor='#38bdf8';cx.shadowBlur=22;cx.fillStyle='#38bdf8';
  cx.beginPath();cx.arc(CX,CY,16,0,TAU);cx.fill();cx.restore();
  cx.strokeStyle='#a5f3fc';cx.lineWidth=4;cx.lineCap='round';
  for(const l of lines){cx.globalAlpha=1-l.t/2;cx.beginPath();
    cx.moveTo(l.x1,l.y1);cx.lineTo(l.x2,l.y2);cx.stroke();}
  cx.globalAlpha=1;
  if(down){cx.beginPath();cx.moveTo(sx,sy);cx.lineTo(px,py);cx.stroke();}
  if(anchor){cx.setLineDash([6,6]);cx.beginPath();
    cx.moveTo(anchor.x,anchor.y);cx.lineTo(cur.x,cur.y);cx.stroke();cx.setLineDash([]);}
  for(const e of enemies){cx.fillStyle='#ef4444';cx.beginPath();cx.arc(e.x,e.y,e.r,0,TAU);cx.fill();}
  cx.strokeStyle='#f8fafc';cx.lineWidth=1;cx.beginPath();cx.arc(cur.x,cur.y,7,0,TAU);cx.stroke();
  txt('WAVE '+wave+'/5',W/2,20,'#e5e7eb',14);
  txt('ENEMIES LEFT '+enemies.length+'   SCORE '+g.score,W/2,40,'#93c5fd',13);
  txt('DRAG: DRAW LINE  |  ARROWS+SPACE: ANCHOR+DRAW',W/2,H-12,'#64748b',10);
}
const g={score:0,step,draw};
return g;
};
// Sudoku — ported from sausi-7/games (MIT). Mechanics faithful; code rewritten.
MAKERS.sudoku=()=>{
const R=(typeof DAILY_RNG==='function')?DAILY_RNG:rnd;
// --- puzzle: backtracking fill + hole-digging with unique-solution check ---
const sh=a=>{for(let i=a.length-1;i>0;i--){const j=(R(0,i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const ok=(g,r,c,n)=>{for(let i=0;i<9;i++)if(g[r][i]===n||g[i][c]===n)return 0;const br=r-r%3,bc=c-c%3;for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(g[br+i][bc+j]===n)return 0;return 1};
const SOL=[...Array(9)].map(()=>Array(9).fill(0));
const fill=g=>{for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!g[r][c]){for(const n of sh([1,2,3,4,5,6,7,8,9]))if(ok(g,r,c,n)){g[r][c]=n;if(fill(g))return 1;g[r][c]=0}return 0}return 1};
fill(SOL);
const count2=g=>{let n=0;const s=g.map(r=>r.slice());const rec=()=>{if(n>1)return;for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!s[r][c]){for(let v=1;v<=9;v++)if(ok(s,r,c,v)){s[r][c]=v;rec();s[r][c]=0}return}n++};rec();return n};
const PUZ=SOL.map(r=>r.slice());let rem=0,guard=0;
while(rem<44&&guard++<400){const r=(R(0,9))|0,c=(R(0,9))|0,t=PUZ[r][c];if(!t)continue;PUZ[r][c]=0;if(count2(PUZ)!==1)PUZ[r][c]=t;else rem++}
// --- state ---
const BX=18,BY=56,CS=36,PY=388,BY2=432;
const grid=PUZ.map(r=>r.slice()),giv=PUZ.map(r=>r.map(v=>v!==0));
const notes=[...Array(9)].map(()=>[...Array(9)].map(()=>new Set()));
let cur={r:4,c:4},nm=false,mist=0,t=0,done=0,lost=0,fin=0,flT=0,fx=0,fy=0;
const secs=()=>t|0;
const fmt=s=>((s/60)|0)+':'+(''+(s%60|0)).padStart(2,'0');
function put(n){if(done||lost)return;const{r,c}=cur;if(giv[r][c])return;
  if(n===0){grid[r][c]=0;notes[r][c].clear();return}
  if(nm){notes[r][c].has(n)?notes[r][c].delete(n):notes[r][c].add(n);return}
  if(n===SOL[r][c]){grid[r][c]=n;notes[r][c].clear();
    for(let i=0;i<9;i++){notes[r][i].delete(n);notes[i][c].delete(n)}
    if(grid.every((row,rr)=>row.every((v,cc)=>v!==0))){fin=Math.max(0,10000-secs()*10-mist*500);done=1.6}}
  else{mist++;flT=.6;fx=r;fy=c;if(mist>=3)lost=1.4}}
const kd=e=>{if(e.key>='1'&&e.key<='9')put(+e.key);else if(e.key==='0'||e.key==='Backspace'||e.key==='Delete')put(0);else if(e.key==='n'||e.key==='N')nm=!nm};
addEventListener('keydown',kd);
const pd=e=>{if(done||lost)return;const b=cv.getBoundingClientRect();
  const x=(e.clientX-b.left)*W/b.width,y=(e.clientY-b.top)*H/b.height;
  const br=((y-BY)/CS)|0,bc=((x-BX)/CS)|0;
  if(br>=0&&br<9&&bc>=0&&bc<9){cur={r:br,c:bc};return}
  if(y>=PY&&y<=PY+36){const i=((x-BX)/CS)|0;if(i>=0&&i<9)put(i+1);return}
  if(y>=BY2&&y<=BY2+40){if(x<180)nm=!nm;else put(0)}};
cv.addEventListener('pointerdown',pd);
return{score:0,
step(dt,end){const _end=()=>{cv.removeEventListener('pointerdown',pd);removeEventListener('keydown',kd);end()};
  t+=dt;flT=Math.max(0,flT-dt);
  if(take('left'))cur.c=(cur.c+8)%9;if(take('right'))cur.c=(cur.c+1)%9;
  if(take('up'))cur.r=(cur.r+8)%9;if(take('down'))cur.r=(cur.r+1)%9;
  take('fire');take('up'); // drain taps/keys we handle ourselves
  if(done){this.score=fin;done-=dt;if(done<=0)_end();return}
  if(lost){lost-=dt;if(lost<=0)_end()}},
draw(){clear();
  txt(fmt(secs()),60,30,'#EDEDF5',18);txt('X '+mist+'/3',300,30,mist?'#FF6B6B':'#9A9AB5',18);
  const sel=grid[cur.r][cur.c],sv=sel||0;
  cx.fillStyle='#141824';cx.fillRect(BX,BY,CS*9,CS*9);
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){const x=BX+c*CS,y=BY+r*CS;
    const sameBox=(r/3|0)===(cur.r/3|0)&&(c/3|0)===(cur.c/3|0);
    if(r===cur.r||c===cur.c||sameBox){cx.fillStyle='rgba(125,211,252,.10)';cx.fillRect(x,y,CS,CS)}
    if(sv&&grid[r][c]===sv){cx.fillStyle='rgba(125,211,252,.22)';cx.fillRect(x,y,CS,CS)}
    if(r===cur.r&&c===cur.c){cx.fillStyle='rgba(251,191,36,.30)';cx.fillRect(x,y,CS,CS)}
    if(flT>0&&r===fx&&c===fy){cx.fillStyle='rgba(255,60,60,.45)';cx.fillRect(x,y,CS,CS)}
    if(grid[r][c])txt(grid[r][c],x+CS/2,y+CS/2+7,giv[r][c]?'#EDEDF5':'#7DD3FC',giv[r][c]?20:19);
    else if(notes[r][c].size){cx.fillStyle='#9A9AB5';cx.font='10px system-ui';cx.textAlign='center';
      for(const d of notes[r][c])cx.fillText(d,x+((d-1)%3)*11+12,y+(((d-1)/3)|0)*11+13)}}
  cx.strokeStyle='rgba(255,255,255,.14)';cx.lineWidth=1;
  for(let i=0;i<=9;i++){const p=BX+i*CS,q=BY+i*CS;
    cx.strokeStyle=i%3?'rgba(255,255,255,.14)':'rgba(255,255,255,.45)';cx.lineWidth=i%3?1:2;
    cx.beginPath();cx.moveTo(p,BY);cx.lineTo(p,BY+CS*9);cx.moveTo(BX,q);cx.lineTo(BX+CS*9,q);cx.stroke()}
  for(let i=0;i<9;i++){const x=BX+i*CS,y=PY;let full=0;
    for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(grid[r][c]===i+1)full++;
    cx.fillStyle=full>=9?'#232838':'#2E3B55';cx.fillRect(x+1,y,CS-2,36);
    txt(i+1,x+CS/2,y+25,full>=9?'#555B70':'#EDEDF5',18)}
  const btn=(x,l,act)=>{cx.fillStyle=act?'#3B6FE0':'#232838';cx.fillRect(x,BY2,156,40);
    txt(l,x+78,BY2+27,act?'#fff':'#9A9AB5',15)};
  btn(BX,'NOTE: '+(nm?'ON':'OFF'),nm);btn(186,'ERASE',false);
  if(done)txt('SOLVED!',W/2,H/2,'#FBBF24',44);
  if(lost)txt('3 MISTAKES',W/2,H/2,'#FF6B6B',34);
  if(!done&&!lost&&t<3)txt('tap a cell, then 1-9',W/2,H-6,'#9A9AB5',13)}};
};

// ---------------------------------------------------------------------------
// Ludo — ported from sausi-7/games (MIT). DOM rendering rewritten to canvas; logic faithful.
// ---------------------------------------------------------------------------
MAKERS.ludo=()=>{
const COL=['#e84148','#00a859','#f7d842','#1f4cb9'];
const LT=['#f6cdd0','#cdeeda','#fdf3c2','#ccd9f6'];
const PN=['YOU','AI 1','AI 2','AI 3'];
const RT=[];{let r=13,c=6,f=1;const LG=[[-1,0,5],[-1,-1,1],[0,-1,5],[-1,0,2],[0,1,5],[-1,1,1],[-1,0,5],[0,1,2],[1,0,5],[1,1,1],[0,1,5],[1,0,2],[0,-1,5],[1,-1,1],[1,0,5],[0,-1,2]];
for(const q of LG)for(let i=0;i<q[2];i++){if(!f){r+=q[0];c+=q[1];}f=0;RT.push([r,c]);}}
const HP=[[[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],[[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],[[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],[[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]]];
const YD=[[[11,1],[11,3],[13,1],[13,3]],[[1,1],[1,3],[3,1],[3,3]],[[1,11],[1,13],[3,11],[3,13]],[[11,11],[11,13],[13,11],[13,13]]];
const EN=[0,13,26,39],SAFE=[1,9,14,22,27,35,40,48],YO=[[0,9],[0,0],[9,0],[9,9]];
const CS=22,BX=15,BY=46,DX=105,DY=392,DW=150,DH=52;
const PX=c=>BX+(c+.5)*CS,PY=r=>BY+(r+.5)*CS;
let tok=[[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1]];
let cur=0,dice=0,phase='roll',moves=[],sel=0,tmr=0,anim=null,over=null,msg='YOUR TURN - ROLL';
let pcs=[];
function cellOf(p,t){const s=tok[p][t];if(s<0)return YD[p][t];if(s<52)return RT[(EN[p]+s)%52];return HP[p][s-52];}
function sim(p,t,d){const s=tok[p][t];if(s<0)return d===6?{ns:0,abs:EN[p]}:null;const ns=s+d;if(ns>57)return null;return ns<52?{ns:ns,abs:(EN[p]+ns)%52}:{ns:ns,abs:null};}
function getMoves(p,d){const a=[];for(let t=0;t<4;t++){const s=sim(p,t,d);if(s)a.push({t:t,s:s});}return a;}
function homeN(p){let n=0;for(let t=0;t<4;t++)if(tok[p][t]===57)n++;return n;}
function oppOut(){let n=0;for(let p=1;p<4;p++)for(let t=0;t<4;t++){const s=tok[p][t];if(s>=0&&s<57)n++;}return n;}
function doRoll(){dice=1+Math.floor(rnd(0,6));moves=getMoves(cur,dice);
 if(!moves.length){msg='ROLLED '+dice+' - NO MOVE';phase='pass';tmr=1;}
 else if(cur>0){doMove(pickAI());}else{phase='pick';sel=0;msg='ROLLED '+dice+' - PICK A PIECE';}}
function pickAI(){let best=moves[0],bs=-1e9;for(const m of moves){let sc=m.s.ns*.6;
 if(tok[cur][m.t]<0)sc+=40;if(m.s.ns===57)sc+=50;
 if(m.s.abs!=null){if(SAFE.indexOf(m.s.abs)<0){for(let o=0;o<4;o++)if(o!==cur)for(let t=0;t<4;t++){const s=tok[o][t];if(s>=0&&s<52&&(EN[o]+s)%52===m.s.abs)sc+=60;}}else sc+=12;}
 if(sc>bs||(sc===bs&&Math.random()<.5)){bs=sc;best=m;}}return best;}
function doMove(m){anim={p:cur,t:m.t,to:m.s.ns,abs:m.s.abs};phase='anim';tmr=.12;msg='';}
function hop(){const a=anim;const s=tok[a.p][a.t];tok[a.p][a.t]=s<0?0:s+1;
 if(tok[a.p][a.t]>=a.to){anim=null;afterMove(a);}}
function afterMove(a){const p=a.p;
 if(a.abs!=null&&a.to<52&&SAFE.indexOf(a.abs)<0){let hit=false;
  for(let o=0;o<4;o++)if(o!==p)for(let t=0;t<4;t++){const s=tok[o][t];
   if(s>=0&&s<52&&(EN[o]+s)%52===a.abs){tok[o][t]=-1;hit=true;}}
  if(hit)msg='CAPTURE!';}
 if(homeN(p)===4){over={win:p===0,t:2};phase='over';msg=p===0?'YOU WIN!':PN[p]+' WINS';return;}
 if(dice===6){if(p===0){phase='roll';msg='ROLLED 6 - GO AGAIN';}else{phase='ai';tmr=.7;}}
 else nextTurn();}
function nextTurn(){cur=(cur+1)%4;msg='';
 if(cur===0){phase='roll';msg='YOUR TURN - ROLL';}else{phase='ai';tmr=.8;}}
function tap(e){if(over)return;const b=cv.getBoundingClientRect();
 const x=(e.clientX-b.left)*W/b.width,y=(e.clientY-b.top)*H/b.height;
 if(phase==='roll'&&x>DX&&x<DX+DW&&y>DY&&y<DY+DH){doRoll();return;}
 if(phase==='pick')for(const q of pcs){if(q.p!==cur)continue;const dx=x-q.x,dy=y-q.y;
  if(dx*dx+dy*dy<144){const m=moves.find(z=>z.t===q.t);if(m){doMove(m);return;}}}}
cv.addEventListener('pointerdown',tap);
function T(s,x,y,col,size){cx.fillStyle=col;cx.font='bold '+size+'px system-ui,sans-serif';cx.fillText(s,x,y);}
const g={score:0,
step(dt,end){const fin=()=>{cv.removeEventListener('pointerdown',tap);end();};
 if(over){over.t-=dt;if(over.t<=0){g.score=over.win?1000+50*oppOut():100*homeN(0);fin();}return;}
 if(phase==='roll'&&take('fire'))doRoll();
 else if(phase==='pick'){if(take('left'))sel=(sel+moves.length-1)%moves.length;
  if(take('right'))sel=(sel+1)%moves.length;if(take('fire'))doMove(moves[sel]);}
 if(phase==='ai'){tmr-=dt;if(tmr<=0)doRoll();}
 else if(phase==='pass'){tmr-=dt;if(tmr<=0)nextTurn();}
 else if(phase==='anim'&&anim){tmr-=dt;while(tmr<=0&&anim){tmr+=.09;hop();}}
 g.score=100*homeN(0);},
draw(){clear();pcs=[];
 cx.textAlign='center';cx.textBaseline='middle';
 cx.fillStyle='#0e1626';cx.fillRect(0,0,W,44);
 T(PN[cur]+(cur===0?' - YOUR TURN':' IS THINKING'),W/2,15,'#fff',14);
 T(msg,W/2,33,'#9fb3d1',11);
 for(let p=0;p<4;p++){const ox=BX+YO[p][0]*CS,oy=BY+YO[p][1]*CS;
  cx.fillStyle=COL[p];cx.fillRect(ox,oy,CS*6,CS*6);
  cx.fillStyle='#f7f9fc';cx.fillRect(ox+CS,oy+CS,CS*4,CS*4);}
 for(const c of RT){cx.fillStyle='#eef1f6';cx.fillRect(BX+c[1]*CS+.5,BY+c[0]*CS+.5,CS-1,CS-1);}
 for(let p=0;p<4;p++){cx.fillStyle=LT[p];for(const c of HP[p])cx.fillRect(BX+c[1]*CS+.5,BY+c[0]*CS+.5,CS-1,CS-1);}
 cx.fillStyle='#33415c';for(const i of SAFE)cx.fillRect(PX(RT[i][1])-2,PY(RT[i][0])-2,4,4);
 for(let p=0;p<4;p++){cx.strokeStyle=COL[p];cx.lineWidth=2;cx.beginPath();cx.arc(PX(RT[EN[p]][1]),PY(RT[EN[p]][0]),7,0,7);cx.stroke();}
 const zx=BX+6*CS,zy=BY+6*CS,zs=3*CS,hx=zx+zs/2,hy=zy+zs/2;
 cx.fillStyle='#101826';cx.fillRect(zx,zy,zs,zs);
 const tri=(x1,y1,x2,y2,col)=>{cx.fillStyle=col;cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.lineTo(hx,hy);cx.closePath();cx.fill();};
 tri(zx,zy,zx+zs,zy,COL[3]);tri(zx+zs,zy,zx+zs,zy+zs,COL[2]);tri(zx+zs,zy+zs,zx,zy+zs,COL[0]);tri(zx,zy+zs,zx,zy,COL[1]);
 const grp={};for(let p=0;p<4;p++)for(let t=0;t<4;t++){const c=cellOf(p,t),k=c[0]*15+c[1];(grp[k]=grp[k]||[]).push([p,t]);}
 for(const k in grp){const a=grp[k],n=a.length;
  a.forEach((pt,i)=>{const p=pt[0],t=pt[1],c=cellOf(p,t);
   const ox=n>1?((i%2)-.5)*CS*.6:0,oy=n>1?(((i/2)|0)-.5)*CS*.6:0;
   const x=PX(c[1])+ox,y=PY(c[0])+oy,rad=n>1?CS*.24:CS*.32;
   const mv=phase==='pick'&&p===cur&&moves.some(m=>m.t===t);
   cx.fillStyle=COL[p];cx.beginPath();cx.arc(x,y,rad,0,7);cx.fill();
   cx.lineWidth=2;cx.strokeStyle='#fff';cx.stroke();
   if(mv){const isSel=moves[sel]&&moves[sel].t===t;
    cx.lineWidth=isSel?3:1.5;cx.strokeStyle=isSel?'#fff':'#ffd24a';
    cx.beginPath();cx.arc(x,y,rad+3.5,0,7);cx.stroke();}
   pcs.push({p:p,t:t,x:x,y:y});});}
 cx.fillStyle=phase==='roll'?'#1f4cb9':'#24314d';
 cx.beginPath();if(cx.roundRect)cx.roundRect(DX,DY,DW,DH,12);else cx.rect(DX,DY,DW,DH);cx.fill();
 T(phase==='roll'?'ROLL':'DICE '+dice,W/2,DY+DH/2,'#fff',20);
 T('tap ROLL / SPACE - tap a glowing piece to move it',W/2,DY+DH+13,'#9fb3d1',10);
 if(over){cx.fillStyle='rgba(5,8,16,.78)';cx.fillRect(0,0,W,H);
  T(msg,W/2,H/2-16,over.win?'#ffd24a':'#ff7a7a',30);
  T('SCORE '+g.score,W/2,H/2+22,'#fff',16);}}};
return g;};

// ---------------------------------------------------------------------------
// Street Football — ported from sausi-7/games football (MIT); rebranded from "Sports Heads"-style clone.
// Mechanics faithful; code and art rewritten.
// ---------------------------------------------------------------------------
MAKERS.streetball=()=>{
const W=360,H=480,F=400,GW=26,GH=92,BAR=F-GH,GRAV=1500;
const mk=(x,dir)=>({x,y:F-24,vx:0,vy:0,r:24,onG:true,kt:0,dir});
const me=mk(90,1),ai=mk(270,-1);
const ball={x:180,y:F-12,vx:0,vy:0,r:12};
let gp=0,ga=0,t=60,pause=0,fx=0;
const pts=new Set();
const pDown=e=>{pts.add(e.pointerId);if(pts.size===2&&me.onG&&pause<=0){me.vy=-520;me.onG=false;}};
const pUp=e=>pts.delete(e.pointerId);
cv.addEventListener('pointerdown',pDown);cv.addEventListener('pointerup',pUp);cv.addEventListener('pointercancel',pUp);
const clean=()=>{cv.removeEventListener('pointerdown',pDown);cv.removeEventListener('pointerup',pUp);cv.removeEventListener('pointercancel',pUp);};
const kick=p=>{const fx2=p.x+p.dir*16,fy=F-6,dx=ball.x-fx2,dy=ball.y-fy;
 if(ball.y<F-90||dx*dx+dy*dy>(p.r+ball.r+26)*(p.r+ball.r+26))return;
 ball.vx=p.dir*380;ball.vy=-380;p.kt=.18;};
const phys=p=>{p.vy+=GRAV*DT;p.x+=p.vx*DT;p.y+=p.vy*DT;
 if(p.y+p.r>F){p.y=F-p.r;p.vy=0;p.onG=true;}else p.onG=false;
 if(p.x-p.r<0){p.x=p.r;p.vx=0;}if(p.x+p.r>W){p.x=W-p.r;p.vx=0;}};
const bphys=()=>{const b=ball;b.vy+=GRAV*DT;b.x+=b.vx*DT;b.y+=b.vy*DT;
 if(b.y+b.r>F){b.y=F-b.r;b.vy*=-.7;b.vx*=.98;}
 for(let s=0;s<2;s++){const gx=s?W-GW:0;
  if(b.vy>0&&b.y-b.r<BAR&&b.y+b.r>=BAR&&b.x>gx-2&&b.x<gx+GW+2){b.y=BAR-b.r;b.vy*=-.7;}}
 if(b.x-b.r<0&&b.y<BAR){b.x=b.r;b.vx*=-.7;}
 if(b.x+b.r>W&&b.y<BAR){b.x=W-b.r;b.vx*=-.7;}};
const bump=p=>{const dx=ball.x-p.x,dy=ball.y-p.y,d=Math.hypot(dx,dy)||1,m=p.r+ball.r;
 if(d<m){const nx=dx/d,ny=dy/d,o=m-d;p.x-=nx*o*.5;p.y-=ny*o*.5;ball.x+=nx*o*.5;ball.y+=ny*o*.5;
  const rv=(ball.vx-p.vx)*nx+(ball.vy-p.vy)*ny;
  if(rv<0){ball.vx-=nx*rv*1.2;ball.vy-=ny*rv*1.2;}}};
const reset=()=>{me.x=90;me.y=F-24;me.vx=me.vy=0;ai.x=270;ai.y=F-24;ai.vx=ai.vy=0;ball.x=180;ball.y=F-12;ball.vx=ball.vy=0;};
let DT=.016;
const drawP=(p,c,dark)=>{const f=p.kt>0?1:0;
 cx.strokeStyle=dark;cx.lineWidth=7;cx.lineCap='round';
 cx.beginPath();cx.moveTo(p.x,F-4);cx.lineTo(p.x+p.dir*(10+f*16),F-10);cx.stroke();
 cx.fillStyle=c;cx.fillRect(p.x-14,p.y+6,28,22);
 cx.fillStyle='#fbbf72';cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill();
 cx.fillStyle=c;cx.fillRect(p.x-p.r,p.y-14,p.r*2,9);
 cx.fillStyle='#fff';cx.beginPath();cx.arc(p.x+p.dir*9,p.y-2,6,0,7);cx.fill();
 cx.fillStyle='#0f172a';cx.beginPath();cx.arc(p.x+p.dir*10,p.y-2,2.6,0,7);cx.fill();
 cx.strokeStyle='#7c2d12';cx.lineWidth=2;cx.beginPath();cx.arc(p.x+p.dir*4,p.y+8,7,.3,2.8);cx.stroke();};
const goal=s=>{const gx=s?W-GW:0;
 cx.strokeStyle='#e2e8f0';cx.lineWidth=5;cx.beginPath();
 if(s){cx.moveTo(W,F);cx.lineTo(W,BAR);cx.lineTo(gx,BAR);}else{cx.moveTo(0,F);cx.lineTo(0,BAR);cx.lineTo(gx+GW,BAR);}
 cx.stroke();cx.strokeStyle='rgba(226,232,240,.25)';cx.lineWidth=1;
 for(let i=1;i<5;i++){const ny=BAR+i*(GH/5);cx.beginPath();cx.moveTo(s?W:0,ny);cx.lineTo(s?gx:gx+GW,ny);cx.stroke();}};
const g={score:0,
step(dt,end){DT=Math.min(dt,.033);
 if(t>0&&pause<=0){t-=dt;if(t<=0){t=0;clean();end();return;}}
 if(pause>0){pause-=dt;if(pause<=0)reset();}
 let mv=0;if(K.left)mv--;if(K.right)mv++;
 if(mv===0&&drag!=null){const d=drag.x-me.x;if(Math.abs(d)>8)mv=d>0?1:-1;}
 me.vx=mv*150;if(mv)me.dir=mv;
 if(take('up')&&me.onG&&pause<=0){me.vy=-520;me.onG=false;}
 if(take('fire'))kick(me);
 ai.vx=0;
 if(pause<=0&&t>0){let tx=280;if(ball.x>190)tx=ball.x+8;
  const d=tx-ai.x;if(Math.abs(d)>6){ai.vx=(d>0?1:-1)*125;ai.dir=d>0?1:-1;}
  if(ai.onG&&ball.y<ai.y-10&&ball.vy>0&&Math.abs(ball.x-ai.x)<60)ai.vy=-495;
  if(ai.kt<=0&&ball.y>F-90&&Math.abs(ball.x-ai.x)<58&&ball.x>170)kick(ai);}
 phys(me);phys(ai);bphys();bump(me);bump(ai);
 if(pause<=0){
  if(ball.x-ball.r<=2&&ball.y>=BAR&&ball.y<=F){ga++;pause=1.4;fx=1.4;}
  else if(ball.x+ball.r>=W-2&&ball.y>=BAR&&ball.y<=F){gp++;pause=1.4;fx=1.4;}}
 if(fx>0)fx-=dt;
 me.kt=Math.max(0,me.kt-dt);ai.kt=Math.max(0,ai.kt-dt);
 g.score=gp*100-ga*25+(t<=0&&gp>ga?25:0);},
draw(){clear();
 const gr=cx.createLinearGradient(0,F,0,H);gr.addColorStop(0,'#15803d');gr.addColorStop(1,'#14532d');
 cx.fillStyle=gr;cx.fillRect(0,F,W,H-F);
 cx.strokeStyle='rgba(255,255,255,.35)';cx.lineWidth=2;
 cx.beginPath();cx.moveTo(180,F);cx.lineTo(180,H);cx.stroke();
 cx.beginPath();cx.arc(180,F+40,34,0,7);cx.stroke();
 goal(0);goal(1);
 drawP(me,'#22d3ee','#164e63');drawP(ai,'#fb923c','#7c2d12');
 cx.fillStyle='#f8fafc';cx.beginPath();cx.arc(ball.x,ball.y,ball.r,0,7);cx.fill();
 cx.fillStyle='#0f172a';cx.beginPath();cx.arc(ball.x,ball.y,4,0,7);cx.fill();
 txt(gp+' : '+ga,180,14,'#ffffff',26);
 const s=Math.ceil(t);
 txt('0:'+String(s%60).padStart(2,'0'),180,44,s<=10?'#f87171':'#cbd5e1',16);
 txt('YOU',14,14,'#67e8f9',12);txt('CPU',346,14,'#fdba74',12);
 txt('STREET FOOTBALL',180,H-10,'rgba(255,255,255,.4)',11);
 if(fx>0)txt('GOAL!',180,200,'#fde047',44);}};
return g;};

/* ===== DAILY CHALLENGE (decision sheet, Days 3-7) ===== */
// ---------------------------------------------------------------------------
// Daily Challenge patch — APPEND to games.js (do NOT insert mid-file).
// Adds: seeded RNG plumbing, MAKERS.dailysudoku, daily streak store, share toast.
// Requires the minimal seeding hook inside MAKERS.sudoku (see DAILY.md diff):
//   const R=(typeof DAILY_RNG==='function')?DAILY_RNG:rnd;
// and the two generation-time rnd() calls switched to R().
// ---------------------------------------------------------------------------

// Global (file-scope) hook read by the MAKERS.sudoku seeding line above.
var DAILY_RNG = null;

// --- seeded RNG: FNV-1a date hash -> mulberry32, same (a,b) signature as rnd() ---
function _hashDate(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)}return h>>>0}
function _mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function _mulberryRnd(seed,log){const f=_mulberry32(seed);return function(a,b){const r=f();if(log&&log.length<200000)log.push(r);return a+r*(b-a)}}

// Local date as YYYY-MM-DD (everyone's puzzle is the same calendar day; midnight-local rollover).
var _todayFn=null;
function _realToday(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function _today(){return _todayFn?_todayFn():_realToday()}
function _yesterday(dateStr){const p=dateStr.split('-').map(Number);const d=new Date(p[0],p[1]-1,p[2]-864e5*0);d.setDate(d.getDate()-1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function _pretty(dateStr){const p=dateStr.split('-').map(Number);const d=new Date(p[0],p[1]-1,p[2]);return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}

// --- daily streak store ------------------------------------------------------
// localStorage 'arcadeline:daily' = {lastDate, streak, best, history:{date:score}}
var DAILY_KEY='arcadeline:daily';
function _dailyRead(){try{const s=JSON.parse(localStorage.getItem(DAILY_KEY));return s&&typeof s==='object'?s:{}}catch(e){return{}}}
function _dailyWrite(s){try{localStorage.setItem(DAILY_KEY,JSON.stringify(s))}catch(e){}}
function _recordDaily(score,dateStr){
  dateStr=dateStr||_today();
  if(typeof localStorage==='undefined')return{};
  const s=_dailyRead();
  if(s.lastDate===dateStr)return s;                       // already recorded today: no double count
  s.streak=(s.lastDate===_yesterday(dateStr))?((s.streak|0)+1):1;
  s.lastDate=dateStr;
  s.best=Math.max(s.best|0,score|0);
  s.history=s.history||{};s.history[dateStr]=score;
  _dailyWrite(s);return s;
}

// --- share ------------------------------------------------------------------
function _shareText(dateStr,score,streak){
  return 'Daily Sudoku \u2014 '+_pretty(dateStr)+' \u00b7 Score '+score+' \u00b7 \uD83D\uDD25 '+streak+'-day streak \u00b7 Play at arcadeline.leonlink.net';
}
function _doShare(text){
  if(typeof navigator!=='undefined'&&navigator.share){try{navigator.share({text:text}).catch(function(){})}catch(e){}}
  else if(typeof navigator!=='undefined'&&navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){_dailyToastNote('Copied \u2014 paste it anywhere.')},function(){_dailyToastNote('Copy failed \u2014 long-press to copy.')});
  } else _dailyToastNote('Copy this: '+text);
}
function _dailyToastNote(msg){
  if(typeof document==='undefined'||!document.createElement||!document.body)return;
  const n=document.createElement('div');
  n.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;max-width:92vw;background:#141824;color:#EDEDF5;border:1px solid rgba(251,191,36,.5);border-radius:12px;padding:10px 14px;font:14px system-ui;text-align:center';
  n.textContent=msg;document.body.appendChild(n);setTimeout(function(){if(n.remove)n.remove()},3500);
}
function _dailyToast(dateStr,score,streak){
  if(typeof document==='undefined'||!document.createElement||!document.body)return;
  const t=document.createElement('div');
  t.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;max-width:92vw;background:#141824;color:#EDEDF5;border:1px solid rgba(251,191,36,.6);border-radius:14px;padding:14px 16px;font:15px/1.5 system-ui;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.5)';
  const line=document.createElement('div');
  line.innerHTML='Daily Sudoku \u2014 <b>'+score+'</b> pts \u00b7 \uD83D\uDD25 <b>'+streak+'-day streak</b>';
  t.appendChild(line);
  const row=document.createElement('div');row.style.marginTop='10px';
  const sh=document.createElement('button');
  sh.textContent='Share my streak';sh.style.cssText='background:#3B6FE0;color:#fff;border:none;border-radius:10px;padding:10px 16px;font-size:15px;font-weight:700;margin-right:8px';
  sh.onclick=function(){_doShare(_shareText(dateStr,score,streak))};
  const ok=document.createElement('button');
  ok.textContent='Done';ok.style.cssText='background:#232838;color:#9A9AB5;border:none;border-radius:10px;padding:10px 14px;font-size:15px';
  ok.onclick=function(){if(t.remove)t.remove()};
  row.appendChild(sh);row.appendChild(ok);t.appendChild(row);
  document.body.appendChild(t);
}

// --- the daily maker ---------------------------------------------------------
MAKERS.dailysudoku=()=>{
  const dateStr=_today();
  const log=[];
  DAILY_RNG=_mulberryRnd(_hashDate(dateStr),log);   // generation consumes this, then we clear it
  let inner;
  try{inner=MAKERS.sudoku()}finally{DAILY_RNG=null}
  DAILY.lastSeq=log;
  const streak0=(_dailyRead().lastDate===dateStr)?(_dailyRead().streak|0):0;
  return{
    score:0,
    step(dt,end){
      const g=this;
      const _end=()=>{end()};
      inner.step(dt,()=>{
        g.score=inner.score;
        // Glow-run only: token play records the daily streak; practice records nothing.
        const glowRun=(typeof window==='undefined'||typeof window.GL_RUN_MODE==='undefined')||window.GL_RUN_MODE==='glow';
        if(g.score>0&&glowRun){                            // solved: record + toast; loss ends quietly
          const s=_recordDaily(g.score,dateStr);
          _dailyToast(dateStr,g.score,s.streak|0);
        }
        _end();
      });
    },
    draw(){
      inner.draw();
      const st=_dailyRead(), ds=(st.lastDate===dateStr)?(st.streak|0):streak0;
      txt('DAILY '+dateStr+(ds?'  \u00b7  streak '+ds:''),W/2,47,'#FBBF24',12);
    }
  };
};

// Test / debug hooks (harmless in production).
var DAILY={lastSeq:[],today:()=>_today(),setToday:f=>{_todayFn=f},clearToday:()=>{_todayFn=null},
  read:_dailyRead,record:_recordDaily,yesterday:_yesterday,shareText:_shareText,seed:_hashDate};

/* ============ MOBILE WAVE: Glow Flap, Merge Glow, Minefield ============ */
/* Mobile wave: Glow Flap, Merge Glow, Minefield.
   Maker contract (matches live games.js): MAKERS.<id>() returns
   {score, step(dt,end), draw()} using file-scope W,H,cv,cx,txt,take,rnd.
   Extra `_dbg` hooks are test-only and ignored by the runtime. */

/* ---------- shared juice helpers (per-game instances) ---------- */
function mkParts(){const ps=[];return{
 spawn(x,y,n,cols,spd,life,sz){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=spd*(.3+Math.random()*.9);ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,t:0,life:life*(.6+Math.random()*.8),c:cols[(Math.random()*cols.length)|0],s:sz*(.6+Math.random()*.9)})}},
 step(dt){for(let i=ps.length-1;i>=0;i--){const p=ps[i];p.t+=dt;if(p.t>p.life){ps.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=220*dt;p.vx*=.985}},
 draw(){for(const p of ps){cx.globalAlpha=Math.max(0,1-p.t/p.life);cx.fillStyle=p.c;cx.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}cx.globalAlpha=1},
 clear(){ps.length=0},len(){return ps.length}}}
function mkFloats(){const fs=[];return{
 add(x,y,s,c,sz,big){fs.push({x,y,t:0,s:String(s),c,sz:sz||20,big:!!big})},
 step(dt){for(let i=fs.length-1;i>=0;i--){const f=fs[i];f.t+=dt;f.y-=46*dt;if(f.t>1.1)fs.splice(i,1)}},
 draw(){for(const f of fs){const a=Math.max(0,1-f.t/1.1);cx.globalAlpha=a;const sc=f.big?1+f.t*1.6:1;txt(f.s,f.x,f.y,f.c,Math.round(f.sz*sc))}cx.globalAlpha=1},
 clear(){fs.length=0}}}
const easeOC=t=>1-Math.pow(1-t,3);
const easeOB=t=>{const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
function rr(x,y,w,h,r){cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()}
function bestGet(id){try{return parseInt(localStorage.getItem('arcadeline:best:'+id))||0}catch(e){return 0}}
function bestSet(id,s){try{if(s>(parseInt(localStorage.getItem('arcadeline:best:'+id))||0))localStorage.setItem('arcadeline:best:'+id,String(s))}catch(e){}}

/* ================= GLOW FLAP ================= */
MAKERS.flap=()=>{
 const G0=1500,BX=92,R=13,HITR=9.5,FLOOR=448;
 const MEDALS=[[10,'BRONZE','#cd8f52'],[20,'SILVER','#d7d7e6'],[30,'GOLD','#ffd23d'],[40,'NEON','#3df5ff']];
 let st='ready',y=H/2-40,vy=0,wing=0,pipes=[],acc=0,bgx=0,t=0;
 let dead=false,deadT=0,shake=0,flash=0,medal=-1,best=bestGet('flap'),newBest=false,cele=0,celeName='';
 const parts=mkParts(),flts=mkFloats();
 const stars=Array.from({length:26},()=>({x:rnd(0,W),y:rnd(0,330),s:rnd(1,2.4),tw:rnd(0,6)}));
 const far=Array.from({length:7},()=>({x:rnd(0,W),w:rnd(40,90),h:rnd(60,140)}));
 const near=Array.from({length:6},()=>({x:rnd(0,W),w:rnd(50,110),h:rnd(90,190)}));
 const gap=()=>132-Math.min(pipesPassed(),40)*0.7;
 const speed=()=>175+Math.min(pipesPassed(),60)*1.6;
 function pipesPassed(){return o.score}
 function spawn(x){const g=gap();pipes.push({x,gapY:rnd(120+g/2,392-g/2),passed:false})}
 function die(){if(dead)return;dead=true;deadT=0;shake=1;flash=1;parts.spawn(BX,y,26,['#3df5ff','#fff','#ff3d7a'],260,.7,5);
  if(o.score>best){best=o.score;newBest=true;bestSet('flap',o.score)}}
 const o={score:0,
 step(dt,end){
  t+=dt;
  if(take('fire')&&!dead){if(st==='ready'){st='play';spawn(W+40)}vy=-430;wing=1}
  wing=Math.max(0,wing-dt*4);
  const sp=st==='ready'?60:speed();
  bgx=(bgx+sp*dt)%W;
  parts.step(dt);flts.step(dt);
  if(flash>0)flash=Math.max(0,flash-dt*5);
  if(shake>0)shake=Math.max(0,shake-dt*1.8);
  if(cele>0)cele-=dt;
  if(st!=='play')return;
  if(dead){deadT+=dt;vy=Math.min(vy+G0*dt,600);y+=vy*dt;if(deadT>0.75)return end();return}
  vy=Math.min(vy+G0*dt,560);y+=vy*dt;
  if(y<14){y=14;vy=0}
  if(!pipes.length||pipes[pipes.length-1].x<W-235)spawn(W+40);
  const g=gap(),spd=speed();
  for(const p of pipes)p.x-=spd*dt;
  if(pipes.length&&pipes[0].x<-80)pipes.shift();
  for(const p of pipes){
   if(!p.passed&&p.x+64<BX-R){p.passed=true;o.score++;
    parts.spawn(p.x+32,BX-70,10,['#ffd23d','#fff'],140,.5,4);
    flts.add(p.x+32,y-26,'+1','#ffd23d',22);
    const mi=MEDALS.reduce((acc,m,i)=>o.score>=m[0]?i:acc,medal);
    if(mi>medal){medal=mi;celeName=MEDALS[mi][1];cele=1.4;flts.add(W/2,H/2-60,MEDALS[mi][1]+' MEDAL',MEDALS[mi][2],30,true);
     parts.spawn(W/2,H/2-40,34,[MEDALS[mi][2],'#ffffff'],300,1,5)}}
   if(BX+HITR>p.x&&BX-HITR<p.x+64){
    if(y-HITR<p.gapY-g/2||y+HITR>p.gapY+g/2){die();break}}}
  if(y+HITR>=FLOOR){y=FLOOR-HITR;die()}
  parts.spawn(BX-14,y+6,1,['#3df5ff'],30,.35,3);
 },
 draw(){
  cx.save();
  if(shake>0)cx.translate(rnd(-1,1)*7*shake,rnd(-1,1)*7*shake);
  const sky=cx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0a0a1e');sky.addColorStop(.6,'#151532');sky.addColorStop(1,'#1e1b3a');
  cx.fillStyle=sky;cx.fillRect(-10,-10,W+20,H+20);
  for(const s of stars){const a=.35+.65*Math.abs(Math.sin(t*2+s.tw));cx.globalAlpha=a;cx.fillStyle='#cdd6ff';cx.fillRect(s.x,s.y,s.s,s.s)}
  cx.globalAlpha=1;
  const layer=(arr,f,c)=>{cx.fillStyle=c;for(const b of arr){let x=(b.x-bgx*f)%W;if(x<-b.w)x+=W;cx.fillRect(x,400-b.h,b.w,b.h)}};
  layer(far,.25,'#1c1c3d');layer(near,.5,'#242448');
  const g=gap();
  for(const p of pipes){
   const pg=cx.createLinearGradient(p.x,0,p.x+64,0);pg.addColorStop(0,'#0f5c46');pg.addColorStop(.5,'#19d68a');pg.addColorStop(1,'#0f5c46');
   cx.fillStyle=pg;
   cx.fillRect(p.x,0,64,p.gapY-g/2);cx.fillRect(p.x,p.gapY+g/2,64,400-(p.gapY+g/2));
   cx.fillStyle='#2bffa8';cx.fillRect(p.x-3,p.gapY-g/2-12,70,12);cx.fillRect(p.x-3,p.gapY+g/2,70,12);
   cx.fillStyle='rgba(43,255,168,.25)';cx.fillRect(p.x-8,0,5,p.gapY-g/2);cx.fillRect(p.x-8,p.gapY+g/2,5,400-(p.gapY+g/2));
  }
  cx.strokeStyle='rgba(61,245,255,.5)';cx.lineWidth=2;cx.beginPath();
  for(let x=0;x<=W;x+=12){const y=FLOOR+18+Math.sin(x*.05+bgx*.03)*4;cx.lineTo(x,y)}cx.stroke();
  cx.strokeStyle='rgba(61,245,255,.18)';for(let i=0;i<5;i++){cx.beginPath();const off=(bgx*(1+i*.3))%72;for(let x=-72;x<W+72;x+=72){cx.moveTo(x-off,FLOOR+6);cx.lineTo(x-off+36,H)}cx.stroke()}
  cx.fillStyle='#0d0d20';cx.fillRect(-10,FLOOR,W+20,H-FLOOR+10);
  const tilt=Math.max(-.45,Math.min(1.15,vy/520));
  cx.save();cx.translate(BX,y);cx.rotate(tilt);
  const bd=cx.createRadialGradient(-4,-6,3,0,0,16);bd.addColorStop(0,'#9ff7ff');bd.addColorStop(.55,'#3df5ff');bd.addColorStop(1,'#1a6fd6');
  cx.fillStyle=bd;cx.beginPath();cx.ellipse(0,0,15,11,0,0,7);cx.fill();
  const wa=Math.sin(wing*22)*1.1-wing*.7;
  cx.save();cx.translate(-3,2);cx.rotate(wa);cx.fillStyle='#1a9fd6';cx.beginPath();cx.ellipse(-6,0,10,4.5,0,0,7);cx.fill();cx.restore();
  cx.fillStyle='#fff';cx.beginPath();cx.arc(7,-4,4,0,7);cx.fill();
  cx.fillStyle='#0a0a14';cx.beginPath();cx.arc(8.4,-4,1.9,0,7);cx.fill();
  cx.fillStyle='#ffb03d';cx.beginPath();cx.moveTo(13,-2);cx.lineTo(21,1);cx.lineTo(13,4);cx.closePath();cx.fill();
  cx.restore();
  parts.draw();flts.draw();
  txt(o.score,26,44,'#fff',30);txt('BEST '+best,26,66,'#9A9AB5',13);
  for(let i=0;i<=medal;i++){cx.fillStyle=MEDALS[i][2];cx.beginPath();cx.arc(W-24-i*26,34,9,0,7);cx.fill();cx.fillStyle='#0a0a14';txt(MEDALS[i][1][0],W-24-i*26,38,'#0a0a14',11)}
  if(cele>0){cx.globalAlpha=Math.min(1,cele*2);txt(celeName+' MEDAL',W/2,120,MEDALS[Math.max(0,medal)][2],26);cx.globalAlpha=1}
  if(st==='ready'){const b=Math.sin(t*3)*6;txt('TAP TO FLAP',W/2,H/2-110+b,'#fff',26);txt('thread every gate',W/2,H/2-82+b,'#9A9AB5',14)}
  if(dead){cx.globalAlpha=Math.min(1,deadT*3);txt('GAME OVER',W/2,H/2-40,'#fff',34);
   if(medal>=0)txt(MEDALS[medal][1]+' MEDAL',W/2,H/2-8,MEDALS[medal][2],22);
   if(newBest)txt('NEW BEST!',W/2,H/2+22,'#ffd23d',20);cx.globalAlpha=1}
  if(flash>0){cx.fillStyle=`rgba(255,255,255,${flash*.7})`;cx.fillRect(-10,-10,W+20,H+20)}
  cx.restore();
 }};
 o._dbg={get state(){return{st,dead,y,score:o.score,medal,pipes:pipes.length}},forcePipe(x,gapY){pipes.push({x,gapY,passed:false})},setScore(s){o.score=s}};
 return o};

/* ================= MERGE GLOW ================= */
MAKERS.merge=()=>{
 const N=4,CELL=76,OX=(W-N*CELL)/2,OY=100;
 const TCOL={2:['#2a3350','#8f9cc9'],4:['#31436e','#a9bdf2'],8:['#3d5ba6','#cfe0ff'],16:['#4a6fd6','#ffffff'],32:['#5b4fd6','#ffffff'],64:['#7b3ff2','#ffffff'],128:['#a03ff2','#ffffff'],256:['#c03ff2','#ffffff'],512:['#f23fc8','#ffffff'],1024:['#ff3d7a','#ffffff'],2048:['#ffd23d','#3a2a00']};
 let tiles=[],nid=1,phase='idle',phT=0,merges=[],newTiles=[],best=bestGet('merge');
 let comboShow=0,comboN=0,celebrated=false,celeT=0,tension=0,ended=false;
 const parts=mkParts(),flts=mkFloats();
 const empty=()=>{const occ=new Set(tiles.map(t=>t.gy*N+t.gx));const e=[];for(let i=0;i<N*N;i++)if(!occ.has(i))e.push(i);return e};
 const spawnTile=(pop)=>{const e=empty();if(!e.length)return null;const i=e[(Math.random()*e.length)|0];const t={id:nid++,v:Math.random()<.9?2:4,gx:i%N,gy:(i/N)|0,px:0,py:0,sx:0,sy:0,scale:0,born:0,dead:false};t.px=OX+t.gx*CELL+CELL/2;t.py=OY+t.gy*CELL+CELL/2;t.sx=t.px;t.sy=t.py;if(pop){t.born=.0001}tiles.push(t);return t};
 spawnTile(false);spawnTile(false);
 function doSlide(dir){
  const mg=[];let moved=false;
  for(let i=0;i<N;i++){
   const line=[];for(let j=0;j<N;j++){const x=dir==='left'?j:dir==='right'?N-1-j:i,y=dir==='left'?i:dir==='right'?i:dir==='up'?j:N-1-j;
    const t=tiles.find(t=>!t.dead&&t.gx===x&&t.gy===y);if(t)line.push(t)}
   let w=0,k=0;
   while(k<line.length){
    const t=line[k];
    const tx=dir==='left'?w:dir==='right'?N-1-w:i, ty=dir==='left'?i:dir==='right'?i:dir==='up'?w:N-1-w;
    if(k+1<line.length&&line[k+1].v===t.v){
     const u=line[k+1];t.dead=true;u.dead=true;
     if(t.gx!==tx||t.gy!==ty||u.gx!==tx||u.gy!==ty){t.sx=t.px;t.sy=t.py;u.sx=u.px;u.sy=u.py;moved=true}
     else{t.sx=t.px;t.sy=t.py;u.sx=u.px;u.sy=u.py;moved=true}
     t.gx=tx;t.gy=ty;u.gx=tx;u.gy=ty;
     mg.push({v:t.v*2,gx:tx,gy:ty});
     k+=2;w++;
    }else{
     if(t.gx!==tx||t.gy!==ty){t.sx=t.px;t.sy=t.py;t.gx=tx;t.gy=ty;moved=true}
     k++;w++;
    }}}
  if(!moved&&!mg.length)return false;
  merges=mg;phase='slide';phT=0;return true;
 }
 const o={score:0,
 step(dt,end){
  parts.step(dt);flts.step(dt);
  if(comboShow>0)comboShow-=dt;
  if(celeT>0){celeT-=dt;if(celeT<=0)celebrated=true}
  const tgt=empty().length<=2?1:0;tension+=(tgt-tension)*Math.min(1,dt*5);
  for(const t of tiles){
   const txp=OX+t.gx*CELL+CELL/2,typ=OY+t.gy*CELL+CELL/2;
   if(phase==='slide'){const p=Math.min(1,phT/.13),e=easeOC(p);t.px=t.sx+(txp-t.sx)*e;t.py=t.sy+(typ-t.sy)*e}
   else{t.px+=(txp-t.px)*Math.min(1,dt*16);t.py+=(typ-t.py)*Math.min(1,dt*16)}
   if(t.born>0){t.born+=dt;const b=Math.min(1,t.born/.18);t.scale=b<1?easeOB(b):1}else t.scale=Math.min(1,t.scale+dt*8);
  }
  if(phase==='slide'){phT+=dt;if(phT>=.13){
   const combo=Math.max(1,merges.length);let gained=0;
   tiles=tiles.filter(t=>!t.dead);
   for(const m of merges){
    const nt={id:nid++,v:m.v,gx:m.gx,gy:m.gy,px:OX+m.gx*CELL+CELL/2,py:OY+m.gy*CELL+CELL/2,sx:0,sy:0,scale:0,born:.0001,dead:false};
    nt.sx=nt.px;nt.sy=nt.py;tiles.push(nt);
    const add=m.v*combo;gained+=add;
    parts.spawn(nt.px,nt.py,Math.min(22,6+m.v/64),[TCOL[m.v]?TCOL[m.v][0]:'#3df5ff','#ffffff'],200,.6,5);
    flts.add(nt.px,nt.py-8,'+'+add,'#ffd23d',20);
    if(m.v>=2048&&!celebrated){celeT=1.6;parts.spawn(W/2,H/2,80,['#ffd23d','#3df5ff','#ff3d7a','#ffffff'],420,1.4,6);flts.add(W/2,H/2-40,'2048!','#ffd23d',34,true)}
   }
   o.score+=gained;
   if(merges.length>1){comboShow=1.2;comboN=merges.length}
   merges=[];
   const nt=spawnTile(true);newTiles=nt?[nt]:[];
   phase='pop';phT=0;
  }}
  else if(phase==='pop'){phT+=dt;if(phT>=.2){phase='idle';
   if(!ended&&empty().length===0&&!canMove()){ended=true;bestSet('merge',o.score);return end()}
  }}
  else if(phase==='idle'&&!ended){
   for(const d of['left','right','up','down'])if(take(d)){doSlide(d);break}
   take('fire');
  }
 },
 draw(){
  const bg=cx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0d0d20');bg.addColorStop(1,'#141433');
  cx.fillStyle=bg;cx.fillRect(0,0,W,H);
  txt('MERGE GLOW',W/2,34,'#3df5ff',20);
  txt('SCORE '+o.score,OX+4,62,'#fff',17);
  txt('BEST '+Math.max(best,o.score),W-OX-4,62,'#9A9AB5',17);
  cx.textAlign='left';
  rr(OX-6,OY-6,N*CELL+12,N*CELL+12,14);cx.fillStyle='#191930';cx.fill();
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){rr(OX+c*CELL+5,OY+r*CELL+5,CELL-10,CELL-10,10);cx.fillStyle='rgba(255,255,255,.045)';cx.fill()}
  cx.textAlign='center';
  for(const t of tiles){
   const x=t.px,y=t.py,s=(CELL-10)*Math.max(.01,t.scale);
   const col=TCOL[t.v]||['#3df5ff','#0a0a14'];
   cx.save();cx.translate(x,y);cx.scale(Math.max(.01,t.scale),Math.max(.01,t.scale));cx.translate(-x,-y);
   if(t.v>=1024){cx.shadowColor=col[0];cx.shadowBlur=18}
   const g2=cx.createLinearGradient(x-s/2,y-s/2,x+s/2,y+s/2);g2.addColorStop(0,col[0]);g2.addColorStop(1,'#101020');
   rr(x-s/2,y-s/2,s,s,10);cx.fillStyle=g2;cx.fill();
   cx.shadowBlur=0;cx.strokeStyle='rgba(255,255,255,.25)';cx.lineWidth=2;rr(x-s/2,y-s/2,s,s,10);cx.stroke();
   txt(String(t.v),x,y+(t.v>999?7:9),col[1],t.v>999?20:t.v>99?24:30);
   cx.restore();
  }
  parts.draw();flts.draw();
  if(comboShow>0){cx.globalAlpha=Math.min(1,comboShow*2);txt('COMBO x'+comboN,W/2,OY-14,'#ff3d7a',22);cx.globalAlpha=1}
  if(celeT>0){cx.globalAlpha=Math.min(1,celeT);txt('2048 REACHED',W/2,H-40,'#ffd23d',26);txt('keep going',W/2,H-14,'#9A9AB5',14);cx.globalAlpha=1}
  if(tension>.25){cx.strokeStyle=`rgba(255,40,80,${.35*tension*(0.7+0.3*Math.sin(Date.now()/180))})`;cx.lineWidth=6;rr(OX-9,OY-9,N*CELL+18,N*CELL+18,16);cx.stroke()}
  txt('swipe or arrows',W/2,H-24,'#9A9AB5',12);
 }};
 function canMove(){
  if(empty().length)return true;
  const v=(x,y)=>{const t=tiles.find(t=>t.gx===x&&t.gy===y);return t?t.v:0};
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(x+1<N&&v(x,y)===v(x+1,y))return true;if(y+1<N&&v(x,y)===v(x,y+1))return true}
  return false;
 }
 o._dbg={get tiles(){return tiles.map(t=>({v:t.v,gx:t.gx,gy:t.gy}))},celebrated:()=>celebrated||celeT>0,combo:()=>comboN,set(vals){tiles=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){const v=vals[y][x];if(v){tiles.push({id:nid++,v,gx:x,gy:y,px:OX+x*CELL+CELL/2,py:OY+y*CELL+CELL/2,sx:0,sy:0,scale:1,born:0,dead:false})}}},phase:()=>phase,canMove,spawnTile};
 return o};

/* ================= MINEFIELD ================= */
MAKERS.mines=()=>{
 const N=9,M=10,CELL=34,OX=(W-N*CELL)/2,OY=118,FLAGT={x:296,y:56,w:52,h:46};
 const NCOL=['','#4da3ff','#3ddc68','#ff3d3d','#b14dff','#ff8a3d','#3df5ff','#ff3d9a','#8f9cc9'];
 let grid,phase='first',flags=0,elapsed=0,t=0,revealedN=0,overT=0,win=false,shake=0,flash=0,flagMode=false,best=bestGet('mines'),newBest=false;
 let active=true,downT=0,downX=0,downY=0,downB=false;
 const parts=mkParts(),flts=mkFloats();
 const seq={n:0};
 function blank(){const g=[];for(let r=0;r<N;r++){const row=[];for(let c=0;c<N;c++)row.push({m:false,r:false,f:false,n:0,rt:-1,ord:0});g.push(row)}return g}
 grid=blank();
 const inB=(r,c)=>r>=0&&r<N&&c>=0&&c<N;
 function adj(r,c){let k=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if((dr||dc)&&inB(r+dr,c+dc)&&grid[r+dr][c+dc].m)k++;return k}
 function placeMines(ex,ey){
  let bestG=null,bestOpen=-1;
  for(let att=0;att<80;att++){
   const g=blank();const safe=new Set();
   for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(inB(ex+dr,ey+dc))safe.add((ex+dr)*N+ey+dc);
   const cand=[];for(let i=0;i<N*N;i++)if(!safe.has(i))cand.push(i);
   for(let m=0;m<M;m++){const i=(Math.random()*cand.length)|0;const p=cand.splice(i,1)[0];g[(p/N)|0][p%N].m=true}
   for(let r=0;r<N;r++)for(let c=0;c<N;c++){let k=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if((dr||dc)&&inB(r+dr,c+dc)&&g[r+dr][c+dc].m)k++;g[r][c].n=k}
   const open=simOpen(g,ex,ey);
   if(open>bestOpen){bestOpen=open;bestG=g}
   if(open>=8)break;
  }
  grid=bestG;
 }
 function simOpen(g,ex,ey){const seen=new Set();const q=[[ex,ey]];let n=0;
  while(q.length){const[r,c]=q.pop();const k=r*N+c;if(seen.has(k))continue;seen.add(k);n++;
   if(g[r][c].n===0)for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if((dr||dc)&&inB(r+dr,c+dc))q.push([r+dr,c+dc])}
  return n}
 function reveal(r,c){
  const cell=grid[r][c];if(cell.r||cell.f)return;
  cell.r=true;cell.rt=t;cell.ord=seq.n++;revealedN++;o.score+=10;
  if(cell.m){lose(r,c);return}
  if(cell.n===0){const q=[[r,c]];while(q.length){const[qr,qc]=q.pop();
   for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=qr+dr,nc=qc+dc;
    if(!inB(nr,nc))continue;const nc2=grid[nr][nc];
    if(!nc2.r&&!nc2.f&&!nc2.m){nc2.r=true;nc2.rt=t+nc2.ord*0+Math.hypot(nr-r,nc-c)*.03;nc2.ord=seq.n++;revealedN++;o.score+=10;
     if(nc2.n===0)q.push([nr,nc])}}}}
  checkWin();
 }
 function chord(r,c){
  const cell=grid[r][c];if(!cell.r||cell.n===0)return;
  let fl=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if((dr||dc)&&inB(r+dr,c+dc)&&grid[r+dr][c+dc].f)fl++;
  if(fl!==cell.n)return;
  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=r+dr,nc=c+dc;
   if(!inB(nr,nc))continue;const nc2=grid[nr][nc];
   if(!nc2.r&&!nc2.f){reveal(nr,nc);if(phase!=='play')return}}
 }
 function checkWin(){if(revealedN===N*N-M){win=true;phase='win';overT=0;o.score+=1000;if(o.score>best){best=o.score;newBest=true;bestSet('mines',o.score)}
  for(let i=0;i<60;i++)parts.spawn(rnd(0,W),rnd(60,420),1,['#ffd23d','#3df5ff','#ff3d7a','#ffffff'],380,1.3,6)}}
 function lose(r,c){phase='over';overT=0;shake=1;flash=1;parts.spawn(OX+c*CELL+CELL/2,OY+r*CELL+CELL/2,30,['#ff3d3d','#ffffff','#ff8a3d'],340,.9,6);
  if(o.score>best){best=o.score;bestSet('mines',o.score)}}
 function toggleFlag(r,c){const cell=grid[r][c];if(cell.r)return;cell.f=!cell.f;flags+=cell.f?1:-1;
  if(cell.f)parts.spawn(OX+c*CELL+CELL/2,OY+r*CELL+CELL/2,8,['#ffb03d','#ffffff'],160,.4,4)}
 function tapCell(r,c,long){
  if(phase==='first'){placeMines(r,c);phase='play';reveal(r,c);return}
  if(phase!=='play')return;
  const cell=grid[r][c];
  if(long){toggleFlag(r,c);return}
  if(flagMode){toggleFlag(r,c);return}
  if(cell.r){chord(r,c);return}
  reveal(r,c);
 }
 const toCell=(x,y)=>{const c=Math.floor((x-OX)/CELL),r=Math.floor((y-OY)/CELL);return inB(r,c)?[r,c]:null};
 const pd=e=>{if(!active)return;const rc=cv.getBoundingClientRect();downX=(e.clientX-rc.left)*W/rc.width;downY=(e.clientY-rc.top)*H/rc.height;downT=Date.now();downB=true;e.preventDefault&&e.preventDefault()};
 const pu=e=>{if(!active||!downB)return;downB=false;const rc=cv.getBoundingClientRect();const x=(e.clientX-rc.left)*W/rc.width,y=(e.clientY-rc.top)*H/rc.height;e.preventDefault&&e.preventDefault();
  const long=Date.now()-downT>=350;const moved=Math.hypot(x-downX,y-downY)>14;
  if(x>=FLAGT.x&&x<=FLAGT.x+FLAGT.w&&y>=FLAGT.y&&y<=FLAGT.y+FLAGT.h&&!long&&!moved){flagMode=!flagMode;parts.spawn(FLAGT.x+FLAGT.w/2,FLAGT.y+FLAGT.h/2,10,['#3df5ff','#ffffff'],150,.4,4);return}
  if(moved)return;
  const cell=toCell(x,y);if(cell)tapCell(cell[0],cell[1],long)};
 const pc=()=>{downB=false};
 const kf=e=>{if(e.key==='f'||e.key==='F')flagMode=!flagMode};
 cv.addEventListener('pointerdown',pd);cv.addEventListener('pointerup',pu);cv.addEventListener('pointercancel',pc);
 addEventListener('keydown',kf);
 const o={score:0,
 step(dt,end){
  t+=dt;parts.step(dt);flts.step(dt);
  take('fire');
  if(shake>0)shake=Math.max(0,shake-dt*1.6);
  if(flash>0)flash=Math.max(0,flash-dt*5);
  if(phase==='play')elapsed+=dt;
  if((phase==='win'||phase==='over')){overT+=dt;
   if(phase==='win'&&overT>1.15){active=false;end()}
   if(phase==='over'&&overT>1.15){active=false;end()}}
 },
 draw(){
  cx.save();
  if(shake>0)cx.translate(rnd(-1,1)*8*shake,rnd(-1,1)*8*shake);
  const bg=cx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0c0c1c');bg.addColorStop(1,'#151528');
  cx.fillStyle=bg;cx.fillRect(-10,-10,W+20,H+20);
  txt('MINEFIELD',W/2,30,'#ffb03d',20);
  txt(flags+'/'+M+' mines',OX+2,66,'#fff',15);cx.textAlign='left';
  const mm=String((elapsed/60)|0).padStart(2,'0'),ss=String((elapsed|0)%60).padStart(2,'0');
  txt(mm+':'+ss,W/2,66,'#9A9AB5',15);
  txt('BEST '+best,W/2,88,'#9A9AB5',12);cx.textAlign='center';
  rr(FLAGT.x,FLAGT.y,FLAGT.w,FLAGT.h,10);
  cx.fillStyle=flagMode?'#3df5ff':'#23233d';cx.fill();
  cx.strokeStyle=flagMode?'#ffffff':'#4a4a6e';cx.lineWidth=2;cx.stroke();
  cx.fillStyle=flagMode?'#0a0a14':'#ffb03d';
  cx.beginPath();cx.moveTo(FLAGT.x+20,FLAGT.y+10);cx.lineTo(FLAGT.x+38,FLAGT.y+17);cx.lineTo(FLAGT.x+20,FLAGT.y+24);cx.closePath();cx.fill();
  cx.fillRect(FLAGT.x+18,FLAGT.y+10,3,26);
  txt('FLAG',FLAGT.x+FLAGT.w/2,FLAGT.y+FLAGT.h-8,flagMode?'#0a0a14':'#9A9AB5',10);
  const showMines=phase==='over';
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){
   const cell=grid[r][c],x=OX+c*CELL,y=OY+r*CELL;
   if(cell.r){
    let sc=1;if(cell.rt>=0){const p=Math.min(1,(t-cell.rt)/.16);sc=p<1?easeOB(p):1}
    cx.save();cx.translate(x+CELL/2,y+CELL/2);cx.scale(Math.max(.01,sc),Math.max(.01,sc));cx.translate(-x-CELL/2,-y-CELL/2);
    rr(x+2,y+2,CELL-4,CELL-4,7);cx.fillStyle=cell.m?'#5c1212':'#151527';cx.fill();
    if(cell.m){cx.fillStyle='#0a0a0a';cx.beginPath();cx.arc(x+CELL/2,y+CELL/2,9,0,7);cx.fill();
     cx.strokeStyle='#0a0a0a';cx.lineWidth=3;for(let a=0;a<8;a++){const an=a/8*6.283;cx.beginPath();cx.moveTo(x+CELL/2+Math.cos(an)*6,y+CELL/2+Math.sin(an)*6);cx.lineTo(x+CELL/2+Math.cos(an)*13,y+CELL/2+Math.sin(an)*13);cx.stroke()}
     cx.fillStyle='#fff';cx.fillRect(x+CELL/2-4,y+CELL/2-4,3,3)}
    else if(cell.n>0)txt(String(cell.n),x+CELL/2,y+CELL/2+8,NCOL[cell.n],20);
    cx.restore();
   }else if(showMines&&cell.m){
    rr(x+2,y+2,CELL-4,CELL-4,7);cx.fillStyle='#3a2020';cx.fill();
    cx.fillStyle='#0a0a0a';cx.beginPath();cx.arc(x+CELL/2,y+CELL/2,9,0,7);cx.fill();
   }else{
    const g2=cx.createLinearGradient(x,y,x,y+CELL);g2.addColorStop(0,'#2c2c4a');g2.addColorStop(1,'#20203a');
    rr(x+2,y+2,CELL-4,CELL-4,7);cx.fillStyle=g2;cx.fill();
    cx.strokeStyle='rgba(61,245,255,.35)';cx.lineWidth=1.5;cx.stroke();
    if(cell.f){cx.fillStyle='#ffb03d';cx.beginPath();cx.moveTo(x+11,y+9);cx.lineTo(x+25,y+14);cx.lineTo(x+11,y+19);cx.closePath();cx.fill();
     cx.fillStyle='#d8d8e2';cx.fillRect(x+9,y+9,2.5,18)}
   }
  }
  parts.draw();flts.draw();
  if(phase==='first'){cx.fillStyle='rgba(5,5,12,.55)';cx.fillRect(OX,OY,N*CELL,N*CELL);txt('TAP TO START',W/2,OY+N*CELL/2-8,'#fff',22);txt('first tap is always safe',W/2,OY+N*CELL/2+20,'#9A9AB5',14)}
  if(phase==='win'){cx.globalAlpha=Math.min(1,overT*2);txt('FIELD CLEARED!',W/2,H/2-30,'#ffd23d',30);txt('+1000 bonus',W/2,H/2,'#3df5ff',20);if(newBest)txt('NEW BEST!',W/2,H/2+30,'#fff',18);cx.globalAlpha=1}
  if(phase==='over'){cx.globalAlpha=Math.min(1,overT*2.5);txt('BOOM',W/2,H/2-30,'#ff3d3d',34);txt(revealedN+' cells cleared',W/2,H/2,'#9A9AB5',16);cx.globalAlpha=1}
  if(flash>0){cx.fillStyle=`rgba(255,60,60,${flash*.5})`;cx.fillRect(-10,-10,W+20,H+20)}
  cx.restore();
 }};
 o._dbg={grid:()=>grid,phase:()=>phase,setMines(list){grid=blank();for(const[r,c]of list)grid[r][c].m=true;for(let r=0;r<N;r++)for(let c=0;c<N;c++)grid[r][c].n=adj(r,c);phase='play'},tap:(r,c)=>tapCell(r,c,false),longTap:(r,c)=>tapCell(r,c,true),setFlagMode(v){flagMode=v},flagMode:()=>flagMode,flags:()=>flags,elapsed:()=>elapsed};
 return o};


// ============================================================================
// Pocket Dominion — tiny grand strategy (turn-based, tap-only). Original game.
// One marked region, additive only: safe to merge with other games.js patches.
// ============================================================================
MAKERS.dominion=()=>{
 // ---------- config ----------
 const COLS=5,ROWS=5,HOLES=[[0,0],[4,4]];
 const OC=['#22d3ee','#ef4444','#f59e0b','#a78bfa'];          // owner bright
 const OD=['#123a44','#4a1414','#4a2f0c','#33245c'];          // owner dark fill
 const NEUT='#3a4356';
 const AI=[
  null,
  {name:'The Bold',short:'Bold',icon:'\u2694\uFE0F',trait:'bold'},
  {name:'The Banker',short:'Banker',icon:'\uD83E\uDE99',trait:'banker'},
  {name:'The Schemer',short:'Schemer',icon:'\uD83D\uDD75\uFE0F',trait:'schemer'}];
 const FARM_COST=12,FORT_COST=18,MAX_TURNS=20,WIN_FRAC=0.6;
 const TW=72,TH=60,OX=0,OY=104; // map tile geometry
 let S=null;
 // ---------- tiny utils ----------
 const inMap=(x,y)=>x>=0&&y>=0&&x<COLS&&y<ROWS&&!HOLES.some(h=>h[0]===x&&h[1]===y);
 const tidx=(x,y)=>S.T.findIndex(t=>t.x===x&&t.y===y);
 const nbrs=i=>{const t=S.T[i],r=[];for(const d of[[1,0],[-1,0],[0,1],[0,-1]]){const j=tidx(t.x+d[0],t.y+d[1]);if(j>=0)r.push(j);}return r;};
 const terrCount=o=>S.T.filter(t=>t.owner===o).length;
 const armiesOf=o=>S.T.filter(t=>t.owner===o).reduce((a,t)=>a+t.armies,0);
 const farmsOf=o=>S.T.filter(t=>t.owner===o&&t.bld==='farm').length;
 const incomeOf=o=>3+terrCount(o)+2*farmsOf(o)+S.incomeBonus;
 const terrainBonus=t=>(t.terr==='hills'?1:0)+(t.bld==='fort'?2:0);
 const leader=()=>{let b=0;for(let o=1;o<=3;o++)if(terrCount(o)>terrCount(b))b=o;return b;};
 const alive=o=>terrCount(o)>0;
 function log(m){S.log.push(m);if(S.log.length>60)S.log.shift();}
 function fxAdd(f){f.t=0;f.delay=f.delay||0;S.fx.push(f);}
 let AC=null;
 function blip(f,d,type){try{if(typeof window==='undefined')return;AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),gn=AC.createGain();o.type=type||'square';o.frequency.value=f||440;gn.gain.value=0.04;o.connect(gn);gn.connect(AC.destination);o.start();o.stop(AC.currentTime+(d||0.07));}catch(e){}}
 // ---------- match setup ----------
 function newMatch(){
  S={turn:1,gold:10,phase:'play',sel:-1,modal:null,log:[],fx:[],floaters:[],
     pacts:{1:'none',2:'none',3:'none'},pactTurns:{1:0,2:0,3:0},pactOffers:1,
     grudge:{1:0,2:0,3:0},recruitCost:3,incomeBonus:0,over:false,won:false,why:'',
     aiQueue:[],aiTimer:0,aiDelay:0,spy:null,tick:0,_btns:[],evFlash:-1,T:[]};
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
   if(!inMap(x,y))continue;
   S.T.push({i:S.T.length,x:x,y:y,owner:-1,armies:1+((Math.random()*3)|0),terr:Math.random()<0.22?'hills':'plains',bld:null});
  }
  const give=(x,y,o,a)=>{const t=S.T[tidx(x,y)];t.owner=o;t.armies=a;};
  give(0,4,0,4);give(1,4,0,3);give(0,3,0,3);
  give(4,0,1,4);give(4,1,1,3);give(3,0,1,3);
  give(1,1,2,3);give(2,0,2,3);give(0,1,2,3);
  give(2,4,3,3);give(3,4,3,3);give(4,3,3,3);
  log('Four banners rise. Take the map.');
  recompute();
 }
 // ---------- score ----------
 function recompute(final){
  const terr=terrCount(0);
  let bonus=0;
  if(S.won)bonus=Math.round(500*(MAX_TURNS-S.turn+1)/MAX_TURNS);
  g.score=terr*100+armiesOf(0)*5+S.gold+bonus;
 }
 // ---------- combat ----------
 function doAttack(fromI,toI,byPlayer){
  const A=S.T[fromI],B=S.T[toI];
  const oldOwner=B.owner;
  const aN=Math.min(A.armies-1,3),dN=Math.min(B.armies+terrainBonus(B),3);
  const ad=[],dd=[];
  for(let i=0;i<aN;i++)ad.push(1+((Math.random()*6)|0));
  for(let i=0;i<dN;i++)dd.push(1+((Math.random()*6)|0));
  ad.sort((a,b)=>b-a);dd.sort((a,b)=>b-a);
  let aL=0,dL=0;const n=Math.min(ad.length,dd.length);
  for(let i=0;i<n;i++){if(ad[i]>dd[i])dL++;else aL++;}
  A.armies-=aL;B.armies-=dL;
  let captured=false;
  if(B.armies<=0){
   captured=true;
   const move=Math.max(1,A.armies-1);
   A.armies=1;B.armies=move;B.owner=A.owner;
  }
  if(byPlayer&&oldOwner>0)S.grudge[oldOwner]=2;
  recompute();
  return{ad:ad,dd:dd,aL:aL,dL:dL,captured:captured,from:fromI,to:toI,oldOwner:oldOwner,newOwner:A.owner};
 }
 // ---------- player actions ----------
 function actRecruit(){
  const t=S.T[S.sel];
  if(!t||t.owner!==0||S.gold<S.recruitCost)return false;
  t.armies++;S.gold-=S.recruitCost;blip(520,0.06);
  fxAdd({k:'float',i:t.i,txt:'+1',c:'#4ade80'});
  recompute();return true;
 }
 function actBuild(kind){
  const t=S.T[S.sel];
  const cost=kind==='farm'?FARM_COST:FORT_COST;
  if(!t||t.owner!==0||t.bld||S.gold<cost)return false;
  t.bld=kind;S.gold-=cost;blip(660,0.08);
  fxAdd({k:'build',i:t.i});
  log((kind==='farm'?'\uD83C\uDF3E Farm':'\uD83D\uDEE1\uFE0F Fort')+' raised.');
  recompute();return true;
 }
 function actOfferPact(ai,force){
  if(S.pactOffers<=0||S.pacts[ai]!=='none'||!alive(ai))return false;
  S.pactOffers--;
  const tr=AI[ai].trait;
  const pAccept=tr==='schemer'?1:tr==='banker'?0.75:(terrCount(0)>terrCount(ai)?0.45:0.15);
  const roll=force===undefined?Math.random():(force?0:1);
  if(roll<pAccept){
   S.pacts[ai]='active';S.pactTurns[ai]=3;
   log('\uD83E\uDD1D '+AI[ai].name+' accepts your pact. 3 turns of peace.');
   blip(700,0.1,'sine');
  }else log('\uD83D\uDEA9 '+AI[ai].name+' refuses your pact.');
  return true;
 }
 function actEndTurn(){
  if(S.phase!=='play'||S.modal||S.over)return;
  S.sel=-1;S.phase='ai';
  S.aiQueue=[1,2,3].filter(alive);S.aiTimer=0;S.aiDelay=0;
 }
 // ---------- events ----------
 const EVENTS=[
  {id:'harvest',icon:'\uD83C\uDF3E',name:'Bumper Harvest',txt:'Farms overflow. +2 gold for every farm you hold.',
   fx:()=>{const f=farmsOf(0);S.gold+=2*f;log('\uD83C\uDF3E Harvest: +'+(2*f)+' gold.');}},
  {id:'rebel',icon:'\uD83D\uDD25',name:'Rebellion!',txt:'A garrison rises up. One territory loses half its armies.',
   fx:()=>{const c=S.T.filter(t=>t.armies>1);if(!c.length){log('Rebellion fizzles — no garrison to raid.');return;}const t=c[(Math.random()*c.length)|0];const lost=t.armies-Math.max(1,Math.ceil(t.armies/2));t.armies-=lost;S.evFlash=t.i;log('\uD83D\uDD25 Rebellion! '+(t.owner===0?'Your':t.owner<0?'A neutral':AI[t.owner].name+"'s")+' land loses '+lost+' armies.');recompute();}},
  {id:'merc',icon:'\u2694\uFE0F',name:'Mercenaries',txt:'Swords for hire. Recruiting costs 1 gold this round.',
   fx:()=>{S.recruitCost=1;log('\u2694\uFE0F Mercenaries: recruit for 1 gold this round.');}},
  {id:'plague',icon:'\u2620\uFE0F',name:'Plague',txt:'Sickness in the camps. Every territory loses 1 army.',
   fx:()=>{for(const t of S.T)t.armies=Math.max(1,t.armies-1);log('\u2620\uFE0F Plague sweeps the map.');recompute();}},
  {id:'golden',icon:'\u2728',name:'Golden Age',txt:'Prosperity smiles. Everyone gains +2 income this round.',
   fx:()=>{S.incomeBonus=2;log('\u2728 Golden Age: +2 income for all.');}},
  {id:'desert',icon:'\uD83C\uDFDC\uFE0F',name:'Desertion',txt:'Crowded garrisons grow restless. Your lands with 5+ armies lose 1.',
   fx:()=>{let n=0;for(const t of S.T)if(t.owner===0&&t.armies>4){t.armies--;n++;}log('\uD83C\uDFDC\uFE0F Desertion: '+n+' of your lands lose an army.');recompute();}},
  {id:'spy',icon:'\uD83D\uDD75\uFE0F',name:'Spy',txt:'Your spies uncover an enemy plan. Watch the map for the red arrow.',
   fx:()=>{const cands=[1,2,3].filter(alive);if(!cands.length)return;const ai=cands[(Math.random()*cands.length)|0];const mv=pickAttack(ai,AI[ai].trait,true);if(mv){S.spy={from:mv.from,to:mv.to,ai:ai};log('\uD83D\uDD75\uFE0F Spies: '+AI[ai].name+' eyes a target.');}}},
  {id:'fair',icon:'\u2600\uFE0F',name:'Fair Weather',txt:'Clear skies over the realm. Nothing stirs.',
   fx:()=>{log('\u2600\uFE0F Fair weather. A quiet round.');}}
 ];
 function fireEvent(){
  const ev=EVENTS[(Math.random()*EVENTS.length)|0];
  ev.fx();
  S.modal={type:'event',ev:ev,t:0};
 }
 function dismissModal(){
  const m=S.modal;S.modal=null;
  if(m&&m.type==='battle'){checkEnd();}
 }
 // ---------- pacts ----------
 function pactTick(ai){
  if(S.pacts[ai]!=='active')return;
  const tr=AI[ai].trait;
  if(tr==='schemer'&&terrCount(0)<terrCount(ai)/2){
   // break it when the player is weak and a fat stack sits on the border
   let best=null;
   for(const t of S.T){
    if(t.owner!==ai||t.armies<2)continue;
    for(const j of nbrs(t.i)){
     const u=S.T[j];
     if(u.owner!==0)continue;
     if(t.armies>=2*(u.armies+terrainBonus(u))&&(!best||t.armies>best.armies))best={from:t.i,to:j};
    }
   }
   if(best){
    S.pacts[ai]='none';
    log('\uD83D\uDD75\uFE0F The Schemer BREAKS the pact \u2014 "Trust is for the weak."');
    blip(160,0.2,'sawtooth');
    const r=doAttack(best.from,best.to,false);
    fxAdd({k:'atk',from:best.from,to:best.to,cap:r.captured,delay:0.2});
    log('\u2694\uFE0F The Schemer storms your land!');
    if(S.over)return;
   }
  }
  S.pactTurns[ai]--;
  if(S.pacts[ai]==='active'&&S.pactTurns[ai]<=0){
   S.pacts[ai]='none';
   log('\uD83E\uDD1D Pact with '+AI[ai].name+' expires.');
  }
 }
 // ---------- AI ----------
 function bestFarmSpot(ai){
  const c=S.T.filter(t=>t.owner===ai&&!t.bld&&t.terr==='plains');
  return c.length?c[(Math.random()*c.length)|0]:null;
 }
 function mostThreatened(ai){
  let best=null,bs=-1;
  for(const t of S.T){
   if(t.owner!==ai||t.bld)continue;
   let th=0;for(const j of nbrs(t.i)){const u=S.T[j];if(u.owner!==ai&&u.owner!==-1)th+=u.armies;}
   if(th>bs){bs=th;best=t;}
  }
  return best;
 }
 function borderOf(ai){return S.T.filter(t=>t.owner===ai&&nbrs(t.i).some(j=>S.T[j].owner!==ai));}
 function recruitTarget(ai,trait){
  const mine=S.T.filter(t=>t.owner===ai);
  if(!mine.length)return null;
  if(trait==='banker')return mine.reduce((a,b)=>a.armies<=b.armies?a:b);
  const b=borderOf(ai);
  if(trait==='bold'&&b.length){
   return b.reduce((a,c)=>{const ta=nbrs(a.i).reduce((s,j)=>s+(S.T[j].owner!==ai?S.T[j].armies:0),0);const tb=nbrs(c.i).reduce((s,j)=>s+(S.T[j].owner!==ai?S.T[j].armies:0),0);return ta>=tb?a:c;});
  }
  if(b.length)return b.reduce((a,c)=>a.armies>=c.armies?a:c);
  return mine.reduce((a,c)=>a.armies<=c.armies?a:c);
 }
 function targetScore(ai,t,trait){
  const o=t.owner;
  let s=(12-t.armies-terrainBonus(t))*2;
  if(o===-1)s+=6;
  const lead=leader();
  if(o===lead&&o!==ai)s+=9;            // gang the leader — logged, fair
  if(o>0&&o!==ai)s+=2;
  return s;
 }
 function pickAttack(ai,trait,peek){
  const pact=S.pacts[ai]==='active';
  let best=null,bs=-1e9;
  for(const t of S.T){
   if(t.owner!==ai||t.armies<2)continue;
   for(const j of nbrs(t.i)){
    const u=S.T[j];
    if(u.owner===ai)continue;
    if(pact&&u.owner===0)continue;      // honored — unless broken earlier
    if(trait==='banker'&&u.owner!==-1)continue; // banker only takes neutrals
    const need=t.armies>=2*(u.armies+terrainBonus(u));
    const boldOk=trait==='bold'&&t.armies>=1.5*(u.armies+terrainBonus(u))+1;
    if(!need&&!boldOk)continue;
    const s=targetScore(ai,u,trait)+Math.random()*3;
    if(s>bs){bs=s;best={from:t.i,to:j};}
   }
  }
  return best;
 }
 function aiTurn(ai){
  if(!alive(ai)){return;}
  pactTick(ai);
  if(S.over)return;
  const trait=AI[ai].trait;
  let gold=incomeOf(ai);
  const cost=S.recruitCost;
  // build
  if(trait==='banker'){
   const t=bestFarmSpot(ai);
   if(t&&gold>=FARM_COST){t.bld='farm';gold-=FARM_COST;fxAdd({k:'build',i:t.i,delay:S.aiDelay});log('\uD83E\uDE99 The Banker raises a farm.');}
  }else if(trait==='bold'){
   const t=mostThreatened(ai);
   if(t&&gold>=FORT_COST){t.bld='fort';gold-=FORT_COST;fxAdd({k:'build',i:t.i,delay:S.aiDelay});log('\u2694\uFE0F The Bold raises a fort.');}
  }
  // recruit
  let guard=60;
  while(gold>=cost&&guard-->0){
   const t=recruitTarget(ai,trait);
   if(!t)break;
   t.armies++;gold-=cost;
  }
  recompute();
  // attack
  const nAtk=trait==='bold'?2:1;
  for(let a=0;a<nAtk;a++){
   const mv=pickAttack(ai,trait,false);
   if(!mv)break;
   const before=S.T[mv.to].owner;
   const r=doAttack(mv.from,mv.to,false);
   fxAdd({k:'atk',from:mv.from,to:mv.to,cap:r.captured,delay:S.aiDelay});
   S.aiDelay+=0.55;
   const nm=AI[ai].name;
   const tgt=r.oldOwner===-1?'a wild land':r.oldOwner===0?'YOU':AI[r.oldOwner].name;
   let line=trait==='bold'?(r.captured?'\u2694\uFE0F The Bold storms '+tgt+'!':'\u2694\uFE0F The Bold clashes with '+tgt+'.')
    :trait==='banker'?'\uD83E\uDE99 The Banker takes '+tgt+' (cheap land).'
    :(r.captured?'\uD83D\uDD75\uFE0F The Schemer slithers into '+tgt+'.':'\uD83D\uDD75\uFE0F The Schemer probes '+tgt+'.');
   if(r.oldOwner===0&&r.newOwner!==0)line+=' Your land is lost!';
   if(before===0&&r.captured)line+=' Your land is lost!';
   if(r.oldOwner===leader()&&r.oldOwner!==ai&&r.oldOwner>0)line+=' (The pack hunts the leader.)';
   log(line);
   blip(r.captured?300:200,0.08,'sawtooth');
   if(S.over||terrCount(0)===0)break;
  }
  // schemer offers the player a pact when the player leads
  if(trait==='schemer'&&alive(0)&&S.pacts[ai]==='none'&&!S.modal&&terrCount(0)>terrCount(ai)){
   S.modal={type:'pactOffer',ai:ai,t:0};
   log('\uD83D\uDD75\uFE0F The Schemer offers a pact...');
  }
 }
 // ---------- turn flow ----------
 function processAiTurn(ai){
  aiTurn(ai);
  if(S.over)return;
  checkEnd();
 }
 function checkEnd(){
  if(S.over)return;
  const total=S.T.length,mine=terrCount(0);
  if(mine===0)return endMatch(false,'Your banner has fallen.');
  if(mine/total>=WIN_FRAC)return endMatch(true,'Dominion is yours. The map kneels.');
  for(let a=1;a<=3;a++)if(terrCount(a)/total>=WIN_FRAC)return endMatch(false,AI[a].name+' rules the map.');
  if(terrCount(1)+terrCount(2)+terrCount(3)===0)return endMatch(true,'Every rival kneels. The realm is yours.');
 }
 function endMatch(won,why){
  if(S.over)return;
  S.over=true;S.won=won;S.why=why;
  blip(won?880:140,won?0.3:0.4,won?'sine':'sawtooth');
  recompute(true);
  cleanup();
  if(S.endCb)S.endCb();
 }
 function newRound(){
  S.pactOffers=1;S.recruitCost=3;S.incomeBonus=0;S.spy=null;S.sel=-1;S.evFlash=-1;
  for(const a in S.grudge)if(S.grudge[a]>0)S.grudge[a]--;
  if(!S.modal)fireEvent();
  const inc=incomeOf(0);S.gold+=inc;
  fxAdd({k:'float',x:180,y:150,txt:'+'+inc+' gold',c:'#fbbf24'});
  recompute();
 }
 function afterAiPhase(){
  S.phase='play';
  checkEnd();if(S.over)return;
  if(S.turn>=MAX_TURNS){
   const c=[0,1,2,3].map(terrCount),best=Math.max.apply(null,c);
   const won=c[0]===best;
   return endMatch(won,won?'Most lands when the horn sounds. Victory!':'Out-held at the horn. The realm slips away.');
  }
  S.turn++;
  newRound();
 }
 function moodOf(ai){
  if(S.pacts[ai]==='active'&&AI[ai].trait==='schemer'&&terrCount(0)<terrCount(ai)/2)return'\uD83D\uDE08';
  if(S.grudge[ai]>0)return'\uD83D\uDE20';
  if(terrCount(ai)>terrCount(0))return'\uD83D\uDE0F';
  return'\uD83D\uDE42';
 }
 // ---------- step ----------
 function step(dt,end){
  S.endCb=end;
  S.tick+=dt;
  for(const f of S.fx){if(f.delay>0)f.delay-=dt;else f.t+=dt;}
  S.fx=S.fx.filter(f=>f.t<1.4);
  for(const f of S.floaters)f.t+=dt;
  S.floaters=S.floaters.filter(f=>f.t<1.2);
  if(S.modal&&S.modal.type==='battle')S.modal.t+=dt;
  if(S.phase==='ai'&&!S.over){
   S.aiTimer+=dt;
   if(S.aiTimer>0.85){
    S.aiTimer=0;
    const ai=S.aiQueue.shift();
    if(ai==null){afterAiPhase();}
    else processAiTurn(ai);
   }
  }
 }
 // ---------- draw helpers ----------
 function rr(x,y,w,h,r){cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath();}
 function txy(i){const t=S.T[i];return{x:OX+t.x*TW+TW/2,y:OY+t.y*TH+TH/2};}
 function wrap(s,mw){const w=[];let line='';for(const wd of s.split(' ')){const t=line?line+' '+wd:wd;if(cx.measureText(t).width>mw&&line){w.push(line);line=wd;}else line=t;}if(line)w.push(line);return w;}
 function drawDie(x,y,v,c){
  cx.fillStyle='#0B0B14';rr(x-15,y-15,30,30,6);cx.fill();
  cx.strokeStyle=c;cx.lineWidth=2;rr(x-15,y-15,30,30,6);cx.stroke();
  cx.fillStyle=c;
  const P={1:[[0,0]],2:[[-6,-6],[6,6]],3:[[-6,-6],[0,0],[6,6]],4:[[-6,-6],[6,-6],[-6,6],[6,6]],5:[[-6,-6],[6,-6],[0,0],[-6,6],[6,6]],6:[[-6,-6],[6,-6],[-6,0],[6,0],[-6,6],[6,6]]}[v];
  for(const p of P){cx.beginPath();cx.arc(x+p[0],y+p[1],3,0,7);cx.fill();}
 }
 function draw(){
  clear();
  S._btns=[];
  // header
  txt('POCKET DOMINION',92,20,'#e8e4da',15);
  txt('Turn '+S.turn+'/'+MAX_TURNS,300,20,'#94a3b8',13);
  txt('\u25CF '+S.gold+' gold  (+'+incomeOf(0)+'/turn)',96,42,'#fbbf24',14);
  txt('\u26C9 '+terrCount(0)+'/'+S.T.length+' lands',296,42,'#94a3b8',14);
  // rulers strip
  for(let a=0;a<=3;a++){
   const x=6+a*89,y=48,w=80,h=32,bx=x,by=y;
   rr(x,y,w,h,8);cx.fillStyle='#111827';cx.fill();
   cx.strokeStyle=a===0?OC[0]:OC[a];cx.lineWidth=a===0?2.5:1.2;cx.stroke();
   const nm=a===0?'You':AI[a].short;
   txt(nm,x+34,y+15,a===0?'#fff':'#cbd5e1',11);
   txt(a===0?'\uD83C\uDFE0':AI[a].icon,x+14,y+22,a===0?'#fff':OC[a],14);
   if(a>0){
    txt(moodOf(a),x+66,y+22,'#fff',12);
    if(S.pacts[a]==='active')txt('\uD83E\uDD1D',x+52,y+23,'#fff',11);
   }
   S._btns.push({x:x,y:y,w:w,h:h,chip:a,btn:'chip'});
  }
  // log (last 2)
  const lg=S.log.slice(-2);
  lg.forEach((m,i)=>txt(m.slice(0,52),180,90+i*13,'#94a3b8',11));
  // map
  for(const t of S.T){
   const x=OX+t.x*TW,y=OY+t.y*TH,c=txy(t.i);
   cx.fillStyle=t.owner<0?NEUT:OD[t.owner];cx.fillRect(x+2,y+2,TW-4,TH-4);
   cx.lineWidth=2;cx.strokeStyle=t.owner<0?'#64748b':OC[t.owner];cx.strokeRect(x+2,y+2,TW-4,TH-4);
   if(t.terr==='hills'){cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(x+2,y+2,TW-4,10);}
   if(t.bld==='farm'){cx.fillStyle='#4ade80';cx.beginPath();cx.arc(x+12,y+TH-12,5,0,7);cx.fill();}
   if(t.bld==='fort'){cx.fillStyle='#f59e0b';cx.fillRect(x+TW-18,y+TH-18,10,10);}
   if(S.evFlash===t.i&&Math.sin(S.tick*10)>0){cx.fillStyle='rgba(239,68,68,.4)';cx.fillRect(x+2,y+2,TW-4,TH-4);}
   if(t.i===S.sel){cx.strokeStyle='#fbbf24';cx.lineWidth=3;cx.strokeRect(x+3,y+3,TW-6,TH-6);}
   // attackable highlight
   const sel=S.sel>=0?S.T[S.sel]:null;
   if(sel&&sel.owner===0&&sel.armies>=2&&t.owner!==0&&nbrs(sel.i).indexOf(t.i)>=0){
    const p=0.5+0.5*Math.sin(S.tick*6);
    cx.strokeStyle='rgba(251,191,36,'+(0.4+0.6*p)+')';cx.lineWidth=3;cx.strokeRect(x+3,y+3,TW-6,TH-6);
   }
   txt(''+t.armies,c.x,c.y+8,'#fff',20);
  }
  // spy arrow
  if(S.spy&&S.phase==='play'){
   const a=txy(S.spy.from),b=txy(S.spy.to),p=0.5+0.5*Math.sin(S.tick*6);
   cx.strokeStyle='rgba(239,68,68,'+(0.5+0.5*p)+')';cx.lineWidth=3;cx.setLineDash([8,6]);
   cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke();cx.setLineDash([]);
  }
  // fx
  for(const f of S.fx){
   if(f.k==='atk'){
    const a=txy(f.from),b=txy(f.to);
    cx.strokeStyle=f.cap?'rgba(251,191,36,.9)':'rgba(239,68,68,.8)';cx.lineWidth=3;cx.setLineDash([10,8]);
    cx.lineDashOffset=-f.t*60;
    cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke();cx.setLineDash([]);
   }else if(f.k==='cap'){
    const c=f.i!=null?txy(f.i):null;
    if(c){cx.strokeStyle='rgba(251,191,36,'+(1-f.t)+')';cx.lineWidth=4;cx.beginPath();cx.arc(c.x,c.y,10+f.t*40,0,7);cx.stroke();}
   }else if(f.k==='build'){
    const c=txy(f.i);txt('+',c.x,c.y-20-f.t*20,'#4ade80',16+((f.t*10)|0));
   }else if(f.k==='float'){
    const c=f.i!=null?txy(f.i):{x:f.x,y:f.y};
    txt(f.txt,c.x,c.y-14-f.t*24,f.c||'#fff',14);
   }
  }
  for(const f of S.floaters)txt(f.txt,f.x,f.y-f.t*24,f.c,14);
  drawBar();
  drawModal();
 }
 function drawBar(){
  const by=426,bh=48;
  const endBtn={x:248,y:by,w:104,h:bh,t:'END TURN',cb:actEndTurn,btn:'end'};
  const sel=S.sel>=0?S.T[S.sel]:null;
  if(sel&&sel.owner===0){
   const nm='Land '+(sel.i+1)+' \u2022 '+sel.armies+' armies'+(sel.terr==='hills'?' \u2022 hills':'')+(sel.bld==='farm'?' \u2022 farm':sel.bld==='fort'?' \u2022 fort':'');
   txt(nm,124,418,'#94a3b8',11);
   drawBtn({x:8,y:by,w:108,h:bh,t:'RECRUIT',sub:'-'+S.recruitCost+'g',en:S.gold>=S.recruitCost,cb:actRecruit});
   if(!sel.bld){
    drawBtn({x:124,y:by,w:58,h:bh,t:'FARM',sub:'-'+FARM_COST+'g',en:S.gold>=FARM_COST,cb:()=>actBuild('farm')});
    drawBtn({x:188,y:by,w:56,h:bh,t:'FORT',sub:'-'+FORT_COST+'g',en:S.gold>=FORT_COST,cb:()=>actBuild('fort')});
   }else{
    txt(sel.bld==='farm'?'\uD83C\uDF3E Farm':'\uD83D\uDEE1\uFE0F Fort',184,456,'#94a3b8',13);
   }
  }else{
   txt(sel?'Enemy land \u2014 tap your land first':'Tap one of your cyan lands',124,452,'#64748b',12);
  }
  drawBtn(endBtn);
 }
 function drawBtn(b){
  rr(b.x,b.y,b.w,b.h,8);
  cx.fillStyle=b.en===false?'#1e293b':'#1d4ed8';cx.fill();
  txt(b.t,b.x+b.w/2,b.y+(b.sub?22:31),'#fff',13);
  if(b.sub)txt(b.sub,b.x+b.w/2,b.y+40,'#cbd5e1',11);
  S._btns.push(b);
 }
 function drawModal(){
  const m=S.modal;if(!m)return;
  cx.fillStyle='rgba(0,0,0,.72)';cx.fillRect(0,OY,W,300);
  const cw=300,ch=230,cx0=30,cy0=OY+35;
  rr(cx0,cy0,cw,ch,12);cx.fillStyle='#141422';cx.fill();cx.strokeStyle='#38bdf8';cx.lineWidth=2;cx.stroke();
  if(m.type==='event'){
   txt(m.ev.icon,180,cy0+52,'#fff',38);
   txt(m.ev.name,180,cy0+84,'#fbbf24',17);
   wrap(m.ev.txt,260).forEach((l,i)=>txt(l,180,cy0+110+i*17,'#cbd5e1',13));
   txt('TAP TO CONTINUE',180,cy0+ch-20,'#64748b',11);
  }else if(m.type==='attack'){
   const A=S.T[m.from],B=S.T[m.to];
   txt('\u2694\uFE0F ATTACK',180,cy0+40,'#ef4444',18);
   txt('Your '+A.armies+'  vs  Their '+B.armies+(terrainBonus(B)?' (+'+terrainBonus(B)+' def)':''),180,cy0+70,'#e8e4da',14);
   txt('You roll '+Math.min(A.armies-1,3)+' dice \u2014 they roll '+Math.min(B.armies+terrainBonus(B),3),180,cy0+94,'#94a3b8',12);
   drawBtn({x:52,y:cy0+120,w:112,h:52,t:'ATTACK',cb:()=>resolvePlayerAttack()});
   drawBtn({x:196,y:cy0+120,w:112,h:52,t:'CANCEL',cb:()=>{S.modal=null;}});
  }else if(m.type==='battle'){
   const r=m.res;
   txt(r.captured?'\uD83C\uDFC6 VICTORY!':'\uD83D\uDEE1\uFE0F HELD',180,cy0+36,r.captured?'#fbbf24':'#94a3b8',18);
   txt('YOU',110,cy0+64,'#ef4444',12);txt('THEM',250,cy0+64,'#38bdf8',12);
   r.ad.forEach((v,i)=>drawDie(70+i*38,cy0+100,v,'#ef4444'));
   r.dd.forEach((v,i)=>drawDie(210+i*38,cy0+100,v,'#38bdf8'));
   txt('You lose '+r.aL+' \u2022 They lose '+r.dL,180,cy0+150,'#cbd5e1',13);
   if(r.captured)txt('The land is yours.',180,cy0+172,'#4ade80',13);
   if(m.t>0.5)txt('TAP TO CONTINUE',180,cy0+ch-16,'#64748b',11);
  }else if(m.type==='pactOffer'){
   txt(AI[m.ai].icon+' '+AI[m.ai].name,180,cy0+52,'#e8e4da',18);
   txt('offers a pact \u2014 3 turns of peace.',180,cy0+80,'#94a3b8',13);
   txt('Accept?',180,cy0+102,'#e8e4da',14);
   drawBtn({x:52,y:cy0+120,w:112,h:52,t:'ACCEPT',cb:()=>{S.pacts[m.ai]='active';S.pactTurns[m.ai]=3;log('\uD83E\uDD1D Pact with '+AI[m.ai].name+'. 3 turns.');S.modal=null;}});
   drawBtn({x:196,y:cy0+120,w:112,h:52,t:'DECLINE',cb:()=>{log('You refuse the Schemer. It smiles anyway.');S.modal=null;}});
  }
 }
 function resolvePlayerAttack(){
  const m=S.modal;if(!m||m.type!=='attack')return;
  const r=doAttack(m.from,m.to,true);
  fxAdd({k:'atk',from:m.from,to:m.to,cap:r.captured});
  if(r.captured)fxAdd({k:'cap',i:m.to});
  blip(r.captured?700:220,r.captured?0.15:0.1,r.captured?'sine':'sawtooth');
  const A=S.T[m.to];
  log(r.captured?('\u2694\uFE0F You take '+(r.oldOwner===-1?'a wild land':AI[r.oldOwner].name+"'s land")+'!')
   :('\u2694\uFE0F Your attack on '+(r.oldOwner===-1?'a wild land':AI[r.oldOwner].name)+' is held.'));
  S.sel=m.from;
  S.modal={type:'battle',res:r,t:0};
 }
 // ---------- input ----------
 function pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
 let dP=null,dT=0;
 function onDown(e){const p=pos(e);dP=p;dT=Date.now();try{e.preventDefault();}catch(_){}}
 function onUp(e){
  if(!dP)return;
  const p=pos(e),moved=Math.hypot(p.x-dP.x,p.y-dP.y),dt=Date.now()-dT;dP=null;
  if(moved>14||dt>600)return;
  handleTap(p.x,p.y);
 }
 function handleTap(x,y){
  // buttons first
  for(const b of S._btns){
   if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){
    if(b.btn==='chip'&&b.chip>0){chipTap(b.chip);return;}
    if(b.en===false)return;
    if(b.cb){b.cb();return;}
   }
  }
  const m=S.modal;
  if(m){
   if(m.type==='event'){S.modal=null;return;}
   if(m.type==='battle'&&m.t>0.5){dismissModal();return;}
   return;
  }
  if(S.phase!=='play'||S.over)return;
  // map tiles
  if(y>=OY&&y<OY+ROWS*TH){
   const gx=Math.floor((x-OX)/TW),gy=Math.floor((y-OY)/TH);
   const j=inMap(gx,gy)?tidx(gx,gy):-1;
   if(j>=0)tileTap(j);
  }
 }
 function chipTap(ai){
  if(S.phase!=='play'||S.modal||!alive(ai))return;
  if(S.pacts[ai]==='none'){
   if(S.pactOffers>0)actOfferPact(ai);
   else log('No pact offers left this turn.');
  }else log('Pact with '+AI[ai].name+' is active ('+S.pactTurns[ai]+' turns left).');
 }
 function tileTap(j){
  const t=S.T[j],sel=S.sel>=0?S.T[S.sel]:null;
  if(t.owner===0){S.sel=(S.sel===j)?-1:j;blip(440,0.05);return;}
  if(sel&&sel.owner===0&&sel.armies>=2&&nbrs(sel.i).indexOf(j)>=0&&t.owner!==0){
   S.modal={type:'attack',from:sel.i,to:j,t:0};
   blip(300,0.08);
   return;
  }
  S.sel=-1;
 }
 function cleanup(){
  cv.removeEventListener('pointerdown',onDown);
  cv.removeEventListener('pointerup',onUp);
 }
 // ---------- go ----------
 const g={score:0,step:step,draw:draw};
 newMatch();
 cv.addEventListener('pointerdown',onDown);
 cv.addEventListener('pointerup',onUp);
 fireEvent();
 const inc=incomeOf(0);S.gold+=inc;
 fxAdd({k:'float',x:180,y:150,txt:'+'+inc+' gold',c:'#fbbf24'});
 recompute();
 // headless/test hook — pure logic access, no DOM beyond stubs
 g._t={S:()=>S,newMatch:newMatch,doAttack:doAttack,aiTurn:aiTurn,actRecruit:actRecruit,actBuild:actBuild,
  actOfferPact:actOfferPact,actEndTurn:actEndTurn,resolvePlayerAttack:resolvePlayerAttack,dismissModal:dismissModal,
  fireEvent:fireEvent,applyEvent:(id)=>{const ev=EVENTS.find(e=>e.id===id);ev.fx();},pickAttack:pickAttack,
  pactTick:pactTick,terrCount:terrCount,incomeOf:incomeOf,checkEnd:checkEnd,endMatch:endMatch,
  runAiPhaseSync:()=>{S.aiQueue=[1,2,3].filter(alive);while(S.aiQueue.length&&!S.over){processAiTurn(S.aiQueue.shift());}if(!S.over)afterAiPhase();},
  tileTap:tileTap,chipTap:chipTap,handleTap:handleTap,processAiTurn:processAiTurn,afterAiPhase:afterAiPhase};
 return g;
};
