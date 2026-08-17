/**
 * SONIQ — Premium Audio Player
 * Real dual-deck crossfade · 5-band EQ · Professional
 */
'use strict';

// ─── State ───
const S={queue:[],idx:-1,playing:false,shuffle:false,repeat:'off',vol:.85,cf:true,cfDur:4,liked:new Set(),sleepTm:null,sleepEOS:false};

// ─── Audio Engine (Dual Deck for REAL crossfade) ───
const deckA=document.getElementById('deckA');
const deckB=document.getElementById('deckB');
let activeDeck=deckA, standbyDeck=deckB;
let fadeOutId=null, fadeInId=null;

function playTrack(url){
    if(!url)return false;
    if(S.cf&&S.playing&&!activeDeck.paused&&activeDeck.currentTime>1){
        // REAL crossfade: play new on standby, fade out active, then swap
        standbyDeck.src=url;
        standbyDeck.volume=0;
        standbyDeck.play().then(()=>{
            fadeIn(standbyDeck,S.cfDur,S.vol);
            fadeOut(activeDeck,S.cfDur);
            // Swap decks after fade completes
            setTimeout(()=>{
                const tmp=activeDeck;
                activeDeck=standbyDeck;
                standbyDeck=tmp;
            },S.cfDur*1000);
        }).catch(()=>{});
    } else {
        // Normal play
        activeDeck.src=url;
        activeDeck.volume=S.vol;
        activeDeck.play().catch(()=>{});
    }
    return true;
}

function fadeIn(el,dur,target){
    clearInterval(fadeInId);
    let v=0;const step=target/20,int=(dur*1000)/20;
    fadeInId=setInterval(()=>{v+=step;if(v>=target){el.volume=target;clearInterval(fadeInId)}else el.volume=v},int);
}
function fadeOut(el,dur){
    clearInterval(fadeOutId);
    let v=el.volume;const step=v/20,int=(dur*1000)/20;
    fadeOutId=setInterval(()=>{v-=step;if(v<=0){el.volume=0;el.pause();el.currentTime=0;clearInterval(fadeOutId)}else el.volume=v},int);
}

// ─── DOM ───
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);

// ─── Init ───
document.addEventListener('DOMContentLoaded',()=>{
    setupAudioEvents();
    setupNav();
    setupMini();
    setupFP();
    setupSearch();
    setupChips();
    setupEQ();
    setupCfg();
    setupKeys();
    loadHome();
});

// ─── Audio Events ───
function setupAudioEvents(){
    [deckA,deckB].forEach(d=>{
        d.addEventListener('timeupdate',()=>{if(d!==activeDeck)return;onTime()});
        d.addEventListener('ended',()=>{if(d!==activeDeck)return;onEnded()});
        d.addEventListener('loadedmetadata',()=>{if(d!==activeDeck)return;$('#fpT2').textContent=fmt(activeDeck.duration)});
        d.addEventListener('waiting',()=>{if(d!==activeDeck)return;$('#fpBuf').classList.add('show')});
        d.addEventListener('canplaythrough',()=>{if(d!==activeDeck)return;$('#fpBuf').classList.remove('show')});
        d.addEventListener('error',()=>{if(d!==activeDeck)return;setTimeout(playNext,500)});
    });
}

function onTime(){
    const dur=activeDeck.duration;if(!dur)return;
    const pct=(activeDeck.currentTime/dur)*100;
    $('#mpFill').style.width=pct+'%';
    $('#fpPlayed').style.width=pct+'%';
    $('#fpKnob').style.left=`calc(${pct}% - 7px)`;
    $('#fpT1').textContent=fmt(activeDeck.currentTime);
    try{const b=activeDeck.buffered;if(b.length)$('#fpBuffered').style.width=(b.end(b.length-1)/dur*100)+'%'}catch(e){}
}

function onEnded(){
    if(S.sleepEOS){S.playing=false;S.sleepEOS=false;updIcons();return}
    playNext();
}

