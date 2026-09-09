import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { compileFunction } from 'node:vm';

const require = createRequire(import.meta.url);
const T = require('three');
const ts = require('typescript');
const cache = new Map();
function loadSource(path) {
 const filename = resolve(path);
 if (cache.has(filename)) return cache.get(filename);
 const compiled = { exports: {} };
 const source = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
 const localRequire = id => id.startsWith('.') ? loadSource(resolve(dirname(filename), id + '.ts')) : require(id);
 compileFunction(source, ['require', 'module', 'exports'])(localRequire, compiled, compiled.exports);
 cache.set(filename, compiled.exports);
 return compiled.exports;
}
const { layoutLetter, columns, pageMetrics, fittedDistance, pageTitle } = loadSource('app/typewriter-layout.ts');
const { addTypewriter } = loadSource('app/typewriter.ts');

test('returns keep extending the paper, including blank paragraphs beyond the old page limit', () => {
 let previous = layoutLetter('First line');
 for (let row = 1; row <= 100; row++) {
  const current = layoutLetter('First line' + '\n'.repeat(row));
  assert.equal(current.height - previous.height, pageMetrics.line);
  assert.equal(current.lines[0], 'First line');
  assert.equal(current.row, row);
  previous = current;
 }
 assert.equal(layoutLetter('\n'.repeat(4000)).lines.length, 4001);
});

test('long words, paragraphs, and Unicode stay within the paper margins', () => {
 for (const text of ['a'.repeat(4000), 'A small letter for Emily. '.repeat(160), 'é😊'.repeat(100), 'one\r\n\r\nthree\n']) {
  const result = layoutLetter(text);
  assert.ok(result.lines.every(line => Array.from(line).length <= columns));
  assert.equal(result.lines.join('').replaceAll(' ', ''), text.replace(/[\r\n ]/g, ''));
 }
});

function machine() {
 // A canvas double records ink coordinates. Three.js still computes real world
 // transforms, geometry bounds and camera projections without a browser or GPU.
 Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement() {
  let shiftY = 0; const stack = []; const draws = [];
  const ctx = { draws, fillRect(){draws.length=0}, clearRect(){draws.length=0}, save(){stack.push(shiftY)}, restore(){shiftY=stack.pop()}, translate(x,y){shiftY+=y}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, fillText(text,x,y){draws.push({text,x,y:y+shiftY})} };
  return { width: 0, height: 0, getContext(){return ctx} };
 }}});
 const materials=[], textures=[], geometries=[];
 const group=(parent,x=0,y=0,z=0,rot=0)=>{const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot;parent.add(g);return g};
 const mesh=(parent,geo,x,y,z,mat)=>{geometries.push(geo);const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m};
 const plain=color=>{const m=new T.MeshStandardMaterial({color});materials.push(m);return m};
 const context={materials,textures,geometries,group,plain,surface:plain,random:()=>.5,reduced:true,brass:plain('#b18a40'),ink:plain('#3f3933'),rose:plain('#b87577'),
  box:(p,w,h,d,x,y,z,m)=>mesh(p,new T.BoxGeometry(w,h,d),x,y,z,m),
  cylinder:(p,rt,rb,h,x,y,z,m)=>mesh(p,new T.CylinderGeometry(rt,rb,h),x,y,z,m),
  sphere:(p,r,x,y,z,m)=>mesh(p,new T.SphereGeometry(r),x,y,z,m),
  rod:(p,a,b,r,m)=>{const start=new T.Vector3(...a),end=new T.Vector3(...b);const center=start.clone().add(end).multiplyScalar(.5);const rod=mesh(p,new T.CylinderGeometry(r,r,start.distanceTo(end)),center.x,center.y,center.z,m);rod.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize());return rod},
 };
 const parent=group(new T.Group(),-3.58,.9475,2.52,Math.PI/2);
 const writer=addTypewriter(context,parent,0,0,.03);
 const settle=()=>{for(let i=0;i<120;i++)writer.update(1/60);writer.root.updateWorldMatrix(true,true)};
 const paperMeshes=()=>{const meshes=[];writer.root.traverse(o=>{if(o.isMesh&&o.visible&&o.material.map?.image.width===800)meshes.push(o)});return meshes};
 return {writer,settle,paperMeshes,dispose(){new Set(materials).forEach(m=>m.dispose());new Set(textures).forEach(t=>t.dispose());new Set(geometries).forEach(g=>g.dispose());delete globalThis.document}};
}

