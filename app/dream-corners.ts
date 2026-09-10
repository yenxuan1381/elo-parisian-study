import * as T from 'three';
import { destinations, type Drink } from './room-settings';
import { addTypewriter, type Typewriter, type TypewriterSound } from './typewriter';
import { records } from './room-content';

type P = T.Object3D;
type Context = {
 scene:T.Scene; materials:T.Material[]; textures:T.Texture[]; geometries:T.BufferGeometry[];
 group:(p:P,x?:number,y?:number,z?:number,rot?:number)=>T.Group;
 box:(p:P,w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material,round?:number)=>T.Mesh;
 cylinder:(p:P,rt:number,rb:number,h:number,x:number,y:number,z:number,m:T.Material,segments?:number)=>T.Mesh;
 sphere:(p:P,r:number,x:number,y:number,z:number,m:T.Material,sx?:number,sy?:number,sz?:number)=>T.Mesh;
 rod:(p:P,a:number[],b:number[],radius:number,m:T.Material)=>T.Mesh;
 surface:(color:string,kind?:string)=>T.MeshStandardMaterial;
 plain:(color:string,roughness?:number,metalness?:number)=>T.MeshStandardMaterial;
 chair:(p:P,x:number,z:number,rot?:number,scale?:number)=>T.Group;
 plant:(p:P,x:number,y:number,z:number,scale?:number,flowers?:boolean)=>T.Group;
 bookStack:(p:P,x:number,y:number,z:number,n?:number)=>number;
 lamp:(p:P,x:number,y:number,z:number,scale?:number,deskType?:boolean)=>T.Group;
 wood:T.Material; darkWood:T.Material; lightWood:T.Material; rose:T.Material; blush:T.Material; linen:T.Material;
 cream:T.Material; ivory:T.Material; brass:T.Material; ink:T.Material; paper:T.Material; sage:T.Material; ceramic:T.Material;
 random:()=>number; reduced:boolean;
};