// ─── Navigation ───
function setupNav(){
    $$('.tab').forEach(t=>t.addEventListener('click',()=>nav(t.dataset.p)));
    $('#btnSearch').addEventListener('click',()=>nav('search'));
}
function nav(p){
    $$('.tab').forEach(t=>t.classList.toggle('on',t.dataset.p===p));
    $$('.pg').forEach(x=>x.classList.remove('on'));
    const el=$(`#pg${p.charAt(0).toUpperCase()+p.slice(1)}`);
    if(el){el.classList.add('on');el.scrollTop=0}
    if(p==='search')setTimeout(()=>$('#inp')?.focus(),100);
}
window.nav=nav;

// ─── Home ───
async function loadHome(){
    loadList('Arijit Singh','#listPicks','_pk');
    loadCards('Bollywood trending 2024','#rowTrend','_tr');
    loadCards('New Hindi songs 2024','#rowNew','_nw');
    loadArtists();
}

async function loadList(q,sel,k){
    const r=await api(`/api/search/songs?query=${enc(q)}&limit=8`);
    if(!r)return;S[k]=r;
    $(sel).innerHTML=r.map((s,i)=>liHTML(s,k,i)).join('');
}
async function loadCards(q,sel,k){
    const r=await api(`/api/search/songs?query=${enc(q)}&limit=12`);
    if(!r)return;S[k]=r;
    $(sel).innerHTML=r.map((s,i)=>cdHTML(s,k,i)).join('');
}
async function loadArtists(){
    const n=['Arijit Singh','Shreya Ghoshal','Pritam','AP Dhillon','Diljit Dosanjh','Atif Aslam'];
    $('#rowArt').innerHTML=n.map(a=>`<div class="cd" onclick="moodPlay('${esc(a)}')"><div class="cd-img" style="display:flex;align-items:center;justify-content:center;background:var(--bg2);border-radius:50%;font-size:1.6rem">🎤</div><div class="cd-t">${esc(a)}</div></div>`).join('');
}

function liHTML(s,k,i){const img=bImg(s.image);return `<div class="li" onclick="pf('${k}',${i})"><div class="li-img"><img src="${img}" loading="lazy"></div><div class="li-info"><div class="li-t">${esc(s.name)}</div><div class="li-s">${esc(art(s))}</div></div></div>`}
function cdHTML(s,k,i){const img=bImg(s.image);return `<div class="cd" onclick="pf('${k}',${i})"><div class="cd-img"><img src="${img}" loading="lazy"><div class="cd-ov"><svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div><div class="cd-t">${esc(s.name)}</div><div class="cd-s">${esc(art(s))}</div></div>`}

// ─── Chips ───
function setupChips(){
    $('#homeChips')?.addEventListener('click',e=>{const c=e.target.closest('.c');if(!c)return;$$('#homeChips .c').forEach(x=>x.classList.remove('on'));c.classList.add('on');const q=c.dataset.q;q==='all'?loadHome():moodPlay(q+' songs hindi')});
}

// ─── Play Functions ───
function pf(k,i){S.queue=[...(S[k]||[])];S.idx=i;play();}window.pf=pf;
async function moodPlay(q){show(true);const r=await api(`/api/search/songs?query=${enc(q)}&limit=20`);if(r){S.queue=r;S.idx=0;play()}show(false)}window.moodPlay=moodPlay;
function pq(i){S.idx=i;play()}window.pq=pq;
function ps(i){S.queue=S._sr||[];S.idx=i;play()}window.ps=ps;

function play(){
    const s=S.queue[S.idx];if(!s)return;
    const url=bUrl(s.downloadUrl);if(!url){playNext();return}
    const ok=playTrack(url);if(!ok){playNext();return}
    S.playing=true;updUI(s);updQ();updLib();
}

function tog(){
    if(!S.queue.length)return;
    if(S.playing){activeDeck.pause();S.playing=false}else{activeDeck.volume=S.vol;activeDeck.play().catch(()=>{});S.playing=true}
    updIcons();$('#fpArt').classList.toggle('spin',S.playing);
}

