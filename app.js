const sb=supabase.createClient('https://cjtutkvhyzjsgclqvylg.supabase.co','sb_publishable_E48ovT9wWxduLxnzPXL_5g_SnNl2rqz');
const $=i=>document.getElementById(i),esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const GAMES=[
 {id:'snake',img:'https://www.leonlink.net/img/cards/serpentine.jpg',ic:'🐍',name:'Serpentine',desc:'Grow the line, eat the dots, never bite yourself.',hint:'Arrows / WASD or swipe to steer.'},
 {id:'bricks',img:'https://www.leonlink.net/img/cards/brickfall.jpg',ic:'🧱',name:'Brickfall',desc:'Bounce the orb, smash every brick, keep the paddle alive.',hint:'Left/right or drag to move. Space or ● to launch.'},
 {id:'rocks',img:'https://www.leonlink.net/img/cards/drift.jpg',ic:'☄️',name:'Drift',desc:'Pilot a lone ship through a field of splitting rocks.',hint:'Left/right rotate, up thrust, space/● fire.'},
 {id:'invaders',img:'https://www.leonlink.net/img/cards/skylinesiege.jpg',ic:'👾',name:'Skyline Siege',desc:'Hold the line against descending waves from above.',hint:'Left/right or drag to move. Space/● fires.'},
 {id:'blocks',img:'https://www.leonlink.net/img/cards/stackline.jpg',ic:'🟪',name:'Stackline',desc:'Rotate, drop and clear lines before the well fills.',hint:'Left/right move, up rotate, down soft drop, ● hard drop.'},
 {id:'boxing',img:'https://www.leonlink.net/img/cards/knockoutqueens.jpg',ic:'🥊',name:'Knockout Queens',desc:'Arcade boxing: read the tells and KO six women champions.',hint:'◀/▶ dodge · hold ▼ block · ▲ high punch · ● body punch · hold ▼ + ▲ for a Star Punch (earn stars with counters).'},
 {id:'maze',img:'https://www.leonlink.net/img/cards/glowmaze.jpg',ic:'🟣',name:'Glowmaze',desc:'Gobble every spark in a neon maze while four glitches hunt you.',hint:'Arrows / WASD or swipe to steer. Grab a green core to turn the glitches blue and zap them.'},
 {id:'squad',img:'https://www.leonlink.net/img/cards/sootsquad.jpg',ic:'🪖',name:'Soot Squad',desc:'Lead four tiny troopers. Clear the patrols, blow the bunkers, bring them home.',hint:'Arrows / WASD, D-pad or drag to move. Your squad fires on its own — positioning is the game.'},
 {id:'swipe',img:'https://www.leonlink.net/img/cards/swipe.jpg',ic:'🗡️',name:'Swipe Assassin',desc:'Silent grid stealth: strike patrolling guards from behind, never face-to-face.',hint:'Swipe or arrows/WASD to move. Strike from behind — being seen is fatal.'},
 {id:'hex',img:'https://www.leonlink.net/img/cards/hex.jpg',ic:'⬡',name:'Hex Puzzle',desc:'Drop hex shapes onto the hive; fill full lines to clear.',hint:'Drag pieces onto the board, or tap a piece then arrows + space.'},
 {id:'linetrap',img:'https://www.leonlink.net/img/cards/linetrap.jpg',ic:'🕸️',name:'Line Trap',desc:'Draw glowing lines to zap waves of incoming enemies before they reach the core.',hint:'Drag to draw a line, or arrows + space to anchor and draw.'},
 {id:'sudoku',img:'https://www.leonlink.net/img/cards/sudoku.jpg',ic:'🔢',name:'Sudoku',desc:'Classic 9x9 with pencil notes — three mistakes ends the run.',hint:'Tap a cell then 1-9. Arrows move the cursor, N toggles notes.'},
 {id:'ludo',img:'https://www.leonlink.net/img/cards/ludo.jpg',ic:'🎲',name:'Ludo',desc:'Classic four-player board race against three AI rivals.',hint:'Tap ROLL or space, then tap a glowing piece. Roll 6 to leave the yard.'},
 {id:'streetball',img:'https://www.leonlink.net/img/cards/streetball.jpg',ic:'⚽',name:'Street Football',desc:'Big-head soccer showdown vs the CPU in 60-second matches.',hint:'Left/right or drag to move, up or two fingers to jump, space or tap to kick.'},
];
let P=null,ITEMS=[],BADGES=[],user=null,nick=null,mode='in',cur=null,after=null;
function go(v){document.body.classList.toggle('playing',v==='play');for(const s of ['home','play','auth','nick','profile'])$('v-'+s).hidden=s!==v;window.scrollTo(0,0)}
function renderWho(){$('who').innerHTML=user?`<span class="wh" onclick="openProfile()">${P?avHtml(P.av,P.fr):''}<span class="small">${esc(nick||user.email)}</span>${P?`<span class="tk">🪙${P.tokens}</span>`:''}</span> <button class="ghost" onclick="signOut()">Sign out</button>`:`<button onclick="go('auth')">Sign in</button>`}
const MORE=[{img:'https://www.leonlink.net/img/cards/chimneyrun.jpg',ic:'🏠',name:'Chimney Run',desc:'Run the rooftops, stomp soot gremlins and warp through chimneys.',u:'https://www.leonlink.net/chimney-run.html'},{ic:'🗞️',img:'https://www.leonlink.net/img/cards/paperroute.jpg',name:'Paper Route',desc:'Neon paper-boy run: hit glowing porches, dodge cars and dogs.',u:'https://www.leonlink.net/paper-route.html'}];
function renderHome(){const c=(g,tag)=>`<div class="pim"><img src="${g.img}" alt="${esc(g.name)}" loading="lazy"></div><div class="pbd"><h3>${g.name}</h3><p>${g.desc}</p><span class="go">${tag}</span></div>`;$('games').innerHTML=MORE.map(g=>`<a class="gc" href="${g.u}">${c(g,'Play on LeonLink \u2192')}</a>`).join('')+GAMES.map(g=>`<a class="gc" href="#${g.id}" onclick="openGame('${g.id}');return false">${c(g,'Play \u00b7 Leaderboard \u2192')}</a>`).join('')}
async function loadUser(){const {data}=await sb.auth.getSession();user=data.session?.user||null;nick=null;
 if(user){const {data:p}=await sb.from('arc_profiles').select('*').eq('id',user.id).maybeSingle();nick=p?.nickname||null;P=p?prof(p):null}else P=null;renderWho()}
