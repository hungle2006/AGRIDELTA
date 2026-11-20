"""Render the exact Start model for devices without WebGL2.

Run blender -b -t 3 --python blender/render_start_fallback.py
The intermediate PNGs can be converted using scripts/encode-start-fallback.sh.
"""
import os
from pathlib import Path

import bpy
from mathutils import Vector

PROJECT = Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(PROJECT / 'blender/start_lifecycle.blend'))
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 16
scene.cycles.use_denoising = False
scene.cycles.max_bounces = 3
scene.render.resolution_x = scene.render.resolution_y = 580
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'AgX'
scene.world = bpy.data.worlds.new('Open sky')
scene.world.use_nodes = True
background = scene.world.node_tree.nodes.get('Background')
background.inputs['Color'].default_value = (.77, .89, 1, 1)
background.inputs['Strength'].default_value = .48

out = Path(os.environ.get('AGRIDELTA_START_FRAMES', '/tmp/agridelta-start-frames'))
out.mkdir(parents=True, exist_ok=True)


def aim(obj, point):
    obj.rotation_euler = (Vector(point)-obj.location).to_track_quat('-Z', 'Y').to_euler()


def light(name, loc, power, color, size):
    bpy.ops.object.light_add(type='AREA', location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.data.energy, obj.data.color, obj.data.size = power, color, size
    aim(obj, (0,0,.8))


light('Sunlight from upper left', (-3, -2, 5), 680, (1, .91, .69), 3.6)
light('Soft sky from above', (3, 1.5, 4.0), 880, (.86, .95, 1), 4)
light('Soft fill for underground', (-.8, -4, -1), 300, (1, .86, .66), 3)
bpy.ops.object.camera_add()
camera = bpy.context.object
scene.camera = camera
camera.data.type = 'ORTHO'


def render(name):
    scene.render.filepath = str(out / f'{name}.png')
    bpy.ops.render.render(write_still=True)


roots = bpy.data.collections['Roots']
soil = bpy.data.collections['Soil']
plants = bpy.data.collections['Plant']
roots.hide_render = True
camera.location = (0, -10, 3.10)
aim(camera, (0, 0, 1.23))
camera.data.ortho_scale = 3.65
for i, frame in enumerate((1, 82, 396, 462, 657)):
    scene.frame_set(frame)
    render(f'lifecycle-{i}')

scene.frame_set(scene.frame_end)
render('harvested')

if os.environ.get('AGRIDELTA_START_STILLS_ONLY') != '1':
    scene.render.resolution_x = scene.render.resolution_y = 320
    scene.cycles.samples = 5
    for index, frame in enumerate(range(1, scene.frame_end + 1, 4)):
        scene.frame_set(frame)
        render(f'motion-{index:03d}')

scene.render.resolution_x = scene.render.resolution_y = 580
scene.cycles.samples = 16
soil.hide_render = True
for obj in plants.objects:
    obj.hide_render = not obj.get('rootCollar')
roots.hide_render = False
camera.location = (0,-10,-1.37)
aim(camera, (0,0,-1.12))
camera.data.ortho_scale = 4.64
for marker in [obj for obj in roots.objects if 'rootIndex' in obj]:
    plants.hide_render = marker['rootIndex'] != 2
    for obj in roots.objects:
        obj.hide_render = obj.type == 'MESH' and obj.parent != marker
    render(f'root-{marker["rootIndex"]}')
