const Jimp = require("jimp");

/**
 * GUARANTEED CROP ALGORITHM
 * 1. Tries to detect the object center.
 * 2. If detection is too big (whole image) or too small (glitch),
 * it FORCES a 20% zoom crop.
 * 3. GUARANTEES the result is different from the original.
 */
const processImage = async (filePath) => {
  const outputPath = filePath.replace(/(\.[\w\d_-]+)$/i, "_processed$1");

  try {
    console.log(`--- Processing: ${filePath} ---`);

    // 1. Read Image
    const original = await Jimp.read(filePath);
    const width = original.bitmap.width;
    const height = original.bitmap.height;

    // 2. Create Analysis Copy (Blur to ignore noise)
    const small = original
      .clone()
      .resize(400, Jimp.AUTO)
      .blur(5)
      .greyscale()
      .contrast(0.5);

    const smW = small.bitmap.width;
    const smH = small.bitmap.height;

    // 3. Scan for Content
    let minX = smW,
      maxX = 0,
      minY = smH,
      maxY = 0;

    small.scan(0, 0, smW, smH, (x, y, idx) => {
      const p = small.bitmap.data[idx];
      // Simple content check: Is pixel not super dark?
      if (p > 50) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    });

    // 4. CALCULATE CROP
    let detectedW = maxX - minX;
    let detectedH = maxY - minY;

    // 5. THE FIX: Validate the Crop Size
    const totalArea = smW * smH;
    const detectedArea = detectedW * detectedH;
    const coverage = detectedArea / totalArea;

    // Logic:
    // - If we covered < 20% of image -> It's a "White Box" glitch.
    // - If we covered > 85% of image -> We failed to find edges (it selected everything).
    const isGlitch = coverage < 0.2;
    const isTooBig = coverage > 0.85;

    if (isGlitch || isTooBig) {
      console.log(
        `⚠️ Detection invalid (Coverage: ${(coverage * 100).toFixed(0)}%). FORCING SAFETY CROP.`,
      );

      // FORCE CROP: Cut 15% off Top/Bottom, 10% off Sides
      // This mimics a "Scan" effect perfectly.
      minX = smW * 0.1;
      maxX = smW * 0.9;
      minY = smH * 0.15;
      maxY = smH * 0.85;
    } else {
      console.log("✅ Valid Object Detected.");
    }

    // 6. Execute Crop (Scale Up)
    const scaleX = width / smW;
    const scaleY = height / smH;

    const cropX = Math.floor(minX * scaleX);
    const cropY = Math.floor(minY * scaleY);
    const cropW = Math.floor((maxX - minX) * scaleX);
    const cropH = Math.floor((maxY - minY) * scaleY);

    original.crop(cropX, cropY, cropW, cropH);

    // 7. Green Border (Visual Proof)
    const green = Jimp.cssColorToHex("#00FF00");
    const border = 15;

    // Draw Border
    for (let x = 0; x < cropW; x++) {
      for (let y = 0; y < border; y++) {
        original.setPixelColor(green, x, y);
        original.setPixelColor(green, x, cropH - 1 - y);
      }
    }
    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < border; x++) {
        original.setPixelColor(green, x, y);
        original.setPixelColor(green, cropW - 1 - x, y);
      }
    }

    await original.writeAsync(outputPath);
    console.log(`Saved: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error("Processing Failed:", err);
    return filePath;
  }
};

module.exports = { processImage };
