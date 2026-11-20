"""Live Start: initial botanical animation extended to blossom/fruit, real soil and five roots.
Run blender -b -t 6 --python blender/start_lifecycle.py. Exports one GLB, no render cards.
"""
import bpy, os, math, json, struct, re
from mathutils import Vector
from math import sin, cos, pi
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT=ROOT+'/public/assets'
bpy.ops.wm.open_mainfile(filepath=ROOT+'/blender/living_growth.blend')
s=bpy.context.scene;s.frame_start=1;s.frame_end=672;s.render.fps=24;s.frame_set(384)
# Preserve the original Blender growth animation and its attachment-point pivots.
for o in list(bpy.data.objects):
 if o.type in {'CAMERA','LIGHT'} or o.name.startswith(('Soil','Primary radicle','Lateral root')):bpy.data.objects.remove(o,do_unlink=True)
plants=list(s.objects)
rig=bpy.data.objects.new('Botanical lifecycle',None);s.collection.objects.link(rig);rig.scale=(1.27,)*3;rig.location=(0,.03,.15)
for o in plants:
 if o.parent is None:o.parent=rig
# Hold the original mature keyframes through flowering and fruiting.
for o in plants:
 if o.animation_data and o.animation_data.action:
  for fc in o.animation_data.action.fcurves:
   fc.extrapolation='CONSTANT'
   if o.name.startswith('Seed shell') and fc.data_path=='location':
    offset={1:-.22,55:-.22,102:-.12,155:-.05,384:-.05}
    for key in fc.keyframe_points:
     amount=(-.16 if fc.array_index==1 else offset.get(round(key.co.x),0)) if fc.array_index in [1,2] else 0
     key.co.y+=amount;key.handle_left.y+=amount;key.handle_right.y+=amount
# Use the real leaf albedo on Blender lamina geometry.
m=bpy.data.materials.get('Translucent leaf lamina');p=m.node_tree.nodes.get('Principled BSDF')
im=bpy.data.images.load(OUT+'/leaf-albedo-v2.webp');im.scale(1024,512);im.pack()
tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;m.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color']);p.inputs['Roughness'].default_value=.48;m.use_backface_culling=False

def material(name,c,rough=.55):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=rough;return m
petal=material('Golden tomato blossom',(.98,.68,.025));pollen=material('Pollen gold',(.95,.54,.04));red=material('Ripe tomato red',(.68,.012,.006),.28);calyx=material('Tomato calyx green',(.09,.24,.015),.48);stem=bpy.data.materials.get('Living stem')
red.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.28
def sphere(name,loc,scale,mat):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 return o

def growth(o,start,end,fade=None):
 target=o.scale.copy()
 for f,k in [(1,.001),(start,.001),(end,1),(fade[0],1) if fade else (672,1),(fade[1],.001) if fade else (672,1)]:
  o.scale=target*k;o.keyframe_insert(data_path='scale',frame=f)
 for fc in o.animation_data.action.fcurves:
  for k in fc.keyframe_points:k.interpolation='BEZIER'
 o['botanicalPart']='flower' if 'Blossom' in o.name else 'fruit'

def tube(name,pts,r,mat):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=8;c.bevel_depth=r;c.bevel_resolution=2;sp=c.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
 for i,(p,co) in enumerate(zip(sp.bezier_points,pts)):
  p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
  if name=='Root collar connection':p.radius=max(.06,1-i/(len(pts)-1)*.94)
 o=bpy.data.objects.new(name,c);s.collection.objects.link(o);o.data.materials.append(mat);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);return o
# Three blooms open, then red tomato fruit swell below their fixed attachment.
for j,(x,y,z) in enumerate([(.57,-.04,1.18),(-.48,-.02,1.40),(.37,-.03,1.69)]):
 base=(x*.68,y-.035,z-.12)
 o=tube('Flower stalk %d'%j,[(0,0,z-.22),base,(x,y-.08,z)],.012,stem);o.parent=rig;growth(o,365+j*10,420+j*10)
 for k in range(5):
  a=2*pi*k/5;o=sphere('Blossom %d petal %d'%(j,k),(x+.09*cos(a),y-.012,z+.08*sin(a)),(.105,.035,.065),petal);o.rotation_euler=(0,-a,0);o.parent=rig;growth(o,410+j*12,470+j*12,(530+j*10,590+j*10))
 o=sphere('Blossom %d pollen'%j,(x,y-.045,z),(.045,.035,.045),pollen);o.parent=rig;growth(o,415+j*12,475+j*12,(535+j*10,590+j*10))
 # A gently ribbed, rounded tomato with a depressed crown and a green star calyx.
 vs=[];fs=[];N=24;R=40;radius=.20+j*.018
 for i in range(N+1):
  t=i/N;w=radius*sin(pi*t)**.78
  for k in range(R):
   a=k*2*pi/R;rib=1+.045*cos(5*a)*sin(pi*t);vs.append((w*cos(a)*rib,w*sin(a)*rib,-radius*.13-radius*1.7*t))
 for i in range(N):
  for k in range(R):a=i*R+k;b=i*R+(k+1)%R;fs.append((a,b,b+R,a+R))
 me=bpy.data.meshes.new('Tomato ribbed skin');me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new('Fruit red tomato %d'%j,me);s.collection.objects.link(o);o.location=(x,y-.08,z);o.parent=rig;o.data.materials.append(red)
 for p in me.polygons:p.use_smooth=True
 growth(o,535+j*12,650+j*6)
 for k in range(5):
  a=2*pi*k/5;v=[(0,0,0),(.08*cos(a-.38),.08*sin(a-.38),-.015),(.24*cos(a),.24*sin(a),-.09),(.08*cos(a+.38),.08*sin(a+.38),-.015)]
  me=bpy.data.meshes.new('Tomato star sepal');me.from_pydata(v,[],[(0,1,2,3)]);me.update();o=bpy.data.objects.new('Tomato calyx %d.%d'%(j,k),me);s.collection.objects.link(o);o.location=(x,y-.08,z-.02);o.parent=rig;o.data.materials.append(calyx);growth(o,530+j*12,610+j*6)

