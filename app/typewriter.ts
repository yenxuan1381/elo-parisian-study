import * as T from 'three';
import { columns as COLS, layoutLetter, pageMetrics, pageTitle } from './typewriter-layout';

// A working machine: keys depress, a typebar swings up to the print point, the carriage
// steps left a character at a time, a bell warns near the margin, and the return rolls
// the paper up a line. Cream shell, pastel pink keys, brass hardware.
type P = T.Object3D;
export type TypewriterContext = {
 materials:T.Material[]; textures:T.Texture[]; geometries:T.BufferGeometry[];
 group:(p:P,x?:number,y?:number,z?:number,rot?:number)=>T.Group;
 box:(p:P,w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material,round?:number)=>T.Mesh;
 cylinder:(p:P,rt:number,rb:number,h:number,x:number,y:number,z:number,m:T.Material,segments?:number)=>T.Mesh;
 sphere:(p:P,r:number,x:number,y:number,z:number,m:T.Material,sx?:number,sy?:number,sz?:number)=>T.Mesh;
 rod:(p:P,a:number[],b:number[],radius:number,m:T.Material)=>T.Mesh;
 surface:(color:string,kind?:string)=>T.MeshStandardMaterial;
 plain:(color:string,roughness?:number,metalness?:number)=>T.MeshStandardMaterial;
 brass:T.Material; ink:T.Material; rose:T.Material; random:()=>number; reduced:boolean;
};
export type Typewriter = {
 root:T.Group;
 write:(ch:string)=>void; erase:()=>void; carriageReturn:()=>void; loadSheet:()=>void;
 setShift:(value:boolean)=>void; setText:(text:string)=>void; text:()=>string;
 update:(dt:number)=>void;
 framingBounds:()=>T.Box3;
};

// Page metrics. The canvas is the sheet itself, so a character's place on the page and
// the carriage position that puts it under the type guide come from the same numbers.
const {pixels:PX,width:W,margin:MARGIN,character:CHAR_PX,top:TOP_PX,line:LINE_PX}=pageMetrics;
const SHEET_W=W/PX;
const CHAR_W=CHAR_PX/PX,LINE_STEP=LINE_PX/PX;
const PRINT_Y=.285,PRINT_Z=-.085,LEAN=.12;
// The sheet sits so the line being typed lands on the print point: everything above it on
// the page has already rolled through, so the paper grows upward as the letter gets longer.
const CARRIAGE_X0=(W/2-MARGIN-CHAR_PX/2)/PX;
const BAR_L=.15,BAR_REST=1.15,BAR_COUNT=42,BELL_AT=COLS-8;
const PAPER='#f1e6cf',KEY_ROWS=['zxcvbnm,.?','asdfghjkl;','qwertyuiop','1234567890'];

export type TypewriterSound = {strike:()=>void; space:()=>void; bell:()=>void; carriage:()=>void; sheet:()=>void};
const silent:TypewriterSound={strike(){},space(){},bell(){},carriage(){},sheet(){}};

