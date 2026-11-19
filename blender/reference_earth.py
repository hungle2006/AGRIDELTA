"""AGRIDELTA reference scene: botanical seedling, moist soil cutaway and branching roots.
All visible plant/soil/root/orb geometry is authored here in Blender. The distant
landscape is a separate photographic raster backdrop; interface text stays HTML.
Run: blender -b -t 6 --python blender/reference_earth.py
"""
import bpy, math, random, os, json
from mathutils import Vector
from math import sin,cos,pi
from bpy_extras.object_utils import world_to_camera_view
random.seed(7319)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT=ROOT+'/public/assets'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=48;s.cycles.use_denoising=False
s.render.resolution_x=1600;s.render.resolution_y=893;s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.film_transparent=True
s.view_settings.view_transform='AgX';s.render.fps=24
# Warm backlight and a physically lit sky remain active even with transparent film.
s.world.use_nodes=True;wn=s.world.node_tree.nodes;wb=wn.get('Background');sky=wn.new('ShaderNodeTexSky');sky.sky_type='NISHITA';sky.sun_elevation=.12;sky.sun_rotation=2.6;sky.sun_disc=False;wb.inputs['Strength'].default_value=.14;s.world.node_tree.links.new(sky.outputs['Color'],wb.inputs['Color'])
COL={}
def collection(name):
 c=bpy.data.collections.new(name);s.collection.children.link(c);COL[name]=c;return c
for n in ['Earth','Roots','Plant','Extra leaves','Flowers','Pods','Foreground','Studio']:collection(n)
def into(o,col):
 for c in list(o.users_collection):c.objects.unlink(o)
 COL[col].objects.link(o);return o

def mat(name,rgb,rough=.5,emit=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*rgb,1)
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*rgb,1);p.inputs['Roughness'].default_value=rough
 if emit:p.inputs['Emission Color'].default_value=(*rgb,1);p.inputs['Emission Strength'].default_value=emit
 return m
soil=mat('Moist humus - porous earth',(.035,.011,.003),.94)
n=soil.node_tree.nodes;l=soil.node_tree.links;p=n.get('Principled BSDF')
t=n.new('ShaderNodeTexNoise');t.inputs['Scale'].default_value=48;t.inputs['Detail'].default_value=5;t.inputs['Roughness'].default_value=.8
r=n.new('ShaderNodeValToRGB');r.color_ramp.elements[0].position=.18;r.color_ramp.elements[0].color=(.003,.001,.0003,1);r.color_ramp.elements[1].position=.8;r.color_ramp.elements[1].color=(.11,.044,.012,1);l.new(t.outputs['Fac'],r.inputs[0]);l.new(r.outputs['Color'],p.inputs['Base Color'])
b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.68;b.inputs['Distance'].default_value=.032;l.new(t.outputs['Fac'],b.inputs['Height']);l.new(b.outputs['Normal'],p.inputs['Normal'])
# Photographic albedo is mapped over actual Blender soil geometry, with bump.
soil_image=bpy.data.images.load(OUT+'/soil-albedo-v2.webp');soil_image.pack()
soil_tex=n.new('ShaderNodeTexImage');soil_tex.image=soil_image;soil_tex.projection='BOX';soil_tex.projection_blend=.25
coords=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(3.4,1.6,1.4)
l.new(coords.outputs['Generated'],mapping.inputs['Vector']);l.new(mapping.outputs['Vector'],soil_tex.inputs['Vector']);l.new(soil_tex.outputs['Color'],p.inputs['Base Color']);l.new(soil_tex.outputs['Color'],b.inputs['Height'])
clods=[mat('Earth aggregate %d'%i,(.013+i*.006,.004+i*.0026,.001+i*.0007),.96) for i in range(12)]
stemmat=mat('Soft translucent green stem',(.29,.43,.035),.43);stemmat.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value=.18
vein=mat('Raised yellow-green midrib',(.46,.55,.14),.48)
rootmat=mat('Living roots - warm ivory',(.50,.25,.07),.62,.72)
fineroot=mat('Root hairs - fine cream',(.42,.20,.061),.8,.65)
brightroot=mat('Selected root illumination',(.9,.53,.16),.4,5)
seedmat=mat('Brown seed husk',(.25,.10,.025),.52)
seedmat.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value=.08
leafmat=mat('Young leaf - real lamina texture',(.4,.55,.08),.4)
p=leafmat.node_tree.nodes.get('Principled BSDF');p.inputs['Subsurface Weight'].default_value=.10;p.inputs['Subsurface Radius'].default_value=(.16,.26,.04);p.inputs['Transmission Weight'].default_value=.08
im=bpy.data.images.load(OUT+'/leaf-albedo-v2.webp');im.pack();tex=leafmat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;mix=leafmat.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(.66,.79,.44,1);leafmat.node_tree.links.new(tex.outputs['Color'],mix.inputs[1]);leafmat.node_tree.links.new(mix.outputs[0],p.inputs['Base Color'])
b=leafmat.node_tree.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=.14;b.inputs['Distance'].default_value=.009;leafmat.node_tree.links.new(tex.outputs['Color'],b.inputs['Height']);leafmat.node_tree.links.new(b.outputs['Normal'],p.inputs['Normal'])
water=mat('Clear surface-tension dew',(.94,.98,1),.025);p=water.node_tree.nodes.get('Principled BSDF');p.inputs['IOR'].default_value=1.333;p.inputs['Transmission Weight'].default_value=1
petal=mat('Bean blossom - warm ivory',(.88,.83,.57),.58)
podmat=mat('Bean pod green',(.22,.32,.025),.45)

