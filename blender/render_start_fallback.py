"""Blender-rendered animated fallback for browsers without WebGL2, never photo stand-ins."""
import bpy,os,time,math
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.open_mainfile(filepath=ROOT+'/blender/start_lifecycle.blend')
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=8;s.cycles.use_denoising=False;s.cycles.max_bounces=3;s.cycles.diffuse_bounces=1;s.cycles.glossy_bounces=1;s.cycles.transmission_bounces=1;s.render.film_transparent=True
s.render.resolution_x=960;s.render.resolution_y=536;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.image_settings.compression=15
s.world.use_nodes=True;s.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.65,.78,.9,1);s.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.45
s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast'
def area(loc,power,color,size):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.color=color;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,.4))-o.location).to_track_quat('-Z','Y').to_euler()
area((-3,3,5),1000,(1,.84,.51),3);area((2,-5,4),450,(.84,1,.92),5)
bpy.ops.object.camera_add(location=(0,-13,2.2));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,-.16))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=11.1;s.camera=cam
roots=[o for o in s.objects if 'rootIndex' in o]
for o in roots:o.hide_render=True
out=os.environ.get('START_OUTPUT','/tmp/agridelta-live-frames');os.makedirs(out,exist_ok=True)
# Reveal the same continuous taproot, top to bottom, within the plant movie.
trunk=next(o for o in roots if o.get('rootIndex')==-1)
trunk.hide_render=False
for slot in trunk.material_slots:
 mat=slot.material.copy();slot.material=mat
 nodes=mat.node_tree.nodes;links=mat.node_tree.links
 output=nodes.get('Material Output');original=output.inputs['Surface'].links[0].from_socket
 z=nodes.new('ShaderNodeSeparateXYZ');links.new(nodes.new('ShaderNodeNewGeometry').outputs['Position'],z.inputs[0])
 level=nodes.new('ShaderNodeValue')
 visible=nodes.new('ShaderNodeMath');visible.operation='GREATER_THAN'
 links.new(z.outputs['Z'],visible.inputs[0]);links.new(level.outputs[0],visible.inputs[1])
 mix=nodes.new('ShaderNodeMixShader');links.new(visible.outputs[0],mix.inputs[0])
 links.new(nodes.new('ShaderNodeBsdfTransparent').outputs[0],mix.inputs[1]);links.new(original,mix.inputs[2]);links.new(mix.outputs[0],output.inputs['Surface'])
 for frame,height in [(1,.32),(35,.12),(75,-.52),(120,-2.4)]:
  level.outputs[0].default_value=height;level.outputs[0].keyframe_insert(data_path='default_value',frame=frame)
# Preserve a fresh green leaf colour under physical light.
m=bpy.data.materials.get('Translucent leaf lamina');p=m.node_tree.nodes.get('Principled BSDF');links=m.node_tree.links;source=p.inputs['Base Color'].links[0].from_socket;mix=m.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(.55,.76,.32,1);links.new(source,mix.inputs[1]);links.new(mix.outputs[0],p.inputs['Base Color'])
# One benchmark frame, then the full 12fps botanical lifecycle.
frames=[int(x) for x in os.environ.get('START_FRAMES','').split(',') if x] or range(1,673,3)
worker=int(os.environ.get('START_WORKER','0'));workers=int(os.environ.get('START_WORKERS','1'))
frames=list(frames)[worker::workers]
if os.environ.get('FAST_RENDER'):
 s.render.resolution_percentage=85;s.cycles.samples=5
for i,f in enumerate(frames):
 s.frame_set(f);s.render.filepath=out+'/plant_%04d.png'%((f-1)//3);t=time.time();bpy.ops.render.render(write_still=True);print('START FRAME',i,f,round(time.time()-t,2),flush=True)
