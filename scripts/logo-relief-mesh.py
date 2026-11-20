"""Generate the relief mesh from the original raster alpha, retaining its identity."""
from PIL import Image
from scipy.ndimage import binary_closing,binary_opening,label,distance_transform_edt,gaussian_filter
import numpy as np,json
im=Image.open('blender/logo-source.webp').resize((180,180));a=np.array(im)[:,:,3]>210;a=binary_opening(binary_closing(a,iterations=1),iterations=1);labels,n=label(a)
for i in range(1,n+1):
 if (labels==i).sum()<250:a[labels==i]=False
h=gaussian_filter(distance_transform_edt(a),1);vertices=[];faces=[];index={};edges={}
for y in range(179):
 for x in range(179):
  if not a[y,x]:continue
  inds=[]
  for xx,yy in [(x,y),(x+1,y),(x+1,y+1),(x,y+1)]:
   if (xx,yy) not in index:index[xx,yy]=len(vertices);vertices.append((xx/179*2-1,1-yy/179*2,.035+min(h[yy,xx]/13,1)*.16))
   inds.append(index[xx,yy])
  inds=inds[::-1];faces.append(inds)
  for u,v in zip(inds,inds[1:]+inds[:1]):
   k=tuple(sorted([u,v]));edges[k]=None if k in edges else (u,v)
front_count=len(faces);N=len(vertices);vertices += [(x,y,-.10) for x,y,z in vertices]
for edge in edges.values():
 if edge is not None:
  u,v=edge;faces.append((v,u,u+N,v+N))
json.dump(dict(vertices=vertices,faces=faces,front_count=front_count),open('/tmp/agri-logo-mesh.json','w'))