def smooth(o):
 if o.type=='MESH':
  for f in o.data.polygons:f.use_smooth=True
 return o

def mesh(name,verts,faces,material,col):
 m=bpy.data.meshes.new(name);m.from_pydata(verts,[],faces);m.update();o=bpy.data.objects.new(name,m);COL[col].objects.link(o);o.data.materials.append(material);return smooth(o)

def sphere(name,loc,scale,material,col='Plant',seg=20,rings=12):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(material);smooth(o);return into(o,col)

def curve(name,pts,r,material,col='Roots'):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=12;c.bevel_depth=r;c.bevel_resolution=2
 sp=c.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
 for p,co in zip(sp.bezier_points,pts):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 for i,p in enumerate(sp.bezier_points):p.radius=max(.09,1-(i/max(1,len(pts)-1))*.88)
 o=bpy.data.objects.new(name,c);COL[col].objects.link(o);o.data.materials.append(material);return o

def h(x,y):return .17*math.exp(-x*x/1.05)+.028*sin(4*x)+.024*sin(11*x+2*y)+.015*cos(17*x-4*y)-.02*y
# A physically rough vertical soil cut face and a shallow top extending into the valley.
verts=[];faces=[];NX=240;NZ=130
for iz in range(NZ+1):
 d=iz/NZ
 for ix in range(NX+1):
  x=-6.7+13.4*ix/NX;z=h(x,0)-d*3.9
  y=.022*sin(x*51+iz*.7)+.009*cos(x*107-iz*.4)
  verts.append((x,y,z))
for iz in range(NZ):
 for ix in range(NX):
  a=iz*(NX+1)+ix;faces.append((a,a+1,a+NX+2,a+NX+1))
mesh('Earth cutaway - irregular humus layers',verts,faces,soil,'Earth')
verts=[];faces=[];NY=30
for j in range(NY+1):
 y=j/NY*1.5
 for i in range(NX+1):
  x=-6.7+13.4*i/NX;verts.append((x,y,h(x,y)+.016*random.random()))
for j in range(NY):
 for i in range(NX):
  a=j*(NX+1)+i;faces.append((a,a+NX+1,a+NX+2,a+1))
mesh('Moist soil surface and central seed mound',verts,faces,soil,'Earth')
# Granules use one consolidated geometry and varied physical colours, not repeated dots.
# Consolidated, irregular top and cut-face particles: true micro geometry.
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1)
base=bpy.context.object;bv=[v.co.copy() for v in base.data.vertices];bf=[tuple(f.vertices) for f in base.data.polygons];bpy.data.objects.remove(base,do_unlink=True)
v=[];f=[];materials=[]
for i in range(6700):
 if i<1800:
  x=random.uniform(-6.6,6.6);y=random.uniform(-.015,1.48);z=h(x,max(0,y));sz=random.uniform(.008,.048)
 else:
  x=random.uniform(-6.6,6.6);z=random.uniform(-3.7,h(x,0));y=-.027;sz=random.uniform(.008,.043)
 scale=(sz*random.uniform(.75,1.4),sz*random.uniform(.50,1.0),sz*random.uniform(.5,1.05));off=len(v)
 for q in bv:v.append((x+q.x*scale[0],y+q.y*scale[1],z+q.z*scale[2]))
 for face in bf:f.append(tuple(off+j for j in face));materials.append(random.randrange(len(clods)))
