const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create a valid PNG image buffer
function createPngBuffer(width, height, r, g, b, a = 255) {
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[i] = c;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, c]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = chunk('IHDR', ihdr);

  // Scanlines with ambient gradient and circular vinyl look
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = width / 2;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      if (dist <= maxRadius * 0.95) {
        if (dist <= maxRadius * 0.28) {
          // Amber core spindle
          rawData[offset++] = 245; // R
          rawData[offset++] = 158; // G
          rawData[offset++] = 11;  // B
          rawData[offset++] = 255;
        } else if (dist <= maxRadius * 0.35) {
          // Gold ring
          rawData[offset++] = 217;
          rawData[offset++] = 119;
          rawData[offset++] = 6;
          rawData[offset++] = 255;
        } else {
          // Midnight vinyl body with groove variations
          const groove = Math.sin(dist * 0.8) * 8;
          rawData[offset++] = Math.min(255, Math.max(0, 15 + Math.floor(groove)));
          rawData[offset++] = Math.min(255, Math.max(0, 20 + Math.floor(groove)));
          rawData[offset++] = Math.min(255, Math.max(0, 32 + Math.floor(groove)));
          rawData[offset++] = 255;
        }
      } else {
        // Transparent border
        rawData[offset++] = 7;
        rawData[offset++] = 11;
        rawData[offset++] = 20;
        rawData[offset++] = 255;
      }
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = chunk('IDAT', idatData);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Create basic ICO format containing a 32x32 PNG
function createIcoFromPng(pngBuffer, width, height) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(1, 4); // 1 image

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(width === 256 ? 0 : width, 0);
  dirEntry.writeUInt8(height === 256 ? 0 : height, 1);
  dirEntry.writeUInt8(0, 2); // Palette
  dirEntry.writeUInt8(0, 3); // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // Size of image data
  dirEntry.writeUInt32LE(6 + 16, 12); // Offset to image data

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

const publicDir = path.resolve(__dirname, '../public');

// 1. Generate apple-touch-icon.png (180x180)
const appleIconBuf = createPngBuffer(180, 180, 245, 158, 11);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIconBuf);
console.log('✔ Generated public/apple-touch-icon.png (180x180)');

// 2. Generate favicon.ico (32x32)
const favPngBuf = createPngBuffer(32, 32, 245, 158, 11);
const icoBuf = createIcoFromPng(favPngBuf, 32, 32);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
console.log('✔ Generated public/favicon.ico (32x32)');
