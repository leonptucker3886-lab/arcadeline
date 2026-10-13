const sb=supabase.createClient('https://cjtutkvhyzjsgclqvylg.supabase.co','sb_publishable_E48ovT9wWxduLxnzPXL_5g_SnNl2rqz');
const $=i=>document.getElementById(i),esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const GAMES=[
 {id:'snake',ic:'🐍',name:'Serpentine',desc:'Grow the line, eat the dots, never bite yourself.',hint:'Arrows / WASD or swipe to steer.'},
 {id:'bricks',ic:'🧱',name:'Brickfall',desc:'Bounce the orb, smash every brick, keep the paddle alive.',hint:'Left/right or drag to move. Space or ● to launch.'},
 {id:'rocks',ic:'☄️',name:'Drift',desc:'Pilot a lone ship through a field of splitting rocks.',hint:'Left/right rotate, up thrust, space/● fire.'},
 {id:'invaders',ic:'👾',name:'Skyline Siege',desc:'Hold the line against descending waves from above.',hint:'Left/right or drag to move. Space/● fires.'},
 {id:'blocks',ic:'🟪',name:'Stackline',desc:'Rotate, drop and clear lines before the well fills.',hint:'Left/right move, up rotate, down soft drop, ● hard drop.'}];
let user=null,nick=null,mode='in',cur=null,after=null;
function go(v){for(const s of ['home','play','auth','nick'])$('v-'+s).hidden=s!==v;window.scrollTo(0,0)}
function renderWho(){$('who').innerHTML=user?`<span class="small">${esc(nick||user.email)}</span> <button class="ghost" onclick="signOut()">Sign out</button>`:`<button onclick="go('auth')">Sign in</button>`}
const MORE=[{ic:'🏠',name:'Chimney Run',desc:'Run the rooftops, stomp soot gremlins and warp through chimneys.',u:'https://www.leonlink.net/chimney-run.html'},{ic:'🗞️',name:'Paper Route',desc:'Neon paper-boy run: hit glowing porches, dodge cars and dogs.',u:'https://www.leonlink.net/paper-route.html'}];
function renderHome(){const _m=MORE.map(g=>`<a class="gc" style="text-decoration:none;color:inherit" href="${g.u}"><div class="ic">${g.ic}</div><h3>${g.name}</h3><p>${g.desc}</p></a>`).join('');$('games').innerHTML=GAMES.map(g=>`<div class="gc" onclick="openGame('${g.id}')"><div class="ic">${g.ic}</div><h3>${g.name}</h3><p>${g.desc}</p></div>`).join('')+_m}
async function loadUser(){const {data}=await sb.auth.getSession();user=data.session?.user||null;nick=null;
 if(user){const {data:p}=await sb.from('arc_profiles').select('nickname').eq('id',user.id).maybeSingle();nick=p?.nickname||null}renderWho()}
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
async function loadLB(g){const {data}=await sb.from('arc_leaderboard').select('nickname,best').eq('game',g).order('best',{ascending:false}).limit(20);
 $('lb').innerHTML=(data||[]).map(r=>`<li class="${r.nickname===nick?'me':''}"><span>${esc(r.nickname)}</span><b>${r.best}</b></li>`).join('')||'<li class="small">No scores yet. Be the first.</li>';
 if(user){const {data:b}=await sb.from('arc_scores').select('score').eq('game',g).eq('user_id',user.id).order('score',{ascending:false}).limit(1);$('best').textContent=b?.[0]?.score??'–'}else $('best').textContent='–'}
function openGame(id){cur=GAMES.find(g=>g.id===id);$('gtitle').textContent=cur.name;$('hint').textContent=cur.hint;$('score').textContent=0;go('play');loadLB(id);showStart()}
function overlay(html){const o=$('overlay');o.innerHTML=html;o.hidden=!html}
function showStart(){overlay(`<h2>${cur.name}</h2><p>${cur.hint}</p><button onclick="begin()">Start</button>`)}
function begin(){overlay('');startGame(cur.id,onOver)}
async function onOver(score,dur){let msg='';
 if(score>0&&!user){msg=`<p>Sign in to post your score to the leaderboard.</p><button class="ghost" onclick="after=()=>{go('play');post(${score},${dur})};go('auth')">Sign in & save</button>`}
 else if(score>0&&!nick){msg=`<button class="ghost" onclick="after=()=>{go('play');post(${score},${dur})};go('nick')">Pick a name & save</button>`}
 overlay(`<h2>Game over</h2><p>Score <b>${score}</b></p><p id="pmsg" class="small"></p>${msg}<button onclick="begin()">Play again</button>`);
 if(score>0&&user&&nick)post(score,dur)}
async function post(score,dur){const {error}=await sb.rpc('arc_submit_score',{p_game:cur.id,p_score:score,p_duration:Math.max(3,Math.round(dur))});
 const m=$('pmsg');if(m)m.textContent=error?('Not saved: '+error.message):'Score saved ✓';if(!error)loadLB(cur.id)}
sb.auth.onAuthStateChange(()=>{});renderHome();loadUser();go('home');