function flip(){mode=mode==='in'?'up':'in';$('atitle').textContent=mode==='in'?'Sign in to save scores':'Create a free account';$('abtn').textContent=mode==='in'?'Sign in':'Create account';$('aflip').textContent=mode==='in'?'New here? Create a free account':'Have an account? Sign in';$('amsg').textContent=''}
async function auth(){const email=$('em').value.trim(),password=$('pw').value;$('amsg').textContent='…';
 const r=mode==='in'?await sb.auth.signInWithPassword({email,password}):await sb.auth.signUp({email,password,options:{emailRedirectTo:location.origin}});
 if(r.error){$('amsg').textContent=r.error.message;return}
 if(!r.data.session){$('amsg').textContent='Check your email to confirm, then sign in.';return}
 await loadUser();if(!nick)go('nick');else if(after)after();else go('home')}
async function saveNick(){const n=$('nick').value.trim();if(!/^[A-Za-z0-9_]{3,16}$/.test(n)){$('nmsg').textContent='3–16 letters, numbers or _';return}
 const {error}=await sb.from('arc_profiles').upsert({id:user.id,nickname:n});if(error){$('nmsg').textContent=error.code==='23505'?'That name is taken.':error.message;return}
 nick=n;renderWho();if(after)after();else go('home')}
async function signOut(){await sb.auth.signOut();user=null;nick=null;renderWho();go('home')}
async function loadLB(g){const {data}=await sb.from('arc_leaderboard').select('nickname,best,lvl,av,fr,co,ti').eq('game',g).order('best',{ascending:false}).limit(20);
 $('lb').innerHTML=(data||[]).map(r=>`<li class="${r.nickname===nick?'me':''}"><span><span class="lv">Lv${r.lvl}</span>${avHtml(r.av||'🕹️',r.fr)} <span style="${r.co?'color:'+r.co:''}">${esc(r.nickname)}</span>${r.ti?`<span class="ti">${esc(r.ti)}</span>`:''}</span><b>${r.best}</b></li>`).join('')||'<li class="small">No scores yet. Be the first.</li>';
 if(user){const {data:b}=await sb.from('arc_scores').select('score').eq('game',g).eq('user_id',user.id).order('score',{ascending:false}).limit(1);$('best').textContent=b?.[0]?.score??'–'}else $('best').textContent='–'}
function openGame(id){cur=GAMES.find(g=>g.id===id);if(!cur)return;history.replaceState(null,'','#'+id);$('gtitle').textContent=cur.name;$('hint').textContent=cur.hint;$('score').textContent=0;go('play');loadLB(id);showStart()}
function overlay(html){const o=$('overlay');o.innerHTML=html;o.hidden=!html}
function showStart(){overlay(`<h2>${cur.name}</h2><p>${cur.hint}</p><button onclick="begin()">Start</button>`)}
function begin(){overlay('');startGame(cur.id,onOver)}
async function onOver(score,dur){let msg='';
 if(score>0&&!user){msg=`<p>Sign in to post your score to the leaderboard.</p><button class="ghost" onclick="after=()=>{go('play');post(${score},${dur})};go('auth')">Sign in & save</button>`}
 else if(score>0&&!nick){msg=`<button class="ghost" onclick="after=()=>{go('play');post(${score},${dur})};go('nick')">Pick a name & save</button>`}
 overlay(`<h2>Game over</h2><p>Score <b>${score}</b></p><p id="pmsg" class="small"></p>${msg}<button onclick="begin()">Play again</button>`);
 if(score>0&&user&&nick)post(score,dur)}
