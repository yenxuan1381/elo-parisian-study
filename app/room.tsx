'use client';
import { useEffect, useRef, useState } from 'react';
import { Armchair, BookOpen, Expand, HelpCircle, Home, LampDesk, Moon, Sun, ScanLine } from 'lucide-react';
import type { RoomController } from './scene';
const views = [{id:'room',label:'The room',Icon:Home},{id:'desk',label:'My desk',Icon:LampDesk},{id:'library',label:'The library',Icon:BookOpen},{id:'window',label:'By the window',Icon:Armchair}] as const;
export default function Room(){
 const host = useRef<HTMLDivElement>(null); const controller = useRef<RoomController|null>(null);
 const [ready,setReady]=useState(false); const [error,setError]=useState(false); const [view,setView]=useState('room'); const [evening,setEvening]=useState(false); const [help,setHelp]=useState(false); const [toast,setToast]=useState('');
 useEffect(()=>{let stopped=false;import('./scene').then(({createRoom})=>{if(stopped||!host.current)return;controller.current=createRoom(host.current,()=>{if(!stopped)setReady(true)},(id)=>{setView(id)});}).catch(()=>{if(!stopped)setError(true)});return()=>{stopped=true;controller.current?.dispose()};},[]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(timer)},[toast]);
 const go=(id:string)=>{setView(id);controller.current?.go(id);host.current?.focus()};
 return <main className="room" aria-label="Élo’s immersive Parisian room">
  <div ref={host} className="scene" tabIndex={0} aria-label="Interactive 3D room. Drag to look around, use arrow keys to look, W and S to move forward and back. Use the viewpoint buttons to explore." />
  {!ready&&!error&&<div className="loading" role="status"><div className="loading-ring"/><h2>Come on in.</h2><p>Opening a little corner of Paris…</p></div>}
  {error&&<div className="fallback"><img src="/room-reference.png" alt="A sunlit Parisian study with a rose chair, wooden desk, bookshelves and French windows."/><p>Your browser couldn’t open the 3D room. Try a browser with WebGL enabled to explore.</p><button onClick={()=>location.reload()}>Try again</button></div>}
  <header className="room-header"><div><h1 className="brand">Élo’s room<span style={{color:'#92555b'}}>.</span></h1><p className="eyebrow">A little corner of Paris</p></div><div className="header-actions">
   <button className="icon-button" aria-label={evening?'Switch to afternoon light':'Switch to evening light'} title={evening?'Afternoon':'Evening'} onClick={()=>{setEvening(!evening);controller.current?.setEvening(!evening)}}>{evening?<Moon/>:<Sun/>}</button>
   <button className="icon-button" aria-label="Toggle fullscreen" title="Fullscreen" onClick={()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>setToast('Fullscreen is unavailable in this preview.'))}}><Expand/></button>
   <button className="icon-button" aria-label="How to explore" aria-expanded={help} onClick={()=>setHelp(!help)}><HelpCircle/></button>
  </div></header>
  {help&&<aside className="help-card"><h2>Make yourself at home.</h2><p>Drag anywhere to look around. Scroll or pinch to move closer.</p><p>Use the places below to settle into a different corner. You can also click the desk, shelves, or reading chair.</p><p>On a keyboard: arrow keys look around; W and S move forward and back. Press Home to return.</p><button onClick={()=>setHelp(false)}>Back to the room</button></aside>}
  {toast&&<div className="toast" role="status">{toast}</div>}
  <div className="corner-note">Stay a little while</div>
  <div className="bottom-ui"><p className="caption">{view==='desk'?'A place for a new idea.':view==='library'?'A few of my favorite things.':view==='window'?'Paris can wait.':'The afternoon is yours.'}</p><nav className="nav" aria-label="Places in the room">{views.map(({id,label,Icon})=><button key={id} aria-pressed={view===id} onClick={()=>go(id)}><Icon/><span>{label}</span></button>)}</nav><p className="hint"><ScanLine size={12} style={{display:'inline',verticalAlign:'-2px',marginRight:7}}/>Drag to look around · Scroll to move closer · Choose a corner</p></div>
 </main>
}
