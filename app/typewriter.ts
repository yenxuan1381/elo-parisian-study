import * as T from 'three';

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
};

// Page metrics. The canvas is the sheet itself, so a character's place on the page and
// the carriage position that puts it under the type guide come from the same numbers.
const PX=2000,SHEET_W=.4,SHEET_H=.44,W=SHEET_W*PX,H=SHEET_H*PX;
const MARGIN=64,CHAR_PX=14.4,TOP_PX=96,LINE_PX=34;
const COLS=Math.floor((W-MARGIN*2)/CHAR_PX),ROWS=Math.floor((H-TOP_PX-58)/LINE_PX);
const CHAR_W=CHAR_PX/PX,LINE_STEP=LINE_PX/PX;
const PRINT_Y=.285,PRINT_Z=-.085,LEAN=.35;
// The sheet sits so the line being typed lands on the print point: everything above it on
// the page has already rolled through, so the paper grows upward as the letter gets longer.
const SHEET_REST=(TOP_PX+LINE_PX/2)/PX-SHEET_H/2;
const CARRIAGE_X0=(W/2-MARGIN-CHAR_PX/2)/PX;
const BAR_L=.15,BAR_REST=1.15,BAR_COUNT=42,BELL_AT=COLS-8;
const PAPER='#f1e6cf',KEY_ROWS=['zxcvbnm,.?','asdfghjkl;','qwertyuiop','1234567890'];

export type TypewriterSound = {strike:()=>void; space:()=>void; bell:()=>void; carriage:()=>void; sheet:()=>void};
const silent:TypewriterSound={strike(){},space(){},bell(){},carriage(){},sheet(){}};