async function post(score,dur){const {data:rw,error}=await sb.rpc('arc_submit_score',{p_game:cur.id,p_score:score,p_duration:Math.max(3,Math.round(dur))});
 const m=$('pmsg');if(m)m.innerHTML=error?('Not saved: '+esc(error.message)):`Score saved ✓ <span class="rw">+${rw.tokens} 🪙 · +${rw.xp} XP</span>${rw.pb?' · New personal best!':''}${rw.levelup?` · Level up! You're level ${rw.level}`:''}${(rw.badges||[]).map(b=>`<br>Badge unlocked: ${b.icon} ${esc(b.name)}`).join('')}`;if(!error){loadLB(cur.id);loadUser()}}
sb.auth.onAuthStateChange(()=>{});renderHome();loadUser();go('home');{const h=location.hash.slice(1);if(GAMES.some(g=>g.id===h))setTimeout(()=>openGame(h),0)}

function prof(p){const it=id=>ITEMS.find(i=>i.id===id);return{...p,av:it(p.avatar)?.val||'🕹️',fr:it(p.frame)?.val,co:it(p.color)?.val,ti:it(p.title)?.val,lvl:Math.floor(Math.sqrt(p.xp/50))+1}}
function avHtml(v,f){return `<span class="av${f==='rainbow'?' rb':''}" style="${f&&f!=='rainbow'?'border-color:'+f+';box-shadow:0 0 8px '+f:''}">${esc(v)}</span>`}
async function loadCat(){const [i,b]=await Promise.all([sb.from('arc_items').select('*').order('sort'),sb.from('arc_badges').select('*').order('sort')]);ITEMS=i.data||[];BADGES=b.data||[]}
async function openProfile(){if(!user){go('auth');return}if(!nick){go('nick');return}await loadUser();go('profile');renderProfile()}
async function renderProfile(){const p=P;if(!p)return;const lv=p.lvl,lo=50*(lv-1)**2,hi=50*lv**2;
 $('pav').outerHTML=`<div id="pav">${avHtml(p.av,p.fr).replace('class="av','class="av big')}</div>`;
 $('pname').innerHTML=`<span style="${p.co?'color:'+p.co:''}">${esc(p.nickname)}</span>`;$('ptitle').textContent=p.ti||'';
 $('plvl').textContent='Level '+lv;$('pbar').style.width=Math.round(100*(p.xp-lo)/(hi-lo))+'%';$('pxp').textContent=`${p.xp-lo}/${hi-lo} XP`;
 $('ptok').textContent=p.tokens;$('pstreak').textContent=p.streak;const today=new Date().toISOString().slice(0,10);$('dbtn').disabled=p.last_daily===today;$('dbtn').textContent=p.last_daily===today?'Daily bonus claimed \u2713':'Claim daily bonus';
 const [{data:e},{data:o}]=await Promise.all([sb.from('arc_earned').select('badge').eq('user_id',user.id),sb.from('arc_owned').select('item')]);const E=new Set((e||[]).map(x=>x.badge)),O=new Set((o||[]).map(x=>x.item));
 $('badges').innerHTML=BADGES.map(b=>`<div class="bd ${E.has(b.id)?'':'off'}" title="${esc(b.descr)}"><b>${b.icon}</b>${esc(b.name)}<div class="small">${esc(b.descr)}</div></div>`).join('');
 const K={avatar:'Avatars',frame:'Frames',color:'Name colours',title:'Titles'},eq={avatar:p.avatar,frame:p.frame,color:p.color,title:p.title};
 $('shop').innerHTML=Object.keys(K).map(k=>`<h4>${K[k]}</h4><div class="shop">${ITEMS.filter(i=>i.kind===k).map(i=>{const own=i.price===0||O.has(i.id),on=eq[k]===i.id;
  const pv=k==='avatar'?esc(i.val):k==='frame'?avHtml(p.av,i.val):k==='color'?`<b style="color:${i.val}">${esc(p.nickname)}</b>`:`<span class="small">${esc(i.val)}</span>`;
  const btn=on?(k==='avatar'?'<button disabled>Equipped</button>':`<button class="ghost" onclick="unequip('${k}')">Unequip</button>`):own?`<button onclick="equip('${i.id}')">Equip</button>`:lv<i.min_level?`<button disabled>Level ${i.min_level}</button>`:`<button ${p.tokens<i.price?'disabled':''} onclick="buy('${i.id}')">\U0001FA99 ${i.price}</button>`;
  return `<div class="it ${on?'eq':''}"><div class="pv">${pv}</div>${esc(i.name)}${btn}</div>`}).join('')}</div>`).join('')}
async function act(fn,args,ok){const {data,error}=await sb.rpc(fn,args);$('pmsg2').textContent=error?error.message:(typeof ok==='function'?ok(data):ok);await loadUser();renderProfile()}
const buy=id=>act('arc_buy',{p_item:id},'Unlocked! Tap Equip to wear it.'),equip=id=>act('arc_equip',{p_item:id},'Equipped.'),unequip=k=>act('arc_unequip',{p_kind:k},'Removed.');
const claimDaily=()=>act('arc_daily',{},d=>d.claimed?`+${d.tokens} tokens \u00b7 ${d.streak}-day streak`:'Already claimed today.');
loadCat().then(loadUser);
