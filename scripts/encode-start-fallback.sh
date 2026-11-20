#!/usr/bin/env bash
set -euo pipefail
START_FRAMES_DIRECTORY=${START_FRAMES_DIRECTORY:-/tmp/agridelta-live-frames}
# Keep alpha independent of the RGB denoising/interpolation pipeline.
ffmpeg -hide_banner -loglevel warning -filter_complex_threads 2 -framerate 8 -i "$START_FRAMES_DIRECTORY"/plant_%04d.png -filter_complex '[0:v]split=2[c][a];[c]format=yuv420p,hqdn3d=1.2:1.2:2:2,minterpolate=fps=24:mi_mode=blend[c1];[a]alphaextract,format=yuv444p,minterpolate=fps=24:mi_mode=blend,extractplanes=y,scale=in_range=tv:out_range=pc,format=gray,setparams=range=full[a1];[c1][a1]alphamerge,format=yuva420p[out]' -map '[out]' -c:v libvpx-vp9 -crf 30 -b:v 0 -auto-alt-ref 0 -row-mt 1 -cpu-used 4 -threads 4 -y public/assets/start-lifecycle-film.webm
for i in 0 1 2 3 4; do
 ffmpeg -hide_banner -loglevel warning -framerate 18 -i /tmp/agridelta-root-frames/root_${i}_%03d.png -vf format=yuva420p -c:v libvpx-vp9 -crf 26 -b:v 0 -auto-alt-ref 0 -row-mt 1 -cpu-used 4 -threads 3 -y public/assets/start-root-motion-${i}.webm
done