# Automatic care is part of the Blender animation, before each growth transition.
water=material('Irrigation water azure',(.12,.47,.68),.16)
water.node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value=.25
feed=material('Organic fertilizer granules',(.54,.25,.062),.72)
care_windows=[(1,30,58),(142,172,192),(354,384,406),(476,506,530)]
def linear_keys(o,path):
 for fc in o.animation_data.action.fcurves:
  if fc.data_path==path:
   for key in fc.keyframe_points:key.interpolation='LINEAR'
water_mesh=None
for i in range(24):
 o=sphere('Automatic irrigation drop %02d'%i,(0,0,0),(.017,.017,.043),water)
 if water_mesh is None:water_mesh=o.data
 else:o.data=water_mesh
 target=o.scale.copy();o['careEffect']='water'
 for start,wet_end,feed_end in care_windows:
  f=start+(i%8)*2;ox=.83+(i%3)*.15;oy=-.2+(i%4)*.11;tx=(i%7-3)*.13
  for frame,loc,k in [(max(1,f-1),(ox,oy,1.85),.001),(f,(ox,oy,1.85),1),(f+9,((ox+tx)*.5,oy,1.30),1),(f+13,(tx,-.17,.20),.90),(f+18,(tx*.65,-.18,-.155),.60),(f+22,(tx*.12,-.18,-.36),.001)]:
   o.location=loc;o.scale=target*k;o.keyframe_insert(data_path='location',frame=frame);o.keyframe_insert(data_path='scale',frame=frame)
 linear_keys(o,'location');linear_keys(o,'scale')
feed_mesh=None
for i in range(16):
 o=sphere('Automatic organic feed %02d'%i,(0,0,0),(.025,.019,.022),feed);target=o.scale.copy();o['careEffect']='feed'
 if feed_mesh is None:feed_mesh=o.data
 else:o.data=feed_mesh
 for start,wet_end,feed_end in care_windows:
  f=wet_end+(i%6)*2;tx=(i%8-3.5)*.12
  for frame,loc,k in [(f-1,(-.8,-.28,1.15),.001),(f,(-.8,-.28,1.15),1),(f+7,((tx-.8)*.5,-.28,.90),1),(f+13,(tx,-.20,.15),.90),(f+17,(tx*.66,-.19,-.14),.65),(f+21,(tx*.1,-.18,-.31),.001)]:
   o.location=loc;o.scale=target*k;o.keyframe_insert(data_path='location',frame=frame);o.keyframe_insert(data_path='scale',frame=frame)
 linear_keys(o,'location');linear_keys(o,'scale')
# Append the actual reference earth and roots. No blurred framing leaf images.
with bpy.data.libraries.load(ROOT+'/blender/reference_earth.blend',link=False) as (src,dst):dst.collections=[n for n in ['Earth','Roots'] if n in src.collections]
for c in dst.collections:s.collection.children.link(c);c.hide_render=False;c.hide_viewport=False
s.frame_set(672)
root_collection=bpy.data.collections.get('Roots')
# One continuous root collar bridges the plant base to the underground taproot.
collar=tube('Root collar connection',[(0,.03,.28),(.02,-.08,.12),(-.012,-.13,-.25),(.008,-.13,-.48),(-.04,-.15,-1.3),(.06,-.16,-2.3)],.042,bpy.data.materials.get('Living roots - warm ivory'))
for c in list(collar.users_collection):c.objects.unlink(collar)
root_collection.objects.link(collar)
for o in list(root_collection.objects):
 if o.name=='Taproot connection':bpy.data.objects.remove(o,do_unlink=True)
