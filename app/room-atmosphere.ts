import * as T from 'three';
import type { TypewriterContext } from './typewriter';

export function addRoomAtmosphere(c:TypewriterContext&{scene:T.Scene;wood:T.Material;paper:T.Material;linen:T.Material}){
 const {scene,group,box,rod,plain,textures,materials,geometries}=c;
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
 const sx=shadowCanvas.getContext('2d')!,gradient=sx.createRadialGradient(64,64,3,64,64,64);
 gradient.addColorStop(0,'rgba(58,36,27,.32)');gradient.addColorStop(.45,'rgba(58,36,27,.16)');gradient.addColorStop(1,'rgba(58,36,27,0)');sx.fillStyle=gradient;sx.fillRect(0,0,128,128);
 const shadowTexture=new T.CanvasTexture(shadowCanvas);textures.push(shadowTexture);
 const shadowMat=new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});materials.push(shadowMat);
 const shadowGeo=new T.PlaneGeometry(1,1);geometries.push(shadowGeo);
 for(const [x,z,w,d] of [[-.55,-.45,3.8,2.3],[-.65,1.2,1.5,1.5],[3.6,2.08,1.3,2.7],[-.95,4.82,3.4,1.8],[1.71,4.97,2,1.4],[-3.58,2.52,1.3,2.2],[2.9,-2.75,1.5,1.5]]){
  const shadow=new T.Mesh(shadowGeo,shadowMat);shadow.rotation.x=-Math.PI/2;shadow.position.set(x,.075,z);shadow.scale.set(w,d,1);scene.add(shadow);
 }
 const book=group(scene,-.85,.465,3.38,.2);box(book,.56,.022,.37,0,0,0,plain('#786756'),.008);
 const pageCanvas=document.createElement('canvas');pageCanvas.width=512;pageCanvas.height=512;const ctx=pageCanvas.getContext('2d')!;ctx.fillStyle='#eadac0';ctx.fillRect(0,0,512,512);
 ctx.fillStyle='#785f4e';ctx.font='italic 28px Georgia';ctx.textAlign='center';ctx.fillText('Stay a little longer.',256,75);
 for(let i=0;i<16;i++){ctx.fillStyle=`rgba(120,95,78,${i%3===0?.32:.2})`;ctx.fillRect(50,119+i*19,350-(i%5)*13,2)}
 const pageTex=new T.CanvasTexture(pageCanvas);pageTex.colorSpace=T.SRGBColorSpace;textures.push(pageTex);const mat=new T.MeshStandardMaterial({map:pageTex,side:T.DoubleSide,roughness:1});materials.push(mat);
 for(const side of [-1,1]){const geo=new T.PlaneGeometry(.265,.345,12,1),positions=geo.attributes.position;for(let i=0;i<positions.count;i++){const x=positions.getX(i);positions.setZ(i,Math.sin((x+.1325)/.265*Math.PI)*.026)}geo.computeVertexNormals();geometries.push(geo);const page=new T.Mesh(geo,mat);page.rotation.x=-Math.PI/2;page.position.set(side*.133,.018,0);book.add(page)}
 rod(book,[.025,.025,-.17],[.035,.029,.24],.006,plain('#a06672'));
 const note=group(scene,-1.38,1.28,-.3,-.1);
 const cv=document.createElement('canvas');cv.width=640;cv.height=360;const cx=cv.getContext('2d')!;cx.fillStyle='#f0dfc5';cx.fillRect(0,0,640,360);cx.fillStyle='#88575d';cx.textAlign='center';cx.font='italic 48px Georgia';cx.fillText('Make yourself at home.',320,150);cx.font='32px Georgia';cx.fillText('♡ Emily',320,230);
 const texture=new T.CanvasTexture(cv);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);const material=new T.MeshStandardMaterial({map:texture,roughness:1,side:T.DoubleSide});materials.push(material);const geometry=new T.PlaneGeometry(.3,.17);geometries.push(geometry);const card=new T.Mesh(geometry,material);card.rotation.x=-Math.PI/2;note.add(card);
}