o=mesh('Crumbly soil aggregates and cut-face pores',v,f,clods[0],'Earth')
for m in clods[1:]:o.data.materials.append(m)
for face,mi in zip(o.data.polygons,materials):face.material_index=mi
# Larger minerals distributed sparingly near the soil surface.
for i in range(29):
 x=random.uniform(-5.3,5.3);y=random.uniform(.1,.9)
 o=sphere('Dew on soil %02d'%i,(x,y,h(x,y)+.06),(.032,.032,.028),water,'Earth',16,10)
# Seed left of the emergent shoot: crease and shell highlights.
seed=sphere('Opened bean seed',(-.31,.04,.25),(.30,.18,.17),seedmat,'Plant',40,24);seed.rotation_euler=(.15,.12,-.24)
curve('Seed coat crease',[(-.54,-.09,.27),(-.34,-.135,.32),(-.12,-.07,.27)],.012,mat('Husk crease',(.065,.017,.004),.75),'Plant')
# The shoot curves gently, without whole-object scaling or spinning.
curve('Primary shoot',[(0,.03,.19),(.015,.035,.58),(-.025,.035,1.13),(-.07,.035,1.48),(-.065,.035,1.51)],.043,stemmat,'Plant')
curve('Shoot highlight',[(-.022,-.001,.25),(-.018,.003,.82),(-.056,.003,1.45)],.008,vein,'Plant')

