const cv=document.getElementById('cv'),cx=cv.getContext('2d'),W=360,H=480;
const K={left:0,right:0,up:0,down:0,fire:0},P={};let loop=null,G=null;
const KM={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',' ':'fire'};
addEventListener('keydown',e=>{const k=KM[e.key];if(k&&G){if(!K[k])P[k]=1;K[k]=1;e.preventDefault()}});
addEventListener('keyup',e=>{const k=KM[e.key];if(k)K[k]=0});
document.querySelectorAll('#pad button').forEach(b=>{const k=b.dataset.k;
 b.addEventListener('pointerdown',e=>{e.preventDefault();K[k]=1;P[k]=1});['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>K[k]=0))});
let tx=null,ty=null,drag=null;cv.style.touchAction='none';
cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();tx=e.clientX;ty=e.clientY;drag=(e.clientX-r.left)*W/r.width});
cv.addEventListener('pointermove',e=>{if(tx==null)return;const r=cv.getBoundingClientRect();drag=(e.clientX-r.left)*W/r.width});
cv.addEventListener('pointerup',e=>{if(tx==null)return;const dx=e.clientX-tx,dy=e.clientY-ty;
 if(Math.max(Math.abs(dx),Math.abs(dy))>25){const k=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');P[k]=1}else P.fire=1;tx=null;drag=null});
const take=k=>{const v=P[k];P[k]=0;return v};
const rnd=(a,b)=>a+Math.random()*(b-a);
function txt(s,x,y,c='#EDEDF5',sz=16){cx.fillStyle=c;cx.font=`bold ${sz}px system-ui`;cx.textAlign='center';cx.fillText(s,x,y)}
function clear(){cx.fillStyle='#0B0B14';cx.fillRect(0,0,W,H)}
function setScore(s){document.getElementById('score').textContent=s}
function stopGame(){if(loop)cancelAnimationFrame(loop);loop=null;G=null}
function startGame(id,over){stopGame();for(const k in P)P[k]=0;const g=MAKERS[id]();G=g;const t0=performance.now();let last=t0;
 const end=()=>{const s=g.score;stopGame();over(s,(performance.now()-t0)/1000)};
 const f=now=>{if(G!==g)return;const dt=Math.min(.05,(now-last)/1000);last=now;g.step(dt,end);if(G!==g)return;clear();g.draw();setScore(g.score);loop=requestAnimationFrame(f)};
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
 return{score:0,step(dt,end){s.a+=(K.right-K.left)*4.2*dt;P.left=P.right=P.up=0;
  if(K.up){s.vx+=Math.cos(s.a)*220*dt;s.vy+=Math.sin(s.a)*220*dt}s.vx*=.992;s.vy*=.992;s.x+=s.vx*dt;s.y+=s.vy*dt;wrap(s);s.inv-=dt;cool-=dt;
  if((K.fire||P.fire)&&cool<=0){shots.push({x:s.x,y:s.y,vx:Math.cos(s.a)*420+s.vx,vy:Math.sin(s.a)*420+s.vy,t:.85});cool=.22;P.fire=0}
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
  if((K.fire||P.fire)&&cool<=0){shots.push({x:px,y:H-44});cool=.4;P.fire=0}
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
  if(take('fire')){while(fits(pc.c,pc.x,pc.y+1)){pc.y++;me.score+=1}place();return}P.down=0;
  acc+=dt*(K.down?12:1);const iv=Math.max(.08,.8-(lvl-1)*.07);
  if(acc>=iv){acc=0;if(fits(pc.c,pc.x,pc.y+1)){pc.y++;if(K.down)me.score+=1}else place()}},
  draw(){cx.fillStyle='#151526';cx.fillRect(ox,oy,COLS*C,ROWS*C);
   const cell=(x,y,c)=>{cx.fillStyle=c;cx.fillRect(ox+x*C+1,oy+y*C+1,C-2,C-2)};
   grid.forEach((r,y)=>r.forEach((v,x)=>v&&cell(x,y,CL[v-1])));
   let gy=pc.y;while(fits(pc.c,pc.x,gy+1))gy++;cx.globalAlpha=.25;pc.c.forEach(([a,b])=>gy+b>=0&&cell(pc.x+a,gy+b,CL[pc.t]));cx.globalAlpha=1;
   pc.c.forEach(([a,b])=>pc.y+b>=0&&cell(pc.x+a,pc.y+b,CL[pc.t]));
   txt('NEXT',W-50,40,'#9A9AB5',13);SH[nx].forEach(([a,b])=>{cx.fillStyle=CL[nx];cx.fillRect(W-80+a*14,52+b*14,12,12)});
   txt('LINES',W-50,130,'#9A9AB5',13);txt(lines,W-50,152);txt('LEVEL',W-50,190,'#9A9AB5',13);txt(lvl,W-50,212)}}};
