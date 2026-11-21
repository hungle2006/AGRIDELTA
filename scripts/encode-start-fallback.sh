#!/usr/bin/env bash
set -euo pipefail

frames="${AGRIDELTA_START_FRAMES:-/tmp/agridelta-start-frames}"
for index in 0 1 2 3 4; do
  for layer in lifecycle root; do
    ffmpeg -hide_banner -loglevel error -i "$frames/$layer-$index.png" \
      -c:v libwebp -quality 83 -y "public/assets/start-botanical-$layer-$index.webp"
  done
done

ffmpeg -hide_banner -loglevel error -i "$frames/harvested.png" \
  -c:v libwebp -quality 83 -y public/assets/start-botanical-harvested.webp

ffmpeg -hide_banner -loglevel error -i "$frames/bean-pod.png" \
  -c:v libwebp -quality 88 -y public/assets/start-bean-pod.webp

if [[ -f "$frames/motion-000.png" ]]; then
  ffmpeg -hide_banner -loglevel error -filter_complex_threads 2 -framerate 6 -i "$frames/motion-%03d.png" \
    -filter_complex '[0:v]tpad=stop_mode=clone:stop_duration=0.5,split=2[c][a];[c]format=yuv420p,minterpolate=fps=24:mi_mode=blend[c1];[a]alphaextract,format=yuv444p,minterpolate=fps=24:mi_mode=blend,extractplanes=y,scale=in_range=tv:out_range=pc,format=gray,setparams=range=full[a1];[c1][a1]alphamerge,format=yuva420p[out]' \
    -map '[out]' -t 32.5 -c:v libvpx-vp9 -crf 32 -b:v 0 -auto-alt-ref 0 -row-mt 1 -threads 3 \
    -y "$frames/lifecycle.webm"
  mv "$frames/lifecycle.webm" public/assets/start-lifecycle-film.webm
fi
