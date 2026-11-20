"""Render a real extruded, softly bevelled 3D version of the original app mark."""
import bpy,os,json,math
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data=json.load(open('/tmp/agri-logo-mesh.json'))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
m=bpy.data.meshes.new('Rounded leaf logo relief');m.from_pydata(data['vertices'],[],data['faces']);m.update();o=bpy.data.objects.new('AGRIDELTA extruded logo',m);bpy.context.collection.objects.link(o)
mat=bpy.data.materials.new('Glossy leaf enamel');mat.use_nodes=True;p=mat.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=.28;p.inputs['Coat Weight'].default_value=.5;p.inputs['Metallic'].default_value=.18
im=bpy.data.images.load(ROOT+'/blender/logo-source.webp');im.pack();t=mat.node_tree.nodes.new('ShaderNodeTexImage');t.image=im;mat.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color']);o.data.materials.append(mat)
side=bpy.data.materials.new('Deep green extruded edges');side.diffuse_color=(.035,.16,.01,1);side.use_nodes=True;p=side.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(.045,.20,.012,1);p.inputs['Metallic'].default_value=.23;p.inputs['Roughness'].default_value=.27;o.data.materials.append(side)
uv=m.uv_layers.new(name='UVMap')
for poly in m.polygons:
 poly.use_smooth=True;poly.material_index=0 if poly.index<data['front_count'] else 1
 for li in poly.loop_indices:
  v=m.vertices[m.loops[li].vertex_index].co;uv.data[li].uv=((v.x+1)/2,(v.y+1)/2)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=32;s.cycles.use_denoising=False;s.render.resolution_x=512;s.render.resolution_y=512;s.render.resolution_percentage=100;s.render.film_transparent=True;s.render.image_settings.color_mode='RGBA';s.render.image_settings.file_format='PNG'
s.world.color=(.5,.5,.5);s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast'
for loc,power,size in [((-3,2,5),450,3),((3,-1,4),280,2),((0,4,1),200,2)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.size=size;l.rotation_euler=(-l.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(.32,-.65,5));c=bpy.context.object;c.rotation_euler=(-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=2.1;s.camera=c
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/blender/logo_relief.blend');s.render.filepath='/tmp/agri-logo-3d.png';bpy.ops.render.render(write_still=True)
