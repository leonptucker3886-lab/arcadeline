const sb=supabase.createClient('https://cjtutkvhyzjsgclqvylg.supabase.co','sb_publishable_E48ovT9wWxduLxnzPXL_5g_SnNl2rqz');
const $=i=>document.getElementById(i),esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const GAMES=[
 {id:'snake',img:'https://www.leonlink.net/img/cards/serpentine.jpg',ic:'🐍',name:'Serpentine',desc:'Grow the line, eat the dots, never bite yourself.',hint:'Arrows / WASD or swipe to steer.'},
 {id:'dailysudoku',img:'https://www.leonlink.net/img/cards/sudoku.jpg',ic:'\ud83d\udcc5',name:'Daily Sudoku',desc:'One puzzle for everyone, every day. Build your streak \u2014 three mistakes ends the run.',hint:'Same puzzle all day for every player. Tap a cell then 1-9; N toggles notes.'},
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

 {id:'flap',img:'https://www.leonlink.net/img/cards/glowflap.jpg',ic:'',name:'Glow Flap',desc:'Thread neon gates with one thumb. Chain gates, earn medals up to Neon.',hint:'Tap / space / click to flap. 10 gates earns Bronze, 20 Silver, 30 Gold, 40 Neon.'},
 {id:'merge',img:'https://www.leonlink.net/img/cards/mergeglow.jpg',ic:'',name:'Merge Glow',desc:'Slide and fuse neon tiles. Chain merges in one move for combo multipliers.',hint:'Swipe or arrows / WASD to slide. Fuse equal tiles - reach the 2048 tile, then keep going.'},
 {id:'mines',img:'https://www.leonlink.net/img/cards/minefield.jpg',ic:'',name:'Minefield',desc:'Clear the 9x9 grid. Flag the mines, chord the numbers, beat the clock.',hint:'Tap to reveal, long-press or the FLAG button (or F) to flag. First tap is always safe.'},
 {id:'dominion',img:'https://www.leonlink.net/img/cards/dominion.jpg',ic:'\u265F',name:'Pocket Dominion',desc:'Tiny grand strategy: raise armies, build farms and forts, break pacts, take the map in 20 turns.',hint:'Tap only. Tap your lands to recruit and build, tap a neighbor to attack, tap a rival banner to offer a pact.'},
 {id:'orbitfall',url:'/orbitfall/',img:'/img/orbitfall.jpg',ic:'',name:'Orbitfall',desc:'Ride three orbits around a dying star. Grab shards, chain combos, skim meteors and dodge plasma arcs.',hint:'Tap to switch orbits.'},
];
let P=null,ITEMS=[],BADGES=[],user=null,nick=null,mode='in',cur=null,after=null;
const STAKE=25;                 // flat Glow entry per token run (Leon's constitution)
let runMode=null;               // 'glow' | 'practice'
let CHAL=null;                    // incoming challenge payload, consumed at landing
let ACT=null;                     // challenge being played this run {g,s,n}
// --- Challenge a friend: payload {g,s,n} base64url'd into #<game>?c=<payload>
function b64uEnc(s){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function b64uDec(s){s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))}
function parseChallenge(h){const m=/^#([A-Za-z0-9]+)\?c=([A-Za-z0-9\-_]+)$/.exec(h||'');if(!m)return null;
 try{const p=JSON.parse(b64uDec(m[2]));if(!p||p.g!==m[1])return null;if(!GAMES.some(x=>x.id===p.g))return null;
 const s=Math.round(Number(p.s));if(!isFinite(s)||s<0)return null;
 const n=String(p.n||'Someone').replace(/[\x00-\x1f]/g,'').slice(0,16)||'Someone';
 return{g:p.g,s:s,n:n}}catch(e){return null}}
function chalLink(g,s,n){return location.origin+location.pathname+'#'+g+'?c='+b64uEnc(JSON.stringify({g:g,s:Math.round(s),n:String(n||'Someone').slice(0,16)}))}
function toast(msg){if(typeof document==='undefined'||!document.body)return;const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){if(t.remove)t.remove()},2600)}
async function shareChallenge(score){const me=(user&&nick)?nick:'Someone';const url=chalLink(cur.id,score,me);
 const text='I scored '+score+' on '+cur.name+' \u2014 beat it.';
 if(typeof navigator!=='undefined'&&navigator.share){try{await navigator.share({title:'Arcadeline challenge',text:text,url:url})}catch(e){}}
 else if(typeof navigator!=='undefined'&&navigator.clipboard&&navigator.clipboard.writeText){try{await navigator.clipboard.writeText(url);toast('Challenge link copied')}catch(e){toast('Copy this link: '+url)}}
 else toast('Copy this link: '+url)}
