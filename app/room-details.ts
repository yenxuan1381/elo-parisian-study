import * as T from 'three';
import type { TypewriterContext } from './typewriter';

type Context = TypewriterContext & { scene:T.Scene; wood:T.Material; cream:T.Material; ivory:T.Material; green:T.Material };

export function addRoomDetails(c:Context){
 const {scene,group,box,cylinder,sphere,rod,plain,brass,wood,cream,ivory,green,materials,geometries,reduced}=c;
 const root=group(scene);
 const enamel=plain('#657f7a',.42,.1),recess=plain('#465f5c',.65),wire=plain('#615841',.65,.3);
 const glass=plain('#fff1d5',.28);glass.emissive.set('#ffd7a1');glass.emissiveIntensity=.8;
 const warmLights:T.PointLight[]=[];
 function tube(p:T.Object3D,points:T.Vector3[],radius:number,mat:T.Material){
  const geometry=new T.TubeGeometry(new T.CatmullRomCurve3(points),48,radius,6,false);geometries.push(geometry);const mesh=new T.Mesh(geometry,mat);p.add(mesh);return mesh;
 }
 function trim(p:T.Object3D,w:number,h:number,x:number,y:number,z:number,m:T.Material){
  for(const sx of [-1,1])box(p,.022,h,.025,x+sx*w/2,y,z,m,.004);
  for(const sy of [-1,1])box(p,w,.022,.025,x,y+sy*h/2,z,m,.004);
 }
 // A real opening in the right wall leads into a small, illuminated vestibule.
 const entry=group(root,4.11,0,3.66,-Math.PI/2);
 for(const x of [-.09,1.48]){
  box(entry,.16,3.13,.19,x,1.56,0,cream,.009);
  box(entry,.025,3.04,.025,x,1.53,.11,brass,.004);
  box(entry,.23,.24,.23,x,.12,.018,cream,.01);
 }
 box(entry,1.81,.19,.23,.695,3.13,.015,cream,.014);
 box(entry,1.94,.08,.29,.695,3.26,.015,ivory,.012);
 box(entry,1.48,.035,.4,.695,.02,0,brass);
 const door=group(entry,1.39,0,.015);door.scale.x=-1;door.userData.activity='door';
 box(door,1.39,2.99,.082,.695,1.515,0,enamel,.012);
 for(const [y,h] of [[.62,.76],[1.88,1.49]]){
  box(door,1.1,h,.018,.695,y,.047,recess,.008);
  trim(door,1.13,h+.03,.695,y,.061,cream);
  trim(door,1.02,h-.08,.695,y,.072,brass);
  box(door,.97,h-.13,.025,.695,y,.064,enamel,.005);
 }
 for(const y of [.35,1.5,2.68])cylinder(door,.025,.025,.14,.016,y,.064,brass,16);
 box(door,.078,.23,.023,1.225,1.34,.068,brass,.022);
 rod(door,[1.225,1.37,.084],[1.225,1.37,.153],.016,brass);
 rod(door,[1.225,1.37,.153],[1.07,1.37,.153],.018,brass);
 sphere(door,.011,1.225,1.275,.084,recess,1,1.4,.35);
 const plaqueGeo=new T.TorusGeometry(.1,.01,8,36);geometries.push(plaqueGeo);const knocker=new T.Mesh(plaqueGeo,brass);knocker.position.set(.695,2.35,.11);door.add(knocker);sphere(door,.025,.695,2.44,.085,brass);
 box(root,2.5,.08,1.66,5.32,-.015,4.36,wood);
 box(root,.12,3.45,1.72,6.6,1.7,4.36,enamel);
 for(const z of [3.51,5.23])box(root,2.5,3.45,.1,5.35,1.7,z,cream);
 box(root,2.6,.12,1.76,5.3,3.44,4.36,cream);
 const hallGlow=new T.PointLight('#ffe0ac',2.3,4,2);hallGlow.position.set(5.2,2.6,4.35);root.add(hallGlow);
 // A picture rail ties the whole wall together; the panelled bay keeps to the stretch
 // of wall the shelves leave empty, so no moulding runs behind a shelf or the cabinet.
 const RAIL=3.42;
 box(root,.075,.09,7.5,4.042,RAIL,-.44,cream,.012);
 box(root,.052,.03,7.5,4.052,RAIL-.066,-.44,brass,.008);
 for(const z of [-3.42,-2.15]){const panel=group(root,4.055,2.44,z,-Math.PI/2);trim(panel,1.15,1.62,0,0,0,cream);trim(panel,1.04,1.51,0,0,.008,brass);}
 const ceiling=group(root,-.15,4.73,.55);
 for(const r of [.17,.29,.4]){const geo=new T.TorusGeometry(r,.024,8,48);geometries.push(geo);const ring=new T.Mesh(geo,cream);ring.rotation.x=Math.PI/2;ceiling.add(ring);}
 cylinder(ceiling,.09,.11,.1,0,-.02,0,brass,24);
 rod(ceiling,[0,-.06,0],[0,-.57,0],.012,brass);
 for(let i=0;i<5;i++){
  const a=i*Math.PI*2/5,x=Math.cos(a)*.41,z=Math.sin(a)*.41;
  tube(ceiling,[new T.Vector3(0,-.55,0),new T.Vector3(x*.55,-.74,z*.55),new T.Vector3(x,-.66,z)],.013,brass);
  sphere(ceiling,.104,x,-.58,z,glass,1,1.3,1);cylinder(ceiling,.072,.09,.025,x,-.704,z,brass,24);
 }
 const chandelier=new T.PointLight('#ffdfb0',1.6,5,2);chandelier.position.set(-.15,3.9,.55);root.add(chandelier);warmLights.push(chandelier);
 // A eucalyptus garland, hung from brass hooks over the picture rail and swagged
 // across the tea shelves — every string starts and ends on something solid.
 const bulb=plain('#fff3ce',.2);bulb.emissive.set('#ffd596');bulb.emissiveIntensity=2;
 const WALL=4.02,HOOKS=[.95,2.05,3.15],DROP=RAIL-.115;
 for(const z of HOOKS){
  rod(root,[WALL+.03,RAIL+.07,z],[WALL+.03,RAIL-.055,z],.009,brass);
  const hookGeo=new T.TorusGeometry(.032,.008,6,20,Math.PI*1.35);geometries.push(hookGeo);
  const hook=new T.Mesh(hookGeo,brass);hook.rotation.set(0,Math.PI/2,Math.PI*.1);hook.position.set(WALL+.03,RAIL-.085,z);root.add(hook);
 }
 for(let s=0;s<HOOKS.length-1;s++){
  const z0=HOOKS[s],z1=HOOKS[s+1];
  const at=(t:number)=>new T.Vector3(WALL,DROP-Math.sin(t*Math.PI)*.27,z0+(z1-z0)*t);
  const strand:T.Vector3[]=[];for(let i=0;i<=32;i++)strand.push(at(i/32));
  tube(root,strand,.005,wire);
  for(let i=0;i<9;i++){
   const p=at((i+.5)/9);
   rod(root,[p.x,p.y,p.z],[p.x,p.y-.05,p.z],.005,wire);
   cylinder(root,.012,.014,.023,p.x,p.y-.056,p.z,brass,12);
   sphere(root,.022,p.x,p.y-.089,p.z,bulb,.75,1.25,.75);
   const leaf=sphere(root,.046,p.x-.028,p.y-.014,p.z+.045,green,1,.36,1.6);
   leaf.rotation.set(Math.PI/2,0,(i+s*3)*.79);
  }
 }
 const fairyGlow=new T.PointLight('#ffce91',1.4,4.3,2);fairyGlow.position.set(3.58,2.95,2.1);root.add(fairyGlow);warmLights.push(fairyGlow);
 const sconce=group(root,3.98,2.75,-2.15,-Math.PI/2);
 sphere(sconce,.13,0,0,0,brass,.72,1.3,.25);tube(sconce,[new T.Vector3(0,-.03,0),new T.Vector3(0,-.12,.2),new T.Vector3(0,.02,.27)],.016,brass);
 cylinder(sconce,.12,.19,.25,0,.14,.27,ivory,32);cylinder(sconce,.192,.192,.012,0,.013,.27,brass,32);
 const sconceLight=new T.PointLight('#ffe0af',1.5,3.7,2);sconceLight.position.set(3.59,2.79,-2.15);root.add(sconceLight);warmLights.push(sconceLight);
 let opened=false;
 return {
  toggleDoor(){opened=!opened;return opened;},
  openDoor(){opened=true;},
  update(dt:number,night:number){
   const ease=reduced?1:1-Math.exp(-dt*4);
   door.rotation.y+=((opened?1.18:0)-door.rotation.y)*ease;
   bulb.emissiveIntensity=1.4+night*1.7;glass.emissiveIntensity=.55+night*.8;
   warmLights.forEach((light,i)=>{light.intensity=(i===0?1.25:1.05)+night*.8});
  },
 };
}
