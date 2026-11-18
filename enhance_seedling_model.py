"""Refine the existing seedling GLB: broad cupped leaf blades, real vein geometry,
subtle asymmetry, soil root filaments, and water droplets. Procedural 3D,
not a Blender render; the Blender authoring source remains in blender/."""
import math, random
from pathlib import Path
import numpy as np, trimesh
path=Path(__file__).parent/'public/assets/agridelta_seed_to_harvest_model.glb'
base=trimesh.load(path,force='scene')
out=trimesh.Scene()
for name,geo in base.geometry.items():
    if name.startswith('Veined leaf blade') or name.startswith('Leaf petiole'): continue
    out.add_geometry(geo.copy(),geom_name=name,node_name=name)
rnd=random.Random(24)
def add_tube(a,b,r,color,label):
    a,b=np.array(a,float),np.array(b,float)
    delta=b-a;dist=np.linalg.norm(delta)
    if dist<.0001:return
    m=trimesh.creation.cylinder(radius=r,height=dist,sections=8)
    m.apply_transform(trimesh.geometry.align_vectors([0,0,1],delta/dist))
    m.apply_translation((a+b)/2)
    m.visual.vertex_colors=np.tile(color,(len(m.vertices),1))
    out.add_geometry(m,geom_name=label)
leaves=[
 ((.04,0,.46),(.69,.12,.80),.20),
 ((-.02,0,.70),(-.71,-.20,1.08),.23),
 ((.02,-.01,.91),(.84,-.26,1.36),.25),
 ((-.02,.01,1.14),(-.84,.19,1.62),.27),
 ((.035,0,1.38),(.93,.25,1.92),.27),
 ((.02,-.01,1.61),(-.76,-.36,2.05),.23),
 ((.01,0,1.84),(.46,-.28,2.24),.17),
 ((0,0,1.97),(-.31,.12,2.40),.13)]
for ix,(start,end,width) in enumerate(leaves):
    a=np.array(start,float);b=np.array(end,float);d=b-a
    planar=np.array([d[0],d[1],0.0]);planar/=max(.01,np.linalg.norm(planar))
    side=np.array([-planar[1],planar[0],0.])
    vertices=[];colors=[];faces=[];N=25;W=12
    for i in range(N+1):
        t=i/N;mid=a+d*t;mid[2]+=.065*math.sin(math.pi*t)-.026*t*t
        span=math.sin(math.pi*t)**.8*(.85+.15*math.cos(2*math.pi*t))
        for j in range(W+1):
            v=j/W*2-1;point=mid+side*v*width*span
            point[2]+=.045*(1-v*v)*math.sin(math.pi*t)-.05*v*v*math.sin(math.pi*t)
            point[1]+=.013*v*math.sin(8*t+ix)
            vertices.append(point)
            ch=.9+.2*(1-abs(v))-.18*v*v+.05*math.sin(26*t+ix)+rnd.uniform(-.045,.045)
            colors.append([int(np.clip(48*ch,20,145)),int(np.clip(142*ch,50,218)),int(np.clip(62*ch,20,140)),255])
    for i in range(N):
        for j in range(W):
            q=i*(W+1)+j;r=q+1;v=q+W+1;u=v+1
            faces.extend([[q,v,r],[r,v,u],[q,r,v],[r,u,v]])
    mesh=trimesh.Trimesh(vertices=np.array(vertices),faces=np.array(faces),process=False)
    mesh.visual.vertex_colors=np.array(colors,np.uint8)
    out.add_geometry(mesh,geom_name='Detailed leaf %02d'%ix)
    add_tube(a,b,.01,[103,146,66,255],'Petiole %02d'%ix)
    for k in range(1,8,2):
        t=k/10.;center=a+d*t;center[2]+=.065*math.sin(math.pi*t)
        for sign in (-1,1):
            te=min(.98,t+.13);dest=a+d*te+side*sign*width*math.sin(math.pi*te)**.8*.79
            dest[2]+=.027*math.sin(math.pi*te)
            add_tube(center,dest,.0025,[186,210,110,255],'Vein %02d-%d-%d'%(ix,k,sign))
for i in range(8):
    a=np.array(leaves[i][0]);b=np.array(leaves[i][1])
    t=.4+.1*(i%3);pos=a+(b-a)*t;pos[2]+=.068*math.sin(math.pi*t)
    sphere=trimesh.creation.icosphere(subdivisions=2,radius=.013)
    sphere.apply_translation(pos)
    sphere.visual.vertex_colors=np.tile([175,219,208,235],(len(sphere.vertices),1))
    out.add_geometry(sphere,geom_name='Dew %02d'%i)
for i in range(34):
    ang=i*2*math.pi/34
    tip=[math.cos(ang)*(.2+.4*(i%5)/5),math.sin(ang)*(.2+.4*(i%5)/5),-.21-.04*(i%6)]
    add_tube([0,0,-.08],tip,.002,[160,116,73,255],'Root hair %02d'%i)
path.write_bytes(out.export(file_type='glb'))
print('Enhanced GLB:',len(out.geometry),'meshes;',path.stat().st_size,'bytes')
