import { createWriteStream } from 'node:fs';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve, sep } from 'node:path';

// A dependency-free ZIP writer: works on Windows, macOS, and Linux with Node.
// It includes source + the existing dist build; dependencies and secrets stay out.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(root, 'artifacts');
const output = join(outputDir, 'hailegebriel-marketing-portfolio.zip');
const excluded = new Set([
  'node_modules',
  '.git',
  '.vercel',
  '.openai',
  '.DS_Store',
  'artifacts',
]);
const table = Array.from({ length: 256 }, (_, n) => {
  let value = n;
  for (let k = 0; k < 8; k += 1)
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes)
    value = table[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}
async function files(directory) {
  const list = [];
  for (const item of (await readdir(directory, { withFileTypes: true })).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    if (
      excluded.has(item.name) ||
      (item.name.startsWith('.env') && item.name !== '.env.example') ||
      item.name.endsWith('.log')
    )
      continue;
    const path = join(directory, item.name);
    if (item.isDirectory()) list.push(...(await files(path)));
    else if (item.isFile()) list.push(path);
  }
  return list;
}

await mkdir(outputDir, { recursive: true });
const stream = createWriteStream(output);
const complete = new Promise((resolveDone, reject) => {
  stream.on('finish', resolveDone);
  stream.on('error', reject);
});
const entries = [];
let offset = 0;
for (const file of await files(root)) {
  const name = Buffer.from(
    `hailegebriel-marketing-portfolio/${relative(root, file).split(sep).join('/')}`,
  );
  const bytes = await readFile(file);
  const checksum = crc32(bytes);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(0x21, 12);
  header.writeUInt32LE(checksum, 14);
  header.writeUInt32LE(bytes.length, 18);
  header.writeUInt32LE(bytes.length, 22);
  header.writeUInt16LE(name.length, 26);
  stream.write(header);
  stream.write(name);
  stream.write(bytes);
  entries.push({ name, bytes: bytes.length, checksum, offset });
  offset += header.length + name.length + bytes.length;
}
const centralOffset = offset;
for (const entry of entries) {
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(0x21, 14);
  central.writeUInt32LE(entry.checksum, 16);
  central.writeUInt32LE(entry.bytes, 20);
  central.writeUInt32LE(entry.bytes, 24);
  central.writeUInt16LE(entry.name.length, 28);
  central.writeUInt32LE(entry.offset, 42);
  stream.write(central);
  stream.write(entry.name);
  offset += central.length + entry.name.length;
}
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(entries.length, 8);
end.writeUInt16LE(entries.length, 10);
end.writeUInt32LE(offset - centralOffset, 12);
end.writeUInt32LE(centralOffset, 16);
stream.end(end);
await complete;
console.log(`Created ${output} (${entries.length} files)`);
