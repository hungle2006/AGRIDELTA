"""AGRIDELTA — From Seed to Harvest / Blender 4.2+ (Cycles / glTF export)

Run from the project root:
    blender --background --python blender/seed_to_harvest.py

Output under assets/:
    seed_to_harvest.blend      editable Blender scene
    seed_to_harvest.glb        3D scene with object keyframes and transforms
    seed_to_harvest_poster.png  rendered poster still (Blender installed)

Timeline at 24fps, 480 frames (~20 seconds):
  001-066 seed falls into soil, bounces, coat cracks
  050-125 roots extend under soil (bevel_factor_end)
  094-190 plant stem lifts, leaves unfurl
  185-250 transparent raindrops fall and ripple
  240-360 healthy mature plant and rice panicles bloom
  360-480 golden-hour camera finishes to "good harvest"

The web UI also contains a canvas-based offline cinematic. That fallback is NOT
Blender-rendered; this script creates the genuine 3D authoring deliverables.
"""
from __future__ import annotations
import bpy
import math
import os
import random
from mathutils import Vector
from math import sin, cos, pi

random.seed(20261118)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSETS = os.path.join(ROOT, "public", "assets")
os.makedirs(ASSETS, exist_ok=True)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for mat in list(bpy.data.materials):
    if mat.users == 0:
        bpy.data.materials.remove(mat)
scene = bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.render.resolution_x=1600
scene.render.resolution_y=900
scene.render.resolution_percentage=80
scene.render.image_settings.file_format='PNG'
scene.frame_start=1
scene.frame_end=480
scene.render.fps=24
scene.world.color=(0.032,0.063,0.04)
scene.view_settings.view_transform='AgX'

# --- physically inspired color/roughness from soil to chlorophyll ---
def mat(name, rgb, roughness=0.67, metallic=0.0, transmission=0.0, alpha=1):
    m=bpy.data.materials.new(name);m.diffuse_color=(*rgb, alpha);m.use_nodes=True
    bsdf=m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value=(*rgb,alpha)
    bsdf.inputs['Roughness'].default_value=roughness
    bsdf.inputs['Metallic'].default_value=metallic
    if 'Transmission Weight' in bsdf.inputs: bsdf.inputs['Transmission Weight'].default_value=transmission
    if 'Alpha' in bsdf.inputs: bsdf.inputs['Alpha'].default_value=alpha
    return m

soil=mat('Rich living soil · wet cocoa',(0.135,.096,.060),.94)
soillight=mat('Granules · toasted umber',(.26,.185,.105),.96)
soilchar=mat('Granules · dark charcoal',(.058,.059,.042),.99)
seedmat=mat('Seed husk · tan and umber',(.41,.243,.104),.48)
seedlight=mat('Seed interior · warm oat',(.77,.64,.4),.63)
stemmat=mat('Stalk · chlorophyll',(.15,.38,.095),.36)
leafmat=mat('Leaf · translucent green',(.26,.51,.12),.39)
leaflighter=mat('Leaf · sunlit green',(.38,.68,.19),.43)
veinmat=mat('Veins · jade pale',(.51,.68,.30),.56)
rootmat=mat('Roots · amber hair',(.55,.37,.19),.85)
watermat=mat('Rain · glistening translucent',(.58,.78,.86),.04,0,.92,.33)
grainmat=mat('Harvest · golden grain',(.74,.55,.19),.62)

# Procedural bumps: soil is not a perfectly flat brown cylinder.
bsdf=soil.node_tree.nodes.get('Principled BSDF'); tex=soil.node_tree.nodes.new('ShaderNodeTexNoise'); tex.inputs['Scale'].default_value=28
bump=soil.node_tree.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=.42; bump.inputs['Distance'].default_value=.12
soil.node_tree.links.new(tex.outputs['Fac'],bump.inputs['Height'])
soil.node_tree.links.new(bump.outputs['Normal'],bsdf.inputs['Normal'])

# --- shared helpers ---
def smoother(ob):
    if ob.type=='MESH':
        for face in ob.data.polygons: face.use_smooth=True
    return ob

def uv(name,loc,scale,material,segments=24,rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc)
    ob=bpy.context.object;ob.name=name;ob.scale=scale;ob.data.materials.append(material);smoother(ob)
    return ob

def curve(name,points,material,bevel=.025,resolution=14):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.resolution_u=resolution
    spline=data.splines.new('BEZIER');spline.bezier_points.add(len(points)-1)
    for p,co in zip(spline.bezier_points,points):
        p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    data.bevel_resolution=3;data.bevel_depth=bevel
    ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material)
    return ob

def key(ob,path,keys,interp='BEZIER'):
    for frame,value in keys:
        setattr(ob,path,value)
        ob.keyframe_insert(data_path=path,frame=frame)
    if ob.animation_data and ob.animation_data.action:
        act=ob.animation_data.action
        if hasattr(act,'fcurves'):
            for fc in act.fcurves:
                for pt in fc.keyframe_points: pt.interpolation=interp

