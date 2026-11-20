"""Build the animated bean plant and cutaway used by Start.

Run blender -b -t 3 --python blender/start_lifecycle.py
"""
import json
import struct
from math import cos, pi, sin
from pathlib import Path
from random import Random

import bpy
from mathutils import Vector
from mathutils.noise import noise_vector

PROJECT = Path(__file__).resolve().parents[1]
ASSETS = PROJECT / 'public/assets'
LAST = 673
rng = Random(92)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.frame_end = LAST
scene.render.fps = 24


def collection(name):
    result = bpy.data.collections.new(name)
    scene.collection.children.link(result)
    return result


canopy = collection('Plant')
underground = collection('Roots')
soil = collection('Soil')
crown = Vector((0, 0, 0))


def material(name, color, roughness=.63, painted=False, translucent=0):
    result = bpy.data.materials.new(name)
    result.diffuse_color = (*color, 1)
    result.use_nodes = True
    shader = result.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Subsurface Weight'].default_value = translucent
    if painted:
        vertex_color = result.node_tree.nodes.new('ShaderNodeVertexColor')
        vertex_color.layer_name = 'Pigment'
        result.node_tree.links.new(vertex_color.outputs['Color'], shader.inputs['Base Color'])
    return result


stem_mat = material('Green stem', (.15, .28, .036), .56, translucent=.08)
vein_mat = material('Raised leaf veins', (.22, .37, .065), translucent=.08)
leaf_mat = material('Variegated leaf lamina', (.11, .25, .030), .64, painted=True, translucent=.12)
root_mat = material('Warm ivory root', (.56, .33, .16), .76)
hair_mat = material('Fine capillary root', (.41, .23, .107), .79)
seed_mat = material('Speckled seed coat', (.39, .16, .064), .55, painted=True)
petal_mat = material('Bean flower petals', (.82, .74, .49), .51, painted=True, translucent=.12)
pod_mat = material('Bean pod', (.14, .32, .041), .54, painted=True, translucent=.09)
soil_mat = material('Weathered soil', (.14, .065, .022), .97, painted=True)


def mesh(name, vertices, faces, mat, group, origin=(0, 0, 0), colors=None, travel=None):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    if colors:
        color_data = data.color_attributes.new(name='Pigment', type='FLOAT_COLOR', domain='POINT')
        for item, value in zip(color_data.data, colors):
            item.color = (*value, 1)
        data.color_attributes.active_color = color_data
    if travel:
        attribute = data.attributes.new(name='_ROOT_TRAVEL', type='FLOAT', domain='POINT')
        for item, value in zip(attribute.data, travel):
            item.value = value
    obj = bpy.data.objects.new(name, data)
    group.objects.link(obj)
    obj.location = origin
    data.materials.append(mat)
    for face in data.polygons:
        face.use_smooth = True
    return obj


def growth(obj, start, end, fade=None):
    keyframes = [(1, .00001), (start, .00001), (end, 1), (LAST, 1)]
    if fade:
        keyframes = [*keyframes[:3], (fade[0], 1), (fade[1], .00001), (LAST, .00001)]
    for frame, value in keyframes:
        obj.scale = (value,) * 3
        obj.keyframe_insert(data_path='scale', frame=frame, group='Bean lifecycle')


def path(points, steps=28):
    """Return a Catmull-Rom centerline with exact endpoints and no rigid elbows."""
    control = [Vector(p) for p in points]
    p = [2 * control[0] - control[1], *control, 2 * control[-1] - control[-2]]
    sampled = []
    for i in range(steps + 1):
        position = i * (len(control) - 1) / steps
        j = min(int(position), len(control) - 2)
        t = position - j
        a, b, c, d = p[j:j + 4]
        sampled.append(.5 * ((2*b) + (-a+c)*t + (2*a-5*b+4*c-d)*t*t + (-a+3*b-3*c+d)*t*t*t))
    return sampled


