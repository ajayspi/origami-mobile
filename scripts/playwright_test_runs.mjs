import { chromium } from 'playwright';

async function launchSlingshot(page) {
  const canvas = await page.$('canvas');
  if (!canvas) throw new Error('Canvas not found');
  const box = await canvas.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX, centerY + 105, { steps: 5 });
  await page.waitForTimeout(200);
  await page.mouse.up();
}

async function runPlaywrightGameTests() {
  console.log('--- Starting Playwright Automated Multi-Flight Playthroughs ---');

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const runsSummary = [];

  try {
    // -------------------------------------------------------------
    // RUN 1: Falcon Dart (Slingshot + Tactical Steer + Barrel Roll)
    // -------------------------------------------------------------
    console.log('\n[RUN 1] Falcon Dart - High Agility Slingshot & Slalom Banking...');
    const context1 = await browser.newContext({
      viewport: { width: 412, height: 915 },
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36'
    });
    const page1 = await context1.newPage();

    const consoleErrors1 = [];
    page1.on('console', msg => {
      if (msg.type() === 'error') consoleErrors1.push(msg.text());
    });

    await page1.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page1.waitForTimeout(1000);

    // Slingshot Aim & Launch
    await launchSlingshot(page1);
    console.log('  -> Slingshot released!');

    // Wait for in-flight HUD
    await page1.waitForSelector('button:has-text("LEFT")', { timeout: 4000 });
    await page1.waitForTimeout(1000);

    // Steer Left using on-screen button
    const leftBtn = page1.locator('button:has-text("LEFT")');
    if (await leftBtn.count() > 0) {
      await leftBtn.dispatchEvent('pointerdown');
      await page1.waitForTimeout(400);
      await leftBtn.dispatchEvent('pointerup');
      console.log('  -> Steered LEFT via tactile HUD button');
    }

    // Steer Right via 'D' key
    await page1.keyboard.press('d', { delay: 300 });
    console.log('  -> Steered RIGHT via keyboard D key');

    // Trigger Barrel Roll via 'R' key
    await page1.keyboard.press('r');
    console.log('  -> Triggered 360° Barrel Roll');
    await page1.waitForTimeout(1000);

    // Read HUD telemetry text
    const distText1 = await page1.evaluate(() => {
      const el = document.querySelector('div[style*="font-size: 36px"]') || document.querySelector('div[style*="font-size: 34px"]');
      return el ? el.textContent.trim() : 'Unknown';
    });
    console.log(`  -> Run 1 Mid-Flight Distance: ${distText1}`);

    runsSummary.push({
      run: 1,
      kit: 'Falcon Dart',
      distance: distText1,
      errors: consoleErrors1.length
    });
    await context1.close();

    // -------------------------------------------------------------
    // RUN 2: Sacred Peace Crane - Thruster Booster & Loop-the-Loop
    // -------------------------------------------------------------
    console.log('\n[RUN 2] Sacred Peace Crane - Triple Rocket Thruster Ignition...');
    const context2 = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 14
      isMobile: true,
      hasTouch: true
    });
    const page2 = await context2.newPage();
    const consoleErrors2 = [];
    page2.on('console', msg => {
      if (msg.type() === 'error') consoleErrors2.push(msg.text());
    });

    await page2.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page2.waitForTimeout(1000);

    // Select Sacred Peace Crane (🕊️)
    const craneBtn = page2.locator('button:has-text("Crane"), button:has-text("🕊️")').first();
    if (await craneBtn.count() > 0) {
      await craneBtn.click();
      console.log('  -> Switched to Sacred Peace Crane (🕊️)');
      await page2.waitForTimeout(600);
    }

    // Launch via Slingshot
    await launchSlingshot(page2);
    console.log('  -> Slingshot Launch initiated!');
    await page2.waitForSelector('button:has-text("BOOST")', { timeout: 4000 });

    // Fire Thruster Boost #1
    const boostBtn = page2.locator('button:has-text("BOOST")').first();
    if (await boostBtn.count() > 0) {
      await boostBtn.click();
      console.log('  -> Rocket Booster #1 Fired!');
      await page2.waitForTimeout(1300);

      // Fire Thruster Boost #2
      await boostBtn.click();
      console.log('  -> Rocket Booster #2 Fired!');
      await page2.waitForTimeout(1300);

      // Fire Thruster Boost #3
      await boostBtn.click();
      console.log('  -> Rocket Booster #3 Fired!');
      await page2.waitForTimeout(1300);
    }

    // Trigger Loop-the-Loop via 'L' key
    await page2.keyboard.press('l');
    console.log('  -> Triggered Loop-the-Loop Stunt');
    await page2.waitForTimeout(1500);

    const distText2 = await page2.evaluate(() => {
      const el = document.querySelector('div[style*="font-size: 36px"]') || document.querySelector('div[style*="font-size: 34px"]');
      return el ? el.textContent.trim() : 'Unknown';
    });
    console.log(`  -> Run 2 Boosted Distance: ${distText2}`);

    runsSummary.push({
      run: 2,
      kit: 'Sacred Peace Crane',
      distance: distText2,
      errors: consoleErrors2.length
    });
    await context2.close();

    // -------------------------------------------------------------
    // RUN 3: Celestial Dragon - Gyroscope Tilt Steering & Touchdown
    // -------------------------------------------------------------
    console.log('\n[RUN 3] Celestial Dragon - Gyroscope Device Orientation Tilt...');
    const context3 = await browser.newContext({
      viewport: { width: 412, height: 915 },
      isMobile: true,
      hasTouch: true
    });
    const page3 = await context3.newPage();
    const consoleErrors3 = [];
    page3.on('console', msg => {
      if (msg.type() === 'error') consoleErrors3.push(msg.text());
    });

    await page3.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page3.waitForTimeout(1000);

    // Select Celestial Dragon (🐉)
    const dragonBtn = page3.locator('button:has-text("Dragon"), button:has-text("🐉")').first();
    if (await dragonBtn.count() > 0) {
      await dragonBtn.click();
      console.log('  -> Switched to Celestial Dragon (🐉)');
      await page3.waitForTimeout(600);
    }

    // Launch
    await launchSlingshot(page3);
    console.log('  -> Celestial Dragon Launched!');
    await page3.waitForSelector('button:has-text("TILT")', { timeout: 4000 });

    // Toggle Tilt (Gyro) Steering
    const tiltBtn = page3.locator('button:has-text("TILT")').first();
    if (await tiltBtn.count() > 0) {
      await tiltBtn.click();
      console.log('  -> Mobile Tilt (Gyroscope) Steering ACTIVATED');
      await page3.waitForTimeout(500);
    }

    // Dispatch synthetic deviceorientation events (tilt left, then tilt right)
    await page3.evaluate(() => {
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
        gamma: -24, // Roll left
        beta: 52,   // Pitch forward
        alpha: 0
      }));
    });
    console.log('  -> Emulated Gyro tilt: Left (-24°) & Pitch Dive');
    await page3.waitForTimeout(1500);

    await page3.evaluate(() => {
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
        gamma: 26,  // Roll right
        beta: 40,   // Pitch climb
        alpha: 0
      }));
    });
    console.log('  -> Emulated Gyro tilt: Right (+26°) & Pitch Climb');
    await page3.waitForTimeout(2000);

    const distText3 = await page3.evaluate(() => {
      const el = document.querySelector('div[style*="font-size: 36px"]') || document.querySelector('div[style*="font-size: 34px"]');
      return el ? el.textContent.trim() : 'Unknown';
    });
    console.log(`  -> Run 3 Gyro Guided Distance: ${distText3}`);

    runsSummary.push({
      run: 3,
      kit: 'Celestial Dragon',
      distance: distText3,
      errors: consoleErrors3.length
    });
    await context3.close();

    console.log('\n=== Multi-Flight Playthrough Test Results ===');
    console.table(runsSummary);

    return runsSummary;
  } finally {
    await browser.close();
  }
}

runPlaywrightGameTests().then(() => {
  console.log('Playwright gameplay test suite finished successfully.');
  process.exit(0);
}).catch(err => {
  console.error('Playwright test failed:', err);
  process.exit(1);
});