test('ink lands at the type guide after many returns and crosses texture strips without losing the letter', () => {
 const fixture=machine();
 try {
  const {writer,settle,paperMeshes}=fixture;
  const message='First sentence.\n'+'\n'.repeat(48)+'Z';
  writer.setText(message);settle();
  assert.equal(writer.text(),message);
  const meshes=paperMeshes();assert.ok(meshes.length>1);
  assert.ok(meshes.some(m=>m.material.map.image.getContext().draws.some(d=>d.text===pageTitle)));
  let printPosition;
  for(const mesh of meshes){
   const canvas=mesh.material.map.image;
   assert.ok(canvas.height<=1024);
   const ink=canvas.getContext().draws.find(d=>d.text==='Z'&&d.y>=0&&d.y<=canvas.height);
   if(ink)printPosition=mesh.localToWorld(new T.Vector3((ink.x/pageMetrics.width-.5)*.4,.5-ink.y/canvas.height,0));
  }
  const guide=writer.root.localToWorld(new T.Vector3(-pageMetrics.character/pageMetrics.pixels,.285,-.085));
  assert.ok(printPosition.distanceTo(guide)<.00001);
  writer.erase();assert.equal(writer.text(),message.slice(0,-1));
  writer.setText('');settle();assert.equal(paperMeshes().length,1);
 } finally {fixture.dispose()}
});

test('the full carriage stroke fits phone, tablet and desktop viewports', () => {
 const fixture=machine();
 try {
  for(const rows of [0,4,12,24,90]){
   fixture.writer.setText('\n'.repeat(rows));fixture.settle();
   const bounds=fixture.writer.framingBounds(),center=bounds.getCenter(new T.Vector3()),outward=new T.Vector3(1,.24,0).normalize();
   for(const [width,height] of [[320,330],[390,506],[768,686],[1024,480],[1440,612],[844,214]]){
    const camera=new T.PerspectiveCamera(58,width/height,.04,70);
    camera.position.copy(center).addScaledVector(outward,fittedDistance(bounds,center,outward,camera.aspect,camera.fov));camera.lookAt(center);camera.updateMatrixWorld();
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
     const projected=new T.Vector3(x,y,z).project(camera);
     assert.ok(Math.abs(projected.x)<=.871&&Math.abs(projected.y)<=.871,`${width}×${height}: ${projected.toArray().join(', ')}`);
    }
   }
  }
 } finally {fixture.dispose()}
});

test('the roller and body do not occlude the current print line', () => {
 const fixture=machine();
 try {
  for(const rows of [0,5,20])for(const column of [1,columns-1]){
   fixture.writer.setText('\n'.repeat(rows)+'a'.repeat(column));fixture.settle();
   const bounds=fixture.writer.framingBounds(),center=bounds.getCenter(new T.Vector3()),outward=new T.Vector3(1,.24,0).normalize();
   const cameraPosition=center.clone().addScaledVector(outward,fittedDistance(bounds,center,outward,1.5,58));
   const guide=fixture.writer.root.localToWorld(new T.Vector3(-pageMetrics.character/pageMetrics.pixels,.285,-.085));
   const ray=new T.Raycaster(cameraPosition,guide.clone().sub(cameraPosition).normalize());
   const first=ray.intersectObject(fixture.writer.root,true).find(hit=>hit.object.visible);
   assert.ok(first,'The paper must be visible');
   assert.equal(first.object.material.map?.image.width,800,`Occluded at row ${rows}, column ${column}`);
   assert.ok(first.point.distanceTo(guide)<.00001);
  }
 } finally {fixture.dispose()}
});
