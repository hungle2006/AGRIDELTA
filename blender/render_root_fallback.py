"""Transparent movies of the actual Blender roots extending from trunk to tip."""
import bpy,os,math
setup=open(os.path.join(os.path.dirname(__file__),'render_start_fallback.py')).read().split("out='/tmp/agridelta-live-frames'")[0]
exec(compile(setup,__file__,'exec'))
s.frame_set(672)
for o in s.objects:
 if o.type not in {'CAMERA','LIGHT'}:o.hide_render=True
out='/tmp/agridelta-root-frames';os.makedirs(out,exist_ok=True)
for idx in range(5):
 for o in roots:o.hide_render=True
 chosen=[o for o in roots if o.get('rootIndex')==idx or (idx==0 and o.get('rootIndex')==-1)]
 shaders=[]
 for o in chosen:
  o.hide_render=False
  for slot in o.material_slots:
   m=slot.material.copy();slot.material=m;n=m.node_tree.nodes;l=m.node_tree.links;output=n.get('Material Output');shader=output.inputs['Surface'].links[0].from_socket
   attr=n.new('ShaderNodeAttribute');attr.attribute_name='_ROOT_TRAVEL';threshold=n.new('ShaderNodeValue')
   less=n.new('ShaderNodeMath');less.operation='LESS_THAN';l.new(attr.outputs['Fac'],less.inputs[0]);l.new(threshold.outputs[0],less.inputs[1]);transparent=n.new('ShaderNodeBsdfTransparent');mix=n.new('ShaderNodeMixShader');l.new(less.outputs[0],mix.inputs[0]);l.new(transparent.outputs[0],mix.inputs[1]);l.new(shader,mix.inputs[2]);l.new(mix.outputs[0],output.inputs['Surface']);shaders.append((threshold,o.get('rootIndex')))
 for f in range(25):
  p=f/24;p=p*p*(3-2*p)
  for value,branch in shaders:value.outputs[0].default_value=1.001*p
  s.render.filepath=out+'/root_%d_%03d.png'%(idx,f);bpy.ops.render.render(write_still=True)
 print('ROOT BRANCH COMPLETE',idx,flush=True)