function acceptChallenge(){if(!CHAL||CHAL.g!==cur.id)return;ACT={g:CHAL.g,s:CHAL.s,n:CHAL.n};CHAL=null;startRun('practice')}
function setChip(m){const c=$('modechip');if(!c)return;c.hidden=!m;c.className='modechip '+(m||'');c.textContent=m==='glow'?'GLOW RUN · '+STAKE+' staked':m==='practice'?'PRACTICE':''}
function go(v){document.body.classList.toggle('playing',v==='play');for(const s of ['home','play','auth','nick','profile'])$('v-'+s).hidden=s!==v;window.scrollTo(0,0)}
function renderWho(){$('who').innerHTML=user?`<span class="wh" onclick="openProfile()">${P?avHtml(P.av,P.fr):''}<span class="small">${esc(nick||user.email)}</span>${P?`<span class="tk">🪙${P.tokens}</span>`:''}</span> <button class="ghost" onclick="signOut()">Sign out</button>`:`<button onclick="go('auth')">Sign in</button>`}

const CATS=[
 {id:'top',name:'Top Picks',ids:['dailysudoku','maze','blocks','flap','merge','boxing']},
 {id:'classic',name:'Classic Arcade',ids:['snake','bricks','blocks','maze','flap','swipe']},
 {id:'action',name:'Action & Sports',ids:['rocks','invaders','squad','linetrap','boxing','streetball']},
 {id:'puzzle',name:'Puzzle & Brain',ids:['dailysudoku','sudoku','hex','merge','mines']},
 {id:'board',name:'Board & Strategy',ids:['ludo','dominion']}
];
(function(){const m=new Set();CATS.slice(1).forEach(c=>c.ids.forEach(i=>m.add(i)));const rest=GAMES.filter(g=>!m.has(g.id)).map(g=>g.id);if(rest.length)CATS.push({id:'more',name:'More Games',ids:rest})})();
let LOBBY_CAT='lobby';
function tileHTML(g){return `<a class="lt" href="#${g.id}" onclick="openGame('${g.id}');return false" aria-label="Play ${esc(g.name)}"><span class="lti"><img src="${g.img}" alt="" loading="lazy"><b class="ltp" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></b></span><span class="ltn">${esc(g.name)}</span></a>`}
function catGames(c){return c.ids.map(i=>GAMES.find(g=>g.id===i)).filter(Boolean)}
function renderHome(){
 const feat=[['dailysudoku','Daily challenge','One puzzle for everyone, every day. Keep your streak alive.'],['maze','Featured','Neon chase. Four glitches. One leaderboard.']];
 $('lhero').innerHTML=feat.map(([id,k,t])=>{const g=GAMES.find(x=>x.id===id);return g?`<a class="lh" href="#${g.id}" onclick="openGame('${g.id}');return false" style="background-image:linear-gradient(90deg,rgba(11,11,20,.92) 30%,rgba(11,11,20,.2)),url('${g.img}')"><small>${k}</small><strong>${esc(g.name)}</strong><span>${t}</span><em>Play now</em></a>`:''}).join('');
 $('lchips').innerHTML=[{id:'lobby',name:'Lobby'}].concat(CATS).map(c=>`<button type="button" class="lc${c.id===LOBBY_CAT?' on':''}" onclick="setCat('${c.id}')">${esc(c.name)}</button>`).join('');
 const q=($('lsearch').value||'').trim().toLowerCase();
 if(q){const r=GAMES.filter(g=>(g.name+' '+g.desc).toLowerCase().includes(q));$('games').innerHTML=`<div class="lrh"><h2>Results (${r.length})</h2></div>`+(r.length?`<div class="lgrid">${r.map(tileHTML).join('')}</div>`:`<p class="small">No games match "${esc(q)}".</p>`);return}
 if(LOBBY_CAT!=='lobby'){const c=CATS.find(x=>x.id===LOBBY_CAT),gs=catGames(c);$('games').innerHTML=`<div class="lrh"><h2>${esc(c.name)} (${gs.length})</h2><button type="button" class="lsa" onclick="setCat('lobby')">Back to lobby</button></div><div class="lgrid">${gs.map(tileHTML).join('')}</div>`;return}
 $('games').innerHTML=CATS.map(c=>{const gs=catGames(c);return `<section class="lrow"><div class="lrh"><h2>${esc(c.name)}</h2><button type="button" class="lsa" onclick="setCat('${c.id}')">See all (${gs.length})</button></div><div class="lscroll">${gs.map(tileHTML).join('')}</div></section>`}).join('')+`<section class="lrow"><div class="lrh"><h2>All games</h2><span class="small">${GAMES.length} games</span></div><div class="lgrid">${GAMES.map(tileHTML).join('')}</div></section>`}
