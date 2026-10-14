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
