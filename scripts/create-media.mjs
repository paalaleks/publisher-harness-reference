import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";

// Original CC0 fixture artwork, encoded directly as RGB PNG without external assets.
const width = 720;
const height = 360;
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, bytes) {
  const data = Buffer.concat([Buffer.from(type), bytes]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(bytes.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(data));
  return Buffer.concat([length, data, checksum]);
}
function png(pixel) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    raw.set(pixel(x, y), y * (width * 3 + 1) + 1 + x * 3);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
const directory = fileURLToPath(new URL("../public/media/", import.meta.url));
mkdirSync(directory, { recursive: true });
writeFileSync(`${directory}/harbour.png`, png((x, y) => {
  if (x > 460 && x < 620 && y > 105 && y < 235) return x > 520 && x < 553 && y > 150 ? [240, 220, 161] : [163, 66, 45];
  if (y > 260) return y % 28 < 2 ? [179, 207, 205] : [80, 134, 140];
  if (y > 235) return [192, 174, 144];
  return [224, 232, 220];
}));
writeFileSync(`${directory}/garden.png`, png((x, y) => {
  if (y > 110 && y < 300 && x > 70 && x < 650 && x % 200 < 150) {
    return x % 36 < 14 && y % 42 < 20 ? [99, 135, 75] : [112, 82, 59];
  }
  return [216, 219, 182];
}));
