'use client';
import { useEffect, useRef, useState } from 'react';
import { Armchair, ArrowLeft, BookOpen, Check, Coffee, Copy, DoorOpen, Expand, FilePlus2, Flame, HelpCircle, Home, LampDesk, Mail, Moon, Send, Sun, Volume2, VolumeX, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { drinkSteps, letterMailto, roomSettings, type Drink } from './room-settings';
import type { RoomController } from './scene';

const views = [{id:'room',label:'The room',Icon:Home},{id:'typewriter',label:'Write to Élo',Icon:Mail},{id:'desk',label:'My desk',Icon:LampDesk},{id:'library',label:'Library',Icon:BookOpen},{id:'drinks',label:'Tea & candles',Icon:Coffee},{id:'window',label:'Paris',Icon:Armchair}];

export default function Room(){
 const host=useRef<HTMLDivElement>(null),controller=useRef<RoomController|null>(null),input=useRef<HTMLTextAreaElement>(null);
 const [ready,setReady]=useState(false),[error,setError]=useState(false),[view,setView]=useState('room');
 const [evening,setEvening]=useState(false),[help,setHelp]=useState(false),[toast,setToast]=useState('');
 const [typing,setTyping]=useState(false),[muted,setMuted]=useState(false),[letter,setLetter]=useState(''),[name,setName]=useState('');
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
    if(id==='drinks'&&(detail==='tea'||detail==='matcha'||detail==='coffee'))setDrink(detail);
    if(id==='cat'){controller.current?.fillBowl();setToast('A little bowl, filled with love.');}
   },setTyping,setLetter);
   controller.current.setEvening(saved.evening);controller.current.setMuted(saved.muted);controller.current.setCandles(saved.candles);controller.current.updateNote(saved.letter);
   for(const id of ['tea','matcha','coffee'] as Drink[])controller.current.setDrink(id,saved.progress[id]);
   controller.current.setDrink(saved.drink,saved.progress[saved.drink]);
   if(saved.doorOpen)controller.current.toggleDoor();
   setTyping(false);controller.current.go(saved.view);
  }).catch(()=>{if(!stopped)setError(true)});
  return()=>{stopped=true;controller.current?.dispose();controller.current=null};
 },[]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(timer)},[toast]);
 const go=(id:string)=>{controller.current?.go(id);host.current?.focus()};
 const changeLetter=(value:string)=>{controller.current?.updateNote(value)};
 const brew=()=>{const next=progress[drink]===3?0:progress[drink]+1;setProgress(p=>({...p,[drink]:next}));controller.current?.setDrink(drink,next)};
 const mailto=letterMailto(roomSettings.ownerEmail,name,letter);
 return <main className={'room'+(typing?' is-writing':'')+(evening?' is-evening':'')+(view==='drinks'||view==='candles'?' is-ritual':'')} aria-label="Élo’s immersive Parisian room">
  <div ref={host} className="scene" tabIndex={0} aria-label="Interactive 3D room" />
  {!ready&&!error&&<div className="loading" role="status"><div className="loading-ring"/><h2>Come on in.</h2><p>Opening a little corner of Paris…</p></div>}
  {error&&<div className="fallback"><img src="/room-reference.png" alt="A sunlit Parisian study with a rose chair, wooden desk, bookshelves and French windows."/><p>Your browser couldn’t open the 3D room.</p><button onClick={()=>location.reload()}>Try again</button></div>}
  <header className="room-header"><div><h1 className="brand">Élo’s room<span>.</span></h1><p className="eyebrow">My Parisian Dream</p></div><div className="header-actions">
   <button className="icon-button" disabled={!ready} aria-label="Go to the entrance" title="The entrance" onClick={()=>go('entrance')}><DoorOpen/></button>
   <button className="icon-button" disabled={!ready} aria-label={evening?'Switch to afternoon light':'Switch to evening light'} title={evening?'Afternoon':'Evening'} onClick={()=>{setEvening(!evening);controller.current?.setEvening(!evening)}}>{evening?<Moon/>:<Sun/>}</button>
   <button className="icon-button fullscreen-button" aria-label="Toggle fullscreen" title="Fullscreen" onClick={()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>setToast('Fullscreen is unavailable in this preview.'))}}><Expand/></button>
   <button className="icon-button" aria-label="How to explore" title="How to explore" aria-expanded={help} onClick={()=>setHelp(!help)}><HelpCircle/></button>
  </div></header>
  <Dialog open={help} onOpenChange={setHelp}><DialogContent className="room-dialog"><DialogTitle>Make yourself at home.</DialogTitle><DialogDescription>Drag to look around, scroll or pinch to move closer. Select a place below, or click an object in the room.</DialogDescription><p>The typewriter is yours. Write a letter, then send it to Élo by email.</p><p>Arrow keys look around. W and S move. Home returns to the room.</p></DialogContent></Dialog>
  {toast&&<div className="toast" role="status">{toast}</div>}
  {typing?<>
   <button className="writing-back quiet-button" onClick={()=>go('room')}><ArrowLeft size={16}/>Back to the room</button>
   <section className="writing-station" aria-label="Write a letter to Élo">
    <div className="writing-heading"><label htmlFor="letter-input">Dear Élo,</label><span>A letter from My Parisian Dream</span></div>
    <textarea ref={input} id="letter-input" aria-label="Your letter" value={letter} maxLength={4000} placeholder="Something on your mind? Write it here…" spellCheck={false} onChange={e=>changeLetter(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();go('room')}}}/>
    <div className="writing-footer"><div className="writing-tools">
     <button className="tool-button" aria-label="Start a new letter" title="New letter" onClick={()=>{if(letter)setClearSheet(true);else input.current?.focus()}}><FilePlus2/></button>
     <button className="tool-button" aria-label={muted?'Turn typewriter sound on':'Mute typewriter sound'} title={muted?'Sound on':'Sound off'} aria-pressed={muted} onClick={()=>{setMuted(!muted);controller.current?.setMuted(!muted)}}>{muted?<VolumeX/>:<Volume2/>}</button>
     <span className="letter-count">{letter.length.toLocaleString()} / 4,000</span>
    </div><button className="primary-button" disabled={!letter.trim()} onClick={()=>setReview(true)}><Send size={16}/>Send to Élo</button></div>
   </section>
  </>:<>
   {view==='room'&&ready&&<button className="write-invitation" onClick={()=>go('typewriter')}><Mail size={20}/><span>Leave me a letter<small>At the typewriter · delivered by email</small></span></button>}
   {(view==='drinks'||view==='candles')&&<section className="ritual-bar" aria-label="Tea and candle controls"><div className="ritual-header"><h2>A little daily ritual</h2><button className="tool-button" aria-label={candles?'Blow out the candles':'Light the candles'} title={candles?'Blow out the candles':'Light the candles'} aria-pressed={candles} onClick={()=>{setCandles(!candles);controller.current?.setCandles(!candles)}}><Flame/></button></div><div className="drink-options" role="group" aria-label="Choose your drink">{(['tea','matcha','coffee'] as Drink[]).map(id=><button key={id} aria-pressed={drink===id} onClick={()=>setDrink(id)}>{id}</button>)}</div><button className="primary-button brew-button" onClick={brew}>{progress[drink]===3?<Check size={16}/>:<Coffee size={16}/>}<span>{progress[drink]===3?'Another cup':drinkSteps[drink][progress[drink]]}</span><small>{progress[drink]===3?'Ready':(progress[drink]+1)+' / 3'}</small></button></section>}
   {view==='entrance'&&<section className="entrance-actions" aria-label="Entrance"><button className="quiet-button" onClick={()=>setDoorOpen(controller.current?.toggleDoor()??false)}><DoorOpen size={18}/>{doorOpen?'Close the door':'Open the door'}</button><button className="primary-button" onClick={()=>{setDoorOpen(true);controller.current?.enter()}}>Come on in<ArrowLeft size={16}/></button></section>}
   <div className="bottom-ui"><p className="caption">{view==='desk'?'A place for a new idea.':view==='library'?'A few of my favorite things.':view==='window'?(evening?'Paris, all lit up.':'Paris can wait.'):view==='drinks'||view==='candles'?'Something warm, a little light.':view==='entrance'?'You’re always welcome.':evening?'Let the evening linger.':'The afternoon is yours.'}</p><nav className="nav" aria-label="Places in the room">{views.map(({id,label,Icon})=><button key={id} disabled={!ready} aria-pressed={view===id} onClick={()=>go(id)}><Icon/><span>{label}</span></button>)}</nav></div>
  </>}
  <Dialog open={review} onOpenChange={setReview}><DialogContent className="room-dialog letter-dialog"><DialogTitle>A letter for Élo</DialogTitle><DialogDescription>Your email app will open with your letter addressed and ready to send.</DialogDescription><div className="envelope-details"><span>To</span><strong>{roomSettings.ownerEmail}</strong><span>Subject</span><strong>My Parisian Dream — A letter from the room</strong></div><pre className="letter-preview">{letter}</pre><label className="signature-label" htmlFor="signature">With love,</label><input id="signature" className="signature-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (optional)" maxLength={80}/><div className="letter-dialog-actions"><button className="quiet-button" onClick={()=>{navigator.clipboard.writeText(letter).then(()=>setToast('Letter copied.')).catch(()=>setToast('Copy is unavailable. Your letter is still here.'))}}><Copy size={16}/>Copy letter</button>{mailto&&<a className="primary-button" href={mailto}><Mail size={16}/>Open email & send</a>}</div></DialogContent></Dialog>
  <Dialog open={clearSheet} onOpenChange={setClearSheet}><DialogContent className="room-dialog"><DialogTitle>A fresh sheet?</DialogTitle><DialogDescription>This will clear your current letter.</DialogDescription><div className="letter-dialog-actions"><button className="quiet-button" onClick={()=>setClearSheet(false)}><X size={16}/>Keep writing</button><button className="primary-button" onClick={()=>{controller.current?.newSheet();setClearSheet(false);input.current?.focus()}}><FilePlus2 size={16}/>New letter</button></div></DialogContent></Dialog>
 </main>;
}
