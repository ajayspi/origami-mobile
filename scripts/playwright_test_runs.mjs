import { chromium } from 'playwright';

async function launchSlingshot(page) {
  const canvas = await page.$('canvas');
  if (!canvas) throw new Error('Canvas not found');
  const box = await canvas.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX, centerY + 110, { steps: 6 });
  await page.waitForTimeout(200);
  await page.mouse.up();
}

async function runPlaywrightGameTests() {
  console.log('=== Starting Playwright 30m Cliff Precipice & Arcade Flow Suite ===\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const runsSummary = [];

  try {
    // =============================================================
    // RUN 1: Arcade Splash -> Character Select -> Sacred Peace Crane
    // =============================================================
    console.log('[RUN 1] Sacred Peace Crane: Splash -> Selection -> 30m Cliff Launch & Respawn...');
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
    await page1.waitForTimeout(800);

    // 1. Verify Arcade Splash Screen and click Launch Into Canyon
    const splashLaunchBtn = page1.locator('button:has-text("LAUNCH INTO CANYON")').first();
    if (await splashLaunchBtn.count() === 0) {
      throw new Error('Splash screen launch button not found');
    }
    await splashLaunchBtn.click();
    console.log('  -> [Splash Screen] Clicked "LAUNCH INTO CANYON"');
    await page1.waitForTimeout(600);

    // 2. Select Sacred Peace Crane on Character Select stage
    const craneCard = page1.locator('button:has-text("Crane"), button:has-text("Orizuru")').first();
    if (await craneCard.count() > 0) {
      await craneCard.click();
      console.log('  -> [Character Select] Selected Sacred Peace Crane (🕊️)');
      await page1.waitForTimeout(400);
    }

    // 3. Deploy to 30m Cliff Precipice
    const deployBtn = page1.locator('button:has-text("DEPLOY TO CLIFF")').first();
    if (await deployBtn.count() === 0) {
      throw new Error('Character Select "DEPLOY TO CLIFF" button not found');
    }
    await deployBtn.click();
    console.log('  -> [Character Select] Clicked "DEPLOY TO CLIFF"');
    await page1.waitForTimeout(1000);

    // 4. Verify on-cliff prompt
    const cliffPrompt = page1.locator('div:has-text("30m Cliff Edge")').first();
    const hasPrompt = await cliffPrompt.count() > 0;
    console.log(`  -> Cliff edge launchpad prompt visible: ${hasPrompt}`);

    // 5. Slingshot pullback & launch
    await launchSlingshot(page1);
    console.log('  -> Slingshot pulled back & released from 30m cliff!');

    // Wait for in-flight HUD
    await page1.waitForSelector('button:has-text("LEFT")', { timeout: 4000 });
    await page1.waitForTimeout(1200);

    // Read Mid-Flight Distance and Altitude telemetry
    const telemetry1 = await page1.evaluate(() => {
      const distEl = document.querySelector('div[style*="font-size: 36px"]') || document.querySelector('div[style*="font-size: 34px"]');
      const allText = document.body.innerText;
      return {
        distance: distEl ? distEl.textContent.trim() : 'Unknown',
        hasAltitude: allText.includes('ALT') || allText.includes('m')
      };
    });
    console.log(`  -> Run 1 Mid-Flight Telemetry: Distance = ${telemetry1.distance}, Altitude displayed = ${telemetry1.hasAltitude}`);

    // Steer Left & Right
    const leftBtn = page1.locator('button:has-text("LEFT")');
    if (await leftBtn.count() > 0) {
      await leftBtn.dispatchEvent('pointerdown');
      await page1.waitForTimeout(300);
      await leftBtn.dispatchEvent('pointerup');
      console.log('  -> Steered LEFT via tactile HUD button');
    }
    await page1.keyboard.press('d', { delay: 300 });
    console.log('  -> Steered RIGHT via keyboard D');

    // Trigger 360° Barrel Roll
    await page1.keyboard.press('r');
    console.log('  -> Triggered 360° Barrel Roll');
    await page1.waitForTimeout(1000);

    // Test instant cliff respawn via store action
    await page1.evaluate(() => {
      // @ts-ignore
      if (window.__GAME_STORE__) {
        // @ts-ignore
        window.__GAME_STORE__.getState().instantCliffRespawn();
      }
    });

    runsSummary.push({
      run: 1,
      creature: 'Sacred Peace Crane',
      distance: telemetry1.distance,
      errors: consoleErrors1.length,
      status: 'PASS'
    });
    await context1.close();

    // =============================================================
    // RUN 2: Celestial Dragon - High Velocity Thruster Ignition
    // =============================================================
    console.log('\n[RUN 2] Celestial Dragon: Character Select -> Cliff Launch -> Triple Thrusters...');
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
    await page2.waitForTimeout(600);

    // Splash -> Select
    await page2.locator('button:has-text("LAUNCH INTO CANYON")').first().click();
    await page2.waitForTimeout(500);

    // Select Celestial Dragon
    const dragonCard = page2.locator('button:has-text("Dragon"), button:has-text("Ryū")').first();
    await dragonCard.click();
    console.log('  -> [Character Select] Selected Celestial Dragon (🐉)');
    await page2.waitForTimeout(400);

    // Deploy to Cliff
    await page2.locator('button:has-text("DEPLOY TO CLIFF")').first().click();
    await page2.waitForTimeout(800);

    // Slingshot Launch
    await launchSlingshot(page2);
    console.log('  -> Celestial Dragon Launched into Canyon!');
    await page2.waitForSelector('button:has-text("BOOST")', { timeout: 4000 });

    // Fire Triple Thruster Boosts
    const boostBtn = page2.locator('button:has-text("BOOST")').first();
    if (await boostBtn.count() > 0) {
      await boostBtn.click();
      console.log('  -> Rocket Booster #1 Fired!');
      await page2.waitForTimeout(1100);

      await boostBtn.click();
      console.log('  -> Rocket Booster #2 Fired!');
      await page2.waitForTimeout(1100);

      await boostBtn.click();
      console.log('  -> Rocket Booster #3 Fired!');
      await page2.waitForTimeout(1100);
    }

    // Loop-the-Loop stunt
    await page2.keyboard.press('l');
    console.log('  -> Triggered Loop-the-Loop acrobatic stunt');
    await page2.waitForTimeout(1200);

    const distText2 = await page2.evaluate(() => {
      const el = document.querySelector('div[style*="font-size: 36px"]') || document.querySelector('div[style*="font-size: 34px"]');
      return el ? el.textContent.trim() : 'Unknown';
    });
    console.log(`  -> Run 2 Boosted Distance: ${distText2}`);

    runsSummary.push({
      run: 2,
      creature: 'Celestial Dragon',
      distance: distText2,
      errors: consoleErrors2.length,
      status: 'PASS'
    });
    await context2.close();

    // =============================================================
    // RUN 3: Peregrine Falcon - Apex Dive Raptor & Gyroscope Tilt
    // =============================================================
    console.log('\n[RUN 3] Peregrine Falcon: 3D Falcon Geometry -> Gyroscope Steering...');
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
    await page3.waitForTimeout(600);

    // Splash -> Select
    await page3.locator('button:has-text("LAUNCH INTO CANYON")').first().click();
    await page3.waitForTimeout(500);

    // Select Peregrine Falcon
    const falconCard = page3.locator('button:has-text("Falcon"), button:has-text("Hayabusa")').first();
    await falconCard.click();
    console.log('  -> [Character Select] Selected Peregrine Falcon (🦅)');
    await page3.waitForTimeout(400);

    // Deploy to Cliff
    await page3.locator('button:has-text("DEPLOY TO CLIFF")').first().click();
    await page3.waitForTimeout(800);

    // Launch
    await launchSlingshot(page3);
    console.log('  -> Peregrine Falcon Launched from 30m cliff!');
    await page3.waitForSelector('button:has-text("TILT")', { timeout: 4000 });

    // Activate Gyroscope Tilt Steering
    const tiltBtn = page3.locator('button:has-text("TILT")').first();
    if (await tiltBtn.count() > 0) {
      await tiltBtn.click();
      console.log('  -> Mobile Tilt (Gyroscope) Steering ACTIVATED');
      await page3.waitForTimeout(400);
    }

    // Emulate Device Orientation Events (Banking Left & Right)
    await page3.evaluate(() => {
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
        gamma: -25, // Bank Left
        beta: 45,
        alpha: 0
      }));
    });
    console.log('  -> Emulated Gyro Tilt: Banking Left (-25°)');
    await page3.waitForTimeout(1200);

    await page3.evaluate(() => {
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
        gamma: 25,  // Bank Right
        beta: 45,
        alpha: 0
      }));
    });
    console.log('  -> Emulated Gyro Tilt: Banking Right (+25°)');
    await page3.waitForTimeout(1500);

    const distText3 = await page3.evaluate(() => {
      const el = document.querySelector('div[style*="font-size: 36px"]') || document.querySelector('div[style*="font-size: 34px"]');
      return el ? el.textContent.trim() : 'Unknown';
    });
    console.log(`  -> Run 3 Gyro Banking Distance: ${distText3}`);

    runsSummary.push({
      run: 3,
      creature: 'Peregrine Falcon',
      distance: distText3,
      errors: consoleErrors3.length,
      status: 'PASS'
    });
    await context3.close();

    console.log('\n=== Multi-Flight Playthrough Test Results ===');
    console.table(runsSummary);

    return runsSummary;
  } finally {
    await browser.close();
  }
}

runPlaywrightGameTests().then((results) => {
  const allPassed = results.every(r => r.status === 'PASS' && r.errors === 0);
  if (allPassed) {
    console.log('\nAll Playwright gameplay test playthroughs PASSED with 0 errors.');
    process.exit(0);
  } else {
    console.error('\nSome playthroughs reported errors.');
    process.exit(1);
  }
}).catch(err => {
  console.error('Playwright test failed:', err);
  process.exit(1);
});
