import bpy,os,time
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.open_mainfile(filepath=ROOT+'/blender/living_growth.blend')
s=bpy.context.scene
s.render.engine='CYCLES';s.cycles.samples=12;s.cycles.use_denoising=False
s.render.resolution_x=640;s.render.resolution_y=640;s.render.resolution_percentage=100
s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.image_settings.compression=20
FRAMES=os.environ.get('AGRIDELTA_RENDER_DIR',os.path.join(ROOT,'blender','render_frames'))
os.makedirs(FRAMES,exist_ok=True)
for i in range(192):
 s.frame_set(1+i*2);s.render.filepath=os.path.join(FRAMES,f'frame_{i:04d}.png');bpy.ops.render.render(write_still=True)
 print(f'RENDER PROGRESS {i+1}/192',flush=True)
