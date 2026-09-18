const Jimp = require('jimp');
const fs = require('fs');

async function processImage() {
  const image = await Jimp.read('C:/Users/Harshith/.gemini/antigravity-ide/brain/1064e88f-fa2d-4a3f-8ec8-87db98c8d3d6/.user_uploaded/media_1789719151733.jpg');
  console.log(`Dimensions: ${image.bitmap.width}x${image.bitmap.height}`);
  
  // Make white transparent
  const threshold = 240;
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const red = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue = this.bitmap.data[idx + 2];
    
    if (red > threshold && green > threshold && blue > threshold) {
      this.bitmap.data[idx + 3] = 0; // Alpha
    }
  });

  const w = image.bitmap.width / 2;
  const h = image.bitmap.height / 2;

  fs.mkdirSync('public/assets/robots', { recursive: true });

  image.clone().crop(0, 0, w, h).write('public/assets/robots/robot-standard.png');
  image.clone().crop(w, 0, w, h).write('public/assets/robots/robot-repair.png');
  image.clone().crop(0, h, w, h).write('public/assets/robots/robot-heavy.png');
  image.clone().crop(w, h, w, h).write('public/assets/robots/robot-shield.png');
  console.log('Processed successfully!');
}

processImage().catch(console.error);
