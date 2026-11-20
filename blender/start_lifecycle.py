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
# Use the real leaf albedo on Blender lamina geometry.
m=bpy.data.materials.get('Translucent leaf lamina');p=m.node_tree.nodes.get('Principled BSDF')
im=bpy.data.images.load(OUT+'/leaf-albedo-v2.webp');im.scale(1024,512);im.pack()
tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;m.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color']);p.inputs['Roughness'].default_value=.48;m.use_backface_culling=False

def material(name,c,rough=.55):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=rough;return m
petal=material('Ivory bean blossom',(.95,.83,.54));pollen=material('Pollen gold',(.95,.54,.04));red=material('Ripe tomato red',(.68,.018,.009),.29);calyx=material('Tomato green calyx',(.12,.29,.018),.6);stem=bpy.data.materials.get('Living stem')
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
 for p,co in zip(sp.bezier_points,pts):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,c);s.collection.objects.link(o);o.data.materials.append(mat);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);return o
# Three blooms open, then petals recede while pods swell from their attachment.
for j,(x,y,z) in enumerate([(.57,-.04,1.18),(-.48,-.02,1.40),(.37,-.03,1.69)]):
 base=(x*.68,y,z-.12)
 o=tube('Flower stalk %d'%j,[(0,0,z-.22),base,(x,y,z)],.012,stem);o.parent=rig;growth(o,365+j*10,420+j*10)
 for k in range(5):
  a=2*pi*k/5;o=sphere('Blossom %d petal %d'%(j,k),(x+.09*cos(a),y-.012,z+.08*sin(a)),(.105,.035,.065),petal);o.rotation_euler=(0,-a,0);o.parent=rig;growth(o,410+j*12,470+j*12,(530+j*10,590+j*10))
 o=sphere('Blossom %d pollen'%j,(x,y-.045,z),(.045,.035,.045),pollen);o.parent=rig;growth(o,415+j*12,475+j*12,(535+j*10,590+j*10))
 # Round, subtly lobed tomato body, attached by a green five-point calyx.
 o=sphere('Tomato red fruit %d'%j,(x,y-.018,z-.175),(.205,.185,.19),red);o.parent=rig
 for v in o.data.vertices:
  a=math.atan2(v.co.y,v.co.x);v.co.x*=1+.045*cos(5*a);v.co.y*=1+.045*cos(5*a)
 growth(o,535+j*12,650+j*6)
 for k in range(5):
  a=2*pi*k/5;pts=[(x,y-.018,z+.014),(x+.13*cos(a),y-.018+.13*sin(a),z-.015),(x+.19*cos(a),y-.018+.19*sin(a),z-.06)]
  leaf=tube('Tomato calyx %d %d'%(j,k),pts,.022,calyx);leaf.parent=rig;growth(leaf,530+j*12,585+j*8)
# Actual automatic care: a tilted watering can, falling drops and nutrient pellets.
water=material('Irrigation water blue',(.12,.54,.80),.12)
p=water.node_tree.nodes.get('Principled BSDF');p.inputs['Metallic'].default_value=.15;p.inputs['Coat Weight'].default_value=.65
canmat=material('Enamel watering can',(.055,.24,.16),.28);canmat.node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value=.4
nutrient=material('Organic nutrient granules',(.52,.30,.07),.8)
care_rig=bpy.data.objects.new('Automatic irrigation can',None);s.collection.objects.link(care_rig);care_rig.location=(-1.10,-.1,1.65)
o=sphere('Watering can vessel',(0,0,0),(.22,.16,.25),canmat);o.parent=care_rig
for name,pts,r in [('Watering can spout',[(.12,0,-.03),(.32,0,.06),(.48,0,.16)],.045),('Watering can handle',[(-.15,0,.13),(-.34,0,.17),(-.36,0,-.14),(-.16,0,-.16)],.032)]:
 o=tube(name,pts,r,canmat);o.parent=care_rig
for f,k in [(1,.001),(7,1),(50,1),(62,.001),(170,.001),(180,1),(216,1),(228,.001),(370,.001),(380,1),(412,1),(424,.001),(490,.001),(500,1),(526,1),(538,.001),(672,.001)]:
 care_rig.scale=(k,)*3;care_rig.rotation_euler[1]=.24 if k>0.1 else 0;care_rig.keyframe_insert(data_path='scale',frame=f);care_rig.keyframe_insert(data_path='rotation_euler',frame=f)