# Soil geological cross-section: irregular mound rather than floating disc.
verts=[];faces=[];N=80;R=2.25
verts.append((0,0,.02))
for i in range(N):
    a=2*pi*i/N;r=R*(.96+.04*random.random());z=-.035+.07*random.random()
    verts.append((r*cos(a),r*sin(a),z))
for i in range(N):faces.append((0,1+i,1+(i+1)%N))
for i in range(N):
    x,y,z=verts[1+i];verts.append((x,y,-.35))
for i in range(N):faces.append((1+i,1+(i+1)%N,1+N+(i+1)%N,1+N+i))
mesh=bpy.data.meshes.new('organic soil mesh');mesh.from_pydata(verts,[],faces);mesh.update()
ground=bpy.data.objects.new('Soil · textured cross-section',mesh);bpy.context.collection.objects.link(ground);ground.data.materials.append(soil)
# Scatter 250 clods / pebbles, intentionally no repeated exact pattern.
for i in range(260):
    a=random.uniform(-pi,pi);r=random.uniform(.07,2.05);z=random.uniform(-.04,.07)
    ob=uv(f'Soil grain {i+1:03d}',(r*cos(a),r*sin(a),z),(.016+.03*random.random(),.014+.025*random.random(),.009+.023*random.random()),soillight if i%3 else soilchar,8,4)
    ob.rotation_euler=(random.random(),random.random(),random.random())

# Seed shell moves dynamically, splits at the moment of germination.
seed=uv('Seed · falling and settling',(-.05,0,3.0),(.16,.11,.245),seedmat,48,24)
seed.rotation_euler=(0,.4,.35)
key(seed,'location',[(1,(-.06,0,3.6)),(36,(0,0,.28)),(46,(0,0,.43)),(57,(0,0,.19))])
key(seed,'rotation_euler',[(1,(0,.2,1.7)),(57,(0,.12,.36))])
seedcoat=uv('Split seed coat',(.1,.04,.2),(.115,.125,.11),seedlight)
key(seedcoat,'scale',[(1,(0,0,0)),(58,(0,0,0)),(85,(.11,.1,.09)),(155,(.11,.1,.09))])
key(seedcoat,'location',[(58,(0,0,.19)),(105,(.25,-.03,.055))])

# Fine roots extend into soil (a rendered cross-section can reveal them).
for i in range(28):
    angle=2*pi*i/28
    depth=random.uniform(.35,1.2)
    distance=random.uniform(.25,.9)
    pts=[(0,0,.035),(distance*.23*cos(angle),distance*.23*sin(angle),-.18),
         (distance*.7*cos(angle),distance*.7*sin(angle),-.49),
         (distance*cos(angle),distance*sin(angle),-depth)]
    r=curve('Root thread {:02d}'.format(i),pts,rootmat,random.uniform(.004,.011))
    key(r.data,'bevel_factor_end',[(1,0),(64+i%9,0),(125+i%9,1)],'BEZIER')

# Main stem bends organically, grows instead of abruptly changing height.
stem=curve('Stem · primary upward growth',[(0,0,.0),(-.045,0,.55),(.04,.01,1.24),(.12,.02,1.85)],stemmat,.052)
key(stem.data,'bevel_factor_end',[(1,0),(83,0),(198,1)])
# Stems for secondary leaves; these appear gradually.
for i,ang in enumerate([.32,2.4,-.55,2.9, .14,-.35]):
    z=.35+i*.235
    radius=.50+i*.04
    p0=(.015,0,z);p1=(radius*.24*cos(ang),radius*.24*sin(ang),z+.17)
    p2=(radius*cos(ang),radius*sin(ang),z+.24)
    branch=curve('Petiole · {:02d}'.format(i),[p0,p1,p2],stemmat,.018)
    key(branch.data,'bevel_factor_end',[(1,0),(110+i*22,0),(168+i*22,1)])

# Parametric real mesh leaves: tapering lamina with central ridge and curling tips.
def leaf_mesh(name,base,direction,length,width,material):
    direction=Vector(direction).normalized();up=Vector((0,0,1))
    side=direction.cross(up).normalized()
    if side.length<.01:side=Vector((1,0,0))
    verts=[];faces=[];nx=22;ny=10
    for i in range(nx+1):
        t=i/nx
        amp=(sin(pi*t)**.92)*width
        curveup=.11*sin(pi*t)+.18*t*t
        for j in range(ny+1):
            q=2*j/ny-1
            p=Vector(base)+direction*length*t+side*q*amp+up*(curveup+.085*(1-q*q)*sin(pi*t))
            verts.append(tuple(p))
    for i in range(nx):
        for j in range(ny):
            a=i*(ny+1)+j;faces.append((a,a+1,a+ny+2,a+ny+1))
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
    ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);ob.data.materials.append(material);smoother(ob)
    return ob

