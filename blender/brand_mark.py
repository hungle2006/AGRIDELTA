"""Model the AGRIDELTA seedling and delta badge as matte ceramic."""
import os
from math import sin, pi
import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
s = bpy.context.scene
s.render.engine = 'CYCLES'
s.cycles.samples = 32
s.cycles.use_denoising = False
s.render.film_transparent = True
s.render.resolution_x = s.render.resolution_y = 320
s.render.resolution_percentage = 100
s.render.image_settings.file_format = 'PNG'
s.render.image_settings.color_mode = 'RGBA'
s.world.color = (.45,.5,.45)
s.view_settings.view_transform = 'AgX'

def material(name, rgb, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*rgb,1)
    shader.inputs['Roughness'].default_value = roughness
    return mat

forest = material('Forest ceramic', (.026,.11,.068), .42)
leaf = material('Glazed leaf', (.52,.71,.32), .38)
rim = material('Delta engraving', (.30,.45,.22), .52)
bpy.ops.mesh.primitive_cube_add(size=2)
tile = bpy.context.object
tile.name = 'Rounded soil badge'
tile.scale = (1,1,.21)
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
tile.data.materials.append(forest)
bevel = tile.modifiers.new('Ceramic edge','BEVEL')
bevel.width = .16
bevel.segments = 6

def path(name, points, radius, mat, closed=False):
    curve = bpy.data.curves.new(name,'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spline = curve.splines.new('POLY')
    spline.points.add(len(points)-1)
    for point, co in zip(spline.points,points):
        point.co = (*co,1)
    spline.use_cyclic_u = closed
    obj = bpy.data.objects.new(name,curve)
    s.collection.objects.link(obj)
    curve.materials.append(mat)

path('Delta border', [(-.67,-.18,.23),(0,.74,.23),(.67,-.18,.23)],.025,rim,True)
path('Stem and taproot', [(0,.15,.26),(0,-.54,.26),(0,-.68,.26)], .029,leaf)
path('Left root', [(0,-.39,.26),(-.27,-.27,.26),(-.35,-.31,.26)],.022,leaf)
path('Right root', [(0,-.58,.26),(.23,-.34,.26)], .022,leaf)
for side in (-1,1):
    verts = []
    faces = []
    for i in range(19):
        t = i/18
        width = .14*sin(pi*t)**.65+.008
        for across in (-1,1):
            verts.append((side*(.03+.42*t-across*width*.62),-.01+.40*t+across*width*.65,.27+.06*sin(pi*t)))
    for i in range(18):
        faces.append((2*i,2*i+1,2*i+3,2*i+2))
    mesh = bpy.data.meshes.new('Leaf relief')
    mesh.from_pydata(verts,[],faces)
    obj = bpy.data.objects.new('Seedling leaf',mesh)
    s.collection.objects.link(obj)
    obj.data.materials.append(leaf)
    obj.modifiers.new('Relief thickness','SOLIDIFY').thickness = .043
    edge = obj.modifiers.new('Soft edge','BEVEL')
    edge.width,edge.segments = .026,3

bpy.ops.object.camera_add(location=(.8,-1.4,6))
camera = bpy.context.object
camera.rotation_euler = (-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 2.48
s.camera = camera
for location, power, size in [((-3,-4,5),380,4),((2,1,4),160,3)]:
    bpy.ops.object.light_add(type='AREA',location=location)
    light=bpy.context.object
    light.data.energy=power
    light.data.size=size
    light.rotation_euler=(-light.location).to_track_quat('-Z','Y').to_euler()
s.render.filepath=ROOT+'/public/assets/brand-sculpted.png'
bpy.ops.render.render(write_still=True)
