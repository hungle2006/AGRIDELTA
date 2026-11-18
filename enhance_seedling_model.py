"""Build a detailed 3D seedling GLB for the AGRIDELTA site from the original mesh.
This is procedural mesh creation using trimesh, not a Blender render; the separate
Blender source scene is in blender/seed_to_harvest.py.
"""
import numpy as np, trimesh, math, random
from pathlib import Path
P=Path(__file__).resolve().parent
source=P/'public/assets/agridelta_seed_to_harvest_model.glb'
scene_old=trimesh.load(source,force='scene')
scene=trimesh.Scene()
for name,mesh in scene_old.geometry.items():
    if name.startswith('Veined leaf blade') or name.startswith('Leaf petiole'):continue
    scene.add_geometry(mesh.copy(),geom_name=name,node_name=name)

def tube(a,b,r,color,name,sections=10):
    a,b=np.asarray(a,dtype=float),np.asarray(b,dtype=float)
    dr=b-a;ln=np.linalg.norm(dr)
    if ln<.0001:return
    mesh=trimesh.creation.cylinder(radius=r,height=ln,sections=sections)
    align=trimesh.geometry.align_vectors([0,0,1],dr/ln)
    mesh.apply_transform(align);mesh.apply_translation((a+b)/2)
    mesh.visual.vertex_colors=np.tile(np.array(color,dtype=np.uint8),(len(mesh.vertices),1))
    scene.add_geometry(mesh,geom_name=name,node_name=name)

# Compound leaves with cupping, irregular silhouettes, double-sided blades,
# visible midribs and branching secondary veins. 450-700 faces per leaf.
rng=random.Random(23)
leaves=[
  ((0.05,0.02,.46),(.67,.17,.80),.195),
  ((-.03,.01,.69),(-.69,-.23,1.10),.215),
  ((.045,0,.91),(.84,-.20,1.35),.245),
  ((-.02,.02,1.14),(-.87,.24,1.58),.255),
  ((.04,-.005,1.37),(.92,.26,1.94),.275),
  ((.045,0,1.60),(-.72,-.39,2.02),.227),
  ((.025,-.016,1.82),(.45,-.35,2.21),.185),
  ((0,-.01,1.95),(-.30,.12,2.39),.142),
]
for leaf_i,(start,end,width) in enumerate(leaves):
    start=np.array(start,float);end=np.array(end,float)
    direction=end-start;flat=np.array([direction[0],direction[1],0.0]);flat/=max(np.linalg.norm(flat),.001)
    side=np.array([-flat[1],flat[0],0.0]);N=27;W=13
    vertices=[];colors=[];faces=[]
    for i in range(N+1):
        t=i/N
        central=start+direction*t
        central[2]+= .065*math.sin(math.pi*t) - .034*t*t
        # wide in the middle and sharply tapered toward the tip
        cross=math.sin(math.pi*t)**.78*(.83+.17*math.sin(2*math.pi*t + .3))
        for j in range(W+1):
            s=(j/W)*2-1
            serration=1+.025*math.sin(13*math.pi*t)*abs(s)
            pos=central+side*(s*width*cross*serration)
            pos[2]+= .048*(1-s*s)*math.sin(math.pi*t) - .055*s*s*math.sin(math.pi*t) + .02*s*math.cos(math.pi*t)
            pos[1]+= .015*math.sin(t*7.0+leaf_i)*s
            vertices.append(pos)
            # biologically varied chlorophyll shade, brighter near midrib, muted edges
            variation=math.sin(39*t+2*leaf_i)*5 + math.sin(35*s+19*t)*4+rng.uniform(-8,8)
            core=(1-abs(s))*.22
            edge=(abs(s)**2)*.23
            shade=.86+core-edge + .07*math.sin(math.pi*t)
            color=[int(np.clip(44*shade +variation*.45,15,135)),int(np.clip(122*shade+variation,55,215)),int(np.clip(53*shade+variation*.6,19,170)),255]
            if abs(s)<.075:color=[int(min(255,color[0]+20)),int(min(255,color[1]+14)),int(min(255,color[2]+2)),255]
            colors.append(color)
    for i in range(N):
        for j in range(W):
            a=i*(W+1)+j; b=a+1;c=a+W+1;d=c+1
            faces.extend([[a,c,b],[b,c,d],[a,b,c],[b,d,c]])
    mesh=trimesh.Trimesh(vertices=np.array(vertices),faces=np.array(faces),process=False)
    mesh.visual.vertex_colors=np.array(colors,dtype=np.uint8)
    scene.add_geometry(mesh,geom_name=f'Leaf organic blade {leaf_i}',node_name=f'Leaf organic blade {leaf_i}')
    tube(start,end, .012 if leaf_i<5 else .008,[97,143,59,255],f'Petiole {leaf_i}',sections=9)
    for j in range(1,9):
        t=j/10
        c=start+direction*t; c[2]+=.065*math.sin(math.pi*t)
        if j%2==0:continue
        for sign in [-1,1]:
            angle=.12+ .04*rng.random()
            te=min(.985,t+angle)
            central=start+direction*te;central[2]+=.065*math.sin(math.pi*te)
            v=central +side*(sign*width*(math.sin(math.pi*te)**.78)*.78)
            v[2]-=.036*math.sin(math.pi*te)
            tube(c,v,.0027,[178,203,104,255],f'Fine leaf vein {leaf_i}-{j}-{sign}',sections=6)
# tiny glistening water droplets, visible only as specular highlights on leaves
for i in range(7):
    start,end,width=leaves[i]; start=np.array(start,float);end=np.array(end,float)
    t=.36+.30*(i%3)/3;center=start+(end-start)*t
    center[2]+=.070*math.sin(math.pi*t)+.012
    bubble=trimesh.creation.icosphere(subdivisions=2,radius=.011 if i%2 else .014)
    bubble.apply_translation(center)
    bubble.visual.vertex_colors=np.tile([171,214,204,225],(len(bubble.vertices),1))
    scene.add_geometry(bubble,geom_name=f'Leaf dew {i}',node_name=f'Leaf dew {i}')
# Extra root hairs, deliberately thin, curvilinear, below soil.
for i in range(42):
    az=(i/42)*math.tau; r=.18+.48*(i%5)/5
    start=np.array([0,0,-.06 - .003*(i%3)],float)
    p=np.array([math.cos(az)*r,math.sin(az)*r,-.15-(i%6)*.06],float)
    tube(start*.5+p*.5,p,.0019,[161,119,77,255],f'Root filament {i}',sections=5)
# GLB z-up export; model-viewer applies standard glTF axis.
raw=scene.export(file_type='glb')
source.write_bytes(raw)
print(f'{source}: {len(raw):,} bytes, {len(scene.geometry)} meshes, bounds {scene.bounds}')
