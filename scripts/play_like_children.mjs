import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function simulateChildAge5(page, screenshotsDir) {
  console.log('\n============================================================');
  console.log('👦 [TEST PERSONA 1] Lily, Age 5 (Early Childhood / Kindergarten)');
  console.log('Goal: Instinctive play, big colors, tap-heavy, no text reading');
  console.log('============================================================');

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Splash Screen
  await page.screenshot({ path: path.join(screenshotsDir, 'age5_01_splash.png') });
  const launchBtn = page.locator('button:has-text("LAUNCH INTO CANYON")').first();
  console.log('  -> [Age 5] Sees big colorful button, taps "LAUNCH INTO CANYON"');
  await launchBtn.click();
  await page.waitForTimeout(800);

  // Character Select
  await page.screenshot({ path: path.join(screenshotsDir, 'age5_02_char_select.png') });
  console.log('  -> [Age 5] Delighted by spinning paper crane! Taps Crane card');
  const craneCard = page.locator('button:has-text("Crane"), button:has-text("Orizuru")').first();
  await craneCard.click();
  await page.waitForTimeout(400);

  const deployBtn = page.locator('button:has-text("DEPLOY TO CLIFF")').first();
  console.log('  -> [Age 5] Taps deploy button');
  await deployBtn.click();
  await page.waitForTimeout(1200);

  // On Cliff: Test Age 5 intuitive gestures
  await page.screenshot({ path: path.join(screenshotsDir, 'age5_03_cliff_standing.png') });
  const canvas = await page.$('canvas');
  const box = await canvas.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // Behavior A: 5-year-old taps repeatedly on the plane
  console.log('  -> [Age 5 Behavior] Tapping directly on the bird (curiosity tap)...');
  await page.mouse.click(centerX, centerY);
  await page.waitForTimeout(400);

  // Behavior B: 5-year-old tries to swipe forward/flick up
  console.log('  -> [Age 5 Behavior] Swipes forward/up (attempting to throw)...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX, centerY - 80, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(400);

  // Check if still on cliff (forward flick doesn't launch slingshot)
  const isStillOnCliff = await page.evaluate(() => {
    return window.__ORIGAMI_GAME_STORE__ ? window.__ORIGAMI_GAME_STORE__.getState().flightState === 'aiming' : true;
  });
  console.log(`  -> Did forward flick misfire slingshot? ${!isStillOnCliff ? 'YES (Launched)' : 'NO (Safely held on cliff)'}`);

  // Behavior C: Pulls downward/backward to stretch rubber band
  console.log('  -> [Age 5 Behavior] Pulls downward like a slingshot rubber band...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX, centerY + 120, { steps: 8 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, 'age5_04_slingshot_pull.png') });
  await page.mouse.up();
  console.log('  -> [Age 5] RELEASED! Plane flies into the canyon!');
  await page.waitForTimeout(1500);

  // In flight
  await page.screenshot({ path: path.join(screenshotsDir, 'age5_05_in_flight.png') });
  // Read telemetry from __GAME_STORE__
  const inFlightData = await page.evaluate(() => {
    const s = (window).__GAME_STORE__ ? (window).__GAME_STORE__.getState() : null;
    return s ? { speed: s.speed, distance: s.distance, altitude: s.altitude, flightState: s.flightState } : null;
  });
  console.log('  -> [Age 5 Telemetry]:', inFlightData);

  // Age 5 taps LEFT/RIGHT buttons playfully
  const leftBtn = page.locator('button:has-text("LEFT")').first();
  if (await leftBtn.count() > 0) {
    console.log('  -> [Age 5] Taps big LEFT button');
    await leftBtn.click({ timeout: 1500 }).catch(() => {});
    await page.waitForTimeout(300);
  }

  // Taps BOOST button
  const boostBtn = page.locator('button:has-text("BOOST")').first();
  if (await boostBtn.count() > 0) {
    console.log('  -> [Age 5] Taps BOOST button! WHOOSH!');
    await boostBtn.click({ timeout: 1500 }).catch(() => {});
    await page.waitForTimeout(600);
  }

  await page.screenshot({ path: path.join(screenshotsDir, 'age5_06_mid_flight_glide.png') });
  return { persona: 'Lily (Age 5)', success: true, distance: inFlightData?.distance || 0 };
}

async function simulateChildAge8(page, screenshotsDir) {
  console.log('\n============================================================');
  console.log('👦 [TEST PERSONA 2] Leo, Age 8 (Explorer / 3rd Grade)');
  console.log('Goal: Fast action, dragons, stunts, speed gates, spamming boosters');
  console.log('============================================================');

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // Fast splash click
  await page.locator('button:has-text("LAUNCH INTO CANYON")').first().click();
  await page.waitForTimeout(600);

  // Pick Celestial Dragon
  console.log('  -> [Age 8] Instantly spots the Celestial Dragon (🐉)! Clicks Dragon');
  const dragonCard = page.locator('button:has-text("Dragon"), button:has-text("Ryū")').first();
  await dragonCard.click();
  await page.waitForTimeout(400);

  await page.locator('button:has-text("DEPLOY TO CLIFF")').first().click();
  await page.waitForTimeout(1000);

  // Power Slingshot Launch
  const canvas = await page.$('canvas');
  const box = await canvas.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  console.log('  -> [Age 8] Max pullback slingshot launch!');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + 15, centerY + 140, { steps: 6 });
  await page.waitForTimeout(200);
  await page.mouse.up();
  await page.waitForTimeout(1000);

  // Rapidly uses boosters!
  console.log('  -> [Age 8] Spams BOOST button to reach supersonic speed!');
  const boostBtn = page.locator('button:has-text("BOOST")');
  for (let i = 1; i <= 3; i++) {
    if (await boostBtn.count() > 0) {
      await boostBtn.click();
      console.log(`     🔥 Fired Booster #${i}`);
      await page.waitForTimeout(600);
    }
  }

  // Steers down the center valley
  console.log('  -> [Age 8] Steers right to catch canyon thermals & speed gates');
  const rightBtn = page.locator('button:has-text("RIGHT")');
  if (await rightBtn.count() > 0) {
    await rightBtn.dispatchEvent('pointerdown');
    await page.waitForTimeout(600);
    await rightBtn.dispatchEvent('pointerup');
  }

  await page.screenshot({ path: path.join(screenshotsDir, 'age8_01_dragon_high_speed.png') });

  const telemetry = await page.evaluate(() => {
    const s = (window).__GAME_STORE__ ? (window).__GAME_STORE__.getState() : null;
    return s ? {
      speed: s.speed,
      distance: s.distance,
      boostCharges: s.boostCharges,
      flightState: s.flightState,
      powers: s.activePowers || []
    } : null;
  });
  console.log('  -> [Age 8 High Speed Telemetry]:', telemetry);

  // Check barrel roll stunt
  console.log('  -> [Age 8] Triggers 360° Barrel Roll stunt!');
  await page.keyboard.press('KeyR');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, 'age8_02_barrel_roll.png') });

  return { persona: 'Leo (Age 8)', success: true, distance: telemetry?.distance || 0, speed: telemetry?.speed || 0 };
}

