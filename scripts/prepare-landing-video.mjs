// One-time media preparation. FFmpeg is a development tool, not a web dependency.
import {spawnSync} from 'node:child_process';
import {mkdirSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const ffmpeg = process.argv[2] || 'ffmpeg';
const frontend = fileURLToPath(new URL('../frontend/', import.meta.url));
const source = join(frontend, 'media-source/PortadaAstraAnalog.mp4');
const output = join(frontend, 'public/media');
mkdirSync(output, {recursive: true});

function run(args) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', ...args], {encoding: 'utf8', maxBuffer: 4 * 1024 * 1024});
  if (result.error || result.status !== 0) throw result.error || new Error(result.stderr);
  return result.stdout;
}

const progress = run(['-i', source, '-map', '0:v:0', '-an', '-progress', 'pipe:1', '-nostats', '-f', 'null', '-']);
const frameCount = Number([...progress.matchAll(/^frame=(\d+)/gm)].at(-1)?.[1]);
if (frameCount < 3) throw new Error('El video necesita al menos tres cuadros.');
const desktop = join(output, 'astra-pendulum-1280.mp4');
const mobile = join(output, 'astra-pendulum-768.mp4');
const encoding = ['-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-map_metadata', '-1', '-threads', '2'];

// Omit repeated endpoints: 0..N-1, N-2..1, then loop back to 0.
run(['-i', source, '-filter_complex_threads', '1', '-filter_complex',
  `[0:v]setsar=1,split[f][r];[f]setpts=PTS-STARTPTS[forward];[r]reverse,trim=start_frame=1:end_frame=${frameCount - 1},setpts=PTS-STARTPTS[back];[forward][back]concat=n=2:v=1:a=0[loop]`,
  '-map', '[loop]', ...encoding, desktop]);
run(['-i', desktop, '-vf', 'scale=768:-2', ...encoding, mobile]);
run(['-i', source, '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '3', join(output, 'astra-poster.jpg')]);
for (const name of ['astra-pendulum-1280.mp4', 'astra-pendulum-768.mp4', 'astra-poster.jpg']) {
  console.log(`${name}: ${(statSync(join(output, name)).size / 1_000_000).toFixed(2)} MB`);
}