def tube_data(points, radius, tip, sections, sides=8, fluting=0, end_axes=None):
    center = path(points, sections)
    vertices, faces = [], []
    for i, point in enumerate(center):
        t = i / sections
        axis = (center[min(i + 1, sections)] - center[max(0, i - 1)]).normalized()
        if end_axes and i in (0, sections):
            axis = end_axes[int(i == sections)]
        u = axis.cross(Vector((0, 1, 0))).normalized()
        v = axis.cross(u)
        for j in range(sides):
            angle = 2 * pi * j / sides
            r = (tip + (radius - tip) * (1 - t)**1.15) * (1 + fluting * cos(angle * 3 + t * 2 * pi))
            vertices.append(point + r * (u * cos(angle) + v * sin(angle)))
    for i in range(sections):
        for j in range(sides):
            a = i * sides + j
            b = i * sides + (j + 1) % sides
            faces.append((a, b, b + sides, a + sides))
    faces.extend([tuple(reversed(range(sides))), tuple(sections * sides + j for j in range(sides))])
    return vertices, faces


def stem(name, points, radius, tip, start, end, fade=None, end_axes=None):
    base = Vector(points[0])
    vertices, faces = tube_data(points, radius, tip, 18, fluting=.08, end_axes=end_axes)
    obj = mesh(name, [p - base for p in vertices], faces, stem_mat, canopy, base)
    growth(obj, start, end, fade)
    return obj


def lamina(name, base, end, width, roll, frames, tone=1):
    axis = Vector(end) - Vector(base)
    across = axis.normalized().cross(Vector((.11, -1, roll))).normalized()
    normal = across.cross(axis.normalized()).normalized()
    rows, cols = 28, 12
    verts, faces, colors = [], [], []
    phase = rng.uniform(0, 6)

    def point(t, q):
        profile = .006 + sin(pi*t)**.70 * (1.08 - .23*t)
        edge = 1 + .045 * sin(t * 43 + phase) * abs(q)**2
        curl = .085 * sin(pi*t) - .15*t**4
        fold = .048 * sin(pi*t)*(1 - (.7*q*q + .3*abs(q))) + .048*q*sin(pi*t * 1.7 + phase)*sin(pi*t)
        return axis*t + Vector((0, 0, curl)) + across*(width*q*profile*edge) + normal*fold

    for i in range(rows + 1):
        t = i / rows
        for j in range(cols + 1):
            q = 2*j / cols - 1
            verts.append(point(t, q))
            vein = max(0, 1 - abs(q)*8) * .19
            lateral = .05 * max(0, cos(45*t - 6*abs(q)))**5
            variation = noise_vector(Vector((t*13, q*6, phase)))[0] * .13
            shade = tone * (.80 + .23*t + vein + lateral + variation - .08*abs(q))
            colors.append((.054*shade + .026*vein, .175*shade + .05*vein, .022*shade))
    for i in range(rows):
        for j in range(cols):
            a = i*(cols+1)+j
            faces.append((a, a+1, a+cols+2, a+cols+1))
    obj = mesh(name, verts, faces, leaf_mat, canopy, base, colors)
    growth(obj, *frames)
    vein_vertices, vein_faces = [], []
    for q, start, end in [(0, 0, 1), *[(sign*q, t, t+.12) for t in (.23,.40,.57,.74) for sign in (-1,1) for q in (.9,)]]:
        points = [
            point(start+(end-start)*i/9, q*i/9) + normal*.0035
            for i in range(10)
        ]
        vertices, faces = tube_data(points, .0040 if q == 0 else .0019, .0007, 9, 4)
        vein_faces.extend(tuple(len(vein_vertices)+i for i in face) for face in faces)
        vein_vertices.extend(vertices)
    vein = mesh(f'{name} veins', vein_vertices, vein_faces, vein_mat, canopy)
    vein.parent = obj


def blob(name, center, scales, mat, group, phase, frames=None, rotate=0):
    """A softly irregular seed or petal with pigment painted into its surface."""
    rings, sides = 12, 18
    vertices, faces, colors = [], [], []
    for i in range(rings + 1):
        v = pi*i/rings
        for j in range(sides):
            u = 2*pi*j/sides
            natural = 1 + .07*sin(3*u+phase)*sin(v)**2 + .04*cos(5*u+2*v)
            x, y = scales[0]*sin(v)*cos(u)*natural, scales[1]*sin(v)*sin(u)*natural
            z = scales[2]*cos(v) + .15*x*x/max(scales)
            local = Vector((x*cos(rotate)-z*sin(rotate), y, x*sin(rotate)+z*cos(rotate)))
            vertices.append(local)
            n = noise_vector(local * 54 + Vector((phase, 0, 0)))[0]
            base = mat.diffuse_color
            strength = .85 + .21*n + .24*sin(v)**2
            colors.append(tuple(c*strength for c in base[:3]))
    for i in range(rings):
        for j in range(sides):
            a = i*sides+j
            b = i*sides+(j+1)%sides
            faces.append((a, b, b+sides, a+sides))
    result = mesh(name, vertices, faces, mat, group, center, colors)
    if frames:
        growth(result, *frames)
    return result