export function addTypewriter(c:TypewriterContext,parent:P,x:number,y:number,z:number,audio:TypewriterSound=silent):Typewriter{
 const {materials,textures,geometries,group,box,cylinder,sphere,rod,plain,brass,ink,rose,random,reduced}=c;
 const root=group(parent,x,y,z);root.scale.setScalar(.9);root.userData.activity='typewriter';
 const shell=plain('#e6d6c0',.3,.12),petal=plain('#ead7ce',.32),steel=plain('#a5aaa5',.27,.72),felt=plain('#542d37',.95);

 // Frame: a low cream body with curved side plates and a brass name plate.
 box(root,.66,.06,.5,0,.03,0,shell,.022);
 for(const side of [-1,1]){
  box(root,.048,.21,.42,side*.318,.135,-.03,shell,.028);
  box(root,.035,.055,.2,side*.303,.245,-.06,shell,.016);
 }
 box(root,.6,.055,.032,0,.058,.235,shell,.014);
 box(root,.16,.014,.006,0,.062,.253,brass,.003);
 box(root,.62,.17,.075,0,.105,-.231,shell,.02);
 box(root,.58,.02,.055,0,.198,-.227,shell,.008);
 for(const side of [-1,1]){
  box(root,.009,.034,.38,side*.344,.058,-.005,brass,.004);
  for(let j=0;j<7;j++)box(root,.004,.043,.006,side*.344,.135,-.16+j*.025,steel,.002);
  for(const kz of [-.2,.2]){cylinder(root,.007,.007,.004,side*.312,.064,kz,steel,12);box(root,.009,.001,.001,side*.312,.067,kz,ink);}
 }
 const badge=document.createElement('canvas');badge.width=512;badge.height=96;
 const badgeCtx=badge.getContext('2d')!;badgeCtx.fillStyle='#b18a40';badgeCtx.fillRect(0,0,512,96);badgeCtx.fillStyle='#352b24';badgeCtx.font='bold 46px Georgia';badgeCtx.textAlign='center';badgeCtx.fillText('ELO  /  PARIS',256,65);
 const badgeTex=new T.CanvasTexture(badge);badgeTex.colorSpace=T.SRGBColorSpace;textures.push(badgeTex);
 const badgeMat=new T.MeshStandardMaterial({map:badgeTex,metalness:.4,roughness:.4});materials.push(badgeMat);
 const badgeGeo=new T.PlaneGeometry(.155,.028);geometries.push(badgeGeo);const badgeFace=new T.Mesh(badgeGeo,badgeMat);badgeFace.position.set(0,.069,.257);root.add(badgeFace);
 for(const sx of [-.26,.26])for(const sz of [-.19,.2])cylinder(root,.026,.03,.022,sx,.011,sz,ink);

 // Ribbon spools, and the ribbon that runs from each of them up to the type guide.
 for(const side of [-1,1]){
  cylinder(root,.017,.023,.152,side*.23,.136,.055,shell,16);
  const spool=group(root,side*.23,.216,.055);
  cylinder(spool,.052,.052,.008,0,.026,0,brass,20);cylinder(spool,.05,.05,.026,0,.013,0,felt,20);
  cylinder(spool,.014,.014,.04,0,.02,0,brass);
  for(let j=0;j<5;j++){const a=j*Math.PI*2/5;cylinder(spool,.008,.008,.002,Math.cos(a)*.032,.031,Math.sin(a)*.032,ink,12);}
  rod(root,[side*.23,.242,.055],[side*.03,.262,-.058],.0045,felt);
 }
 // Type guide and the ribbon carrier that lifts each time a bar comes up.
 const vibrator=group(root,0,.252,-.062);
 for(const side of [-1,1])rod(vibrator,[side*.03,-.02,0],[side*.026,.022,0],.0035,brass);
 box(vibrator,.062,.007,.006,0,.02,0,felt);
 rod(root,[-.026,.216,-.05],[.026,.216,-.05],.0035,brass);
 box(root,.03,.03,.012,0,.228,-.038,brass,.005);

 // Typebar basket: every bar pivots on the same point and stands straight up on a strike,
 // so all forty-two type heads converge on the one print point.
 const bars:T.Group[]=[];
 for(let i=0;i<BAR_COUNT;i++){
  const fan=group(root,0,PRINT_Y-BAR_L,PRINT_Z,(i/(BAR_COUNT-1)-.5)*2);
  const swing=group(fan);swing.rotation.x=BAR_REST;
  rod(swing,[0,.012,0],[0,BAR_L-.008,0],.0034,steel);
  box(swing,.013,.014,.005,0,BAR_L,0,ink,.002);
  bars.push(swing);
 }

 // Keyboard: four staggered rows of pastel caps on brass stems, plus shifts and a space bar.
 const glyphs=document.createElement('canvas');glyphs.width=512;glyphs.height=320;
 const gctx=glyphs.getContext('2d')!;gctx.clearRect(0,0,512,320);
 gctx.fillStyle='#4a3a33';gctx.textAlign='center';gctx.textBaseline='middle';gctx.font='34px Georgia';
 KEY_ROWS.forEach((row,r)=>Array.from(row).forEach((ch,i)=>{const cell=r*10+i;gctx.fillText(ch.toUpperCase(),(cell%8)*64+32,Math.floor(cell/8)*64+34)}));
 const glyphTex=new T.CanvasTexture(glyphs);glyphTex.colorSpace=T.SRGBColorSpace;textures.push(glyphTex);
 const capGeo=new T.CircleGeometry(.0185,20);geometries.push(capGeo);
 const keys=new Map<string,{cap:T.Object3D;bar:number}>();
 KEY_ROWS.forEach((row,r)=>Array.from(row).forEach((ch,i)=>{
  const cell=r*10+i;
  const cap=group(root,-.27+i*.06+(r%2?-.007:.007),.085+r*.02,.185-r*.042);
  cap.userData.typeKey=ch;
  cylinder(cap,.0235,.022,.008,0,-.003,0,brass,28);
  cylinder(cap,.0205,.0195,.009,0,0,0,petal,28);
  const face=new T.Mesh(capGeo,(()=>{const tex=glyphTex.clone();tex.repeat.set(1/8,1/5);tex.offset.set((cell%8)/8,1-Math.floor(cell/8)/5-1/5);textures.push(tex);const m=new T.MeshStandardMaterial({map:tex,transparent:true,roughness:.7});materials.push(m);return m})());
  face.rotation.x=-Math.PI/2;face.position.y=.0048;cap.add(face);
  rod(cap,[0,-.006,0],[0,-.032,-.006],.0024,brass);
  keys.set(ch,{cap,bar:(cell*7)%BAR_COUNT});
 }));
 const deck=box(root,.62,.014,.212,0,.088,.122,shell,.006);deck.rotation.x=.444;
 const shifts=[-1,1].map(side=>{const cap=group(root,side*.302,.085,.19);box(cap,.05,.009,.026,0,0,0,petal,.004);rod(cap,[0,-.006,0],[0,-.03,-.008],.0024,brass);return cap});
 const spaceBar=group(root,0,.073,.228);box(spaceBar,.3,.011,.026,0,0,0,petal,.005);
 spaceBar.userData.typeKey=' ';
 for(const sx of [-.11,.11])rod(spaceBar,[sx,-.006,0],[sx,-.028,-.012],.0026,brass);
 const spaceRest=spaceBar.position.y;

 // Carriage: rails on the frame, and a rose platen that carries paper, bail and return lever.
 for(const cz of [-.09,-.2])box(root,.72,.013,.018,0,.206,cz,brass,.005);
 const carriage=group(root,CARRIAGE_X0,0,0);
 const platenRoll=group(carriage,0,.243,-.128);
 const platen=cylinder(platenRoll,.047,.047,.6,0,0,0,rose,28);platen.rotation.z=Math.PI/2;
 for(let i=0;i<7;i++)box(platenRoll,.6,.002,.002,0,.0475,-.004+i*.0013,felt).castShadow=false;
 for(const side of [-1,1]){
  cylinder(carriage,.056,.056,.026,side*.318,.243,-.128,brass,20).rotation.z=Math.PI/2;
  const knob=cylinder(carriage,.046,.046,.039,side*.346,.243,-.128,ink,32);knob.rotation.z=Math.PI/2;
  for(let j=0;j<24;j++){const a=j*Math.PI/12;rod(carriage,[side*.328,.243+Math.cos(a)*.046,-.128+Math.sin(a)*.046],[side*.366,.243+Math.cos(a)*.046,-.128+Math.sin(a)*.046],.0017,steel);}
  box(carriage,.03,.1,.115,side*.335,.222,-.117,shell,.01);
 }
 box(carriage,.66,.016,.04,0,.198,-.128,shell,.008);
 const lever=group(carriage,-.352,.243,-.128);
 lever.userData.typeKey='\n';
 rod(lever,[0,0,0],[-.05,.055,.06],.006,brass);rod(lever,[-.05,.055,.06],[-.045,.05,.15],.005,brass);
 sphere(lever,.014,-.045,.05,.16,ink);
 const bail=group(carriage,0,.316,-.072);
 rod(bail,[-.27,0,0],[.27,0,0],.004,brass);
 for(const bx of [-.11,.11])cylinder(bail,.011,.011,.03,bx,-.004,0,ink,12).rotation.z=Math.PI/2;
 for(const side of [-1,1])rod(carriage,[side*.29,.27,-.11],[side*.27,.316,-.072],.004,brass);

 // The sheet is its own canvas: the part that has rolled past the guide is opaque paper,
 // the rest is still behind the platen and stays clear.
 const paper=group(carriage,0,PRINT_Y,PRINT_Z);paper.rotation.x=-LEAN;
 const sheet=group(paper);
 // Small texture strips allow a continuous sheet of any length without exceeding
 // mobile GPU texture limits. Their edges share one uninterrupted paper surface.
 const TILE=1024;
 const sheetGeo=new T.PlaneGeometry(SHEET_W,1);geometries.push(sheetGeo);
 const tiles:{canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;texture:T.CanvasTexture;mesh:T.Mesh<T.PlaneGeometry,T.MeshStandardMaterial>}[]=[];
 function tileAt(index:number){
  if(tiles[index])return tiles[index];
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=TILE;
  const ctx=canvas.getContext('2d')!;
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;textures.push(texture);
  const material=new T.MeshStandardMaterial({map:texture,transparent:true,roughness:1,side:T.DoubleSide});materials.push(material);
  const mesh=new T.Mesh(sheetGeo,material);sheet.add(mesh);
  const tile={canvas,ctx,texture,mesh};tiles.push(tile);return tile;
 }
 // The rest of the sheet is still wound on the platen: a paper-width ribbon that leaves
 // the roller on the tangent the page stands on, so the page reads as rolled in rather
 // than resting on top. It sits a hair inside the page plane so the two never z-fight.
 const blank=plain(PAPER,1);blank.side=T.DoubleSide;
 const PLATEN_Y=.243,PLATEN_Z=-.128,ROLL_R=.0533,TANGENT=Math.atan2(Math.cos(LEAN),Math.sin(LEAN));
 const spine:number[][]=[];
 {
  // End below the first printable line: the old extension covered the ink.
  spine.push([PRINT_Y-Math.cos(LEAN)*pageMetrics.bottom/PX,PRINT_Z+Math.sin(LEAN)*pageMetrics.bottom/PX-.0003]);
  for(let i=0;i<=28;i++){const a=TANGENT+(-2-TANGENT)*(i/28);spine.push([PLATEN_Y+ROLL_R*Math.cos(a),PLATEN_Z+ROLL_R*Math.sin(a)]);}
 }
 const rollGeo=new T.BufferGeometry();
 {
  const pos:number[]=[],index:number[]=[];
  spine.forEach(([py,pz])=>{pos.push(-SHEET_W/2,py,pz,SHEET_W/2,py,pz)});
  for(let i=0;i<spine.length-1;i++){const a=i*2;index.push(a,a+2,a+1,a+1,a+2,a+3)}
  rollGeo.setAttribute('position',new T.Float32BufferAttribute(pos,3));
  rollGeo.setIndex(index);rollGeo.computeVertexNormals();
 }
 geometries.push(rollGeo);
 const rolled=new T.Mesh(rollGeo,blank);rolled.castShadow=false;carriage.add(rolled);

 // Bell, struck a few characters before the right margin.
 const bell=group(root,.215,.155,-.03);sphere(bell,.03,0,0,0,brass,1,.72,1);cylinder(bell,.004,.004,.03,0,-.02,0,brass);

 let rawText='',line=0,col=0,rung=false,shifted=false;
 const written:string[]=[''];
 const strikes:{bar:number;cap:T.Object3D|null;rest:number;t:number}[]=[];
 let carriageGoal=CARRIAGE_X0,rise=0,riseGoal=0,roll=0,rollGoal=0,leverSwing=0,bellRing=0,eject=0;

 function redraw(){
  const baseline=TOP_PX+line*LINE_PX+LINE_PX/2,height=baseline+pageMetrics.bottom;
  const count=Math.ceil(height/TILE);
  for(let i=0;i<count;i++){
   const {canvas,ctx,texture,mesh}=tileAt(i),offset=i*TILE,tileHeight=Math.min(TILE,height-offset);
   if(canvas.height!==tileHeight){canvas.height=tileHeight;texture.dispose();}
   ctx.fillStyle=PAPER;ctx.fillRect(0,0,W,tileHeight);
   ctx.save();ctx.translate(0,-offset);
   ctx.fillStyle='#794951';ctx.font='28px Georgia';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(pageTitle,W/2,54,W-MARGIN*2);
   ctx.strokeStyle='#c9ac8c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(MARGIN,84);ctx.lineTo(W-MARGIN,84);ctx.stroke();
   ctx.font='24px "Courier New",monospace';ctx.textBaseline='middle';ctx.fillStyle='#3b302b';
   written.forEach((text,row)=>{
    const cy=TOP_PX+row*LINE_PX+LINE_PX/2;
    if(cy+LINE_PX/2<offset||cy-LINE_PX/2>offset+tileHeight)return;
    Array.from(text).forEach((ch,column)=>ctx.fillText(ch,MARGIN+column*CHAR_PX+CHAR_PX/2,cy));
   });
   ctx.restore();texture.needsUpdate=true;mesh.visible=true;
   mesh.scale.y=tileHeight/PX;
   // The last baseline always meets the type guide. Each return adds paper above it.
   mesh.position.y=(TOP_PX+LINE_PX/2-offset-tileHeight/2)/PX;
  }
  tiles.slice(count).forEach(tile=>{tile.mesh.visible=false});
 }
 redraw();

 function swing(ch:string){
  const key=keys.get(ch.toLowerCase());
  if(key)strikes.push({bar:key.bar,cap:key.cap,rest:key.cap.position.y,t:0});
  else strikes.push({bar:Math.floor(random()*BAR_COUNT),cap:null,rest:0,t:0});
  if(strikes.length>6)strikes.shift();
 }
 function carriageReturn(){
  if(!eject)setText(rawText+'\n');
 }
 function loadSheet(){if(eject)return;eject=1;audio.sheet()}
 function write(ch:string){
  if(eject)return;
  if(Array.from(ch).length!==1||ch.charCodeAt(0)<32)return;
  setText(rawText+ch);
  if(ch===' '){audio.space();spaceBar.position.y=spaceRest-.006;return}
  swing(ch);audio.strike();
 }
 function erase(){
  if(eject)return;
  setText(Array.from(rawText).slice(0,-1).join(''));audio.space();
 }
 function setText(text:string){
  const next=layoutLetter(text),previousLine=line;
  rawText=text;written.length=0;written.push(...next.lines);line=next.row;col=next.column;eject=0;
  tiles.forEach(tile=>{tile.mesh.material.opacity=1});
  carriageGoal=CARRIAGE_X0-col*CHAR_W;riseGoal=line*LINE_STEP;
  rollGoal+=((line-previousLine)*LINE_STEP)/.047;
  if(line>previousLine){leverSwing=1;audio.carriage()}
  if(col>=BELL_AT&&!rung){bellRing=1;audio.bell()}
  rung=col>=BELL_AT;redraw();
 }

 return {
  root,write,erase,carriageReturn,loadSheet,text:()=>rawText,setText,
  framingBounds(){
   root.updateWorldMatrix(true,false);
   // Reserve the entire carriage stroke so typing never pushes a side off screen.
   const top=PRINT_Y+(TOP_PX+LINE_PX/2+line*LINE_PX)/PX*Math.cos(LEAN);
   return new T.Box3(new T.Vector3(-.61,0,Math.min(-.24,PRINT_Z-(top-PRINT_Y)*Math.tan(LEAN))),new T.Vector3(.61,top,.27)).applyMatrix4(root.matrixWorld);
  },
  setShift(value){shifted=value},
  update(dt){
   const ease=1-Math.exp(-dt*(reduced?60:9));
   carriage.position.x+=(carriageGoal-carriage.position.x)*(reduced?1:1-Math.exp(-dt*16));
   rise+=(riseGoal-rise)*ease;roll+=(rollGoal-roll)*ease;
   platenRoll.rotation.x=roll;sheet.position.y=rise;rolled.visible=!eject;
   // The basket lifts a little while a shift key is held, as the segment shift does.
   for(const s of shifts)s.position.y+=((shifted?.079:.085)-s.position.y)*ease;
   spaceBar.position.y+=(spaceRest-spaceBar.position.y)*(1-Math.exp(-dt*14));
   let lift=0;
   for(let i=strikes.length-1;i>=0;i--){
    const s=strikes[i];s.t+=dt;
    const p=Math.min(1,s.t/(reduced?.02:.17));
    const u=p<.4?p/.4:1-(p-.4)/.6;
    const shaped=u*u*(3-2*u);
    bars[s.bar].rotation.x=BAR_REST*(1-shaped);
    if(s.cap)s.cap.position.y=s.rest-.0075*shaped;
    lift=Math.max(lift,shaped);
    if(p>=1){bars[s.bar].rotation.x=BAR_REST;if(s.cap)s.cap.position.y=s.rest;strikes.splice(i,1)}
   }
   vibrator.position.y=.252+lift*.011;
   if(bellRing>0){bellRing=Math.max(0,bellRing-dt*5);const j=Math.sin(bellRing*46)*bellRing*.008;bell.position.set(.215+j,.155,-.03)}
   if(leverSwing>0){leverSwing=Math.max(0,leverSwing-dt*3.4);lever.rotation.x=-Math.sin(leverSwing*Math.PI)*.5}
   if(eject>0){
    eject=Math.max(0,eject-dt*(reduced?6:.9));
    sheet.position.y=rise+(1-eject)*.34;
    tiles.forEach(tile=>{tile.mesh.material.opacity=Math.min(1,eject*1.6)});
    if(!eject){
     rawText='';written.length=0;written.push('');line=0;col=0;rung=false;
     rise=riseGoal=0;roll=rollGoal=0;carriage.position.x=carriageGoal=CARRIAGE_X0;
     sheet.position.y=0;tiles.forEach(tile=>{tile.mesh.material.opacity=1});redraw();
    }
   }
  },
 };
}
