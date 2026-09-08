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
 // Fine picture-frame mouldings and a restrained ceiling rose.
 for(const z of [-2.7,-1.15,1.05]){const panel=group(root,4.055,2.78,z,-Math.PI/2);trim(panel,1.15,2.36,0,0,0,cream);trim(panel,1.04,2.25,0,0,.008,brass);}
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
 // Continuous catenary strings: physical sockets and small bulbs, no screen-space glow blobs.
 const fairy=group(root,4.01,0,.93,-Math.PI/2);
 const bulb=plain('#fff3ce',.2);bulb.emissive.set('#ffd596');bulb.emissiveIntensity=2;
 for(let row=0;row<2;row++){
  const points:T.Vector3[]=[];
  for(let i=0;i<=64;i++){const x=-1.99+i/64*4.13,y=3.12-row*.55-Math.abs(Math.sin(i/64*Math.PI*2))*.23;points.push(new T.Vector3(x,y,.055));}
  tube(fairy,points,.005,wire);
  for(let i=0;i<24;i++){
   const t=i/23,x=-1.99+t*4.13,y=3.12-row*.55-Math.abs(Math.sin(t*Math.PI*2))*.23;
   rod(fairy,[x,y,.055],[x,y-.055,.055],.005,wire);cylinder(fairy,.012,.014,.023,x,y-.057,.055,brass,12);sphere(fairy,.022,x,y-.09,.055,bulb,.75,1.25,.75);
   if(row===0&&i%2===0){const leaf=sphere(fairy,.047,x+.042,y-.043,.044,green,1,.36,1.65);leaf.rotation.z=i*.61;}
  }
 }
 const fairyGlow=new T.PointLight('#ffce91',1.4,4.3,2);fairyGlow.position.set(3.45,2.73,1.5);root.add(fairyGlow);warmLights.push(fairyGlow);
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
