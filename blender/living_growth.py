"""A single, non-looping bean germination study. Blender 4.3+, glTF 2.0.
Run: blender -b -t 4 --python blender/living_growth.py
All growth is local to botanical attachment points. No animated camera or model
rotation. Three chapters: seed 0-4s, cotyledons 4-9s, true leaves 9-16s.
"""
import bpy, math, random, os
import numpy as np
from mathutils import Vector
from math import sin, cos, pi
random.seed(42)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'public/assets')
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene; scene.frame_start=1; scene.frame_end=384; scene.render.fps=24
scene.render.engine='CYCLES'; scene.cycles.samples=48; scene.cycles.use_denoising=False
scene.render.resolution_x=1100; scene.render.resolution_y=1100; scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.world.color=(.36,.38,.31)
scene.view_settings.view_transform='AgX'

def mat(name,c,rough=.5):
 m=bpy.data.materials.new(name); m.use_nodes=True; m.diffuse_color=(*c,1)
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*c,1); p.inputs['Roughness'].default_value=rough
 return m
soil=mat('Moist loam',(.035,.016,.006),.96)
clod=mat('Earth aggregates',(.067,.029,.009),.94)
pebble=mat('Mineral fragments',(.13,.105,.06),.88)
stemmat=mat('Living stem',(.235,.38,.065),.52)
rootmat=mat('Ivory radicle',(.66,.53,.31),.8)
seedmat=mat('Warm seed coat',(.31,.12,.035),.68)
veinmat=mat('Leaf midrib',(.35,.46,.11),.55)
# Baked botanical colour texture exported with glTF, with fine secondary veins.
n=512; u,v=np.meshgrid(np.linspace(0,1,n),np.linspace(-1,1,n))
rng=np.random.default_rng(42); noise=rng.normal(0,1,(n,n))
mid=np.exp(-np.abs(v)*95); branches=np.exp(-np.abs(np.sin((u-abs(v)*.20)*pi*9))*60)
shade=.88+.12*np.sin(u*pi)-.10*abs(v)+noise*.018
pix=np.zeros((n,n,4),dtype=np.float32)
for j,c in enumerate([.17,.36,.045]):pix[:,:,j]=np.clip(c*shade+mid*.12+branches*.065,0,1)
pix[:,:,3]=1
im=bpy.data.images.new('Leaf lamina - chlorophyll and veins',width=n,height=n); im.pixels.foreach_set(pix.ravel()); im.filepath_raw=os.path.join(OUT,'leaf-lamina.png'); im.file_format='PNG'; im.save(); im.pack()
leafmat=mat('Translucent leaf lamina',(.2,.4,.06),.65)
p=leafmat.node_tree.nodes.get('Principled BSDF'); tex=leafmat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im
leafmat.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
p.inputs['Subsurface Weight'].default_value=.08
# Mild grain on seed/soil when rendered in Blender; GLB has physical clod geometry.
for material,scale,strength in [(soil,45,.3),(seedmat,95,.16)]:
 nodes=material.node_tree.nodes; links=material.node_tree.links; p=nodes.get('Principled BSDF')
 t=nodes.new('ShaderNodeTexNoise');t.inputs['Scale'].default_value=scale
 b=nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=strength;b.inputs['Distance'].default_value=.025
 links.new(t.outputs['Fac'],b.inputs['Height']);links.new(b.outputs['Normal'],p.inputs['Normal'])

def smooth(o):
 for p in o.data.polygons:p.use_smooth=True
 return o

def sphere(name,loc,scale,material,segments=20,rings=12):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc)
 o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(material);return smooth(o)

def mesh(name,verts,faces,material):
 m=bpy.data.meshes.new(name);m.from_pydata(verts,[],faces);m.update()
 o=bpy.data.objects.new(name,m);bpy.context.collection.objects.link(o);o.data.materials.append(material);return smooth(o)

def tube(name,pts,r,material):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=8;c.bevel_depth=r;c.bevel_resolution=2
 s=c.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for p,co in zip(s.bezier_points,pts):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(material)
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH');smooth(o)
 return o