function playNext(){
    if(!S.queue.length)return;
    if(S.repeat==='one'){activeDeck.currentTime=0;activeDeck.play();return}
    let n;if(S.shuffle)n=Math.floor(Math.random()*S.queue.length);else n=S.idx+1;
    if(n>=S.queue.length){if(S.repeat==='all')n=0;else{activeDeck.pause();S.playing=false;updIcons();$('#fpArt').classList.remove('spin');return}}
    S.idx=n;play();
}

function playPrev(){
    if(!S.queue.length)return;
    if(activeDeck.currentTime>3){activeDeck.currentTime=0;return}
    S.idx=Math.max(0,S.idx-1);play();
}

// ─── UI ───
function updUI(s){
    const img=bImg(s.image),a=art(s);
    setImg('#mpImg',img);$('#mpT').textContent=s.name||'';$('#mpT').classList.add('on');$('#mpS').textContent=a;
    setImg('#fpImg',img);$('#fpTitle').textContent=s.name||'';$('#fpArtist').textContent=a;
    $('#fpBg').style.backgroundImage=img?`url(${img})`:'';
    $('#fpArt').classList.toggle('spin',S.playing);
    $('#fpLike').classList.toggle('liked',S.liked.has(s.id));
    document.title=`${s.name} — Soniq`;updIcons();
}
function setImg(sel,src){const el=$(sel);el.src=src;el.onload=()=>el.classList.add('v')}
function updIcons(){const p=S.playing;$('#mpIPlay').style.display=p?'none':'';$('#mpIPause').style.display=p?'':'none';$('#fpIPlay').style.display=p?'none':'';$('#fpIPause').style.display=p?'':'none'}

function updQ(){
    const el=$('#fpQueue');if(!S.queue.length){el.innerHTML='<p class="ph-msg">Play a song to see your queue</p>';return}
    el.innerHTML=S.queue.map((s,i)=>{const img=bImg(s.image),a=art(s),act=i===S.idx;return `<div class="qi ${act?'act':''}" onclick="pq(${i})"><img src="${img}" loading="lazy"><div class="qi-i"><div class="qi-t">${esc(s.name)}</div><div class="qi-s">${esc(a)}</div></div>${act?'<div class="qi-eq"><i></i><i></i><i></i></div>':''}</div>`}).join('');
}

function updLib(){
    const el=$('#libList'),ph=$('#libPh');if(!S.queue.length){el.innerHTML='';if(ph)ph.style.display='';return}
    if(ph)ph.style.display='none';
    el.innerHTML=S.queue.map((s,i)=>liHTML(s,'_q',i).replace(`pf('_q',${i})`,`pq(${i})`)).join('');S._q=S.queue;
}

// ─── Mini Player ───
function setupMini(){
    $('#mpPlay').addEventListener('click',e=>{e.stopPropagation();tog()});
    $('#mpNext').addEventListener('click',e=>{e.stopPropagation();playNext()});
    $('#mpBody').addEventListener('click',()=>$('#fp').classList.add('open'));
}

// ─── Full Player ───
function setupFP(){
    $('#fpX').addEventListener('click',()=>$('#fp').classList.remove('open'));
    $('#fpPlay').addEventListener('click',tog);
    $('#fpNext').addEventListener('click',playNext);
    $('#fpPrev').addEventListener('click',playPrev);
    $('#fpShuffle').addEventListener('click',()=>{S.shuffle=!S.shuffle;$('#fpShuffle').classList.toggle('on',S.shuffle)});
    $('#fpRepeat').addEventListener('click',()=>{const m=['off','all','one'];S.repeat=m[(m.indexOf(S.repeat)+1)%3];$('#fpRepeat').classList.toggle('on',S.repeat!=='off')});
    $('#fpLike').addEventListener('click',()=>{const s=S.queue[S.idx];if(!s)return;S.liked.has(s.id)?S.liked.delete(s.id):S.liked.add(s.id);$('#fpLike').classList.toggle('liked',S.liked.has(s.id))});
    drag($('#fpBar'),p=>{if(activeDeck.duration)activeDeck.currentTime=p*activeDeck.duration});
    $$('.fp-tab').forEach(t=>t.addEventListener('click',()=>{$$('.fp-tab').forEach(x=>x.classList.remove('on'));$$('.fp-panel').forEach(x=>x.classList.remove('on'));t.classList.add('on');$(`#p${t.dataset.t.charAt(0).toUpperCase()+t.dataset.t.slice(1)}`).classList.add('on')}));
    let sy=0;$('#fp').addEventListener('touchstart',e=>{sy=e.touches[0].clientY},{passive:true});
    $('#fp').addEventListener('touchend',e=>{if(e.changedTouches[0].clientY-sy>100)$('#fp').classList.remove('open')},{passive:true});
}

