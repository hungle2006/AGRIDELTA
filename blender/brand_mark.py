"""Sculpt and light the AGRIDELTA interlocked leaf mark in Blender."""
import bpy, math, os
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=32;s.cycles.use_denoising=False;s.render.film_transparent=True;s.render.resolution_x=320;s.render.resolution_y=320;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA'
s.world.color=(.4,.5,.4);s.view_settings.view_transform='AgX'
def mat(name,c):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.27;p.inputs['Coat Weight'].default_value=.35;return m
mats=[mat('Forest enamel',(.035,.22,.07)),mat('Sunlit leaf enamel',(.32,.61,.035)),mat('Fresh green enamel',(.10,.39,.055))]
for i in range(3):
 # Curved, tapered leaf ribbons form a triangular circular system.
 verts=[];faces=[];angle=i*2*math.pi/3
 for j in range(33):
  t=j/32;a=angle+t*math.pi*.59;r=.75-.14*math.sin(t*math.pi);w=.29*math.sin(math.pi*t)**.7+.012
  for side in [-1,1]:
   verts.append(((r+side*w)*math.sin(a),(r+side*w)*math.cos(a),.10+.10*math.sin(t*math.pi)))
 for j in range(32):faces.append((2*j,2*j+1,2*j+3,2*j+2))
 me=bpy.data.meshes.new('Sculpted leaf ribbon');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('AGRIDELTA leaf %d'%i,me);s.collection.objects.link(o);o.data.materials.append(mats[i]);sol=o.modifiers.new('Leaf body','SOLIDIFY');sol.thickness=.11;be=o.modifiers.new('Soft enamel edge','BEVEL');be.width=.035;be.segments=3
 for p in me.polygons:p.use_smooth=True
bpy.ops.object.camera_add(location=(.25,-.5,5));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.3;s.camera=cam
for loc,energy,size in [((-3,-4,5),350,4),((2,1,4),200,3)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=energy;o.data.size=size;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
s.render.filepath=ROOT+'/public/assets/brand-sculpted.png';bpy.ops.render.render(write_still=True)