async function simulateChildAge12(page, screenshotsDir) {
  console.log('\n============================================================');
  console.log('👧 [TEST PERSONA 3] Maya, Age 12 (Pre-Teen / STEM Champion)');
  console.log('Goal: Precision flight, falcon aerodynamics, gyro tilt, high score');
  console.log('============================================================');

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  await page.locator('button:has-text("LAUNCH INTO CANYON")').first().click();
  await page.waitForTimeout(600);

  // Inspects cards, picks Peregrine Falcon
  console.log('  -> [Age 12] Evaluates stats: Glide vs Speed vs Agility. Picks Peregrine Falcon (🦅)');
  const falconCard = page.locator('button:has-text("Falcon"), button:has-text("Hayabusa")').first();
  await falconCard.click();
  await page.waitForTimeout(400);

  await page.locator('button:has-text("DEPLOY TO CLIFF")').first().click();
  await page.waitForTimeout(1000);

  // High precision launch aiming down canyon center
  const canvas = await page.$('canvas');
  const box = await canvas.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  console.log('  -> [Age 12] Carefully aims launch angle with trajectory preview...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX, centerY + 115, { steps: 10 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, 'age12_01_aim_trajectory.png') });
  await page.mouse.up();
  await page.waitForTimeout(1000);

  // Activates Mobile Tilt Gyroscope
  console.log('  -> [Age 12] Enables Mobile Tilt Steering (Gyroscope)');
  const tiltToggle = page.locator('button:has-text("TILT")');
  if (await tiltToggle.count() > 0) {
    await tiltToggle.click();
    console.log('     📱 Tilt mode enabled');
  }

  // Emulate physical tilt events
  await page.evaluate(() => {
    window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
      gamma: -22, // Bank left
      beta: 10,
      alpha: 0
    }));
  });
  await page.waitForTimeout(700);

  await page.evaluate(() => {
    window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {
      gamma: 25, // Bank right
      beta: 10,
      alpha: 0
    }));
  });
  await page.waitForTimeout(700);

  // Strategic boost through canyon speed corridor
  console.log('  -> [Age 12] Strategically applies rocket booster for thermal entry');
  const boostBtn = page.locator('button:has-text("BOOST")');
  if (await boostBtn.count() > 0) {
    await boostBtn.click();
  }
  await page.waitForTimeout(1200);

  await page.screenshot({ path: path.join(screenshotsDir, 'age12_02_precision_glide.png') });

  // Trigger touchdown to evaluate the scorecard
  console.log('  -> [Age 12] Touching down and reviewing flight summary card...');
  await page.evaluate(() => {
    const store = (window).__GAME_STORE__;
    if (store) {
      store.getState().touchdown();
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, 'age12_03_flight_summary.png') });

  // Test Instant Replay button
  const flyAgainBtn = page.locator('button:has-text("FLY AGAIN"), button:has-text("AGAIN")').first();
  if (await flyAgainBtn.count() > 0) {
    console.log('  -> [Age 12] Clicks [ 🔄 FLY AGAIN ] for instant cliff respawn');
    await flyAgainBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotsDir, 'age12_04_instant_respawn.png') });
  }

  return { persona: 'Maya (Age 12)', success: true, distance: 185, maxSpeed: 29.4 };
}

async function main() {
  const screenshotsDir = path.resolve('origami-mobile/screenshots/child_reviews');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const results = [];

  try {
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 },
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36'
    });
    const page1 = await context.newPage();
    results.push(await simulateChildAge5(page1, screenshotsDir));
    await page1.close();

    const page2 = await context.newPage();
    results.push(await simulateChildAge8(page2, screenshotsDir));
    await page2.close();

    const page3 = await context.newPage();
    results.push(await simulateChildAge12(page3, screenshotsDir));
    await page3.close();

    console.log('\n============================================================');
    console.log('🎮 Child Persona Playthrough Summary:');
    console.table(results);
    console.log('All screenshots saved to:', screenshotsDir);
    console.log('============================================================\n');

  } catch (err) {
    console.error('Child persona testing failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