export function addTypewriter(c:TypewriterContext,parent:P,x:number,y:number,z:number,audio:TypewriterSound=silent):Typewriter{
 const {materials,textures,geometries,group,box,cylinder,sphere,rod,surface,plain,brass,ink,rose,random,reduced}=c;
 const root=group(parent,x,y,z);root.scale.setScalar(.55);
 const shell=surface('#e8dcc0'),petal=plain('#e6c1bf',.62),steel=plain('#93897c',.5,.55),felt=plain('#7d4a4c',.95);

 // Frame: a low cream body with curved side plates and a brass name plate.
 box(root,.66,.06,.5,0,.03,0,shell,.022);
 for(const side of [-1,1]){
  box(root,.048,.21,.42,side*.306,.135,-.03,shell,.028);
  box(root,.035,.055,.2,side*.29,.245,-.06,shell,.016);
 }
 box(root,.6,.055,.032,0,.058,.235,shell,.014);
 box(root,.16,.014,.006,0,.062,.253,brass,.003);
 box(root,.62,.17,.075,0,.105,-.212,shell,.02);
 box(root,.58,.02,.055,0,.198,-.208,shell,.008);
 for(const sx of [-.26,.26])for(const sz of [-.19,.2])cylinder(root,.026,.03,.022,sx,.011,sz,ink);

 // Ribbon spools, and the ribbon that runs from each of them up to the type guide.
 for(const side of [-1,1]){
  const spool=group(root,side*.246,.212,.055);
  cylinder(spool,.052,.052,.008,0,.026,0,brass,20);cylinder(spool,.05,.05,.026,0,.013,0,felt,20);
  cylinder(spool,.014,.014,.04,0,.02,0,brass);
  rod(root,[side*.246,.238,.055],[side*.03,.262,-.058],.0045,felt);
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
 for(const side of [-1,1])box(root,.022,.11,.13,side*.224,.19,-.02,shell,.008);

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
  cylinder(cap,.0215,.0195,.009,0,0,0,petal,20);
  const face=new T.Mesh(capGeo,(()=>{const tex=glyphTex.clone();tex.repeat.set(1/8,1/5);tex.offset.set((cell%8)/8,1-Math.floor(cell/8)/5-1/5);textures.push(tex);const m=new T.MeshStandardMaterial({map:tex,transparent:true,roughness:.7});materials.push(m);return m})());
  face.rotation.x=-Math.PI/2;face.position.y=.0048;cap.add(face);
  rod(cap,[0,-.006,0],[0,-.032,-.006],.0024,brass);
  keys.set(ch,{cap,bar:(cell*7)%BAR_COUNT});
 }));
 const deck=box(root,.62,.014,.212,0,.104,.122,shell,.006);deck.rotation.x=.444;
 const shifts=[-1,1].map(side=>{const cap=group(root,side*.302,.085,.19);box(cap,.05,.009,.026,0,0,0,petal,.004);rod(cap,[0,-.006,0],[0,-.03,-.008],.0024,brass);return cap});
 const spaceBar=group(root,0,.073,.228);box(spaceBar,.3,.011,.026,0,0,0,petal,.005);
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
  box(carriage,.03,.1,.12,side*.335,.215,-.13,shell,.01);
 }
 box(carriage,.66,.016,.04,0,.198,-.128,shell,.008);
 const lever=group(carriage,-.352,.243,-.128);
 rod(lever,[0,0,0],[-.05,.055,.06],.006,brass);rod(lever,[-.05,.055,.06],[-.045,.05,.15],.005,brass);
 sphere(lever,.014,-.045,.05,.16,ink);
 const bail=group(carriage,0,.316,-.072);
 rod(bail,[-.27,0,0],[.27,0,0],.004,brass);
 for(const bx of [-.11,.11])cylinder(bail,.011,.011,.03,bx,-.004,0,ink,12).rotation.z=Math.PI/2;
 for(const side of [-1,1])rod(carriage,[side*.29,.27,-.11],[side*.27,.316,-.072],.004,brass);

 // The sheet is its own canvas: the part that has rolled past the guide is opaque paper,
 // the rest is still behind the platen and stays clear.
 const page=document.createElement('canvas');page.width=W;page.height=H;
 const pctx=page.getContext('2d')!;
 const pageTex=new T.CanvasTexture(page);pageTex.colorSpace=T.SRGBColorSpace;textures.push(pageTex);
 const pageMat=new T.MeshStandardMaterial({map:pageTex,transparent:true,roughness:1,side:T.DoubleSide});materials.push(pageMat);
 const sheetGeo=new T.PlaneGeometry(SHEET_W,SHEET_H);geometries.push(sheetGeo);
 const paper=group(carriage,0,PRINT_Y,PRINT_Z);paper.rotation.x=-LEAN;
 const sheet=new T.Mesh(sheetGeo,pageMat);sheet.position.y=SHEET_REST;paper.add(sheet);
 // The length still to come stands up behind the platen against the paper rest, and gets
 // shorter as the letter grows. Same sheet, just the half that has not rolled through yet.
 const blank=plain(PAPER,1);blank.side=T.DoubleSide;
 const rest=group(carriage,0,PRINT_Y-.03,-.19);rest.rotation.x=-.62;
 const tail=new T.Mesh(sheetGeo,blank);tail.castShadow=false;rest.add(tail);
 const showTail=(row:number)=>{const left=Math.max(.02,SHEET_H-fedTo(row)/PX);tail.scale.y=left/SHEET_H;tail.position.y=left/2};

 // Bell, struck a few characters before the right margin.
 const bell=group(root,.215,.155,-.03);sphere(bell,.03,0,0,0,brass,1,.72,1);cylinder(bell,.004,.004,.03,0,-.02,0,brass);

 let line=0,col=0,rung=false,shifted=false;
 const written:string[]=[''];
 const strikes:{bar:number;cap:T.Object3D|null;rest:number;t:number}[]=[];
 let carriageGoal=CARRIAGE_X0,rise=0,riseGoal=0,roll=0,rollGoal=0,leverSwing=0,bellRing=0,eject=0;

 const cellX=(column:number)=>MARGIN+column*CHAR_PX+CHAR_PX/2;
 const cellY=(row:number)=>TOP_PX+row*LINE_PX+LINE_PX/2;
 const fedTo=(row:number)=>cellY(row)+LINE_PX*.6;
 function feed(row:number){
  const from=row?fedTo(row-1):0;
  pctx.fillStyle=PAPER;pctx.fillRect(0,from,W,fedTo(row)-from);
  pctx.fillStyle='rgba(120,92,66,.16)';pctx.fillRect(0,fedTo(row)-2.5,W,2.5);
  if(row)pctx.fillRect(0,from-2.5,W,2.5);
  pageTex.needsUpdate=true;showTail(row);
 }
 function ink1(row:number,column:number,ch:string){
  if(ch===' ')return;
  pctx.save();pctx.translate(cellX(column)+(random()-.5)*.9,cellY(row)+(random()-.5)*1.3);
  pctx.rotate((random()-.5)*.05);
  pctx.fillStyle=`rgba(66,54,46,${.66+random()*.28})`;
  pctx.textAlign='center';pctx.textBaseline='middle';pctx.font='24px "Courier New",monospace';
  pctx.fillText(ch,0,0);pctx.restore();pageTex.needsUpdate=true;
 }
 function redraw(){
  pctx.clearRect(0,0,W,H);
  for(let row=0;row<=Math.min(line,ROWS-1);row++)feed(row);
  written.forEach((text,row)=>Array.from(text).forEach((ch,column)=>ink1(row,column,ch)));
 }
 feed(0);

 function swing(ch:string){
  const key=keys.get(ch.toLowerCase());
  if(key)strikes.push({bar:key.bar,cap:key.cap,rest:key.cap.position.y,t:0});
  else strikes.push({bar:Math.floor(random()*BAR_COUNT),cap:null,rest:0,t:0});
  if(strikes.length>6)strikes.shift();
 }
 function step(){
  col++;carriageGoal=CARRIAGE_X0-col*CHAR_W;
  if(col>=BELL_AT&&!rung){rung=true;bellRing=1;audio.bell()}
  if(col>=COLS)wrap();
 }
 // At the margin the machine returns on its own, carrying a part-typed word over rather
 // than splitting it, which is what you would do by hand anyway.
 function wrap(){
  const text=written[line],at=text.lastIndexOf(' ');
  const carry=at>0&&text.length-at<=16?text.slice(at+1):'';
  if(carry)written[line]=text.slice(0,at);
  carriageReturn();
  if(!carry||eject)return;
  written[line]=carry;col=carry.length;carriageGoal=CARRIAGE_X0-col*CHAR_W;rung=col>=BELL_AT;redraw();
 }
 function carriageReturn(){
  if(line+1>=ROWS){loadSheet();return}
  line++;col=0;rung=false;written[line]='';
  carriageGoal=CARRIAGE_X0;riseGoal=line*LINE_STEP;rollGoal=roll+LINE_STEP/.047;
  leverSwing=1;feed(line);audio.carriage();
 }
 function loadSheet(){if(eject)return;eject=1;audio.sheet()}
 function write(ch:string){
  if(eject)return;
  if(ch===' '){written[line]+=' ';audio.space();spaceBar.position.y=spaceRest-.006;step();return}
  if(ch.length!==1||ch.charCodeAt(0)<32)return;
  written[line]+=ch;ink1(line,col,ch);swing(ch);audio.strike();step();
 }
 function erase(){
  if(eject||!written[line].length)return;
  written[line]=written[line].slice(0,-1);col=Math.max(0,col-1);
  carriageGoal=CARRIAGE_X0-col*CHAR_W;rung=col>=BELL_AT;
  pctx.fillStyle=PAPER;pctx.fillRect(cellX(col)-CHAR_PX/2-1,cellY(line)-LINE_PX/2,CHAR_PX+2,LINE_PX);
  pageTex.needsUpdate=true;audio.space();
 }
 function setText(text:string){
  written.length=0;written.push('');line=0;col=0;rung=false;
  for(const word of text.replace(/\s+/g,' ').trim().split(' ')){
   if(!word)continue;
   if(written[line].length+word.length+(written[line]?1:0)>COLS){if(line+1>=ROWS)break;line++;written.push('')}
   written[line]+=(written[line]?' ':'')+word;
  }
  col=Math.min(COLS-1,written[line].length);
  carriageGoal=CARRIAGE_X0-col*CHAR_W;rise=riseGoal=line*LINE_STEP;redraw();
 }

 return {
  root,write,erase,carriageReturn,loadSheet,text:()=>written.join('\n').trimEnd(),setText,
  setShift(value){shifted=value},
  update(dt){
   const ease=1-Math.exp(-dt*(reduced?60:9));
   carriage.position.x+=(carriageGoal-carriage.position.x)*(reduced?1:1-Math.exp(-dt*16));
   rise+=(riseGoal-rise)*ease;roll+=(rollGoal-roll)*ease;
   platenRoll.rotation.x=roll;sheet.position.y=SHEET_REST+rise;
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
    sheet.position.y=SHEET_REST+rise+(1-eject)*.34;
    pageMat.opacity=Math.min(1,eject*1.6);
    if(!eject){
     written.length=0;written.push('');line=0;col=0;rung=false;
     rise=riseGoal=0;roll=rollGoal=0;carriage.position.x=carriageGoal=CARRIAGE_X0;
     sheet.position.y=SHEET_REST;pageMat.opacity=1;redraw();
    }
   }
  },
 };
}