for i,ang in enumerate([.32,2.4,-.55,2.9,.14,-.35]):
    z=.58+i*.21
    d=(cos(ang),sin(ang),.1)
    ob=leaf_mesh('Leaf blade · {:02d}'.format(i),(.01,0,z),d,.65+i*.065,.15+i*.012,leafmat if i%2 else leaflighter)
    target=(1,1,1)
    key(ob,'scale',[(1,(.001,.001,.001)),(120+i*24,(.001,.001,.001)),(197+i*18,target)])
    ob.rotation_mode='XYZ'
    key(ob,'rotation_euler',[(170+i*16,(0,0,.13)),(340,(0,0,-.04))])

# Golden rice panicles in background to tell the positive-season finale.
for i in range(21):
    angle=2*pi*i/21; radius=random.uniform(1.4,2.05)
    sx=radius*cos(angle);sy=radius*sin(angle);height=random.uniform(1.25,2.2)
    panicle=curve('Harvest · rice stalk {:02d}'.format(i),[(sx,sy,0),(sx-.07,sy,height*.45),(sx+.12,sy,height)],stemmat,.023)
    start=248+i%7*5; end=351+i%7*5
    key(panicle.data,'bevel_factor_end',[(1,0),(start,0),(end,1)])
    for j in range(6):
        z=height-.1-j*.14;rad=.09+j*.04
        ear=uv('Rice grain {:02d}.{:02d}'.format(i,j),(sx+(.12 if j%2==0 else -.08),sy,z),(rad*.55,rad*.3,rad*.9),grainmat,12,8)
        key(ear,'scale',[(1,(.001,.001,.001)),(start+25,(.001,.001,.001)),(end+8,(rad*.55,rad*.3,rad*.9))]);ear.rotation_euler=(.1,.5,1.3*j)

# Water spray: not decorative dots, refractive droplets with staggered motion.
for i in range(74):
    x=random.uniform(-1.4,1.2);y=random.uniform(-1,.9)
    start=174+i%22; impact=223+i%18
    drop=uv('Rain drop {:03d}'.format(i),(x,y,3.8),(.018,.018,.04),watermat,12,8)
    key(drop,'location',[(1,(x,y,3.8)),(start,(x,y,3.8)),(impact,(x+.1,y,random.uniform(.15,.65)))])
    key(drop,'scale',[(1,(.001,.001,.001)),(start,(.018,.018,.042)),(impact+1,(.001,.001,.001))])

# Warm back rim lighting and cool fill.
def area(name,loc,power,color,size,target=(0,0,0)):
    bpy.ops.object.light_add(type='AREA',location=loc)
    light=bpy.context.object;light.name=name;light.data.energy=power;light.data.color=color;light.data.shape='DISK';light.data.size=size
    direction=Vector(target)-light.location;light.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
area('Sunrise key · soft amber',(-3,-5,7),1200,(1,.83,.58),5)
area('Forest bounce · leaf green',(4,2,4),840,(.57,.92,.59),4)
area('Rim · backlight',(0,5,6),1600,(.92,.99,.75),3)

# Camera gently travels from seed close-up to big harvest scene.
bpy.ops.object.camera_add(location=(3.5,-7,3.9));cam=bpy.context.object;cam.name='Cinematic camera · seed to harvest'
scene.camera=cam;cam.data.type='PERSP';cam.data.lens=48
key(cam,'location',[(1,(2.3,-4.6,2.2)),(90,(2.7,-4.8,2.1)),(230,(3.8,-6.8,3.1)),(360,(4.3,-8.0,3.4)),(480,(4.8,-8.1,3.6))])
for f,point in [(1,(0,0,.15)),(90,(0,0,.23)),(230,(0,0,.96)),(360,(0,0,.94)),(480,(0,0,.9))]:
    cam.rotation_euler=(Vector(point)-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.keyframe_insert(data_path='rotation_euler',frame=f)

# Set the poster frame to the lush mature scene.
scene.frame_set(365)
scene.render.filepath=os.path.join(ASSETS,'seed_to_harvest_poster.png')

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ASSETS,'seed_to_harvest.blend'))
print('Saved .blend under', ASSETS)
try:
    # Blender 4 exporter retains compatible object transform animation.
    bpy.ops.export_scene.gltf(filepath=os.path.join(ASSETS,'seed_to_harvest.glb'),
                              export_format='GLB',export_animations=True,
                              export_apply=False,export_yup=True)
    print('Saved .glb under', ASSETS)
except Exception as e:
    print('glTF export unavailable:',e)
try:
    bpy.ops.render.render(write_still=True)
    print('Saved poster PNG under', ASSETS)
except Exception as e:
    print('Poster render unavailable:',e)