# The shoot emerges from the root crown. Consecutive internodes join at each
# node with matching cross sections. Petioles and flower stalks share those nodes.
nodes = [
    crown, Vector((-.075, -.01, .52)), Vector((-.045, .009, 1.02)),
    Vector((.06, .065, 1.48)), Vector((.115, .094, 1.94)),
    Vector((.044, .11, 2.34)), Vector((.115, .12, 2.68)),
]
radii = [.063, .056, .046, .039, .032, .024, .010]
timing = [(30, 85), (85, 136), (136, 174), (174, 216), (216, 256), (256, 294)]
spine = path(nodes, 36)
for i in range(len(nodes)-1):
    start, end = i*6, (i+1)*6
    line = spine[start:end+1]
    start_axis = (spine[start+1] - spine[max(0,start-1)]).normalized()
    end_axis = (spine[min(len(spine)-1,end+1)] - spine[end-1]).normalized()
    if i == 0:
        line[0] = crown - .015*start_axis
    internode = stem(
        f'Connected internode {i + 1}', line, radii[i], radii[i+1],
        *timing[i], end_axes=(start_axis,end_axis),
    )
    if i == 0:
        internode['rootCollar'] = True

for sign in (-1, 1):
    base = nodes[1]
    end = base + Vector((sign*.29, -.095, .052))
    stem('Cotyledon stalk', [base, base.lerp(end,.52) + Vector((0, 0, .025)), end], .021, .014, 84, 107, fade=(260, 355))
    lamina('Seed leaf', end, end+Vector((sign*.48, -.14, .11)), .16, sign*.83, (104, 150, (260, 355)), .98)

structures = [
    (2, -1, .52, -.20, -.11, 1.04),
    (3,  1, .59, -.21, -.04, .98),
    (4, -1, .60, .13, .045, 1.05),
    (5,  1, .40, -.06, .12, 1.12),
    (6, -1, .19, .04, .09, 1.20),
]
for level, sign, reach, depth, lift, tint in structures:
    base = nodes[level]
    end = base + Vector((sign*reach, depth, lift))
    mid = base.lerp(end, .52) + Vector((0, .018, .08))
    start = timing[level-1][1]-1
    stem(f'Leaf branch from node {level}', [base, mid, end], .033 - level*.0025, .014, start, start+35)
    for j, spread in enumerate((-.66, .73, 0)):
        prong = end + Vector((sign*(.075 if spread else .16), spread*.17, .095*spread))
        stem(f'Leaflet stalk {level}.{j}', [end, end.lerp(prong,.4), prong], .012, .0075, start+34, start+52)
        length = (.61 if spread else .73) * (1 - (level-2)*.085)
        tip = prong + Vector((sign*length*(.56 if spread else 1), spread*.60-.13, .045+spread*.47))
        lamina(f'Leaflet {level}.{j}', prong, tip, length*.34, sign*(.52+spread*.77), (start+51, start+105), tint-abs(spread)*.15)

