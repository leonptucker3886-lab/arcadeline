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
MAKERS.boxing=()=>{
 const OPP=[
  {n:'Rosa "Rookie" Vega',c:'#FF7A59',hair:'#3A1F12',skin:'#E0A27A',hp:80,idle:[1.4,2.4],tell:.85,dmg:9,blk:.1,feint:0,combo:1,sp:.15,spn:'Haymaker'},
  {n:'Mei "Lightning" Tan',c:'#3DF5FF',hair:'#111111',skin:'#F1C9A0',hp:95,idle:[.7,1.4],tell:.55,dmg:7,blk:.15,feint:.05,combo:3,sp:.2,spn:'Lightning Flurry'},
  {n:'Brigid "The Wall" O\'Hara',c:'#7CFF6B',hair:'#C2461E',skin:'#F3D2BE',hp:140,idle:[1.2,2],tell:.75,dmg:14,blk:.45,feint:.05,combo:1,sp:.25,spn:'Wall Crusher'},
  {n:'Zara "Mirage" Okafor',c:'#B07CFF',hair:'#1A0F0A',skin:'#8A5A3C',hp:110,idle:[.8,1.6],tell:.6,dmg:10,blk:.2,feint:.35,combo:2,sp:.2,spn:'Mirage Hook',dodge:.3},
  {n:'Valka "Iron" Petrova',c:'#FF3D5A',hair:'#E8E0C8',skin:'#F0D0B8',hp:150,idle:[1,1.8],tell:.65,dmg:12,blk:.25,feint:.1,combo:2,sp:.25,spn:'Iron Rage',rage:.35},
  {n:'Queen Seraphine',c:'#FFD23D',hair:'#2B1640',skin:'#C98E6A',hp:190,idle:[.6,1.3],tell:.5,dmg:13,blk:.3,feint:.25,combo:3,sp:.3,spn:'Royal Decree',dodge:.2,rage:.3}];
 let oi=0,o,eh,ph=100,stars=0,st,t,atk=null,queue=0,fx=[],msg='',mt=0,pose='idle',pt=0,fightT=0,shake=0,combo=0,clock=0;
 const say=(m,d=1)=>{msg=m;mt=d};
 const hitfx=(x,y,c,s)=>fx.push({x,y,c,s,t:.6});
 const raging=()=>!!o.rage&&eh<o.hp*o.rage;
 const begin=()=>{o=OPP[oi];eh=o.hp;st='intro';t=2.4;fightT=0;atk=null;queue=0;combo=0};
 const nextIdle=()=>{st='idle';t=rnd(o.idle[0],o.idle[1])*(raging()?.6:1)};
 const newAtk=()=>{const sp=Math.random()<o.sp*(raging()?1.8:1);
  atk={k:sp?'U':(Math.random()<.5?'L':'R'),feint:!sp&&Math.random()<o.feint};
  st='tell';t=(sp?o.tell*1.5:o.tell)*(raging()?.8:1);if(sp)say(o.spn+'!',1)};
 begin();
 return{score:0,step(dt,end){const me=this;clock+=dt;mt-=dt;shake=Math.max(0,shake-dt*20);
  fx.forEach(f=>{f.t-=dt;f.y-=30*dt});fx=fx.filter(f=>f.t>0);
  if(st==='intro'){t-=dt;for(const k in PK)PK[k]=0;if(t<=0){nextIdle();say('FIGHT!',.8)}return}
  if(st==='ko'){t-=dt;for(const k in PK)PK[k]=0;if(t<=0){oi++;if(oi>=OPP.length){me.score+=2000;return end()}ph=Math.min(100,ph+50);begin()}return}
  if(st==='down'){t-=dt;for(const k in PK)PK[k]=0;if(t<=0)return end();return}
  fightT+=dt;
  const ko=()=>{eh=0;st='ko';t=2.8;me.score+=300+Math.round(ph*3)+Math.max(0,Math.round((90-fightT)*3));say('K.O.!',2.6);shake=8};
  const punch=(m,kind)=>{const x=W/2+(kind==='lo'?rnd(-10,10):rnd(-25,25)),y=kind==='lo'?250:185;
   if(st==='idle'||st==='stun'){
    if(st==='idle'&&kind!=='star'&&Math.random()<(o.dodge||0)){hitfx(x,y,'#B07CFF','SLIP');combo=0;return}
    if(st==='idle'&&kind!=='star'&&Math.random()<o.blk){hitfx(x,y,'#9A9AB5','BLOCK');combo=0;return}
    const v=(st==='stun'?1.6:1)*m*(kind==='lo'?5:6);eh-=v;combo++;me.score+=Math.round(v*2)+(st==='stun'?15:0)+Math.min(combo,10)*2;
    hitfx(x,y,kind==='star'?'#FFD23D':'#FFFFFF',kind==='star'?'STAR PUNCH!':String(Math.round(v)));shake=kind==='star'?7:2;
    if(kind==='star')me.score+=100;
    if(st==='idle'&&Math.random()<.35)t=Math.min(t,.3)}
   else if(st==='tell'&&!atk.feint){const v=m*9;eh-=v;combo++;me.score+=30+Math.round(v*2);
    hitfx(x,y,'#FFD23D','COUNTER!');shake=4;if(stars<3){stars++;say('\u2b50 Star earned',.8)}st='stun';t=1;queue=0}
   else if(st==='tell'&&atk.feint){hitfx(x,y,'#B07CFF','FEINT!');combo=0;atk.feint=false;t=Math.min(t,.2)}
   else{hitfx(x,y,'#9A9AB5','MISS');combo=0}
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
   const d=o.dmg*(atk.k==='U'?2.2:1)*(raging()?1.3:1);
   if(dodged){me.score+=10;hitfx(W/2,300,'#3DF5FF','DODGE')}
   else if(blocked){ph-=d*.25;hitfx(W/2,320,'#9A9AB5','BLOCK');shake=1}
   else{ph-=d*(wrong?1.2:1);hitfx(W/2,330,'#FF3D5A','-'+Math.round(d));shake=5;combo=0}
   if(ph<=0){ph=0;st='down';t=2.4;say('DOWN!',2.4)}}
  else if(st==='strike'&&t<=0){if(--queue>0)newAtk();else{st='stun';t=.7}}
  else if(st==='stun'&&t<=0)nextIdle()},
  draw(){const sx=shake?rnd(-shake,shake):0,sy=shake?rnd(-shake,shake):0;cx.save();cx.translate(sx,sy);
   // arena
   const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1A0B2E');g.addColorStop(1,'#0B0B14');cx.fillStyle=g;cx.fillRect(-10,-10,W+20,H+20);
   for(let i=0;i<14;i++){cx.fillStyle=`hsla(${(i*47+clock*40)%360},90%,65%,${.25+.2*Math.sin(clock*3+i)})`;cx.beginPath();cx.arc(i*28+8,92+Math.sin(i)*6,2.5,0,7);cx.fill()}
   cx.fillStyle='#24124A';cx.beginPath();cx.moveTo(0,300);cx.lineTo(W,300);cx.lineTo(W,H);cx.lineTo(0,H);cx.fill();
   ['#FF3DCB','#3DF5FF','#FFD23D'].forEach((c,i)=>{cx.strokeStyle=c;cx.globalAlpha=.7;cx.lineWidth=3;cx.beginPath();cx.moveTo(0,215+i*26);cx.lineTo(W,215+i*26);cx.stroke()});cx.globalAlpha=1;cx.lineWidth=1;
   // opponent
   const rg=raging(),tell=st==='tell',stun=st==='stun',koed=st==='ko';
   let ox=W/2,oy=koed?40*Math.min(1,(2.8-t)):0;
   if(st==='idle')ox+=Math.sin(clock*4)*8;
   if(stun)ox+=Math.sin(clock*30)*3;
   const bob=Math.sin(clock*5)*3;
   cx.save();cx.translate(ox,150+bob+oy);if(koed)cx.rotate(Math.min(1,(2.8-t))*.5);
   if(rg){cx.shadowColor='#FF3D5A';cx.shadowBlur=25}
   // body
   cx.fillStyle=o.skin;cx.fillRect(-34,40,68,70);
   cx.fillStyle=o.c;cx.fillRect(-36,58,72,26);cx.fillRect(-38,100,76,50);
   cx.fillStyle='#0B0B14';cx.fillRect(-38,100,76,6);
   // head
   cx.fillStyle=o.hair;cx.beginPath();cx.arc(0,8,30,Math.PI,0);cx.fill();cx.fillRect(-30,8,12,34);cx.fillRect(18,8,12,34);
   cx.fillStyle=o.skin;cx.beginPath();cx.ellipse(0,14,22,27,0,0,7);cx.fill();
   cx.fillStyle=o.hair;cx.beginPath();cx.arc(0,0,23,Math.PI*1.05,Math.PI*1.95);cx.fill();
   if(oi===5){cx.fillStyle='#FFD23D';cx.beginPath();cx.moveTo(-16,-18);cx.lineTo(-10,-34);cx.lineTo(-4,-22);cx.lineTo(0,-38);cx.lineTo(4,-22);cx.lineTo(10,-34);cx.lineTo(16,-18);cx.fill()}
   cx.fillStyle=o.c;cx.fillRect(-22,-4,44,5);
   cx.fillStyle='#0B0B14';const eyeY=stun||koed?14:12;
   if(stun||koed){cx.font='bold 12px system-ui';cx.textAlign='center';cx.fillText('x  x',0,18)}else{cx.fillRect(-11,eyeY,6,4);cx.fillRect(5,eyeY,6,4)}
   cx.fillStyle='#B3364A';cx.fillRect(-6,28,12,3);
   cx.shadowBlur=0;
   // gloves
   let lg=[-44,40],rgv=[44,40];
   if(tell&&atk){const k=atk.k,p=Math.sin(clock*25)*2;if(k==='L')lg=[-70+p,10];else if(k==='R')rgv=[70+p,10];else{lg=[-30,95];rgv=[30,95]}
    if(!atk.feint||Math.random()<.5){cx.fillStyle=k==='U'?'#FFD23D':'#FF3D5A';cx.font='bold 26px system-ui';cx.textAlign='center';cx.fillText('!',k==='L'?-70:k==='R'?70:0,-34)}}
   if(st==='strike'&&atk){if(atk.k==='L')lg=[-10,110];else if(atk.k==='R')rgv=[10,110];else{lg=[-8,120];rgv=[8,120]}}
   if(st==='idle'&&Math.random()<.002)lg=[-40,30];
   const glove=(x,y,s)=>{cx.fillStyle=rg?'#FF3D5A':'#E11D48';cx.beginPath();cx.arc(x,y,s,0,7);cx.fill();cx.fillStyle='rgba(255,255,255,.35)';cx.beginPath();cx.arc(x-s/3,y-s/3,s/3,0,7);cx.fill()};
   const gs=st==='strike'?24:17;glove(lg[0],lg[1],gs);glove(rgv[0],rgv[1],gs);
   cx.restore();
   // player (from behind)
   let px=W/2,py=H-20;if(pose==='dl')px-=70;if(pose==='dr')px+=70;if(pose==='guard')py+=14;
   cx.save();cx.translate(px,py);
   cx.fillStyle='#2A2A44';cx.fillRect(-46,-90,92,90);
   cx.fillStyle='#3DF5FF';cx.fillRect(-48,-30,96,30);
   cx.fillStyle='#5B3A29';cx.beginPath();cx.arc(0,-108,26,0,7);cx.fill();
   cx.fillStyle='#FF3DCB';cx.beginPath();cx.ellipse(0,-128,22,8,0,0,7);cx.fill();cx.fillRect(16,-130,8,40);
   const pg=(x,y,s)=>{cx.fillStyle='#3DF5FF';cx.beginPath();cx.arc(x,y,s,0,7);cx.fill();cx.fillStyle='rgba(255,255,255,.4)';cx.beginPath();cx.arc(x-s/3,y-s/3,s/3,0,7);cx.fill()};
   if(pose==='ph'){pg(-50,-80,18);pg(18,-205,15)}else if(pose==='pl'){pg(-50,-80,18);pg(16,-150,15)}
   else if(pose==='star'){pg(-50,-80,18);cx.shadowColor='#FFD23D';cx.shadowBlur=25;pg(0,-215,20);cx.shadowBlur=0}
   else if(pose==='guard'){pg(-20,-130,19);pg(20,-130,19)}else{pg(-50,-100,18);pg(50,-100,18)}
   cx.restore();
   // fx
   fx.forEach(f=>{cx.globalAlpha=Math.min(1,f.t*2);txt(f.s,f.x,f.y,f.c,f.s.length>6?18:22)});cx.globalAlpha=1;
   cx.restore();
   // HUD
   const bar=(x,v,mx,c,lbl,al)=>{cx.fillStyle='#151526';cx.fillRect(x,10,150,12);cx.fillStyle=c;const w=150*Math.max(0,v)/mx;cx.fillRect(al?x+150-w:x,10,w,12);cx.strokeStyle='#44446A';cx.strokeRect(x,10,150,12);cx.fillStyle='#EDEDF5';cx.font='bold 11px system-ui';cx.textAlign=al?'right':'left';cx.fillText(lbl,al?x+150:x,36)};
   bar(10,ph,100,'#3DF5FF','YOU',false);bar(W-160,eh,o.hp,raging()?'#FF3D5A':o.c,o.n,true);
   cx.textAlign='left';cx.font='14px system-ui';cx.fillStyle='#FFD23D';cx.fillText('\u2b50'.repeat(stars)||'',10,56);
   cx.fillStyle='#9A9AB5';cx.font='bold 11px system-ui';cx.textAlign='right';cx.fillText('BOUT '+(oi+1)+'/6'+(raging()?'  \u00b7 RAGE':''),W-10,56);
   if(st==='intro'){cx.fillStyle='rgba(11,11,20,.75)';cx.fillRect(0,170,W,120);txt('BOUT '+(oi+1)+(oi===5?' \u00b7 TITLE FIGHT':''),W/2,205,'#FF3DCB',16);txt(o.n,W/2,240,o.c,22);txt('Special: '+o.spn,W/2,268,'#9A9AB5',13)}
   if(mt>0&&st!=='intro')txt(msg,W/2,120,msg.startsWith('K.O')||msg==='DOWN!'?'#FFD23D':'#FF3DCB',msg.length<8?40:20)}}};
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