def animate(o,path,keys):
 for f,value in keys:setattr(o,path,value);o.keyframe_insert(data_path=path,frame=f)
 if o.animation_data:
  o.animation_data.action.name='Germination'
  for fc in o.animation_data.action.fcurves:
   for k in fc.keyframe_points:k.interpolation='BEZIER'

def grow(o,a,b,target=(1,1,1)):
 animate(o,'scale',[(1,(.001,.001,.001)),(a,(.001,.001,.001)),(b,target),(384,target)])

# Irregular shallow patch: an actual soil mound, not a perfectly round pedestal.
verts=[(0,0,.035)];faces=[];N=96;RINGS=9
for r in range(1,RINGS+1):
 for i in range(N):
  a=2*pi*i/N;d=r/RINGS;rad=1+.025*sin(7*a)+.018*sin(13*a)
  z=.035+(1-d)*.025+random.uniform(-.017,.017)-max(0,d-.83)*.9
  verts.append((d*1.18*rad*cos(a),d*.78*rad*sin(a),z))
for i in range(N):faces.append((0,1+i,1+(i+1)%N))
for r in range(RINGS-1):
 for i in range(N):
  a=1+r*N+i;b=1+r*N+(i+1)%N;c=a+N;d=b+N;faces.append((a,c,d,b))
ground=mesh('Uneven living earth',verts,faces,soil)
static=[ground]
for i in range(260):
 a=random.uniform(0,2*pi);r=math.sqrt(random.random());x=r*1.12*cos(a);y=r*.74*sin(a)
 if abs(x)<.15 and abs(y)<.11:continue
 s=random.uniform(.013,.047);z=.035+(1-r)*.025-max(0,r-.83)*.9
 o=sphere('Loam aggregate',(x,y,z),(s,s*.7,s*.56),clod if i%7 else pebble,8,5);o.rotation_euler=(random.random(),random.random(),random.random());static.append(o)
# Consolidate soil into one object / three materials to keep mobile draw calls low.
bpy.ops.object.select_all(action='DESELECT')
for o in static:o.select_set(True)
bpy.context.view_layer.objects.active=ground;bpy.ops.object.join();ground.name='Soil and mineral aggregates'

# Split bean shell. The two halves open slowly as the shoot rises.
for side in [-1,1]:
 o=sphere('Seed shell left' if side<0 else 'Seed shell right',(side*.045,0,.115),(.092,.077,.12),seedmat,32,20)
 animate(o,'location',[(1,(side*.045,0,.115)),(55,(side*.045,0,.115)),(102,(side*.12,.006,.11)),(155,(side*.19,.016,.064)),(384,(side*.19,.016,.064))])
 animate(o,'rotation_euler',[(1,(0,0,0)),(55,(0,0,0)),(120,(0,side*.68,side*.15)),(384,(0,side*.68,side*.15))])
# Root growth originates at seed and points down; fine lateral roots branch progressively.
r=tube('Primary radicle',[(0,0,.1),(-.018,0,-.025),(.025,-.015,-.15),(.01,-.02,-.25)],.013,rootmat);grow(r,25,92)
for i in range(12):
 a=i*2.4;d=.05+i*.013
 r=tube('Lateral root %02d'%i,[(0,0,-.015),(d*cos(a),d*sin(a),-.05),(d*1.4*cos(a),d*1.3*sin(a),-.11)],.0035,rootmat);grow(r,50+i*3,110+i*3)

# Segments join at fixed botanical nodes; each grows out of its own base.
points=[(0,0,.08),(-.035,0,.35),(.025,.005,.68),(-.015,0,1.0),(.025,.01,1.34),(.005,.015,1.65)]
for i in range(5):
 a=Vector(points[i]);b=Vector(points[i+1]);d=b-a
 o=tube('Stem internode %02d'%i,[(0,0,0),tuple(d*.48+Vector((-.015,0,0))),tuple(d)],.023-i*.002,stemmat);o.location=a
 grow(o,62+i*38,110+i*38)