for o in root_collection.objects:o.hide_render=False;o.hide_viewport=False
# Convert curves and join by branch to keep draw calls practical on phones.
for o in list(root_collection.objects):
 match=re.search(r'(?:branch |Lateral |hair )(\d+)',o.name)
 o['rootIndex']=int(match.group(1)) if match else -1
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
 if o.type=='CURVE':o.data.resolution_u=5;o.data.bevel_resolution=1;bpy.ops.object.convert(target='MESH')
for i in range(-1,5):
 group=[o for o in root_collection.objects if o.get('rootIndex')==i]
 if not group:continue
 bpy.ops.object.select_all(action='DESELECT')
 for o in group:o.select_set(True)
 bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();o=bpy.context.object;o.name='Root trunk' if i<0 else 'Guide root %d'%i;o['rootIndex']=i
 # vertices are global-ish: join transforms them to active object local coords.
 o['growthOrigin']=[0,-.25 if i in [0,4] else -.48,0]
# Texture the actual soil meshes using explicit exportable UVs.
soil=material('Live textured earth',(.22,.10,.025),.96);p=soil.node_tree.nodes.get('Principled BSDF');tex=soil.node_tree.nodes.new('ShaderNodeTexImage');source=OUT+'/soil-albedo-v2.webp'
im=bpy.data.images.load(source);im.scale(1024,512)
# Tint the same photographic albedo gradually by depth, with an irregular boundary.
import numpy as np
pixels=np.empty(im.size[0]*im.size[1]*4,dtype=np.float32);im.pixels.foreach_get(pixels)
pixels=pixels.reshape(512,1024,4)
y,x=np.mgrid[0:1:512j,0:1:1024j]
layer=.55+.45*np.clip((y-.58+.045*np.sin(x*22)+.025*np.cos(x*47))/.24,0,1)
deep=.8+.2*np.clip((y-.12+.04*np.sin(x*24))/.23,0,1)
pixels[:,:,:3]*=(deep*layer)[:,:,None]
im.pixels.foreach_set(pixels.ravel());im.pack();tex.image=im;soil.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
earth=bpy.data.collections.get('Earth')
for o in list(earth.objects):
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
 if o.type=='CURVE':o.data.resolution_u=3;o.data.bevel_resolution=0;bpy.ops.object.convert(target='MESH')
 if o.type!='MESH':continue
 if 'cutaway' in o.name or 'surface' in o.name:
  o.data.materials.clear();o.data.materials.append(soil);uv=o.data.uv_layers.new(name='UVMap')
  for poly in o.data.polygons:
   for li in poly.loop_indices:
    v=o.data.vertices[o.data.loops[li].vertex_index].co
    if 'cutaway' in o.name:
     uv.data[li].uv=((v.x+6.7)/13.4,max(.01,min(.99,(v.z+3.9)/4.1)))
    else:uv.data[li].uv=(v.x*.4,v.y*.4)
 if len(o.data.polygons)>5000:
  mod=o.modifiers.new('Mobile geometry budget','DECIMATE');mod.ratio=.22 if 'aggregates' in o.name else .35;bpy.ops.object.modifier_apply(modifier=mod.name)
 o['earthGeometry']=True
# Merge static earth, retaining its physically different materials.
bpy.ops.object.select_all(action='DESELECT');meshes=[o for o in earth.objects if o.type=='MESH']
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();bpy.context.object.name='Blender soil cutaway';bpy.context.object['earthGeometry']=True
# The exported lifecycle is a synchronized clip; guide roots are independently revealed in WebGL.
s.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/blender/start_lifecycle.blend')
bpy.ops.export_scene.gltf(filepath=OUT+'/start-lifecycle.glb',export_format='GLB',export_animations=True,export_animation_mode='SCENE',export_force_sampling=True,export_frame_range=True,export_frame_step=3,export_cameras=False,export_lights=False,export_yup=True,export_extras=True,export_materials='EXPORT',export_image_format='AUTO')
path=OUT+'/start-lifecycle.glb';raw=open(path,'rb').read();size=struct.unpack_from('<I',raw,12)[0];g=json.loads(raw[20:20+size]);binary=raw[20+size:];merged={'name':'Seed to blossom and fruit','samplers':[],'channels':[]}
for a in g.get('animations',[]):
 offset=len(merged['samplers']);merged['samplers'].extend(a['samplers'])
 for c in a['channels']:c['sampler']+=offset;merged['channels'].append(c)
g['animations']=[merged];j=json.dumps(g,separators=(',',':')).encode();j+=b' '*((-len(j))%4);open(path,'wb').write(struct.pack('<III',0x46546c67,2,12+8+len(j)+len(binary))+struct.pack('<II',len(j),0x4e4f534a)+j+binary)
print('LIVE START EXPORT COMPLETE',os.path.getsize(path),flush=True)