for j, (node, sign) in enumerate([(3, 1), (4, -1), (5, 1)]):
    base = nodes[node]
    bloom = base + Vector((sign*(.36+j*.06), -.33, .19+j*.025))
    start = 382 + j*14
    stem(f'Flower stalk from node {node}', [base, base.lerp(bloom,.55) + Vector((0,0,.055)), bloom], .024, .013, start, start+41)
    flower = bpy.data.objects.new(f'Blossom {j + 1}', None)
    canopy.objects.link(flower)
    flower.location = bloom
    growth(flower, start+35, start+87, (525+j*9, 568+j*8))
    for k, (x, z, size, tilt) in enumerate([(0,.105,.15,.04),(-.10,.035,.115,.60),(.10,.036,.11,-.54),(-.037,-.051,.10,.24),(.04,-.05,.085,-.30)]):
        petal = blob(f'Blossom {j+1} petal {k+1}', (x,-.045,z), (size,.036,size*.65), petal_mat, canopy, k+j, rotate=tilt)
        petal.parent = flower

    fruit_start = 526 + j*12
    bend = .19 * sign
    pod_length = .55 + j*.08
    vertices, faces = tube_data([(0,0,0), (bend*.32,-.018,-.14), (bend,.007,-pod_length*.64), (bend*.8,.029,-pod_length)], .052, .004, 24, 12, .12)
    colors = []
    for v in vertices:
        t = max(0,min(1,-v.z/pod_length))
        bead = 1 + .13*sin(t*8*pi) + .11*noise_vector(v*19)[0]
        v.x *= .64 + .36*sin(t*pi)**.6 + .3*t
        colors.append((.12*bead, .29*bead, .031*bead))
    pod = mesh(f'Fruit bean pod {j+1}', vertices, faces, pod_mat, canopy, bloom, colors)
    growth(pod, fruit_start, fruit_start+106)

for i, sign in enumerate((-1, 1)):
    seed = blob(f'Seed coat half {i+1}', (sign*.105, -.025, .034), (.14, .095, .085), seed_mat, canopy, i+.5, rotate=sign*.47)
    for frame, offset, angle, scale in [(1,.105,0,1), (51,.126,.16,1), (115,.19,.48,.76), (245,.24,.65,.43), (360,.25,.74,.34), (LAST,.25,.74,.34)]:
        seed.location = (sign*offset, -.025-i*.023, .034-(1-scale)*.045)
        seed.rotation_euler.y = sign*angle
        seed.scale = (scale,)*3
        for prop in ('location','rotation_euler','scale'):
            seed.keyframe_insert(data_path=prop, frame=frame, group='Bean lifecycle')