# Leaf blades in local coordinates so opening never pulls them through the soil.
def blade(name,base,az,length,width,start,cotyledon=False):
 verts=[];faces=[];NX=36;NY=16
 for i in range(NX+1):
  t=i/NX;w=(sin(pi*t)**(.68 if cotyledon else .83))*width
  for j in range(NY+1):
   q=j/NY*2-1
   edge=1+.018*sin(26*pi*t)*abs(q)
   z=.15*sin(pi*t)-.09*t*t+.055*(1-q*q)*sin(pi*t)+.012*q*sin(3*pi*t)
   verts.append((length*t,q*w*edge,z))
 for i in range(NX):
  for j in range(NY):
   a=i*(NY+1)+j;faces.append((a,a+1,a+NY+2,a+NY+1))
 o=mesh(name,verts,faces,leafmat);o.location=base;o.rotation_euler=(0,-.11,az)
 uv=o.data.uv_layers.new(name='UVMap')
 for poly in o.data.polygons:
  for li in poly.loop_indices:
   vi=o.data.loops[li].vertex_index;uv.data[li].uv=(vi//(NY+1)/NX,vi%(NY+1)/NY)
 # Small upright blade flattens as lamina expands, no cyclic sway.
 animate(o,'rotation_euler',[(1,(0,-1.18,az)),(start,(0,-1.18,az)),(start+58,(0,-.11,az)),(384,(0,-.11,az))]);grow(o,start,start+64)
 rib=tube(name+' midrib',[(0,0,.002),(length*.28,0,.13),(length*.6,0,.12),(length,0,-.085)],.004,veinmat)
 rib.parent=o
 return o
# First opposite cotyledons, then progressively alternating true leaves.
blade('Cotyledon west',points[2],3.35,.47,.17,150,True)
blade('Cotyledon east',points[2],.22,.48,.18,150,True)
blade('True leaf 01',points[3],-2.8,.67,.245,190)
blade('True leaf 02',points[3],-.15,.70,.255,202)
blade('True leaf 03',points[4],2.7,.60,.215,242)
blade('True leaf 04',points[4],-.45,.62,.22,255)
blade('Apical young leaf',points[5],1.15,.33,.105,285)
# Export animation as ONE synchronized glTF clip (not one independent clip per object).
scene.frame_set(384)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/living_growth.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'living-growth.glb'),export_format='GLB',export_animations=True,export_animation_mode='SCENE',export_force_sampling=True,export_frame_range=True,export_frame_step=2,export_cameras=False,export_lights=False,export_yup=True,export_materials='EXPORT')

# glTF exporter emits one SCENE clip per object in this Blender build. Merge
# sampler/channel tables losslessly, keeping all accessor data and timings.
import json, struct
path=os.path.join(OUT,'living-growth.glb')
raw=open(path,'rb').read();size=struct.unpack_from('<I',raw,12)[0]
g=json.loads(raw[20:20+size]);binary=raw[20+size:]
merged={'name':'Germination','samplers':[],'channels':[]}
for anim in g.get('animations',[]):
 offset=len(merged['samplers']);merged['samplers'].extend(anim['samplers'])
 for channel in anim['channels']:channel['sampler']+=offset;merged['channels'].append(channel)
g['animations']=[merged]
j=json.dumps(g,separators=(',',':')).encode();j+=b' '*((-len(j))%4)
open(path,'wb').write(struct.pack('<III',0x46546c67,2,12+8+len(j)+len(binary))+struct.pack('<II',len(j),0x4e4f534a)+j+binary)

# Studio poster: same scene, same lens and mature state as the live viewer.
def area(name,loc,power,color,size):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.color=color;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,.8))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large soft morning light',(-3,-4,6),650,(1,.9,.7),4)
area('Soft fill',(3,-1,3),220,(.8,.9,1),3)
area('Leaf translucency rim',(0,3,4),500,(1,1,.8),3)
bpy.ops.object.camera_add(location=(.5,-4,2.0));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.82))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.8;scene.camera=cam
scene.render.filepath=os.path.join(OUT,'living-growth-poster.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/living_growth.blend'))
print('GROWTH EXPORT COMPLETE')