# Mesh transforms export to glTF, unlike an offline particle system.
for kind,count,mat,starts,duration in [('Water drop',15,water,[12,183,383,503],30),('Nutrient pellet',10,nutrient,[35,204,404,520],23)]:
 for j in range(count):
  size=.034 if kind=='Water drop' else .027;o=sphere('%s %02d'%(kind,j),(0,0,0),(size,size,size*(1.65 if kind=='Water drop' else 1)),mat);target=o.scale.copy();o['automaticCare']='water' if kind=='Water drop' else 'feed'
  o.scale=(.001,)*3;o.keyframe_insert(data_path='scale',frame=1)
  for start in starts:
   f=start+j*.8
   for frame,t,k in [(f-1,0,.001),(f,0,1),(f+duration*.48,.48,1),(f+duration,.99,.7),(f+duration+2,1,.001)]:
    x=(-.62*(1-t)+.14*sin(j*2.4)*t) if kind=='Water drop' else (.52*(1-t)+.19*cos(j*2.1)*t)
    z=(1.72*(1-t*t)+.18) if kind=='Water drop' else (1.12*(1-t*t)+.17)
    o.location=(x,-.18-.06*sin(j),z);o.scale=target*k;o.keyframe_insert(data_path='location',frame=frame);o.keyframe_insert(data_path='scale',frame=frame)
  o.scale=(.001,)*3;o.keyframe_insert(data_path='scale',frame=672)
  for fc in o.animation_data.action.fcurves:
   for key in fc.keyframe_points:key.interpolation='LINEAR'
# Rebuild roots from one collar. Every secondary/tertiary starts on its parent's centreline.
with bpy.data.libraries.load(ROOT+'/blender/reference_earth.blend',link=False) as (src,dst):dst.collections=[n for n in ['Earth'] if n in src.collections]
for c in dst.collections:s.collection.children.link(c);c.hide_render=False;c.hide_viewport=False
root_collection=bpy.data.collections.new('Roots');s.collection.children.link(root_collection)
rootmat=material('Living connected roots',(.72,.39,.12),.67);p=rootmat.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(.62,.23,.025,1);p.inputs['Emission Strength'].default_value=.85
fine=material('Fine absorbing roots',(.57,.34,.12),.78);p=fine.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(.36,.16,.025,1);p.inputs['Emission Strength'].default_value=.45
# Smooth centreline interpolation shared by all branch attachment calculations.
def point(path,t):
 t=max(0,min(.999999,t))*(len(path)-1);i=int(t);u=t-i
 a=Vector(path[max(0,i-1)]);b=Vector(path[i]);c=Vector(path[min(len(path)-1,i+1)]);d=Vector(path[min(len(path)-1,i+2)])
 return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u)
def pathdistance(path,t):
 samples=[point(path,t*j/40) for j in range(41)];return sum((samples[j]-samples[j-1]).length for j in range(1,41))
def rootmesh(name,path,width,index,mat=rootmat,offset=0):
 vs=[];fs=[];travels=[];N=(len(path)-1)*9;R=7
 for q in range(N+1):
  t=q/N;p=point(path,t);travel=offset+pathdistance(path,t);tangent=(point(path,min(.999999,t+.001))-point(path,max(0,t-.001))).normalized();axis=tangent.cross(Vector((0,1,0))).normalized();other=tangent.cross(axis).normalized();radius=width*(1-t)**1.15+.001
  for k in range(R):
   v=p+radius*(axis*cos(k*2*pi/R)+other*sin(k*2*pi/R));vs.append(tuple(v));travels.append(travel)
 for q in range(N):
  for k in range(R):a=q*R+k;b=q*R+(k+1)%R;fs.append((a,b,b+R,a+R))
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();attr=me.attributes.new('_ROOT_TRAVEL','FLOAT','POINT');attr.data.foreach_set('value',travels);o=bpy.data.objects.new(name,me);root_collection.objects.link(o);o.data.materials.append(mat);o['rootIndex']=index;o['growthOrigin']=[0,.2516,-.03];o['connectedCollar']=True
 for f in me.polygons:f.use_smooth=True
 return o
collar=(0,.03,.2516);neck=(-.006,-.17,-.10)
paths=[
 [collar,neck,(-.48,-.18,-.42),(-1.4,-.18,-.52),(-2.6,-.17,-.82),(-3.75,-.16,-1.10)],
 [collar,neck,(-.26,-.18,-.59),(-.78,-.18,-1.03),(-1.40,-.17,-1.24),(-1.96,-.16,-1.50)],
 [collar,neck,(.025,-.18,-.60),(-.02,-.18,-1.08),(0,-.17,-1.70)],
 [collar,neck,(.30,-.18,-.56),(.86,-.18,-.94),(1.40,-.17,-1.27),(1.94,-.16,-1.48)],
 [collar,neck,(.48,-.18,-.39),(1.43,-.18,-.54),(2.64,-.17,-.78),(3.75,-.16,-1.10)]]