function setCat(c){LOBBY_CAT=c;$('lsearch').value='';renderHome();const s=$('lbar');if(s&&window.scrollY>s.offsetTop)window.scrollTo({top:s.offsetTop-60,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='lsearch'){if(e.target.value)LOBBY_CAT='lobby';renderHome()}});
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
function openGame(id){cur=GAMES.find(g=>g.id===id);if(!cur)return;if(cur.url){location.href=cur.url;return}runMode=null;history.replaceState(null,'','#'+id);$('gtitle').textContent=cur.name;$('hint').textContent=cur.hint;$('score').textContent=0;go('play');loadLB(id);showStart()}
function overlay(html){const o=$('overlay');o.innerHTML=html;o.hidden=!html}
function showStart(){const signed=!!user;ACT=null;
 const banner=(CHAL&&CHAL.g===cur.id)?`<div class="chb"><b>${esc(CHAL.n)}</b> challenges you: beat <b>${CHAL.s}</b> on ${cur.id==='dailysudoku'?esc("today's board"):esc(cur.name)}.<br><button onclick="acceptChallenge()">Accept \u2014 practice</button></div>`:'';
 overlay(`<h2>${cur.name}</h2><p>${cur.hint}</p>${banner}
 ${signed
  ?`<div class="modebtns"><button onclick="startRun('glow')">Play for Glow — ${STAKE}</button><button class="ghost" onclick="startRun('practice')">Practice — free</button></div><p class="small stake-note">Glow runs record to the leaderboard · Practice records nothing</p>`
  :`<button class="ghost" onclick="startRun('practice')">Practice — free</button><p class="small stake-note">Practice records nothing · <a href="#" onclick="go('auth');return false">Sign in to play for Glow</a></p>`}`);
 setChip(null)}
function begin(){showStart()}
async function startRun(m){runMode=m;
 if(m==='glow'){
  const bal=P?P.tokens:0;
  if(!user||bal<STAKE){overlay(`<h2>${cur.name}</h2><p>Need ${STAKE} Glow — you have ${bal}.</p><p class="small">Practice is free and records nothing.</p><button class="ghost" onclick="showStart()">Back</button><button onclick="startRun('practice')">Practice — free</button>`);return}
  const {data:NB,error}=await sb.rpc('arc_glow_delta',{p_delta:-STAKE,p_reason:'stake:'+cur.id});
  if(error){overlay(`<h2>${cur.name}</h2><p class="small">Couldn't take the stake: ${esc(error.message)}</p><button class="ghost" onclick="showStart()">Back</button>`);return}
  if(P)P.tokens=NB;renderWho();
 }
 if(typeof window!=='undefined')window.GL_RUN_MODE=m;   // games.js daily maker reads this
 overlay('');setChip(m);{const t=$('tchip');if(t){if(ACT&&ACT.g===cur.id){t.hidden=false;t.textContent='TARGET '+ACT.s}else t.hidden=true}}startGame(cur.id,onOver)}
