import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { addDreamCorners } from './dream-corners';
import { addNightSky } from './night-sky';
import { TypewriterAudio } from './ambience';
import type { Drink } from './room-settings';

export type RoomController = { go:(id:string)=>void; setEvening:(value:boolean)=>void; setTyping:(value:boolean)=>void; setMuted:(value:boolean)=>void; newSheet:()=>void; setCandles:(value:boolean)=>void; fillBowl:()=>void; setDrink:(id:Drink,progress:number)=>void; updateNote:(text:string)=>void; setPlaying:(value:boolean)=>void; launchFireworks:(color:string)=>boolean; dispose:()=>void };
type Parent = T.Object3D;
type View = {position:number[]; target:number[]};
const views:Record<string,View> = {
 room:{position:[3.35,2.55,4.6],target:[-.55,1.6,-1.5]},
 desk:{position:[-.6,1.8,1.45],target:[-.65,1.35,-.85]},
 library:{position:[-1.65,1.9,.4],target:[-3.8,1.9,-1.8]},
 window:{position:[1.6,1.7,-1.15],target:[1.15,2.2,-4.8]},
 nook:{position:[.85,2.05,2.65],target:[-.85,1.7,4.85]},
 drinks:{position:[1.67,1.83,2.02],target:[3.55,1.55,2.08]},
 typewriter:{position:[-2.95,1.26,3.16],target:[-3.56,1.02,2.6]},
 letter:{position:[-3.3,1.2,2.52],target:[-3.63,1.13,2.52]},
 music:{position:[1.78,1.75,3.25],target:[1.71,1.25,4.97]},
 travel:{position:[-.8,2.7,3.35],target:[-.8,2.8,5.4]},
 candles:{position:[2.21,1.91,-.1],target:[3.94,1.77,-.37]},
 cat:{position:[2.82,1.5,2.57],target:[2.84,.13,3.45]},
};

