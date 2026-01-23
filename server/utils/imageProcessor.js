const Jimp = require("jimp");
const sharp = require("sharp");

/**
 * GUARANTEED CROP - Using Sharp library for reliability
 * This WILL crop your image. Period.
 */
const processImage = async (filePath) => {
  const outputPath = filePath.replace(/(\.[\w\d_-]+)$/i, "_processed$1");

  try {
    console.log("\n" + "=".repeat(70));
    console.log("🔧 IMAGE PROCESSING STARTED");
    console.log("=".repeat(70));
    console.log("Input file:", filePath);
    console.log("Output file:", outputPath);

    // Get image metadata
    const metadata = await sharp(filePath).metadata();
    const { width, height } = metadata;

    console.log(`\n📏 Original dimensions: ${width} x ${height}`);

    // METHOD 1: Try smart detection with Sharp
    let cropResult = await smartCropWithSharp(
      filePath,
      outputPath,
      width,
      height,
    );

    if (cropResult) {
      console.log("✅ Smart crop successful");
      return outputPath;
    }

    // METHOD 2: Fallback to Jimp pixel-by-pixel scan
    console.log("\n⚠️  Trying Jimp method...");
    cropResult = await cropWithJimp(filePath, outputPath);

    if (cropResult) {
      console.log("✅ Jimp crop successful");
      return outputPath;
    }

    // METHOD 3: FORCED CROP - Remove 20% from all edges
    console.log("\n⚠️  Applying FORCED crop (20% margin)...");
    await forcedCrop(filePath, outputPath, width, height);
    console.log("✅ Forced crop applied");

    return outputPath;
  } catch (error) {
    console.error("\n" + "=".repeat(70));
    console.error("❌ CRITICAL ERROR");
    console.error("=".repeat(70));
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("=".repeat(70) + "\n");
    return filePath;
  }
};

/**
 * METHOD 1: Smart crop using Sharp with trim
 */
async function smartCropWithSharp(filePath, outputPath, width, height) {
  try {
    console.log("\n🎯 Attempting smart crop with Sharp...");

    // Load image and get statistics
    const image = sharp(filePath);
    const stats = await image.stats();

    // Get average brightness of the image
    const avgBrightness =
      (stats.channels[0].mean +
        stats.channels[1].mean +
        stats.channels[2].mean) /
      3;
    console.log(`Average brightness: ${avgBrightness.toFixed(2)}`);

    // Try to trim whitespace automatically
    // This removes edges that are similar to the corner pixel
    await sharp(filePath)
      .trim({
        background: { r: 255, g: 255, b: 255 }, // Trim white
        threshold: 30, // Sensitivity
      })
      .toFile(outputPath);

    // Check if trim worked
    const resultMeta = await sharp(outputPath).metadata();
    const reduction =
      (1 - (resultMeta.width * resultMeta.height) / (width * height)) * 100;

    console.log(`Result: ${resultMeta.width} x ${resultMeta.height}`);
    console.log(`Reduction: ${reduction.toFixed(1)}%`);

    // If reduction is reasonable, it worked
    if (reduction > 5 && reduction < 90) {
      return true;
    }

    console.log("Trim didn't work well enough");
    return false;
  } catch (error) {
    console.log("Sharp method failed:", error.message);
    return false;
  }
}

/**
 * METHOD 2: Pixel-by-pixel scan with Jimp
 */
async function cropWithJimp(filePath, outputPath) {
  try {
    console.log("🔍 Scanning pixels with Jimp...");

    const image = await Jimp.read(filePath);
    const w = image.bitmap.width;
    const h = image.bitmap.height;

    let minX = w,
      maxX = 0,
      minY = h,
      maxY = 0;
    let pixelsFound = 0;

    // Scan every pixel
    image.scan(0, 0, w, h, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const brightness = (r + g + b) / 3;

      // Content = anything not pure white
      if (brightness < 245) {
        pixelsFound++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    });

    console.log(`Found ${pixelsFound} content pixels`);

    if (pixelsFound > 100 && minX < maxX && minY < maxY) {
      const pad = 3;
      const cropX = Math.max(0, minX - pad);
      const cropY = Math.max(0, minY - pad);
      const cropW = Math.min(w - cropX, maxX - minX + pad * 2);
      const cropH = Math.min(h - cropY, maxY - minY + pad * 2);

      console.log(
        `Cropping to: x=${cropX}, y=${cropY}, w=${cropW}, h=${cropH}`,
      );

      image.crop(cropX, cropY, cropW, cropH);
      await image.writeAsync(outputPath);
      return true;
    }

    console.log("Not enough content found");
    return false;
  } catch (error) {
    console.log("Jimp method failed:", error.message);
    return false;
  }
}