rootmesh('Root collar', [collar,neck,(0,-.18,-.47)],.047,-1)
for i,path in enumerate(paths):
 rootmesh('Guide root primary %d'%i,path,.038 if i!=2 else .041,i)
 for j in range(12):
  t=.28+j*.055+.012*sin(j*2.3+i);a=point(path,t);direction=-1 if j%2==0 else 1;length=(.48+.17*sin(j*1.7+i))*(1-t*.4)
  tangent=(point(path,t+.015)-point(path,t-.015)).normalized();normal=Vector((-tangent.z,0,tangent.x))*direction
  end=a+normal*length+Vector((0,-.005,-.11));mid=a.lerp(end,.55)+Vector((.035*sin(i+j),0,.025));side=[tuple(a),tuple(mid),tuple(end)]
  rootmesh('Lateral %d %d'%(i,j),side,.0105*(1-t*.6),i,offset=pathdistance(path,t))
  for k in range(3):
   p=point(side,.38+k*.20);tip=p+Vector((normal.x*.10*(-1 if k%2 else 1),-.002,-.12-.035*k));rootmesh('Absorbing %d %d %d'%(i,j,k),[tuple(p),tuple(p.lerp(tip,.6)+Vector((.012,0,0))),tuple(tip)],.0035,i,fine,offset=pathdistance(path,t)+pathdistance(side,.38+k*.20))
for i in range(-1,5):
 group=[o for o in root_collection.objects if o.get('rootIndex')==i];bpy.ops.object.select_all(action='DESELECT')
 for o in group:o.select_set(True)
 bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();o=bpy.context.object;o.name='Root trunk' if i<0 else 'Guide root %d'%i;o['rootIndex']=i;o['growthOrigin']=[0,.2516,-.03];o['connectedCollar']=True
 attr=o.data.attributes['_ROOT_TRAVEL'];maximum=max(a.value for a in attr.data)
 for a in attr.data:a.value/=maximum
s.frame_set(672)
# Texture the actual soil meshes using explicit exportable UVs.
soil=material('Live textured earth',(.22,.10,.025),.96);p=soil.node_tree.nodes.get('Principled BSDF');tex=soil.node_tree.nodes.new('ShaderNodeTexImage');im=bpy.data.images.load(OUT+'/soil-albedo-v2.webp');im.scale(1024,1024);im.pack();tex.image=im;soil.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
earth=bpy.data.collections.get('Earth')
for o in list(earth.objects):
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
 if o.type=='CURVE':o.data.resolution_u=3;o.data.bevel_resolution=0;bpy.ops.object.convert(target='MESH')
 if o.type!='MESH':continue
 if 'cutaway' in o.name or 'surface' in o.name:
  o.data.materials.clear();o.data.materials.append(soil);uv=o.data.uv_layers.new(name='UVMap')
  for poly in o.data.polygons:
   for li in poly.loop_indices:
    v=o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=(v.x*.4,(v.z if 'cutaway' in o.name else v.y)*.4)
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
bpy.ops.export_scene.gltf(filepath=OUT+'/start-lifecycle.glb',export_format='GLB',export_animations=True,export_animation_mode='SCENE',export_force_sampling=True,export_frame_range=True,export_frame_step=3,export_cameras=False,export_lights=False,export_yup=True,export_extras=True,export_attributes=True,export_materials='EXPORT',export_image_format='AUTO')
path=OUT+'/start-lifecycle.glb';raw=open(path,'rb').read();size=struct.unpack_from('<I',raw,12)[0];g=json.loads(raw[20:20+size]);binary=raw[20+size:];merged={'name':'Seed to blossom and fruit','samplers':[],'channels':[]}
for a in g.get('animations',[]):
 offset=len(merged['samplers']);merged['samplers'].extend(a['samplers'])
 for c in a['channels']:c['sampler']+=offset;merged['channels'].append(c)
g['animations']=[merged];j=json.dumps(g,separators=(',',':')).encode();j+=b' '*((-len(j))%4);open(path,'wb').write(struct.pack('<III',0x46546c67,2,12+8+len(j)+len(binary))+struct.pack('<II',len(j),0x4e4f534a)+j+binary)
print('LIVE START EXPORT COMPLETE',os.path.getsize(path),flush=True)