// ─── EQ ───
let eqCtx,eqFilters=[],eqGain,eqOn=false;
const FREQS=[60,250,1000,4000,16000];
const PRESETS={flat:[0,0,0,0,0],bass:[9,5,0,-1,-2],treble:[-2,0,0,3,7],vocal:[-2,0,5,4,1],edm:[6,3,-2,3,5],rock:[5,3,-1,4,3]};

function connectEQ(){
    if(eqOn)return;eqOn=true;
    eqCtx=new(window.AudioContext||window.webkitAudioContext)();
    // Connect ONLY activeDeck (the one currently playing)
    const src=eqCtx.createMediaElementSource(activeDeck);
    eqGain=eqCtx.createGain();eqGain.gain.value=1;
    let last=src;
    FREQS.forEach((f,i)=>{const fl=eqCtx.createBiquadFilter();fl.type=i===0?'lowshelf':i===4?'highshelf':'peaking';if(fl.type==='peaking')fl.Q.value=1.2;fl.frequency.value=f;fl.gain.value=0;eqFilters.push(fl);last.connect(fl);last=fl});
    last.connect(eqGain);eqGain.connect(eqCtx.destination);
}

function setupEQ(){
    $('#swBass').addEventListener('click',()=>{const on=!$('#swBass').classList.contains('on');$('#swBass').classList.toggle('on',on);connectEQ();applyP(on?'bass':'flat')});
    $('#eqPills').addEventListener('click',e=>{const p=e.target.closest('.ep');if(!p)return;$$('.ep').forEach(x=>x.classList.remove('on'));p.classList.add('on');connectEQ();applyP(p.dataset.e)});
    $$('.vr').forEach(sl=>sl.addEventListener('input',()=>{connectEQ();const i=+sl.dataset.b;if(eqFilters[i])eqFilters[i].gain.value=+sl.value;$$('.ep').forEach(x=>x.classList.remove('on'))}));
    $('#eqVol').addEventListener('input',()=>{const v=+$('#eqVol').value;$('#eqV').textContent=v+'%';if(eqOn)eqGain.gain.value=v/100;else activeDeck.volume=Math.min(1,S.vol*v/100)});
}

function applyP(name){const p=PRESETS[name];if(!p)return;p.forEach((v,i)=>{if(eqFilters[i])eqFilters[i].gain.value=v});$$('.vr').forEach((sl,i)=>{sl.value=p[i]||0});$$('.ep').forEach(x=>x.classList.toggle('on',x.dataset.e===name))}

// ─── Settings ───
function setupCfg(){
    const sw=$('#swCf');sw.classList.toggle('on',S.cf);
    sw.addEventListener('click',()=>{S.cf=!S.cf;sw.classList.toggle('on',S.cf)});
    const sl=$('#cfDur');sl.value=S.cfDur;
    sl.addEventListener('input',()=>{S.cfDur=+sl.value;$('#cfV').textContent=S.cfDur+'s'});
    $('#tmBtns').addEventListener('click',e=>{const b=e.target.closest('.tb');if(!b)return;const m=+b.dataset.m;
        if(m===-1){clearTm();return}
        if(m===0){S.sleepEOS=true;$('#tmV').textContent='Song end';$('.tb-stop').style.display='';return}
        clearTm();let rem=m*60;$('#tmV').textContent=fmt(rem);$('.tb-stop').style.display='';
        S.sleepTm=setInterval(()=>{rem--;if(rem<=0){clearTm();activeDeck.pause();S.playing=false;updIcons();$('#fpArt').classList.remove('spin')}else $('#tmV').textContent=fmt(rem)},1000);
    });
}
function clearTm(){if(S.sleepTm){clearInterval(S.sleepTm);S.sleepTm=null}S.sleepEOS=false;$('#tmV').textContent='Off';$('.tb-stop').style.display='none'}

