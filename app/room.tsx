'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Coffee, Compass, Copy, Disc3, DoorOpen, Expand, FilePlus2, Flame, HelpCircle, Home, Mail, MapPin, Moon, PenLine, Send, Sparkles, Sun, Volume2, VolumeX, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { destinations, drinkSteps, letterMailto, roomSettings, safeExternalUrl, type Drink } from './room-settings';
import { records, roomPlaces, type RecordChoice } from './room-content';
import { MusicPlayer } from './music-player';
import type { RoomController } from './scene';

export default function Room(){
 const host=useRef<HTMLDivElement>(null),controller=useRef<RoomController|null>(null);
 const editor=useRef<HTMLTextAreaElement>(null);
 const [ready,setReady]=useState(false),[error,setError]=useState(false),[view,setView]=useState('room');
 const [evening,setEvening]=useState(false),[help,setHelp]=useState(false),[toast,setToast]=useState('');
 const [typing,setTyping]=useState(false),[muted,setMuted]=useState(false),[letter,setLetter]=useState(''),[name,setName]=useState('');
 const [editing,setEditing]=useState(false);
 const [explore,setExplore]=useState(false),[musicOpen,setMusicOpen]=useState(false),[record,setRecord]=useState<RecordChoice|null>(null),[playing,setPlaying]=useState(false);
 const [recordKind,setRecordKind]=useState('all'),[travel,setTravel]=useState<string|null>(null),[gift,setGift]=useState<Drink|null>(null),[arriving,setArriving]=useState(false);
 const [hint,setHint]=useState<{text:string;x:number;y:number}|null>(null),[brewing,setBrewing]=useState(false),[fed,setFed]=useState(false);
 const brewTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [review,setReview]=useState(false),[clearSheet,setClearSheet]=useState(false),[candles,setCandles]=useState(true),[doorOpen,setDoorOpen]=useState(false);
 const [drink,setDrink]=useState<Drink>('tea'),[progress,setProgress]=useState<Record<Drink,number>>({tea:0,matcha:0,coffee:0});
 const live=useRef({view,evening,muted,candles,doorOpen,letter,drink,progress});
 live.current={view,evening,muted,candles,doorOpen,letter,drink,progress};
 useEffect(()=>{
  let stopped=false;
  import('./scene').then(({createRoom})=>{
   if(stopped||!host.current)return;
   const saved=live.current;
   controller.current=createRoom(host.current,()=>{if(!stopped)setReady(true)},setView,(id,detail)=>{
    if(id==='door')setDoorOpen(controller.current?.toggleDoor()??false);
    if(id==='candles')setCandles(current=>{controller.current?.setCandles(!current);return !current});
    if(id==='music'){setMusicOpen(true);if(detail&&records[Number(detail)])setRecord(records[Number(detail)]);}
    if(id==='travel')setTravel(detail||'london');
    if(id==='gift'&&(detail==='tea'||detail==='matcha'||detail==='coffee'))setGift(detail);
    if(id==='drinks'&&(detail==='tea'||detail==='matcha'||detail==='coffee')){
     setDrink(detail);
    }
   },setTyping,setLetter,setHint);
   controller.current.setEvening(saved.evening);controller.current.setMuted(saved.muted);controller.current.setCandles(saved.candles);controller.current.updateNote(saved.letter);
   for(const id of ['tea','matcha','coffee'] as Drink[])controller.current.setDrink(id,saved.progress[id]);
   controller.current.setDrink(saved.drink,saved.progress[saved.drink]);
   if(saved.doorOpen)controller.current.toggleDoor();
   setTyping(false);
   let welcome=false;try{welcome=!sessionStorage.getItem('emily-room-welcome')}catch{/* A welcome also works without storage. */}
   setArriving(welcome);controller.current.go(welcome?'entrance':saved.view);
  }).catch(()=>{if(!stopped)setError(true)});
  return()=>{stopped=true;if(brewTimer.current)clearTimeout(brewTimer.current);controller.current?.dispose();controller.current=null};
 },[]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(timer)},[toast]);
 const go=(id:string)=>{setExplore(false);setHint(null);controller.current?.go(id);host.current?.focus()};
 const enter=()=>{setArriving(false);setDoorOpen(true);try{sessionStorage.setItem('emily-room-welcome','1')}catch{/* Optional preference. */}controller.current?.enter()};
 const brew=()=>{if(brewing)return;const next=progress[drink]===3?0:progress[drink]+1;controller.current?.setDrink(drink,next);setProgress(current=>({...current,[drink]:next}));if(next){setBrewing(true);brewTimer.current=setTimeout(()=>{setBrewing(false);if(next===3)setToast('Your '+drink+' is ready. Stay a little longer.')},1800)}};
 const changePlaying=(value:boolean)=>{setPlaying(value);controller.current?.setPlaying(value)};
 const postcard=destinations.find(place=>place.id===travel);
 const mailto=letterMailto(roomSettings.ownerEmail,name,letter);
 return <main className={'room'+(evening?' is-evening':'')+(typing?' is-typing':'')} aria-label="Élo’s immersive Parisian room">
  <div ref={host} className="scene" tabIndex={0} aria-label="Interactive 3D room" />
  {hint&&!arriving&&<div className="object-hint" style={{left:hint.x,top:hint.y}}>{hint.text}<span>Click to explore</span></div>}
  {typing&&<div className="writing-title">Write anything and send to Emily</div>}
  {!ready&&!error&&<div className="loading" role="status"><div className="loading-ring"/><h2>Come on in.</h2><p>Opening a little corner of Paris…</p></div>}
  {error&&<div className="fallback"><img src="/room-reference.png" alt="A sunlit Parisian study with a rose chair, wooden desk, bookshelves and French windows."/><p>Your browser couldn’t open the 3D room.</p><button onClick={()=>location.reload()}>Try again</button></div>}
  <header className="room-header"><div><h1 className="brand">Élo’s room<span>.</span></h1><p className="eyebrow">My Parisian Dream</p></div><div className="header-actions">
   <button className="icon-button" disabled={!ready} aria-label="Go to the entrance" title="The entrance" onClick={()=>go('entrance')}><DoorOpen/></button>
   <button className="icon-button" disabled={!ready} aria-label={evening?'Switch to afternoon light':'Switch to evening light'} title={evening?'Afternoon':'Evening'} onClick={()=>{setEvening(!evening);controller.current?.setEvening(!evening)}}>{evening?<Moon/>:<Sun/>}</button>
   <button className="icon-button fullscreen-button" aria-label="Toggle fullscreen" title="Fullscreen" onClick={()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>setToast('Fullscreen is unavailable in this preview.'))}}><Expand/></button>
   <button className="icon-button" aria-label="How to explore" title="How to explore" aria-expanded={help} onClick={()=>setHelp(!help)}><HelpCircle/></button>
  </div></header>
  <Dialog open={help} onOpenChange={setHelp}><DialogContent className="room-dialog"><DialogTitle>Make yourself at home.</DialogTitle><DialogDescription>Drag to look around, scroll or pinch to move closer. Select a place below, or click an object in the room.</DialogDescription><p>The typewriter is yours. Write a letter, then send it to Emily by email.</p><p>Arrow keys look around. W and S move. Home returns to the room.</p></DialogContent></Dialog>
  {toast&&<div className="toast" role="status">{toast}</div>}
  {view==='entrance'&&<section className={'entrance-actions'+(arriving?' welcome-card':'')} aria-label="Entrance">{arriving&&<><span className="small-label">A LITTLE CORNER OF PARIS</span><h2>Make yourself at home.</h2><p>Pick a record. Make something warm.<br/>Stay as long as you like.</p></>}<div className="action-row"><button className="quiet-button" onClick={()=>setDoorOpen(controller.current?.toggleDoor()??false)}><DoorOpen size={18}/>{doorOpen?'Close the door':'Open the door'}</button><button className="primary-button" onClick={enter}>Come on in<ArrowLeft size={16}/></button></div></section>}
  <div className="bottom-ui">
   {view==='drinks'&&<section className="ritual-panel" aria-label="Make a drink"><div className="drink-choices">{(['tea','matcha','coffee'] as Drink[]).map(id=><button key={id} disabled={brewing} aria-pressed={drink===id} onClick={()=>{setDrink(id);controller.current?.setDrink(id,progress[id])}}>{id}</button>)}</div><div className="ritual-step"><span>{progress[drink]===3?'A cup just for you.':`${progress[drink]+1} / 3`}</span><button className="primary-button" disabled={brewing} onClick={brew}>{brewing?'A little patience…':progress[drink]===3?'Make another':drinkSteps[drink][progress[drink]]}</button><button className="tool-button" aria-label={'Buy Emily a '+drink} title={'Buy Emily a '+drink} onClick={()=>setGift(drink)}><Coffee/></button></div></section>}
   {view==='window'&&<section className="ritual-panel sky-controls" aria-label="Paris sky"><button className="quiet-button" onClick={()=>{setEvening(!evening);controller.current?.setEvening(!evening)}}>{evening?<Sun size={16}/>:<Moon size={16}/>} {evening?'Afternoon':'Watch the evening arrive'}</button><button className="primary-button" onClick={()=>{setEvening(true);controller.current?.setEvening(true);if(!controller.current?.launchFireworks('#f4c58e'))setToast('Let these sparkles settle, then try again.')}}><Sparkles size={16}/>Make a little magic</button></section>}
   {view==='music'&&<button className="quiet-button activity-button" onClick={()=>setMusicOpen(true)}><Disc3 size={17}/>Choose a record</button>}
   {view==='travel'&&<button className="quiet-button activity-button" onClick={()=>setTravel('london')}><MapPin size={17}/>Browse the postcards</button>}
   {view==='nook'&&<div className="ritual-panel sky-controls"><button className="quiet-button" onClick={()=>{go('music');setMusicOpen(true)}}><Disc3 size={16}/>Something to listen to</button><button className="quiet-button" onClick={()=>go('drinks')}><Coffee size={16}/>Something warm</button></div>}
   {view==='candles'&&<button className="quiet-button activity-button" onClick={()=>{setCandles(!candles);controller.current?.setCandles(!candles)}}><Flame size={17}/>{candles?'Blow out the candles':'Light the candles'}</button>}
   {view==='cat'&&<button className="quiet-button activity-button" disabled={fed} onClick={()=>{controller.current?.fillBowl();setFed(true);setToast('A little kindness, thank you.')}}>{fed?'A happy little bowl ♡':'Fill the little bowl ♡'}</button>}
   {typing&&<div className="writing-actions" aria-label="Your letter">
    <span className="letter-count">{letter.length.toLocaleString()} / 4,000</span>
    <button className="quiet-button paper-edit" aria-label="Write or edit your letter" onClick={()=>setEditing(true)} title="Read or edit the whole paper"><PenLine size={16}/><span>Write / edit</span></button>
    <button className="tool-button" aria-label="Start a new letter" title="New letter" onClick={()=>{if(letter)setClearSheet(true)}}><FilePlus2/></button>
    <button className="tool-button" aria-label={muted?'Turn typewriter sound on':'Mute typewriter sound'} title={muted?'Sound on':'Sound off'} aria-pressed={muted} onClick={()=>{setMuted(!muted);controller.current?.setMuted(!muted);host.current?.focus()}}>{muted?<VolumeX/>:<Volume2/>}</button>
    <button className="primary-button" disabled={!letter.trim()} onClick={()=>setReview(true)}><Send size={16}/>Send to Emily</button>
   </div>}
   <p className="caption">{typing?'Just type — the words land on the page.':view==='desk'?'A place for a new idea.':view==='library'?'A few of my favorite things.':view==='window'?(evening?'Paris, all lit up.':'Paris can wait.'):view==='drinks'||view==='candles'?'Something warm, a little light.':view==='entrance'?'You’re always welcome.':evening?'Let the evening linger.':'The afternoon is yours.'}</p>
   <nav className="nav compact-dock" aria-label="Places in the room"><button disabled={!ready} aria-expanded={explore} onClick={()=>setExplore(true)}><Compass/><span>Explore</span></button><button disabled={!ready} aria-pressed={view==='room'} onClick={()=>go('room')}><Home/><span>Room</span></button><button disabled={!ready} aria-pressed={typing} onClick={()=>go('typewriter')}><PenLine/><span>Write</span></button><button disabled={!ready} aria-pressed={playing} onClick={()=>{go('music');setMusicOpen(true)}}><Disc3 className={playing?'record-turning':''}/><span>Music</span></button></nav>
  </div>
  <Dialog open={explore} onOpenChange={setExplore}><DialogContent className="room-dialog explore-dialog"><DialogTitle>Where shall we go?</DialogTitle><DialogDescription>There’s a little something in every corner.</DialogDescription><div className="places-grid">{roomPlaces.map(place=><button key={place.id} aria-pressed={view===place.id} onClick={()=>go(place.id)}><span>{place.name}</span><small>{place.detail}</small></button>)}</div></DialogContent></Dialog>
  <Dialog open={musicOpen} onOpenChange={setMusicOpen}><DialogContent className="room-dialog record-dialog"><DialogTitle>A few favourites.</DialogTitle><DialogDescription>Pick a sleeve, press play, and let it keep you company.</DialogDescription><div className="record-filters">{['all','song','album','playlist'].map(kind=><button key={kind} aria-pressed={recordKind===kind} onClick={()=>setRecordKind(kind)}>{kind==='all'?'Everything':kind==='song'?'Songs':kind==='album'?'Albums':'Playlists'}</button>)}</div><div className="record-shelf">{records.filter(item=>recordKind==='all'||item.kind===recordKind).map(item=><button key={item.id} className="record-sleeve" style={{'--sleeve':item.color} as React.CSSProperties} aria-label={`Put on ${item.title} by ${item.artist}`} aria-pressed={record?.id===item.id} onClick={()=>{setRecord(item);setMusicOpen(false)}}><span className="sleeve-art"><Disc3/><small>{item.kind}</small></span><strong>{item.title}</strong><span>{item.artist}</span></button>)}</div></DialogContent></Dialog>
  {record&&<MusicPlayer key={record.id} record={record} onPlaying={changePlaying} onClose={()=>{setRecord(null);changePlaying(false)}}/>}
  <Dialog open={!!postcard} onOpenChange={open=>{if(!open)setTravel(null)}}><DialogContent className="room-dialog postcard-dialog"><DialogTitle>{postcard?.name}</DialogTitle><DialogDescription>{postcard?.caption}</DialogDescription>{postcard&&<figure className="travel-print"><img src={'/postcards/'+postcard.id+'.svg'} alt={'Illustrated postcard of '+postcard.name}/><figcaption>A little travel daydream.</figcaption></figure>}<div className="postcard-tabs">{destinations.map(place=><button key={place.id} aria-pressed={travel===place.id} onClick={()=>setTravel(place.id)}>{place.name}</button>)}</div></DialogContent></Dialog>
  <Dialog open={!!gift} onOpenChange={open=>{if(!open)setGift(null)}}><DialogContent className="room-dialog"><DialogTitle>A {gift} for Emily.</DialogTitle><DialogDescription>A small kindness to keep this little corner cosy.</DialogDescription>{gift&&safeExternalUrl(roomSettings.gifts[gift])?<a className="primary-button" href={safeExternalUrl(roomSettings.gifts[gift])!} target="_blank" rel="noreferrer">Buy Emily a {gift}</a>:<p>The tip jar isn’t open just yet. Your company is lovely, too.</p>}<button className="quiet-button" onClick={()=>{setGift(null);go('typewriter')}}>Leave a little letter instead</button></DialogContent></Dialog>
  <Dialog open={editing} onOpenChange={setEditing}><DialogContent className="room-dialog paper-dialog" initialFocus={editor} finalFocus={host}><DialogTitle>Write anything and send to Emily</DialogTitle><DialogDescription>Make yourself at home. This page is yours.</DialogDescription><textarea ref={editor} className="paper-editor" aria-label="Your letter to Emily" value={letter} maxLength={4000} placeholder="Dear Emily,…" onChange={event=>controller.current?.updateNote(event.target.value)}/><div className="letter-dialog-actions"><button className="quiet-button" onClick={()=>setEditing(false)}>Back to the typewriter</button><button className="primary-button" disabled={!letter.trim()} onClick={()=>{setEditing(false);setReview(true)}}><Send size={16}/>Send to Emily</button></div></DialogContent></Dialog>
  <Dialog open={review} onOpenChange={setReview}><DialogContent className="room-dialog letter-dialog" finalFocus={host}><DialogTitle>A letter for Emily</DialogTitle><DialogDescription>Your email app will open with your letter addressed and ready to send.</DialogDescription><div className="envelope-details"><span>To</span><strong>{roomSettings.ownerEmail}</strong><span>Subject</span><strong>My Parisian Dream — A letter from the room</strong></div><pre className="letter-preview">{letter}</pre><label className="signature-label" htmlFor="signature">With love,</label><input id="signature" className="signature-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (optional)" maxLength={80}/><div className="letter-dialog-actions"><button className="quiet-button" onClick={()=>{navigator.clipboard.writeText(letter).then(()=>setToast('Letter copied.')).catch(()=>setToast('Copy is unavailable. Your letter is still here.'))}}><Copy size={16}/>Copy letter</button>{mailto&&<a className="primary-button" href={mailto}><Mail size={16}/>Open email & send</a>}</div></DialogContent></Dialog>
  <Dialog open={clearSheet} onOpenChange={setClearSheet}><DialogContent className="room-dialog" finalFocus={host}><DialogTitle>A fresh sheet?</DialogTitle><DialogDescription>This will clear your current letter.</DialogDescription><div className="letter-dialog-actions"><button className="quiet-button" onClick={()=>setClearSheet(false)}><X size={16}/>Keep writing</button><button className="primary-button" onClick={()=>{controller.current?.newSheet();setClearSheet(false);host.current?.focus()}}><FilePlus2 size={16}/>New letter</button></div></DialogContent></Dialog>
 </main>;
}
