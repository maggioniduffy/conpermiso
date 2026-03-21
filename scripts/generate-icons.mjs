import sharp from "sharp";

const sizes = [
  { size: 192, name: "android-chrome-192x192.png" },
  { size: 512, name: "android-chrome-512x512.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 32,  name: "favicon-32x32.png" },
  { size: 16,  name: "favicon-16x16.png" },
];

for (const { size, name } of sizes) {
  await sharp("public/biglogo_blue.png")
    .resize(size, size)
    .png()
    .toFile(`public/${name}`);
  console.log(`✓ ${name}`);
}