# Leaf mesh is modelled around its own botanical attachment, with a tapered lamina,
# a rolled edge and a downward-curled tip. The U axis follows the midrib.
def leaf(name,base,tip,width,col='Plant',dew=True):
 base=Vector(base);tip=Vector(tip);axis=tip-base;side=axis.normalized().cross(Vector((0,-1,.18))).normalized()
 if side.z<0:side=-side
 up=axis.normalized().cross(side).normalized()
 if up.z<0:up=-up
 NX=62;NY=24;verts=[];faces=[]
 def point(t,q):
  center=base+axis*t;profile=sin(pi*t)**.74
  width_here=width*profile*(1+.05*sin(17*pi*t)*abs(q))
  return center+side*(q*width_here)+up*(.12*sin(pi*t)-.10*t**5+.045*(1-q*q)*sin(pi*t)+.018*q*sin(4*pi*t))
 for i in range(NX+1):
  for j in range(NY+1):verts.append(tuple(point(i/NX,2*j/NY-1)))
 for i in range(NX):
  for j in range(NY):
   a=i*(NY+1)+j;faces.append((a,a+1,a+NY+2,a+NY+1))
 o=mesh(name,verts,faces,leafmat,col);uv=o.data.uv_layers.new()
 for poly in o.data.polygons:
  for li in poly.loop_indices:
   vi=o.data.loops[li].vertex_index;uv.data[li].uv=(vi//(NY+1)/NX,vi%(NY+1)/NY)
 curve(name+' raised midrib',[tuple(point(t,0)+Vector((0,-.007,.006))) for t in [0,.2,.4,.65,.85,1]],.006,vein,col)
 if dew:
  for k in range(19):
   t=random.uniform(.14,.89);q=random.uniform(-.75,.75);pos=point(t,q)+up*.017
   r=random.uniform(.012,.031);o=sphere(name+' dew %02d'%k,tuple(pos),(r,r,r*.63),water,col,16,10)
 return point
# Direction and proportions follow the supplied three-leaf silhouette.
left=leaf('Primary left leaf',(-.09,.04,1.40),(-1.62,.10,1.71),.35)
right=leaf('Primary right leaf',(-.07,.06,1.48),(1.43,.17,2.37),.42)
leaf('Young right leaf',(-.025,.035,.72),(.92,-.025,1.03),.22)
curve('Left petiole',[(-.07,.04,1.38),(-.30,.04,1.52),(-.48,.04,1.58)],.018,stemmat,'Plant')
# A pendant droplet hangs from the right tip in the reference.
sphere('Pendant dew at right tip',(1.43,.17,2.295),(.037,.037,.058),water,'Plant',24,16)
leaf('Later left leaf',(0,.08,.95),(-.97,.13,1.21),.27,'Extra leaves')
leaf('Later crown leaf',(-.06,.08,1.62),(.35,.12,2.03),.20,'Extra leaves')
for i in range(5):
 a=i*2*pi/5;sp=sphere('Small bean blossom petal',(1.05+.095*cos(a),.02,1.27+.095*sin(a)),(.10,.045,.055),petal,'Flowers',20,12);sp.rotation_euler=(0,a,0)
curve('Flower peduncle',[(.01,.04,1.02),(.57,.05,1.20),(1.05,.02,1.27)],.014,stemmat,'Flowers')
pod=sphere('Green bean pod',(.86,.01,1.0),(.065,.065,.36),podmat,'Pods',28,18);pod.rotation_euler=(0,.4,0)
curve('Pod stalk',[(.02,.04,1.17),(.54,.04,1.3),(.73,.02,1.28)],.015,stemmat,'Pods')

# Five anatomically branching root systems fan out to the five guide endpoints.
anchors=[(-3.75,-.13,-1.10),(-1.96,-.13,-1.50),(0,-.13,-1.70),(1.94,-.13,-1.48),(3.75,-.13,-1.10)]
primary=[]
from mathutils.geometry import interpolate_bezier
for i,(x,y,z) in enumerate(anchors):
 depth=.25 if i in [0,4] else .48
 if i==2:pts=[(0,-.085,.13),(.035,-.12,-.38),(-.018,-.13,-.96),(0,-.15,-1.70)]
 else:pts=[(0,-.10,-depth),(x*.15,-.12,-depth-.20),(x*.36,-.13,-depth-.29),(x*.64,-.14,z*.75),(x,-.15,z)]
 o=curve('Guide root branch %d'%i,pts,.035 if i!=2 else .045,rootmat);primary.append(o)
 bpy.context.view_layer.update();points=[];sp=o.data.splines[0]
 for p0,p1 in zip(sp.bezier_points,sp.bezier_points[1:]):points.extend(interpolate_bezier(p0.co,p0.handle_right,p1.handle_left,p1.co,24))
 for j in range(16):
  fraction=.16+j*.049;pt=points[min(len(points)-1,int(fraction*(len(points)-1)))];bx,by,bz=pt
  sign=(1 if x>0 else -1) if j%3 else (-1 if x>0 else 1)
  ex=bx+sign*random.uniform(.12,.50);ez=bz-random.uniform(.12,.55)
  pts2=[(bx,by-.012,bz),(bx+(ex-bx)*.22,by-.03,bz-.035),(bx+(ex-bx)*.67,by-.037,ez+.08),(ex,by-.045,ez)]
  branch=curve('Lateral %d.%02d'%(i,j),pts2,random.uniform(.007,.012),rootmat)
  bpy.context.view_layer.update();p0,p1=branch.data.splines[0].bezier_points[:2]
  for k in range(4):
   u=.12+.20*k;hx=bx+(ex-bx)*u;hz=bz+(ez-bz)*u
   curve('Root hair %d.%d.%d'%(i,j,k),[(hx,by-.055,hz),(hx+sign*.05,by-.06,hz-.05),(hx+sign*random.uniform(.10,.22),by-.065,hz-random.uniform(.09,.23))],.0028,fineroot)
# The central taproot continues past the large branch junctions.
curve('Taproot connection',[(0,-.10,.14),(.015,-.13,-.40),(-.015,-.15,-1.30),(.04,-.16,-2.30)],.040,rootmat)
# Out-of-focus foreground foliage frames the scene as in the photograph.
for base,tip,w in [((-5.9,-2.8,-.55),(-4.2,-3.0,-.30),.48),((-5.5,-3,-2.1),(-3.2,-3.2,-1.82),.52),((5.9,-3,1.95),(4.3,-3.1,2.25),.58),((5.8,-3,-2.2),(3.9,-3.2,-2.0),.48),((-5.6,-3,2.0),(-4.5,-3.1,2.25),.40)]:leaf('Foreground leaf',base,tip,w,'Foreground',False)

# Fixed camera: the top of the soil falls at about 47% of frame height.
bpy.ops.object.camera_add(location=(0,-13,2.2));cam=into(bpy.context.object,'Studio');cam.name='Reference fixed camera';target=Vector((0,0,-.16));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=11.1;s.camera=cam
focus=bpy.data.objects.new('Focus seedling',None);COL['Studio'].objects.link(focus);focus.location=(0,0,.55);cam.data.dof.use_dof=True;cam.data.dof.focus_object=focus;cam.data.dof.aperture_fstop=3.8

def area(name,loc,power,color,size,target=(0,0,.3)):
 bpy.ops.object.light_add(type='AREA',location=loc);o=into(bpy.context.object,'Studio');o.name=name;o.data.energy=power;o.data.color=color;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Golden morning rim',(-3.6,2.2,3.8),800,(1,.68,.32),2.5)
area('Open sky fill',(-2.5,-4,5),300,(.7,.84,1),5)
area('Soft leaf-side bounce',(4,-1,3.8),190,(.90,1,.65),3)
# Gentle optical bloom on warm roots and dew glints, not an interface gradient.
s.use_nodes=True;nodes=s.node_tree.nodes;nodes.clear();rl=nodes.new('CompositorNodeRLayers');gl=nodes.new('CompositorNodeGlare');gl.glare_type='FOG_GLOW';gl.quality='HIGH';gl.threshold=1.8;gl.size=7;gl.mix=-.88;co=nodes.new('CompositorNodeComposite');s.node_tree.links.new(rl.outputs['Image'],gl.inputs['Image']);s.node_tree.links.new(gl.outputs['Image'],co.inputs['Image'])
# UI anchors are projected from the actual scene, so clickable guides meet roots.
layout=[]
for p in anchors:
 v=world_to_camera_view(s,cam,Vector(p));layout.append({'x':round(v.x*100,4),'y':round((1-v.y)*100,4)})
with open(OUT+'/earth-layout.json','w') as f:json.dump(layout,f)
# Save editable scene with its full studio, then render independent web layers.
COL['Extra leaves'].hide_render=True;COL['Flowers'].hide_render=True;COL['Pods'].hide_render=True
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/blender/reference_earth.blend')
def render(name):s.render.filepath=OUT+'/'+name+'.png';bpy.ops.render.render(write_still=True)
# Main environment: earth, exposed roots and foreground plants.
COL['Plant'].hide_render=True;render('earth-ground-v2')
COL['Earth'].hide_render=True;COL['Roots'].hide_render=True;COL['Foreground'].hide_render=True
COL['Plant'].hide_render=False
# Plants are transparent layers using the same camera. Default stage 1 is the
# reference three-leaf seedling; later stages remain botanically consistent.
for stage in range(5):
 COL['Extra leaves'].hide_render=stage<2;COL['Flowers'].hide_render=stage!=3;COL['Pods'].hide_render=stage!=4
 for o in COL['Plant'].objects:o.hide_render=stage==0 and not ('seed' in o.name.lower() or 'husk' in o.name.lower() or 'crease' in o.name.lower())
 render('earth-plant-%d'%stage)
for o in COL['Plant'].objects:o.hide_render=False
for name in ['Plant','Extra leaves','Flowers','Pods']:COL[name].hide_render=True
# Isolated root highlight layers support pointer/keyboard/swipe-selected guides.
COL['Roots'].hide_render=False
for o in COL['Roots'].objects:o.hide_render=True
for i,o in enumerate(primary):
 o.hide_render=False;old=o.data.materials[0];o.data.materials[0]=brightroot;render('earth-root-focus-%d'%i);o.data.materials[0]=old;o.hide_render=True
# A real Blender glass orb, reused by the five HTML guide buttons.
COL['Roots'].hide_render=True
for c in ['Earth','Foreground']:COL[c].hide_render=True
orb=collection('Guide orb')
glass=mat('Orb - smoky green glass',(.31,.42,.13),.11);p=glass.node_tree.nodes.get('Principled BSDF');p.inputs['Transmission Weight'].default_value=.70;p.inputs['IOR'].default_value=1.44
sphere('Guide glass sphere',(0,0,0),(.85,.85,.85),glass,'Guide orb',64,40)
inner=mat('Orb inner warmth',(.095,.14,.018),.35,.15);sphere('Orb subtle interior',(0,.2,0),(.75,.62,.75),inner,'Guide orb',40,24)
bpy.ops.mesh.primitive_torus_add(major_radius=.85,minor_radius=.012,major_segments=96,minor_segments=12,location=(0,-.06,0),rotation=(pi/2,0,0));o=into(bpy.context.object,'Guide orb');o.data.materials.append(mat('Orb luminous rim',(.70,.79,.20),.2,2.2))
cam.location=(0,-5,.3);cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=2.15;cam.data.dof.use_dof=False;s.render.resolution_x=256;s.render.resolution_y=256;s.cycles.samples=64;render('guide-orb-v2')
print('REFERENCE EARTH ASSETS COMPLETE',flush=True)