export function addDreamCorners(c:Context,sound?:TypewriterSound){
 const {scene,materials,textures,geometries,group,box,cylinder,sphere,rod,surface,plain,chair,plant,bookStack,lamp,wood,darkWood,lightWood,rose,blush,linen,cream,ivory,brass,ink,paper,sage,ceramic,random,reduced}=c;
 const root=group(scene);
 const cancelled=new AbortController();let gone=false;
 function plane(p:P,w:number,h:number,x:number,y:number,z:number,m:T.Material){const geo=new T.PlaneGeometry(w,h);geometries.push(geo);const o=new T.Mesh(geo,m);o.position.set(x,y,z);p.add(o);return o}
 function label(p:P,text:string,x:number,y:number,z:number,w=.5,h=.12,color='#644239',background='#ebd9bd'){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const ctx=canvas.getContext('2d')!;ctx.fillStyle=background;ctx.fillRect(0,0,768,192);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='52px Georgia';ctx.fillText(text,384,98,730);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);const mat=new T.MeshStandardMaterial({map:texture,roughness:1});materials.push(mat);return plane(p,w,h,x,y,z,mat);
 }
 const interactive=(o:P,id:string,detail?:string)=>{o.userData.activity=id;o.userData.detail=detail;return o};
 // Back-wall reading nook: a deep two-seat settee, cushions and a folded throw.
 const nook=group(root,-.95,0,4.82,Math.PI);interactive(nook,'reading');
 box(nook,2.5,.21,.97,0,.42,0,darkWood,.055);box(nook,2.48,.88,.22,0,1.03,-.38,rose,.085);
 for(const x of [-.6,.6])box(nook,1.15,.23,.83,x,.65,.04,rose,.09);
 for(const x of [-1.24,1.24]){box(nook,.22,.37,1.02,x,.79,0,blush,.08);for(const z of [-.33,.33])rod(nook,[x,.1,z],[x*.93,.47,z],.045,darkWood)}
 for(const [x,mat,rz] of [[-.8,linen,.17],[.75,sage,-.14],[.24,blush,.08]] as const){const cushion=box(nook,.48,.48,.19,x,.97,-.11,mat,.085);cushion.rotation.z=rz;}
 const foldedThrow=box(nook,.47,.045,.86,-.51,.79,.12,linen,.018);foldedThrow.rotation.y=.14;
 for(let i=0;i<12;i++)rod(nook,[-.75+i*.042,.78,.56],[-.75+i*.042,.58,.59],.006,linen);
 const footstool=group(root,-.9,0,3.38,.07);box(footstool,1.05,.2,.62,0,.34,0,rose,.075);for(const x of [-.38,.38])for(const z of [-.2,.2])cylinder(footstool,.023,.03,.25,x,.13,z,darkWood);
 box(root,3.55,.021,2.3,-1.05,.035,4.1,surface('#ba9380','fabric'));
 const side=group(root,-2.63,0,4.7);cylinder(side,.39,.39,.055,0,.72,0,wood);cylinder(side,.055,.065,.61,0,.4,0,darkWood);for(let i=0;i<3;i++){const a=i*2.094;rod(side,[0,.23,0],[Math.cos(a)*.3,.04,Math.sin(a)*.3],.026,darkWood)}lamp(side,0,.755,0,.9);bookStack(side,.16,.755,.1,2);
 plant(root,-3.56,0,5.03,1.6);plant(root,.53,0,5.08,1.2);
 // Tea cabinet faces inward from the right wall.
 const drinks=group(root,3.6,0,2.08,-Math.PI/2);interactive(drinks,'drinks');
 box(drinks,2.27,.91,.62,0,.59,0,wood,.035);box(drinks,2.4,.085,.76,0,1.09,0,cream,.015);
 for(const x of [-.79,0,.79]){box(drinks,.72,.63,.028,x,.63,.326,lightWood);box(drinks,.61,.52,.022,x,.63,.35,wood);sphere(drinks,.025,x+.24,.72,.387,brass)}
 for(const x of [-.93,.93])for(const z of [-.22,.22])cylinder(drinks,.035,.05,.22,x,.12,z,darkWood);
 for(const y of [1.8,2.36]){box(drinks,2.32,.055,.29,0,y,-.14,wood);for(const x of [-.91,.91])rod(drinks,[x,y,-.28],[x,y-.18,-.13],.009,brass)}
 const teaMat=plain('#926026'),matchaMat=plain('#86995b'),coffeeMat=plain('#4f3125');
 const liquids:Record<Drink,T.Mesh>={} as Record<Drink,T.Mesh>;
 const beverageMats={tea:teaMat,matcha:matchaMat,coffee:coffeeMat};
 function cup(p:P,x:number,y:number,z:number,m:T.Material,id?:Drink){
  const g=group(p,x,y,z);if(id)interactive(g,'drinks',id);
  const points=[new T.Vector2(0,0),new T.Vector2(.054,0),new T.Vector2(.074,.13),new T.Vector2(.064,.13),new T.Vector2(.045,.015),new T.Vector2(0,.015)];
  const geo=new T.LatheGeometry(points,24);geometries.push(geo);const vessel=new T.Mesh(geo,m);vessel.castShadow=true;g.add(vessel);
  const hg=new T.TorusGeometry(.038,.01,8,20);geometries.push(hg);const handle=new T.Mesh(hg,m);handle.position.set(.086,.078,0);g.add(handle);
  cylinder(g,.115,.115,.013,0,-.004,0,ivory);
  const rimGeo=new T.TorusGeometry(.069,.003,6,32);geometries.push(rimGeo);const rim=new T.Mesh(rimGeo,brass);rim.rotation.x=Math.PI/2;rim.position.y=.131;g.add(rim);
  const saucerGeo=new T.TorusGeometry(.104,.0025,6,32);geometries.push(saucerGeo);const saucer=new T.Mesh(saucerGeo,brass);saucer.rotation.x=Math.PI/2;saucer.position.y=.004;g.add(saucer);
  rod(g,[-.1,.012,.02],[-.12,.014,.16],.004,brass);sphere(g,.016,-.12,.014,.16,brass,.7,.16,1.4);
  if(id){const liquid=cylinder(g,.057,.057,.005,0,.018,0,beverageMats[id]);liquid.visible=false;liquids[id]=liquid}
  return g;
 }
 const drinkNames:Drink[]=['tea','matcha','coffee'];
 drinkNames.forEach((id,i)=>{cup(drinks,-.66+i*.64,1.15,.21,[ivory,sage,blush][i],id);label(drinks,id,-.66+i*.64,1.024,.398,.29,.067);});
 // Tea tins, bamboo whisk, kettle and a little espresso machine.
 for(let i=0;i<4;i++){cylinder(drinks,.085,.085,.2,-.81+i*.23,1.93,-.14,[sage,blush,ivory,ceramic][i]);cylinder(drinks,.089,.089,.017,-.81+i*.23,2.04,-.14,brass);label(drinks,['TEA','MATCHA','COFFEE','SUGAR'][i],-.81+i*.23,1.93,-.047,.12,.04)}
 const kettle=group(drinks,-.82,1.15,-.1);sphere(kettle,.15,0,.15,0,ivory,1,.8,1);cylinder(kettle,.06,.06,.018,0,.279,0,brass);sphere(kettle,.023,0,.305,0,wood);rod(kettle,[.1,.14,0],[.22,.25,0],.024,ivory);const kg=new T.TorusGeometry(.14,.013,8,24,Math.PI);geometries.push(kg);const kh=new T.Mesh(kg,brass);kh.position.y=.23;kettle.add(kh);
 const machine=group(drinks,.75,1.15,-.08);box(machine,.39,.4,.31,0,.21,0,sage,.045);box(machine,.31,.21,.04,0,.18,.174,ink,.01);box(machine,.34,.026,.29,0,.035,.05,brass);cylinder(machine,.026,.026,.05,0,.28,.22,brass);rod(machine,[0,.24,.21],[.17,.24,.28],.012,darkWood);sphere(machine,.034,.09,.35,.169,brass);
 const whisk=group(drinks,-.06,1.15,-.1);cylinder(whisk,.018,.018,.14,0,.09,0,lightWood);for(let i=0;i<14;i++){const a=i*Math.PI/7;rod(whisk,[Math.cos(a)*.017,.14,Math.sin(a)*.017],[Math.cos(a)*.048,.27,Math.sin(a)*.048],.003,lightWood)}
 cup(drinks,.4,2.4,-.1,blush);cup(drinks,.66,2.4,-.1,ivory);cup(drinks,.92,2.4,-.1,sage);plant(drinks,-.75,2.4,-.1,.56);
 // A second row of empty gift cups on their own tray.
 box(drinks,.75,.025,.25,.47,1.833,-.12,brass,.018);
 drinkNames.forEach((id,i)=>{const gift=cup(drinks,.22+i*.24,1.859,-.1,[ivory,sage,blush][i]);gift.scale.setScalar(.74);interactive(gift,'gift',id)});
 // Typewriter table: the machine itself is a working one, built in ./typewriter.
 const writing=group(root,-3.58,0,2.52,Math.PI/2);interactive(writing,'typewriter');
 box(writing,1.68,.075,.72,0,.91,0,wood,.018);for(const x of [-.68,.68])for(const z of [-.26,.26])rod(writing,[x,.05,z],[x,.88,z],.033,darkWood);
 const typewriter:Typewriter=addTypewriter(c,writing,0,.9475,.03,sound);
 bookStack(writing,-.62,.96,.22,2);lamp(writing,.62,.96,.2,.64);
 // Gramophone and selectable CD sleeves.
 const music=group(root,1.71,0,4.97,Math.PI);interactive(music,'music');box(music,1.57,.78,.58,0,.51,0,wood,.03);box(music,1.65,.06,.65,0,.93,0,darkWood);
 for(const x of [-.7,.7])for(const z of [-.22,.22])cylinder(music,.033,.041,.16,x,.1,z,darkWood);
 box(music,1.35,.4,.03,0,.57,.31,lightWood);for(let i=0;i<13;i++)box(music,.04,.33,.045,-.6+i*.1,.57,.339,darkWood);
 const gram=group(music,-.32,.97,.02);box(gram,.62,.1,.48,0,.055,0,wood,.025);const record=cylinder(gram,.205,.205,.016,0,.123,0,ink,48);cylinder(gram,.048,.048,.003,0,.133,0,rose);rod(gram,[.22,.17,-.13],[.09,.155,.08],.012,brass);
 const hornPoints=[new T.Vector2(.025,0),new T.Vector2(.035,.12),new T.Vector2(.07,.23),new T.Vector2(.14,.34),new T.Vector2(.25,.44)];const hornGeo=new T.LatheGeometry(hornPoints,32);geometries.push(hornGeo);const hornMat=plain('#b28a45',.46,.4);hornMat.side=T.DoubleSide;const horn=new T.Mesh(hornGeo,hornMat);horn.position.set(-.15,.31,-.12);horn.rotation.z=-.65;horn.rotation.x=.56;gram.add(horn);rod(gram,[-.15,.12,-.12],[-.15,.34,-.12],.025,brass);
 for(let i=0;i<records.length;i++){const cd=group(music,.02+i*.063,.98,.06,-.15);box(cd,.027,.33,.32,0,.166,0,[sage,rose,ivory,blush,ceramic][i%5]);interactive(cd,'music',String(i));}
 lamp(music,.62,.98,-.12,.61);
 // Travel pinboard with a geographically placed world map and tied polaroids.
 const board=group(root,-.8,2.89,5.46,Math.PI);interactive(board,'travel');box(board,3.24,1.98,.08,0,0,0,surface('#aa805d'));
 for(const x of [-1.65,1.65])box(board,.065,2.1,.11,x,0,.01,wood);for(const y of [-1.04,1.04])box(board,3.36,.065,.11,0,y,.01,wood);
 const mapCanvas=document.createElement('canvas');mapCanvas.width=1200;mapCanvas.height=600;const mapCtx=mapCanvas.getContext('2d')!;mapCtx.fillStyle='#e2ceb0';mapCtx.fillRect(0,0,1200,600);const mapTex=new T.CanvasTexture(mapCanvas);mapTex.colorSpace=T.SRGBColorSpace;textures.push(mapTex);const mapMat=new T.MeshStandardMaterial({map:mapTex,roughness:1});materials.push(mapMat);plane(board,2.35,1.175,0,.27,.048,mapMat);
 type Land={features:{geometry:{type:string;coordinates:number[][][]|number[][][][]}}[]};
 void fetch('/world-land.json',{signal:cancelled.signal}).then(r=>{if(!r.ok)throw new Error('Map unavailable');return r.json() as Promise<Land>}).then(land=>{if(gone)return;mapCtx.strokeStyle='#b6a283';mapCtx.lineWidth=.8;for(let lon=0;lon<1200;lon+=100){mapCtx.beginPath();mapCtx.moveTo(lon,0);mapCtx.lineTo(lon,600);mapCtx.stroke()}for(let lat=0;lat<600;lat+=100){mapCtx.beginPath();mapCtx.moveTo(0,lat);mapCtx.lineTo(1200,lat);mapCtx.stroke()}mapCtx.fillStyle='#879375';mapCtx.strokeStyle='#697258';for(const feature of land.features){const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates as number[][][]]:feature.geometry.coordinates as number[][][][];for(const polygon of polygons){mapCtx.beginPath();for(const ring of polygon){ring.forEach(([lon,lat],i)=>{const x=(lon+180)/360*1200,y=(90-lat)/180*600;if(i===0)mapCtx.moveTo(x,y);else mapCtx.lineTo(x,y)});mapCtx.closePath()}mapCtx.fill('evenodd');mapCtx.stroke()}}mapTex.needsUpdate=true}).catch(()=>{if(!gone){mapCtx.fillStyle='#645445';mapCtx.font='28px Georgia';mapCtx.fillText('The world, one little memory at a time',120,300);mapTex.needsUpdate=true}});
 const stringMat=plain('#7c3944');
 const postcardLoader=new T.TextureLoader();
 destinations.forEach((place,i)=>{const x=-1.28+i*.51,y=-.68;const polaroid=group(board,x,y,.092,(i%2?.04:-.05));polaroid.rotation.z=(i%2?.04:-.055);interactive(polaroid,'travel',place.id);box(polaroid,.43,.52,.012,0,0,0,paper);const picture=postcardLoader.load('/postcards/'+place.id+'.svg');picture.colorSpace=T.SRGBColorSpace;textures.push(picture);const pictureMaterial=new T.MeshStandardMaterial({map:picture,roughness:1});materials.push(pictureMaterial);const card=plane(polaroid,.377,.353,0,.043,.008,pictureMaterial);card.name=place.name+' postcard';label(polaroid,place.name,0,-.194,.009,.36,.055);
  const pinX=place.lon/360*2.35,pinY=.27+place.lat/180*1.175;
  sphere(board,.022,pinX,pinY,.085,brass);sphere(board,.021,x,y+.244,.14,rose);
  const curve=new T.QuadraticBezierCurve3(new T.Vector3(pinX,pinY,.08),new T.Vector3((pinX+x)/2,y+.45,.105),new T.Vector3(x,y+.244,.135));const geo=new T.TubeGeometry(curve,18,.003,4,false);geometries.push(geo);board.add(new T.Mesh(geo,stringMat));
 });
 // Warm festoon lights along the back cornice and board.
 const bulbMat=plain('#ffe1a1');bulbMat.emissive=new T.Color('#ffbf64');bulbMat.emissiveIntensity=1.1;
 for(let i=0;i<24;i++){const x=-3.8+i*.32,y=4.05-Math.sin(i/23*Math.PI)*.38;if(i)rod(root,[x-.32,4.05-Math.sin((i-1)/23*Math.PI)*.38,5.2],[x,y,5.2],.009,darkWood);sphere(root,.029,x,y-.055,5.2,bulbMat,.8,1.2,.8)}
 const nookGlow=new T.PointLight('#ffc685',1.6,5,2);nookGlow.position.set(-.7,3.3,4.7);root.add(nookGlow);
 // Ribbed Loewe-style ceramic candles on a dedicated wall shelf.
 const candleShelf=group(root,3.94,0,-.37,-Math.PI/2);interactive(candleShelf,'candles');box(candleShelf,1.5,.085,.4,0,1.5,0,wood);for(const x of [-.59,.59])rod(candleShelf,[x,1.5,-.15],[x,1.22,.12],.018,brass);
 const candleFlames:T.Mesh[]=[];const candleGlows:T.PointLight[]=[];const wax=plain('#efdbb7');const flameMat=new T.MeshBasicMaterial({color:'#ffe5a2'});materials.push(flameMat);
 for(let i=0;i<3;i++){const x=-.46+i*.46,h=[.25,.33,.28][i],m=[sage,rose,ceramic][i];const candle=group(candleShelf,x,1.55,0);cylinder(candle,.13,.125,h,0,h/2,0,m,32);for(let k=0;k<24;k++){const a=k*Math.PI/12;cylinder(candle,.008,.008,h,Math.cos(a)*.128,h/2,Math.sin(a)*.128,m,5)}cylinder(candle,.115,.115,.01,0,h+.005,0,wax);rod(candle,[0,h,0],[0,h+.037,0],.004,ink);label(candle,'LOEWE',0,h*.5,.135,.14,.047);const flame=sphere(candle,.024,0,h+.061,0,flameMat,.62,1.9,.62);flame.visible=false;candleFlames.push(flame);const glow=new T.PointLight('#ffb355',0,2.1,2);glow.position.set(x,1.55+h+.09,.06);candleShelf.add(glow);candleGlows.push(glow)}
 // Empty bowl, with kibble added only after the visitor fills it.
 const bowl=group(root,3.26,0,5.14,-.42);interactive(bowl,'cat');box(bowl,.78,.016,.51,0,.018,0,linen,.05);
 const bowlGeo=new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.19,0),new T.Vector2(.24,.13),new T.Vector2(.21,.15),new T.Vector2(.16,.033),new T.Vector2(0,.033)],32);geometries.push(bowlGeo);const vessel=new T.Mesh(bowlGeo,ceramic);vessel.position.y=.035;bowl.add(vessel);
 const kibble=group(bowl,0,.082,0);kibble.visible=false;const kibbleGeo=new T.SphereGeometry(.017,6,4);geometries.push(kibbleGeo);const food=new T.InstancedMesh(kibbleGeo,plain('#866046'),65);for(let i=0;i<65;i++){const a=random()*Math.PI*2,r=Math.sqrt(random())*.162;const m=new T.Matrix4().makeTranslation(Math.cos(a)*r,random()*.026,Math.sin(a)*r);food.setMatrixAt(i,m)}kibble.add(food);
 // A soft curl of steam follows the selected drink.
 const steamGeo=new T.BufferGeometry();const steamPos=new Float32Array(18*3);steamGeo.setAttribute('position',new T.BufferAttribute(steamPos,3));geometries.push(steamGeo);const steamMat=new T.PointsMaterial({color:'#f9edd9',transparent:true,opacity:.43,size:.018,depthWrite:false});materials.push(steamMat);const steam=new T.Points(steamGeo,steamMat);steam.visible=false;drinks.add(steam);
 const teaTray=group(drinks,.19,1.148,.12);box(teaTray,.34,.025,.23,0,0,0,brass,.025);
 const biscuit=plain('#c49b65',.85),icing=plain('#d2a6a7',.7);
 for(let i=0;i<3;i++){const x=-.1+i*.1;for(const y of [.027,.051])cylinder(teaTray,.041,.041,.016,x,y,0,i===1?icing:biscuit,24);cylinder(teaTray,.039,.039,.01,x,.039,0,ivory,24);}
 const streamMat=plain('#e1c9a0',.22);streamMat.transparent=true;streamMat.opacity=.6;
 const stream=cylinder(drinks,.009,.012,1,0,0,0,streamMat,8);stream.visible=false;
 const ingredients=group(drinks);ingredients.visible=false;
 for(let i=0;i<14;i++)sphere(ingredients,.008,(random()-.5)*.065,random()*.2,(random()-.5)*.05,matchaMat,1,.5,1);
 let ritualTime=2;
 let lit=true,playing=false,drink:Drink|null=null,drinkProgress=0;const fills:Record<Drink,number>={tea:0,matcha:0,coffee:0};candleFlames.forEach(f=>f.visible=true);
 function animateRitual(dt:number,time:number){
  ritualTime=Math.min(2,ritualTime+dt);const active=ritualTime<1.8&&drink;
  const lift=active?(reduced?1:Math.sin(Math.min(1,ritualTime/1.8)*Math.PI)):0;
  const cupX=-.66+drinkNames.indexOf(drink||'tea')*.64;
  kettle.position.set(-.82,1.15,-.1);kettle.rotation.z=0;whisk.position.set(-.06,1.15,-.1);whisk.rotation.z=0;stream.visible=false;ingredients.visible=false;
  if(active&&drinkProgress===1){ingredients.visible=true;ingredients.position.set(cupX,1.33-(ritualTime% .45)*.2,.21)}
  if(active&&drinkProgress===2){
   kettle.position.set(T.MathUtils.lerp(-.82,cupX-.23,lift),1.15+lift*.24,T.MathUtils.lerp(-.1,.21,lift));kettle.rotation.z=-lift*.65;
   if(lift>.55){const start=new T.Vector3(.22,.25,0).applyEuler(kettle.rotation).add(kettle.position),end=new T.Vector3(cupX,1.26,.21);stream.visible=true;stream.position.copy(start).add(end).multiplyScalar(.5);stream.scale.y=start.distanceTo(end);stream.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize())}
  }
  if(active&&drinkProgress===3&&drink==='matcha'){whisk.position.set(cupX+Math.sin(time*.018)*.015,1.07+lift*.09,.21+Math.cos(time*.018)*.015);whisk.rotation.z=.15*Math.sin(time*.024)}
 }
 return {
  typewriter,
  updateNote:typewriter.setText,
  fillBowl(){kibble.visible=true;},
  setCandles(value:boolean){lit=value;candleFlames.forEach(f=>f.visible=value)},
  setPlaying(value:boolean){playing=value;},
  setDrink(id:Drink,progress:number){const changed=fills[id]!==progress;drink=id;drinkProgress=Math.min(3,Math.max(0,progress));if(changed)ritualTime=0;fills[id]=drinkProgress;liquids[id].visible=progress>0;steam.visible=progress===3;},
  update(time:number,dt:number,night:number){typewriter.update(dt);animateRitual(dt,time);nookGlow.intensity=1.6+night*2;bulbMat.emissiveIntensity=1.1+night*.8;candleGlows.forEach((light,i)=>{light.intensity=lit?(.45+(reduced?0:Math.sin(time*.006+i)*.05)):0});candleFlames.forEach((f,i)=>{f.scale.y=.024*1.9*(1+(reduced?0:Math.sin(time*.008+i)*.09))});if(playing&&!reduced)record.rotation.y+=dt*.65;for(const id of ['tea','matcha','coffee'] as Drink[]){const target=.024+fills[id]/3*.085;liquids[id].position.y=T.MathUtils.lerp(liquids[id].position.y,target,1-Math.exp(-dt*4))}if(drink&&drinkProgress===3){const index=drinkNames.indexOf(drink);for(let i=0;i<18;i++){const phase=(i/18+(reduced?0:time*.00013))%1;steamPos[i*3]=-.66+index*.64+Math.sin(phase*8+i)*.025;steamPos[i*3+1]=1.29+phase*.32;steamPos[i*3+2]=.21+Math.cos(phase*5+i)*.022}steamGeo.attributes.position.needsUpdate=true}},
  dispose(){gone=true;cancelled.abort()},
 };
}