export function createRoom(host:HTMLDivElement,onReady:()=>void,onView:(id:string)=>void,onInteract:(id:string,detail?:string)=>void=()=>{},onTyping:(active:boolean)=>void=()=>{}):RoomController{
 const scene=new T.Scene();scene.background=new T.Color('#e4bfa6');scene.fog=new T.Fog('#e4bfa6',14,34);
 const camera=new T.PerspectiveCamera(58,host.clientWidth/host.clientHeight,.04,70);
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(host.clientWidth,host.clientHeight);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 host.appendChild(renderer.domElement);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let seed=39;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 const materials:T.Material[]=[];const textures:T.Texture[]=[];const geometries:T.BufferGeometry[]=[];
 const geometryCache=new Map<string,T.BufferGeometry>();
 function geom(key:string,fn:()=>T.BufferGeometry){let g=geometryCache.get(key);if(!g){g=fn();geometryCache.set(key,g);geometries.push(g)}return g}
 function surface(color:string,kind='paper'){
  const cv=document.createElement('canvas');cv.width=cv.height=256;const cx=cv.getContext('2d')!;cx.fillStyle=color;cx.fillRect(0,0,256,256);
  for(let i=0;i<6500;i++){const x=random()*256,y=random()*256;cx.fillStyle=random()>.5?`rgba(255,245,217,${random()*.11})`:`rgba(50,27,20,${random()*.08})`;cx.fillRect(x,y,kind==='wood'?random()*70+5:1.6,kind==='fabric'?2:.8)}
  if(kind==='wood'){for(let j=0;j<80;j++){cx.strokeStyle=`rgba(61,32,17,${random()*.16})`;cx.lineWidth=.35;cx.beginPath();const y=random()*256;cx.moveTo(0,y);cx.bezierCurveTo(80,y+random()*12,160,y-random()*10,256,y+random()*4);cx.stroke()}}
  if(kind==='fabric'){cx.globalAlpha=.1;cx.strokeStyle='#fff5df';for(let j=0;j<256;j+=3){cx.beginPath();cx.moveTo(j,0);cx.lineTo(j,256);cx.moveTo(0,j);cx.lineTo(256,j);cx.stroke()}}
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;textures.push(tex);
  const mat=new T.MeshStandardMaterial({map:tex,roughness:kind==='wood'?.8:1,metalness:0});materials.push(mat);return mat;
 }
 function plain(color:string,roughness=.75,metalness=0){const m=new T.MeshStandardMaterial({color,roughness,metalness});materials.push(m);return m}
 const plaster=surface('#dcb2a0'),cream=surface('#e7d7bb'),wood=surface('#966641','wood'),darkWood=surface('#634630','wood'),lightWood=surface('#b38b62','wood');
 const rose=surface('#b87577','fabric'),blush=surface('#cc9390','fabric'),linen=surface('#e5c8b0','fabric'),sage=surface('#617452'),terracotta=surface('#b67452'),ivory=surface('#ede1c8'),brass=plain('#b18a40',.44,.52),ink=plain('#3f3933'),green=plain('#65754e'),green2=plain('#869062'),ceramic=surface('#bec4bb'),paper=surface('#ecdfc3');
 function mesh(g:T.BufferGeometry,m:T.Material,p:Parent,x=0,y=0,z=0,shadow=true){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;p.add(o);return o}
 const boxGeometry=geom('box',()=>new T.BoxGeometry(1,1,1));
 function box(p:Parent,w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material,round=0){const g=round?geom(`rounded${w},${h},${d},${round}`,()=>new RoundedBoxGeometry(w,h,d,2,round)):boxGeometry;const o=mesh(g,m,p,x,y,z);if(!round)o.scale.set(w,h,d);return o}
 function cylinder(p:Parent,rt:number,rb:number,h:number,x:number,y:number,z:number,m:T.Material,segments=16){return mesh(geom(`cyl${rt},${rb},${h},${segments}`,()=>new T.CylinderGeometry(rt,rb,h,segments)),m,p,x,y,z)}
 function sphere(p:Parent,r:number,x:number,y:number,z:number,m:T.Material,sx=1,sy=1,sz=1){const o=mesh(geom('sphere',()=>new T.SphereGeometry(1,12,8)),m,p,x,y,z);o.scale.set(r*sx,r*sy,r*sz);return o}
 function group(p:Parent,x=0,y=0,z=0,rot=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot;p.add(g);return g}
 function rod(p:Parent,a:number[],b:number[],radius:number,m:T.Material){const from=new T.Vector3(...a),to=new T.Vector3(...b);const o=cylinder(p,radius,radius,from.distanceTo(to),0,0,0,m,8);o.position.copy(from.add(to).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...b).sub(new T.Vector3(...a)).normalize());return o}
 const edgeMaterial=new T.LineBasicMaterial({color:'#5a3d2e',transparent:true,opacity:.24});materials.push(edgeMaterial);
 function outline(o:T.Mesh){const g=new T.EdgesGeometry(o.geometry,32);geometries.push(g);const line=new T.LineSegments(g,edgeMaterial);o.add(line)}
 const loader=new T.TextureLoader();
 const paris=loader.load('/paris-watercolor.png');paris.colorSpace=T.SRGBColorSpace;textures.push(paris);
 const reference=loader.load('/room-reference.png');reference.colorSpace=T.SRGBColorSpace;textures.push(reference);
 const pictureMat=new T.MeshBasicMaterial({map:paris});materials.push(pictureMat);
 const referenceMat=new T.MeshBasicMaterial({map:reference});materials.push(referenceMat);
 // A full room at human scale, with actual openings in the window wall.
 box(scene,8.4,.18,10,0,-.11,.6,darkWood);
 const floorMats=['#ae845f','#bb916a','#a87b54','#c49a70','#b58b63'].map(c=>surface(c,'wood'));
 for(let row=0;row<25;row++)for(let col=0;col<9;col++){const x=-3.96+col*.98+(row%2)*.49;const o=box(scene,.955,.025,.385,x,.002,-3.92+row*.395,floorMats[(row+col)%5]);o.castShadow=false}
 box(scene,.2,4.8,10,-4.18,2.4,.6,plaster);box(scene,.2,4.8,10,4.18,2.4,.6,plaster);
 box(scene,8.5,4.8,.18,0,2.4,5.62,plaster);box(scene,8.5,.12,10,0,4.84,.6,cream);
 box(scene,4,4.8,.18,-2.18,2.4,-4.3,plaster);box(scene,.66,4.8,.18,3.88,2.4,-4.3,plaster);
 box(scene,3.8,.66,.18,1.7,.33,-4.3,cream);box(scene,3.8,.52,.18,1.7,4.55,-4.3,plaster);
 for(const x of [-4.04,4.04]){box(scene,.12,.25,9.9,x,.16,.6,cream);box(scene,.17,.12,9.9,x,1.04,.6,cream);box(scene,.25,.16,9.9,x,4.58,.6,cream);box(scene,.18,.08,9.9,x,4.42,.6,cream);for(let z=-3.5;z<5.5;z+=1.3){box(scene,.035,.76,1.05,x,.6,z,cream);}}
 for(const z of [-4.16,5.48]){box(scene,8.1,.24,.1,0,.15,z,cream);box(scene,8.1,.15,.25,0,4.58,z,cream);box(scene,8.1,.07,.16,0,4.43,z,cream)}
 // Window muntins, French doors and brass handles.
 const window=group(scene,1.65,0,-4.12);
 for(const x of [-1.87,0,1.87])box(window,.085,3.77,.16,x,2.44,0,cream);
 for(const y of [.59,1.02,2.65,4.3])box(window,3.86,.075,.16,0,y,0,cream);
 for(const x of [-.94,.94])box(window,.035,3.65,.1,x,2.46,0,ivory);
 for(const x of [-.1,.1])rod(window,[x,1.65,.12],[x,1.88,.12],.02,brass);
 box(window,4.12,.12,.4,0,.55,.04,cream);
 const outsideMat=new T.MeshBasicMaterial({map:paris});materials.push(outsideMat);
 mesh(geom('sky',()=>new T.PlaneGeometry(19,10)),outsideMat,scene,1.7,3.35,-9,false);
 box(scene,5,.15,1.4,1.6,.35,-5,cream);
 for(let x=-.6;x<4;x+=.24)rod(scene,[x,.48,-4.92],[x,1.55,-4.92],.015,ink);
 rod(scene,[-.7,1.57,-4.92],[4,1.57,-4.92],.027,ink);
 for(let x=-.5;x<4;x+=.45){const tor=mesh(geom('balconyRing',()=>new T.TorusGeometry(.16,.012,5,24)),ink,scene,x,1.16,-4.92);tor.castShadow=false}
 const curtainGeo=new T.PlaneGeometry(1.1,3.77,18,30);const cp=curtainGeo.attributes.position;
 for(let i=0;i<cp.count;i++){const x=cp.getX(i),y=cp.getY(i);cp.setZ(i,Math.sin((x+.55)*Math.PI*9)*.065+Math.sin(y*2)*.025);cp.setX(i,x*(.62+.38*Math.pow(Math.abs(y)/1.89,1.3)))}curtainGeo.computeVertexNormals();geometries.push(curtainGeo);
 const curtainMat=surface('#dab1a0','fabric');curtainMat.side=T.DoubleSide;
 const curtains=[mesh(curtainGeo,curtainMat,scene,-.33,2.36,-3.92),mesh(curtainGeo,curtainMat,scene,3.62,2.36,-3.92)];
 rod(scene,[-1,4.36,-3.84],[4,4.36,-3.84],.03,brass);
 for(const x of [-.33,3.62]){for(let i=0;i<7;i++)sphere(scene,.037,x-.42+i*.14,4.28,-3.86,brass);rod(scene,[x-.27,1.85,-3.84],[x+.27,1.85,-3.84],.025,brass)}
 // A woven, faded rug: raised thread borders and a diamond medallion.
 const rugMat=surface('#b77e6c','fabric');const rug=box(scene,4.7,.025,3.7,-.4,.035,.7,rugMat);rug.rotation.y=-.045;rug.castShadow=false;
 const rg=group(scene,-.4,.055,.7,-.045);
 for(const n of [0,.11,.24]){for(const x of [-2.21+n,2.21-n])box(rg,.04,.008,3.35-n*2,x,0,0,ivory).castShadow=false;for(const z of [-1.65+n,1.65-n])box(rg,4.45-n*2,.008,.04,0,0,z,ivory).castShadow=false}
 for(let x=-2.1;x<2.2;x+=.18)for(const z of [-1.9,1.9])rod(rg,[x,0,z],[x+.03,0,z+Math.sign(z)*.12],.007,linen).castShadow=false;
 const motifGeo=geom('motif',()=>new T.CircleGeometry(1,4));
 for(let x=-1.85;x<2;x+=.43)for(let z=-1.25;z<1.4;z+=.43){const o=mesh(motifGeo,(Math.round((x+1.85)/.43)+Math.round((z+1.25)/.43))%2?ivory:sage,rg,x,.014,z,false);o.rotation.x=-Math.PI/2;o.scale.set(.058,.11,1)}
 for(const [r,m] of [[.93,ivory],[.83,sage],[.68,rugMat],[.33,ivory]] as const){const o=mesh(motifGeo,m,rg,0,.018+(1-r)*.01,0,false);o.rotation.x=-Math.PI/2;o.scale.set(r,r*1.35,1)}
 // Books and shelves are individual volumes, so they occlude naturally.
 const bookMats=['#876048','#94736e','#676f59','#b29878','#6b494c','#b48b62','#596768'].map(c=>surface(c,'fabric'));
 function book(p:Parent,x:number,y:number,z:number,w=.1,h=.35,d=.22,index=0){const g=group(p,x,y,z);box(g,w,h,d,0,h/2,0,bookMats[index%bookMats.length]);box(g,w*.8,h*.94,.018,0,h/2,d/2+.002,paper);for(const yy of [.06,h-.05])box(g,w+.003,.009,.008,0,yy,-d/2-.006,brass).castShadow=false;return g}
 function bookStack(p:Parent,x:number,y:number,z:number,n=3){let yy=y;for(let i=0;i<n;i++){const h=.035+random()*.035;const o=box(p,.29+random()*.09,h,.23+random()*.03,x,yy+h/2,z,bookMats[i%7]);o.rotation.y=(random()-.5)*.25;box(o,.88,.65,.98,0,0,0,paper).scale.set(.88,.65,.98);yy+=h+.005}return yy}
 const library=group(scene,-3.84,0,-1.8,Math.PI/2);library.userData.destination='library';
 box(library,3.95,4.1,.12,0,2.1,-.19,darkWood);for(const x of [-2,-.69,.69,2])box(library,.10,4.25,.51,x,2.12,0,cream);
 for(const y of [.12,.73,1.37,2.01,2.65,3.29,3.95,4.2]){box(library,4.14,.095,.58,0,y,.015,cream);box(library,4.2,.035,.61,0,y+.065,.015,lightWood)}
 for(let row=0;row<5;row++){const y=.79+row*.64;for(let section=0;section<3;section++){let x=-1.9+section*1.34;for(let i=0;i<9;i++){const w=.065+random()*.05,h=.31+random()*.2;if(i===6&&(row+section)%2===0){x+=.25;continue}const b=book(library,x,y,.07,w,h,.29,Math.floor(random()*7));b.rotation.y=Math.PI;b.rotation.z=(random()-.5)*.055;x+=w+.015;}}}
 for(const x of [-1.36,0,1.36]){box(library,1.23,.51,.49,x,.4,.02,cream);box(library,1.08,.38,.02,x,.4,.28,lightWood);sphere(library,.025,x,.45,.315,brass)}
 function vase(p:Parent,x:number,y:number,z:number,scale=1,m:T.Material=ceramic){const g=group(p,x,y,z);g.scale.setScalar(scale);cylinder(g,.075,.085,.035,0,.017,0,m);sphere(g,.115,0,.14,0,m,1,1.15,1);cylinder(g,.065,.065,.11,0,.28,0,m);cylinder(g,.077,.077,.018,0,.341,0,brass);return g}
 function plant(p:Parent,x:number,y:number,z:number,scale=1,flowers=false){const g=group(p,x,y,z);g.scale.setScalar(scale);cylinder(g,.13,.09,.22,0,.11,0,flowers?ceramic:terracotta);cylinder(g,.121,.121,.022,0,.22,0,darkWood);for(let i=0;i<(flowers?15:10);i++){const a=i*2.399,r=.12+random()*.2,h=.3+random()*.35;const tip=[Math.cos(a)*r,h,Math.sin(a)*r];rod(g,[0,.18,0],tip,.009,green);for(const side of [-1,1]){const leaf=sphere(g,.08,tip[0]*.7+Math.cos(a+side)*.05,h*.73,tip[2]*.7+Math.sin(a+side)*.05,i%2?green:green2,1,.26,2);leaf.rotation.set(.4,a,side*.6);leaf.castShadow=false}if(flowers){for(let k=0;k<5;k++){const angle=k*Math.PI*2/5;sphere(g,.043,tip[0]+Math.cos(angle)*.034,h+Math.sin(angle)*.027,tip[2],k%2?rose:blush,1,.75,1)}sphere(g,.021,tip[0],h,tip[2]+.023,ivory)}else{const l=sphere(g,.1,tip[0],h,tip[2],i%2?green:green2,.7,.23,1.8);l.rotation.set(.4,a,.5);l.castShadow=false}}return g}
 plant(library,.37,3.35,.15,.85);vase(library,-.4,2.72,.15,.85);vase(library,.6,1.44,.15,.7);vase(library,-1.52,3.36,.15,.8,terracotta);
 // Trailing vine along the bookshelf.
 for(let i=0;i<30;i++){const y=4.05-i*.083,x=.6+Math.sin(i*.42)*.09;rod(library,[x,y,.38],[.6+Math.sin((i+1)*.42)*.09,y-.083,.38],.008,green);const leaf=sphere(library,.075,x+(i%2?.07:-.07),y,.4,green,1,.55,.28);leaf.rotation.z=i*.9;leaf.castShadow=false}
 function framed(p:Parent,x:number,y:number,z:number,w:number,h:number,m:T.Material=pictureMat){const g=group(p,x,y,z);box(g,w+.1,h+.1,.055,0,0,0,darkWood);for(const xx of [-w/2-.022,w/2+.022]){box(g,.045,h+.1,.075,xx,0,.015,brass);box(g,.012,h+.03,.08,xx-Math.sign(xx)*.026,0,.023,ivory)}for(const yy of [-h/2-.022,h/2+.022])box(g,w+.08,.045,.075,0,yy,.015,brass);mesh(geom(`frame${w},${h}`,()=>new T.PlaneGeometry(w,h)),m,g,0,0,.046,false);return g}
 framed(scene,-2.44,2.98,-4.17,1.25,1.6);framed(scene,-1.33,2.74,-4.16,.44,.61);framed(scene,-1.42,3.68,-4.16,.39,.63);
 // Gilded oval mirror, with a softly tinted reflection.
 const mirrorMat=plain('#b4b7a8',.23,.55);const mirror=mesh(geom('mirror',()=>new T.CircleGeometry(1,64)),mirrorMat,scene,-.52,2.75,-4.18);mirror.scale.set(.39,.67,1);
 for(const r of [1,1.065]){const rim=mesh(geom(`mirrorRim${r}`,()=>new T.TorusGeometry(r,.028,7,64)),brass,scene,-.52,2.75,-4.15);rim.scale.set(.41,.69,1)}
 for(let i=0;i<7;i++)sphere(scene,.045,-.52+(i-3)*.048,3.48+Math.sin(i/6*Math.PI)*.09,-4.14,brass,1,1.5,.4);
 // An antique chest below the artwork.
 const chest=group(scene,-1.47,0,-3.56);box(chest,1.62,.89,.68,0,.63,0,wood);box(chest,1.77,.09,.8,0,1.11,0,darkWood);
 for(const x of [-.68,.68])for(const z of [-.24,.24])cylinder(chest,.035,.065,.24,x,.13,z,darkWood);
 for(let row=0;row<3;row++){box(chest,1.48,.22,.04,0,.37+row*.25,.36,lightWood);for(const x of [-.43,.43])sphere(chest,.029,x,.37+row*.25,.41,brass)}
 plant(chest,.5,1.16,0,.85,true);bookStack(chest,-.55,1.16,0,3);
 // Large writing desk, turned legs, drawers, inlaid top.
 const desk=group(scene,-.55,0,-.45);desk.userData.destination='desk';
 outline(box(desk,2.7,.12,1.32,0,1.01,0,wood,.025));box(desk,2.77,.035,1.39,0,1.08,0,lightWood,.008);
 for(const x of [-1.18,1.18])for(const z of [-.48,.48]){cylinder(desk,.045,.035,.77,x,.47,z,wood);for(const [yy,r] of [[.12,.067],[.23,.057],[.77,.072],[.84,.064]])sphere(desk,r,x,yy,z,darkWood,1,.8,1);cylinder(desk,.072,.065,.13,x,.92,z,wood)}
 box(desk,2.5,.23,.1,0,.87,.55,wood);for(const x of [-.84,0,.84]){box(desk,.75,.19,.035,x,.88,.62,lightWood);sphere(desk,.027,x,.88,.66,brass)}
 for(const x of [-.94,.94]){box(desk,.6,.4,1.07,x,.72,-.03,wood);for(let i=0;i<2;i++){box(desk,.53,.16,.035,x,.62+i*.2,.53,lightWood);sphere(desk,.025,x,.62+i*.2,.57,brass)}}
 const monitor=group(desk,-.1,1.1,-.37);box(monitor,.4,.018,.24,0,.008,.025,brass,.008);rod(monitor,[0,.02,0],[0,.28,-.04],.027,ink);outline(box(monitor,.94,.62,.046,0,.54,0,ink,.023));const screen=mesh(geom('screen',()=>new T.PlaneGeometry(.875,.53)),pictureMat,monitor,0,.56,.025,false);
 box(monitor,.87,.035,.014,0,.255,.026,cream);box(desk,.62,.022,.2,-.09,1.115,.07,ceramic,.008);
 for(let row=0;row<4;row++)for(let col=0;col<13;col++)box(desk,.032,.007,.027,-.37+col*.045,1.131,.008+row*.04,ivory).castShadow=false;
 sphere(desk,.072,.43,1.132,.1,ceramic,.6,.27,1);
 const laptop=group(desk,.69,1.11,-.13,-.2);box(laptop,.43,.017,.3,0,.01,0,ink,.006);const lid=group(laptop,0,.025,-.145,-0);lid.rotation.x=-.2;box(lid,.43,.3,.016,0,.15,0,ink,.008);mesh(geom('laptopScreen',()=>new T.PlaneGeometry(.39,.257)),referenceMat,lid,0,.154,.009,false);
 // Open notebook, pen, coffee and stationery.
 const notebook=group(desk,-.36,1.112,.4,.12);box(notebook,.53,.014,.29,0,0,0,bookMats[4]);for(const x of [-.129,.129]){box(notebook,.249,.014,.275,x,.012,0,paper);for(let i=0;i<8;i++)box(notebook,.195,.001,.0015,x,.021,-.09+i*.024,lightWood).castShadow=false}rod(notebook,[-.14,.029,.1],[.14,.029,-.1],.006,ink);
 bookStack(desk,-.99,1.1,.28,3);plant(desk,-1.02,1.1,-.36,.78,true);
 cylinder(desk,.11,.11,.018,.54,1.113,.42,ivory);cylinder(desk,.067,.055,.125,.54,1.18,.42,ivory);cylinder(desk,.059,.059,.005,.54,1.238,.42,darkWood);
 const handle=mesh(geom('cupHandle',()=>new T.TorusGeometry(.046,.012,7,16)),ivory,desk,.616,1.188,.42);handle.rotation.y=Math.PI/2;
 cylinder(desk,.059,.048,.16,.93,1.18,-.02,brass);for(let i=0;i<8;i++)rod(desk,[.93+(random()-.5)*.05,1.14,-.02+(random()-.5)*.05],[.93+(random()-.5)*.13,1.46+random()*.06,-.02+(random()-.5)*.12],.005,bookMats[i%7]);
 const lampLights:T.PointLight[]=[];
 function lamp(p:Parent,x:number,y:number,z:number,scale=1,deskType=false){const g=group(p,x,y,z);g.scale.setScalar(scale);cylinder(g,.13,.15,.036,0,.02,0,brass);if(deskType){rod(g,[0,.04,0],[.07,.43,0],.012,brass);rod(g,[.07,.43,0],[-.17,.66,0],.013,brass);sphere(g,.025,.07,.43,0,brass);cylinder(g,.045,.17,.14,-.17,.62,0,brass);cylinder(g,.145,.145,.008,-.17,.548,0,ivory)}else{cylinder(g,.027,.04,.46,0,.25,0,brass);sphere(g,.075,0,.22,0,brass,.7,1.3,.7);cylinder(g,.15,.25,.3,0,.55,0,linen);cylinder(g,.254,.254,.012,0,.395,0,brass);cylinder(g,.155,.155,.012,0,.705,0,brass)}const l=new T.PointLight('#ffbf71',deskType?1.5:2,3,2);l.position.set(deskType?-.17:0,deskType?.55:.45,0);g.add(l);lampLights.push(l);return g}
 lamp(desk,1.09,1.1,-.43,1,true);lamp(chest,-.42,1.16,0,.87);
 // Upholstered chair: rounded cushions, piping and timber supports.
 function chair(p:Parent,x:number,z:number,rot=0,scale=1){const g=group(p,x,0,z,rot);g.scale.setScalar(scale);for(const xx of [-.3,.3])for(const zz of [-.28,.28]){rod(g,[xx,.08,zz],[xx*.92,.56,zz*.91],.032,darkWood);sphere(g,.05,xx,.1,zz,darkWood)}box(g,.81,.13,.76,0,.53,0,darkWood,.035);box(g,.76,.17,.69,0,.64,0,rose,.075);const back=box(g,.83,.79,.18,0,1.02,-.31,rose,.075);back.rotation.x=-.07;for(const xx of [-.4,.4]){box(g,.18,.22,.75,xx,.87,0,blush,.075);rod(g,[xx,.61,.28],[xx,.83,.28],.029,darkWood)}for(const xx of [-.24,0,.24])for(const yy of [.9,1.14])sphere(g,.016,xx,yy,-.204,darkWood,1,1,.4);return g}
 const deskChair=chair(scene,-.65,1.2,Math.PI+.2,1);deskChair.userData.destination='desk';
 const throwGeo=new T.PlaneGeometry(.4,.95,8,18);const tp=throwGeo.attributes.position;for(let i=0;i<tp.count;i++){const y=tp.getY(i);tp.setZ(i,Math.sin(tp.getX(i)*34)*.025+(y>.04?-(y-.04)*.62:0))}throwGeo.computeVertexNormals();geometries.push(throwGeo);const throwMat=surface('#e1c1aa','fabric');throwMat.side=T.DoubleSide;mesh(throwGeo,throwMat,deskChair,.19,.84,-.42);
 const reading=chair(scene,2.9,-2.75,-.48,1.13);reading.userData.destination='window';
 const cushion=box(reading,.46,.4,.16,.07,.94,-.12,linen,.065);cushion.rotation.z=.17;
 const table=group(scene,1.85,0,-2.95);cylinder(table,.37,.37,.045,0,.7,0,darkWood);cylinder(table,.055,.045,.58,0,.39,0,wood);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;rod(table,[0,.2,0],[Math.sin(a)*.3,.03,Math.cos(a)*.3],.027,wood)}lamp(table,0,.725,0,.7);bookStack(table,.14,.73,.09,2);
 const trunk=group(scene,1.25,0,1.02,-.12);box(trunk,.87,.47,.58,0,.25,0,darkWood,.025);box(trunk,.9,.09,.61,0,.53,0,wood,.03);for(const x of [-.3,.3])box(trunk,.035,.53,.62,x,.28,0,brass);box(trunk,.1,.075,.025,0,.46,.33,brass);bookStack(trunk,-.08,.58,0,4);plant(trunk,.26,.58,-.12,.95);
 plant(scene,-3.35,0,1.05,2.25);plant(scene,3.7,0,-3.6,2.4);plant(scene,-3.55,0,-3.62,1.2);
 const basket=group(desk,.58,0,-.05);cylinder(basket,.22,.17,.4,0,.2,0,lightWood);for(let i=0;i<9;i++){const ring=mesh(geom('basketRing',()=>new T.TorusGeometry(.205,.008,5,24)),darkWood,basket,0,.04+i*.04,0);ring.rotation.x=Math.PI/2;ring.scale.setScalar(.83+i*.017)}for(let i=0;i<3;i++){const roll=cylinder(basket,.032,.032,.49,i*.075-.065,.3,0,paper);roll.rotation.z=(i-1)*.16}
 // Warm sunlight, soft local lamps, and drifting dust in the window light.
 const ambient=new T.HemisphereLight('#fff1d6','#987a69',2.1);scene.add(ambient);
 const sun=new T.DirectionalLight('#ffe0a5',3.6);sun.position.set(4,5.4,-8);sun.target.position.set(-2,0,2);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.normalBias=.035;sun.shadow.bias=-.0004;sun.shadow.radius=4;scene.add(sun,sun.target);
 const fill=new T.DirectionalLight('#f1c0b3',.8);fill.position.set(2,3,4);scene.add(fill);
 const dustGeo=new T.BufferGeometry();const dustPositions=new Float32Array(100*3);for(let i=0;i<100;i++){dustPositions[i*3]=random()*6-2;dustPositions[i*3+1]=random()*4;dustPositions[i*3+2]=random()*7-4}dustGeo.setAttribute('position',new T.BufferAttribute(dustPositions,3));geometries.push(dustGeo);const dustMat=new T.PointsMaterial({color:'#fff0c9',size:.013,transparent:true,opacity:.45,depthWrite:false});materials.push(dustMat);const dust=new T.Points(dustGeo,dustMat);scene.add(dust);
 const typewriterAudio=new TypewriterAudio();
 const corners=addDreamCorners({scene,materials,textures,geometries,group,box,cylinder,sphere,rod,surface,plain,chair,plant,bookStack,lamp,wood,darkWood,lightWood,rose,blush,linen,cream,ivory,brass,ink,paper,sage,ceramic,random,reduced},typewriterAudio);
 const nightSky=addNightSky(scene,textures,materials,geometries,reduced);
 let typing=false;
 let yaw=0,pitch=0,goalYaw=0,goalPitch=0;const targetPosition=new T.Vector3();let traveling=false;let disposed=false;let evening=false;let lastTime=0;let ready=false;
 function setAngles(target:T.Vector3,pos:T.Vector3){const delta=target.clone().sub(pos);goalYaw=Math.atan2(delta.x,-delta.z);goalPitch=Math.atan2(delta.y,Math.hypot(delta.x,delta.z))}
 function setTyping(value:boolean){if(typing===value)return;typing=value;if(value)pressed.clear();else corners.typewriter.setShift(false);onTyping(value)}
 function go(id:string){if(id!=='typewriter'&&id!=='letter')setTyping(false);const v=views[id]||views.room;targetPosition.fromArray(v.position);setAngles(new T.Vector3().fromArray(v.target),targetPosition);while(goalYaw-yaw>Math.PI)goalYaw-=Math.PI*2;while(goalYaw-yaw<-Math.PI)goalYaw+=Math.PI*2;traveling=true;if(reduced){camera.position.copy(targetPosition);yaw=goalYaw;pitch=goalPitch;traveling=false}onView(id)}
 camera.position.fromArray(views.room.position);go('room');yaw=goalYaw;pitch=goalPitch;traveling=false;
 // Keep free motion inside the room and out of furniture; guided paths rise above obstructions.
 const obstacles=[{x:-.55,z:-.45,w:2.85,d:1.5},{x:-.65,z:1.2,w:1,d:1},{x:2.9,z:-2.75,w:1.2,d:1.3},{x:1.25,z:1.02,w:1,d:.8},{x:-1.47,z:-3.56,w:1.85,d:.9},{x:1.85,z:-2.95,w:.8,d:.8},{x:-.95,z:4.82,w:2.8,d:1.15},{x:-.9,z:3.38,w:1.16,d:.73},{x:3.6,z:2.08,w:.9,d:2.5},{x:1.71,z:4.97,w:1.8,d:.8},{x:-3.58,z:2.52,w:.8,d:1.5}];
 function walk(distance:number){traveling=false;const nx=camera.position.x+Math.sin(yaw)*distance,nz=camera.position.z-Math.cos(yaw)*distance;if(nx< -3.2||nx>3.75||nz< -3.85||nz>5)return;const hit=obstacles.some(o=>Math.abs(nx-o.x)<o.w/2+.1&&Math.abs(nz-o.z)<o.d/2+.1);if(!hit){camera.position.x=nx;camera.position.z=nz;targetPosition.copy(camera.position)}}
 const pointers=new Map<number,{x:number;y:number}>();let startX=0,startY=0,lastX=0,lastY=0,moved=false,pinch=0;const ray=new T.Raycaster();
 function down(e:PointerEvent){host.focus();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});renderer.domElement.setPointerCapture(e.pointerId);startX=lastX=e.clientX;startY=lastY=e.clientY;moved=false;traveling=false;if(pointers.size===2){const p=[...pointers.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}}
 function move(e:PointerEvent){if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(Math.hypot(e.clientX-startX,e.clientY-startY)>5)moved=true;if(pointers.size===2){const p=[...pointers.values()];const length=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);walk((length-pinch)*.009);pinch=length;moved=true;return}goalYaw-=(e.clientX-lastX)*.003;goalPitch=T.MathUtils.clamp(goalPitch+(e.clientY-lastY)*.0025,-.65,.7);lastX=e.clientX;lastY=e.clientY}
 function up(e:PointerEvent){pointers.delete(e.pointerId);if(!moved&&e.type!=='pointercancel'){const bounds=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1),camera);const hits=ray.intersectObjects(scene.children,true).filter(hit=>{let p:T.Object3D|null=hit.object;while(p){if(!p.visible)return false;p=p.parent}return !(hit.object instanceof T.Points)});if(hits.length){let o:T.Object3D|null=hits[0].object;while(o){if(o.userData.activity){const action=o.userData.activity as string;go(action==='reading'?'nook':action==='gift'?'drinks':action);if(action==='typewriter')setTyping(true);onInteract(action,o.userData.detail as string|undefined);break}if(o.userData.destination){go(o.userData.destination);break}o=o.parent}}}if(pointers.size===1){const p=[...pointers.values()][0];lastX=p.x;lastY=p.y}}
 function wheel(e:WheelEvent){e.preventDefault();walk(-T.MathUtils.clamp(e.deltaY,-70,70)*.003)}
 const pressed=new Set<string>();const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','s','W','S','Home'];
 function keydown(e:KeyboardEvent){
  if(typing){
   if(e.key==='Escape'){e.preventDefault();setTyping(false);return}
   if(e.metaKey||e.ctrlKey||e.altKey)return;
   corners.typewriter.setShift(e.shiftKey);
   if(e.key==='Enter'){e.preventDefault();corners.typewriter.carriageReturn();return}
   if(e.key==='Backspace'){e.preventDefault();corners.typewriter.erase();return}
   if(e.key.length===1){e.preventDefault();corners.typewriter.write(e.key)}
   return;
  }
  if(!keys.includes(e.key))return;e.preventDefault();if(e.key==='Home')go('room');else{traveling=false;pressed.add(e.key.toLowerCase())}
 }
 function keyup(e:KeyboardEvent){if(typing){corners.typewriter.setShift(e.shiftKey);return}pressed.delete(e.key.toLowerCase())}
 function blur(){pressed.clear();corners.typewriter.setShift(false)}
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);renderer.domElement.addEventListener('wheel',wheel,{passive:false});host.addEventListener('keydown',keydown);host.addEventListener('keyup',keyup);host.addEventListener('blur',blur);
 const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.fov=w/h<.8?72:58;camera.updateProjectionMatrix();renderer.setSize(w,h)});resize.observe(host);
 const direction=new T.Vector3();
 function frame(time:number){if(disposed)return;const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;const speed=1-Math.exp(-dt*5);if(pressed.has('arrowleft'))goalYaw-=dt*.7;if(pressed.has('arrowright'))goalYaw+=dt*.7;if(pressed.has('arrowup'))goalPitch=Math.min(.7,goalPitch+dt*.5);if(pressed.has('arrowdown'))goalPitch=Math.max(-.65,goalPitch-dt*.5);if(pressed.has('w'))walk(dt*.9);if(pressed.has('s'))walk(-dt*.9);
  if(traveling){camera.position.lerp(targetPosition,speed);if(camera.position.distanceTo(targetPosition)<.008)traveling=false}yaw+= (goalYaw-yaw)*speed;pitch+=(goalPitch-pitch)*speed;direction.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));camera.lookAt(camera.position.clone().add(direction));
  sun.intensity=T.MathUtils.lerp(sun.intensity,evening?.05:3.6,speed);ambient.intensity=T.MathUtils.lerp(ambient.intensity,evening?.42:2.1,speed);fill.intensity=T.MathUtils.lerp(fill.intensity,evening?.18:.8,speed);renderer.toneMappingExposure=T.MathUtils.lerp(renderer.toneMappingExposure,evening?1.05:1.25,speed);lampLights.forEach(l=>l.intensity=T.MathUtils.lerp(l.intensity,evening?2.3:1.4,speed));
  corners.update(time,dt,nightSky.update(dt,evening));
  if(!reduced){dust.rotation.y=Math.sin(time*.000015)*.035;dust.position.y=Math.sin(time*.00011)*.04;curtains.forEach((c,i)=>{c.rotation.y=Math.sin(time*.0006+i)*.012})}renderer.render(scene,camera);if(!ready){ready=true;onReady()}}
 renderer.setAnimationLoop(frame);
 return{go,setEvening(value){evening=value},setTyping,setMuted(value){typewriterAudio.muted=value;if(value)typewriterAudio.dispose()},newSheet:corners.typewriter.loadSheet,setCandles:corners.setCandles,fillBowl:corners.fillBowl,setDrink:corners.setDrink,updateNote:corners.updateNote,setPlaying:corners.setPlaying,launchFireworks:nightSky.launch,dispose(){disposed=true;typewriterAudio.dispose();corners.dispose();nightSky.dispose();renderer.setAnimationLoop(null);resize.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',up);renderer.domElement.removeEventListener('wheel',wheel);host.removeEventListener('keydown',keydown);host.removeEventListener('keyup',keyup);host.removeEventListener('blur',blur);new Set(geometries).forEach(g=>g.dispose());new Set(materials).forEach(m=>m.dispose());new Set(textures).forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove()}};
}
