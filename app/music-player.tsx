'use client';
import { useEffect,useRef,useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, X } from 'lucide-react';
import { recordUri,recordUrl,type RecordChoice } from './room-content';

type Playback={data:{isPaused:boolean;isBuffering:boolean}};
type Controller={destroy:()=>void;play:()=>void;addListener:(event:string,listener:(event:Playback)=>void)=>void};
type SpotifyAPI={createController:(element:HTMLElement,options:{uri:string;width:string;height:number},callback:(controller:Controller)=>void)=>void};
declare global {interface Window {onSpotifyIframeApiReady?:(api:SpotifyAPI)=>void}}
let apiPromise:Promise<SpotifyAPI>|undefined;
function spotify(){
 if(!apiPromise)apiPromise=new Promise<SpotifyAPI>((resolve,reject)=>{
  const timer=setTimeout(()=>{apiPromise=undefined;reject(new Error('Spotify is taking a little longer.'))},15000);
  window.onSpotifyIframeApiReady=api=>{clearTimeout(timer);resolve(api)};
  const script=document.createElement('script');script.src='https://open.spotify.com/embed/iframe-api/v1';script.async=true;
  script.onerror=()=>{clearTimeout(timer);apiPromise=undefined;script.remove();reject(new Error('Spotify could not load.'))};document.head.appendChild(script);
 });
 return apiPromise;
}
export function MusicPlayer({record,onPlaying,onClose}:{record:RecordChoice;onPlaying:(playing:boolean)=>void;onClose:()=>void}){
 const mount=useRef<HTMLDivElement>(null),callback=useRef(onPlaying);
 const [collapsed,setCollapsed]=useState(false),[failed,setFailed]=useState(false),[loaded,setLoaded]=useState(false);
 useEffect(()=>{callback.current=onPlaying},[onPlaying]);
 useEffect(()=>{
  let cancelled=false,controller:Controller|undefined;callback.current(false);
  const host=mount.current!;const element=document.createElement('div');host.appendChild(element);
  void spotify().then(api=>{if(cancelled)return;api.createController(element,{uri:recordUri(record),width:'100%',height:152},next=>{
   if(cancelled){next.destroy();return}controller=next;
   next.addListener('playback_update',event=>{if(!cancelled)callback.current(!event.data.isPaused&&!event.data.isBuffering)});
   next.addListener('ready',()=>{if(!cancelled){setLoaded(true);next.play()}});
  })}).catch(()=>{if(!cancelled)setFailed(true)});
  return()=>{cancelled=true;controller?.destroy();host.replaceChildren();callback.current(false)};
 },[record]);
 return <aside className={'music-player'+(collapsed?' is-collapsed':'')} aria-label="Record player">
  <div className="player-heading"><button onClick={()=>setCollapsed(!collapsed)} aria-expanded={!collapsed}><span className="tiny-record"/><span>{record.title}<small>{record.artist}</small></span>{collapsed?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button><button className="tool-button" aria-label="Stop and close the record player" onClick={onClose}><X/></button></div>
  <div className="player-body" hidden={collapsed}>
   {!loaded&&!failed&&<p className="player-status">Putting your record on…</p>}
   {failed&&<p className="player-status">Spotify couldn’t load here. You can still listen using the link below.</p>}
   <div ref={mount}/><a href={recordUrl(record)} target="_blank" rel="noreferrer">Listen on Spotify <ExternalLink size={12}/></a>
  </div>
 </aside>;
}
