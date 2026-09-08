import * as T from 'three';

export function addNightSky(scene:T.Scene, textures:T.Texture[], materials:T.Material[], geometries:T.BufferGeometry[], reduced:boolean){
 const texture=new T.TextureLoader().load('/paris-night.png');texture.colorSpace=T.SRGBColorSpace;textures.push(texture);
 const material=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,toneMapped:false});materials.push(material);
 const geometry=new T.PlaneGeometry(19,10);geometries.push(geometry);const skyline=new T.Mesh(geometry,material);skyline.position.set(1.7,3.35,-8.985);scene.add(skyline);
 const cv=document.createElement('canvas');cv.width=cv.height=64;const cx=cv.getContext('2d')!;const glow=cx.createRadialGradient(32,32,0,32,32,31);glow.addColorStop(0,'#fff');glow.addColorStop(.2,'#fffe');glow.addColorStop(1,'#fff0');cx.fillStyle=glow;cx.fillRect(0,0,64,64);const glowTexture=new T.CanvasTexture(cv);textures.push(glowTexture);
 const bursts:{points:T.Points;material:T.PointsMaterial;geo:T.BufferGeometry;directions:Float32Array;age:number;origin:T.Vector3}[]=[];
 let night=0;
 function launch(color:string){
  if(bursts.length>=3)return false;
  const count=reduced?45:100,positions=new Float32Array(count*3),directions=new Float32Array(count*3);
  for(let i=0;i<count;i++){const a=i*2.399963,h=1-2*(i+.5)/count,r=Math.sqrt(1-h*h);directions[i*3]=Math.cos(a)*r;directions[i*3+1]=h;directions[i*3+2]=Math.sin(a)*r*.15;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));const mat=new T.PointsMaterial({color,map:glowTexture,size:reduced?.07:.045,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
  const points=new T.Points(geo,mat);points.frustumCulled=false;const origin=new T.Vector3(-1+Math.random()*7,5.2+Math.random()*1.4,-8.6);scene.add(points);bursts.push({points,geo,material:mat,directions,age:0,origin});return true;
 }
 function update(dt:number,evening:boolean){night=T.MathUtils.lerp(night,evening?1:0,1-Math.exp(-dt*2.5));material.opacity=night;
  for(let b=bursts.length-1;b>=0;b--){const burst=bursts[b];burst.age+=dt;const age=burst.age,duration=reduced?6:4.2;burst.material.opacity=Math.min(1,age/.8)*Math.max(0,1-age/duration)*.9;const p=burst.geo.attributes.position.array as Float32Array;const radius=reduced?.5+age*.07:1.4*(1-Math.exp(-age*1.4));for(let i=0;i<p.length;i+=3){p[i]=burst.origin.x+burst.directions[i]*radius;p[i+1]=burst.origin.y+burst.directions[i+1]*radius-(reduced?0:age*age*.055);p[i+2]=burst.origin.z+burst.directions[i+2]*radius}burst.geo.attributes.position.needsUpdate=true;if(age>duration){scene.remove(burst.points);burst.geo.dispose();burst.material.dispose();bursts.splice(b,1)}}return night;
 }
 return{launch,update,dispose(){bursts.forEach(b=>{scene.remove(b.points);b.geo.dispose();b.material.dispose()});bursts.length=0}};
}