# Each root starts at a sampled point of the same taproot or lateral that feeds it.
# The exported travel coordinate includes the parent's length at each junction.
tap = path([crown, (-.03,-.02,-.40), (.04,-.035,-.87), (.01,-.02,-1.45), (.11,.025,-2.43)], 100)
root_specs = [
    (24, [(-.52,-.03,-.68),(-1.34,-.09,-.81),(-1.91,-.028,-1.18)]),
    (37, [(-.34,.035,-1.14),(-.69,.049,-1.57),(-1.12,-.06,-1.95)]),
    (0, []),
    (43, [(.41,-.06,-1.19),(.66,-.02,-1.60),(1.05,.05,-2.09)]),
    (20, [(.48,.045,-.46),(1.16,.046,-.66),(1.92,-.012,-1.02)]),
]
for index, (attach, waypoints) in enumerate(root_specs):
    trunk = index == 2
    center = tap if trunk else path([tap[attach], *waypoints], 100)
    groups = {root_mat: ([], [], []), hair_mat: ([], [], [])}

    def add_root(points, radius, tip, mat, start, end, sections, sides):
        vertices, faces = tube_data(points, radius, tip, sections, sides, .10)
        v, f, travel = groups[mat]
        f.extend(tuple(len(v)+i for i in face) for face in faces)
        v.extend(vertices)
        travel.extend(start + (end-start)*(i//sides)/sections for i in range(len(vertices)))

    add_root([center[i] for i in range(0,101,5)], .064 if trunk else .032, .0038, root_mat, 0, 1, 48, 8)
    for j in range(11):
        k = 13+j*7+rng.randrange(0,4)
        fraction = k/100
        base = center[k]
        side = -1 if (j+index) % 3 else 1
        if index > 2:
            side *= -1
        length = rng.uniform(.15,.44) * (1-.30*fraction)
        end = base+Vector((side*length, rng.uniform(-.10,.08), -rng.uniform(.15,.38)))
        small = path([base, base.lerp(end,.47)+Vector((side*.025, -.026, .027)), end], 18)
        finish = min(1, fraction+.17)
        add_root([small[i] for i in range(0,19,3)], rng.uniform(.011,.016), .0011, root_mat, fraction, finish, 12, 6)
        for h in (5, 9, 13):
            branch = small[h]
            tip = branch + Vector((rng.uniform(.036,.13)*side, -.013, -rng.uniform(.07,.14)))
            offset = fraction+(finish-fraction)*h/18
            add_root([branch, branch.lerp(tip,.5)+Vector((.021,0,-.012)), tip], .0036, .0008, hair_mat, offset, min(1,offset+.07), 6, 4)

    marker = bpy.data.objects.new('Taproot' if trunk else f'Guide root {index}', None)
    underground.objects.link(marker)
    marker['rootIndex'] = index
    marker['tip'] = list(center[-1])
    for mat, (vertices, faces, travel) in groups.items():
        obj = mesh(f'{marker.name} - {mat.name}', vertices, faces, mat, underground, travel=travel)
        obj.parent = marker

# A textured, ragged slice of loam, lowered around the crown itself.
verts, faces, colors = [], [], []
rx, ry = 2.32, 1.0
for i in range(21):
    for j in range(61):
        x, y = (j / 30 - 1)*rx, (i / 10 - 1)*ry+.5
        bump = noise_vector(Vector((x*7,y*7,2)))[0]
        z = -.028 - .15*(x/rx)**2 - .095*abs(y) + .088*bump
        verts.append((x, y, min(-.016,z)))
        pigment = max(.17, .65 + .43*bump + .39*noise_vector(Vector((x*22, y*20,0)))[1])
        colors.append((.165*pigment,.081*pigment,.030*pigment))
for i in range(20):
    for j in range(60):
        a = i*61+j
        faces.append((a, a+1, a+62, a+61))
mesh('Blender soil cutaway', verts, faces, soil_mat, soil, colors=colors)['soilGeometry'] = True

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1)
template = bpy.context.object
stone_verts = [v.co.copy() for v in template.data.vertices]
stone_faces = [tuple(f.vertices) for f in template.data.polygons]
bpy.data.objects.remove(template, do_unlink=True)
verts, faces, colors = [], [], []
for _ in range(850):
    x, y = rng.uniform(-rx,rx), rng.uniform(-.46,1.5)
    bump = noise_vector(Vector((x*7,y*7,2)))[0]
    z = -.028-.15*(x/rx)**2-.095*abs(y)+.088*bump
    size = rng.uniform(.009,.041)
    offset = len(verts)
    pigment = rng.uniform(.23,1.12)
    for v in stone_verts:
        verts.append((x+v.x*size*1.3,y+v.y*size,min(-.010,z)+v.z*size*.8))
        colors.append((.18*pigment,.091*pigment,.036*pigment))
    faces.extend(tuple(offset+i for i in f) for f in stone_faces)
mesh('Soil granules', verts, faces, soil_mat, soil, colors=colors)['soilGeometry'] = True

scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(PROJECT / 'blender/start_lifecycle.blend'))
bpy.ops.export_scene.gltf(
    filepath=str(ASSETS / 'start-lifecycle-live.glb'), export_format='GLB',
    export_animations=True, export_animation_mode='SCENE', export_force_sampling=True,
    export_frame_step=4, export_extras=True, export_attributes=True, export_yup=True,
)

# Blender emits a separate channel clip for each animated property in scene
# mode. Use one shared timeline so scrubbing applies every channel together.
asset = ASSETS / 'start-lifecycle-live.glb'
raw = asset.read_bytes()
json_size = struct.unpack_from('<I', raw, 12)[0]
document = json.loads(raw[20:20+json_size])
binary = raw[20+json_size:]
lifecycle = {'name': 'Seed to bean pod', 'samplers': [], 'channels': []}
for clip in document['animations']:
    offset = len(lifecycle['samplers'])
    lifecycle['samplers'].extend(clip['samplers'])
    for channel in clip['channels']:
        channel['sampler'] += offset
        lifecycle['channels'].append(channel)
document['animations'] = [lifecycle]
data = json.dumps(document, separators=(',', ':')).encode()
data += b' ' * (-len(data) % 4)
asset.write_bytes(
    struct.pack('<III', 0x46546c67, 2, 20+len(data)+len(binary))
    + struct.pack('<II', len(data), 0x4e4f534a) + data + binary
)