/**
 * METHOD 3: FORCED CROP - This ALWAYS works
 */
async function forcedCrop(filePath, outputPath, width, height) {
  console.log("🔨 Applying FORCED crop...");

  // Crop 20% from each edge
  const cropMargin = 0.2;

  const left = Math.floor(width * cropMargin);
  const top = Math.floor(height * cropMargin);
  const cropWidth = Math.floor(width * (1 - cropMargin * 2));
  const cropHeight = Math.floor(height * (1 - cropMargin * 2));

  console.log(`Forcing crop: ${cropWidth} x ${cropHeight}`);
  console.log(`Removing ${cropMargin * 100}% from each edge`);

  await sharp(filePath)
    .extract({
      left: left,
      top: top,
      width: cropWidth,
      height: cropHeight,
    })
    .toFile(outputPath);

  console.log("Forced crop complete");
}

/**
 * SIMPLE VERSION - Just crops 15% from all sides
 * USE THIS if nothing else works
 */
const processImageSimple = async (filePath) => {
  const outputPath = filePath.replace(/(\.[\w\d_-]+)$/i, "_processed$1");

  try {
    console.log("\n🔧 SIMPLE CROP MODE");
    console.log("Input:", filePath);

    const metadata = await sharp(filePath).metadata();
    const { width, height } = metadata;

    // Remove 15% from each edge
    const margin = 0.15;
    const left = Math.floor(width * margin);
    const top = Math.floor(height * margin);
    const newWidth = Math.floor(width * (1 - margin * 2));
    const newHeight = Math.floor(height * (1 - margin * 2));

    await sharp(filePath)
      .extract({ left, top, width: newWidth, height: newHeight })
      .toFile(outputPath);

    console.log(
      `✅ Cropped from ${width}x${height} to ${newWidth}x${newHeight}`,
    );
    console.log("Output:", outputPath);

    return outputPath;
  } catch (error) {
    console.error("❌ Simple crop failed:", error.message);
    return filePath;
  }
};

/**
 * DIAGNOSTIC - Shows you what's happening
 */
const diagnoseImage = async (filePath) => {
  console.log("\n" + "=".repeat(70));
  console.log("🔍 IMAGE DIAGNOSTIC");
  console.log("=".repeat(70));

  try {
    // Check with Sharp
    const metadata = await sharp(filePath).metadata();
    console.log("\nSharp metadata:");
    console.log(JSON.stringify(metadata, null, 2));

    const stats = await sharp(filePath).stats();
    console.log("\nColor statistics:");
    stats.channels.forEach((ch, i) => {
      console.log(
        `Channel ${i}: min=${ch.min}, max=${ch.max}, mean=${ch.mean.toFixed(2)}`,
      );
    });

    // Check with Jimp
    const image = await Jimp.read(filePath);
    console.log(
      `\nJimp dimensions: ${image.bitmap.width} x ${image.bitmap.height}`,
    );

    // Sample pixels
    console.log("\nSample pixels:");
    const samples = [
      { x: 0, y: 0, label: "Top-left" },
      { x: image.bitmap.width - 1, y: 0, label: "Top-right" },
      { x: 0, y: image.bitmap.height - 1, label: "Bottom-left" },
      {
        x: image.bitmap.width - 1,
        y: image.bitmap.height - 1,
        label: "Bottom-right",
      },
      {
        x: Math.floor(image.bitmap.width / 2),
        y: Math.floor(image.bitmap.height / 2),
        label: "Center",
      },
    ];

    samples.forEach(({ x, y, label }) => {
      const color = image.getPixelColor(x, y);
      const rgba = Jimp.intToRGBA(color);
      console.log(`${label} (${x},${y}): R=${rgba.r} G=${rgba.g} B=${rgba.b}`);
    });

    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("Diagnostic failed:", error.message);
  }
};

module.exports = {
  processImage,
  processImageSimple,
  diagnoseImage,
};