// ─── Search ───
function setupSearch(){
    let t;const inp=$('#inp'),x=$('#inpX');
    inp.addEventListener('input',()=>{const q=inp.value.trim();x.classList.toggle('show',q.length>0);clearTimeout(t);if(q.length<2){$('#sOut').innerHTML='<p class="ph-msg">Search for your favourite music</p>';return}t=setTimeout(()=>doSearch(q),350)});
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){clearTimeout(t);doSearch(inp.value.trim())}});
    x.addEventListener('click',()=>{inp.value='';x.classList.remove('show');$('#sOut').innerHTML='<p class="ph-msg">Search for your favourite music</p>';inp.focus()});
}
async function doSearch(q){
    if(q.length<2)return;show(true);
    const r=await api(`/api/search/songs?query=${enc(q)}&limit=20`);
    if(r?.length){S._sr=r;$('#sOut').innerHTML=`<div class="list" style="padding:0 12px">${r.map((s,i)=>liHTML(s,'_sr',i).replace(`pf('_sr',${i})`,`ps(${i})`)).join('')}</div>`}
    else $('#sOut').innerHTML='<p class="ph-msg">No results found</p>';
    show(false);
}

// ─── Keys ───
function setupKeys(){document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;switch(e.code){case'Space':e.preventDefault();tog();break;case'ArrowRight':e.shiftKey?playNext():activeDeck.currentTime=Math.min(activeDeck.duration||0,activeDeck.currentTime+10);break;case'ArrowLeft':e.shiftKey?playPrev():activeDeck.currentTime=Math.max(0,activeDeck.currentTime-10);break;case'Escape':$('#fp').classList.remove('open');break}})}

// ─── Helpers ───
function drag(bar,cb){let d=false;const p=e=>{const r=bar.getBoundingClientRect(),x=e.clientX||e.touches?.[0]?.clientX||0;return Math.max(0,Math.min(1,(x-r.left)/r.width))};bar.addEventListener('mousedown',e=>{d=true;cb(p(e))});document.addEventListener('mousemove',e=>{if(d)cb(p(e))});document.addEventListener('mouseup',()=>{d=false});bar.addEventListener('touchstart',e=>{e.preventDefault();d=true;cb(p(e.touches[0]))},{passive:false});bar.addEventListener('touchmove',e=>{e.preventDefault();if(d)cb(p(e.touches[0]))},{passive:false});bar.addEventListener('touchend',()=>{d=false})}

async function api(url){try{const r=await fetch(url);const d=await r.json();return d.success?(d.data.results||d.data):null}catch(e){return null}}
function bUrl(u){if(!u?.length)return null;for(const q of['320kbps','160kbps','96kbps','48kbps','12kbps']){const f=u.find(d=>d.quality===q&&d.url);if(f)return f.url}return u[u.length-1]?.url||null}
function bImg(i){if(!i?.length)return'';for(const q of['500x500','150x150','50x50']){const f=i.find(x=>x.quality===q&&x.url);if(f)return f.url}return i[i.length-1]?.url||''}
function art(s){if(!s?.artists)return'';const p=s.artists.primary||[];return p.length?p.map(a=>a.name).filter(Boolean).join(', '):(s.artists.all||[]).slice(0,2).map(a=>a.name).filter(Boolean).join(', ')||''}
function fmt(s){if(!s||!isFinite(s))return'0:00';s=Math.floor(s);return`${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`}
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function enc(s){return encodeURIComponent(s)}
function show(v){$('#ld').classList.toggle('show',v)}