function llTrack(){try{if(!window.LLProfile)return;LLProfile.init('arcadeline');LLProfile.unlock('first_play');
 const k='arc_ll_played',p=JSON.parse(localStorage.getItem(k)||'[]');if(p.indexOf(cur.id)<0){p.push(cur.id);localStorage.setItem(k,JSON.stringify(p))}if(p.length>=5)LLProfile.unlock('five_games');
 if(cur.id==='dailysudoku'){const d=new Date().toISOString().slice(0,10),s=JSON.parse(localStorage.getItem('arc_ll_daily')||'{}');if(s.last!==d){const y=new Date(Date.now()-864e5).toISOString().slice(0,10);s.n=s.last===y?(s.n||0)+1:1;s.last=d;localStorage.setItem('arc_ll_daily',JSON.stringify(s))}if(s.n>=3)LLProfile.unlock('daily_streak_3')}}catch(e){}}
function llScore(s){try{if(window.LLProfile&&s>0)LLProfile.score(s)}catch(e){}}
async function onOver(score,dur){let msg='';llTrack();llScore(score);
 const glow=runMode==='glow';
 const wasChal=(ACT&&ACT.g===cur.id)?ACT:null;ACT=null;
 const verdict=wasChal?`<p class="verdict${score>=wasChal.s?' win':''}">${score>=wasChal.s?'Challenge beaten by '+(score-wasChal.s)+'!':'Short by '+(wasChal.s-score)+'.'}</p>`:'';
 const chalBtn=score>0?`<button class="ghost" onclick="shareChallenge(${score})">${wasChal?'Challenge them back':'Challenge a friend'}</button>`:'';
 const chip=glow?`<span class="modechip glow">GLOW RUN · ${STAKE} staked</span>`:'<span class="modechip practice">PRACTICE · not recorded</span>';
 if(!glow&&score>0&&!user){msg='<p class="small">Practice — not recorded. <a href="#" onclick="go(\'auth\');return false">Sign in to play for Glow.</a></p>'}
 else if(!glow&&score>0){msg='<p class="small">Practice — not recorded.</p>'}
 else if(glow&&score>0&&user&&!nick){msg=`<button class="ghost" onclick="after=()=>{go('play');post(${score},${dur})};go('nick')">Pick a name & save</button>`}
 overlay(`<h2>Game over</h2><p>${chip}</p>${verdict}<p>Score <b>${score}</b></p><p id="pmsg" class="small"></p>${msg}${glow?`<button onclick="startRun('glow')">Again — ${STAKE} Glow</button><button class="ghost" onclick="startRun('practice')">Practice instead</button>`:`<button onclick="startRun('practice')">Again</button>`}${chalBtn}`);
 if(glow&&score>0&&user&&nick)post(score,dur)}
async function post(score,dur){const {data:s}=await sb.auth.getSession();
 if(!s.session?.user){const m=$('pmsg');if(m)m.textContent='Not recorded — you signed out mid-run.';return}
 const {data:rw,error}=await sb.rpc('arc_submit_score',{p_game:cur.id,p_score:score,p_duration:Math.max(3,Math.round(dur))});
 const m=$('pmsg');if(m)m.innerHTML=error?('Not saved: '+esc(error.message)):`Score saved ✓ <span class="rw">+${rw.tokens} 🪙 · +${rw.xp} XP</span>${rw.pb?' · New personal best!':''}${rw.levelup?` · Level up! You're level ${rw.level}`:''}${(rw.badges||[]).map(b=>`<br>Badge unlocked: ${b.icon} ${esc(b.name)}`).join('')}`;if(!error){loadLB(cur.id);loadUser()}}
sb.auth.onAuthStateChange(()=>{});renderHome();loadUser();go('home');{try{const h=location.hash;CHAL=parseChallenge(h);let id=h.slice(1).split('?')[0];if(CHAL){id=CHAL.g;history.replaceState(null,'','#'+id)}if(GAMES.some(g=>g.id===id))setTimeout(()=>openGame(id),0)}catch(e){}}

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
const claimDaily=()=>act('arc_daily',{},d=>d.claimed?`+${d.tokens} Glow \u00b7 ${d.streak}-day streak`:'Already claimed today.');
loadCat().then(loadUser);

// keep the lobby search bar pinned just under the sticky header
(function(){const f=()=>{const h=document.querySelector('header');if(h)document.documentElement.style.setProperty('--hh',h.offsetHeight+'px')};f();addEventListener('resize',f);addEventListener('load',f)})();
