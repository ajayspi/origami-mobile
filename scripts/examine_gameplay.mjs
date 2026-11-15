import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function examineGameplay() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const screenshotsDir = './screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    consoleMessages.push({ type: 'pageerror', text: err.message });
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Capture Splash Screen
  await page.screenshot({ path: path.join(screenshotsDir, '01_splash.png') });
  console.log('Captured 01_splash.png');

  // Click Launch
  await page.locator('button:has-text("LAUNCH INTO CANYON")').first().click();
  await page.waitForTimeout(1000);

  // Capture Character Select
  await page.screenshot({ path: path.join(screenshotsDir, '02_character_select.png') });
  console.log('Captured 02_character_select.png');

  // Click Deploy to Cliff
  await page.locator('button:has-text("DEPLOY TO CLIFF")').first().click();
  await page.waitForTimeout(1500);

  // Capture Cliff Launchpad resting state
  await page.screenshot({ path: path.join(screenshotsDir, '03_cliff_resting.png') });
  console.log('Captured 03_cliff_resting.png');

  // Test aiming / pulling back
  const canvas = await page.$('canvas');
  const box = await canvas.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  console.log('Simulating pointer drag on canvas...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX, centerY + 80, { steps: 5 });
  await page.waitForTimeout(500);

  // Capture aiming state
  await page.screenshot({ path: path.join(screenshotsDir, '04_aiming_state.png') });
  console.log('Captured 04_aiming_state.png');

  // Release slingshot
  await page.mouse.up();
  await page.waitForTimeout(1000);

  // Capture mid-flight state
  await page.screenshot({ path: path.join(screenshotsDir, '05_in_flight.png') });
  console.log('Captured 05_in_flight.png');

  // Check state & telemetry in store
  const storeState = await page.evaluate(() => {
    // @ts-ignore
    const s = window.__GAME_STORE__ ? window.__GAME_STORE__.getState() : null;
    return {
      flightState: s ? s.flightState : null,
      selectedKitId: s ? s.selectedKitId : null,
      distance: s ? s.distance : null,
      altitude: s ? s.altitude : null,
      speed: s ? s.speed : null,
      isBoosting: s ? s.isBoosting : null,
      boostCharges: s ? s.boostCharges : null,
      gyroEnabled: s ? s.gyroEnabled : null
    };
  });
  console.log('Store state after launch:', storeState);

  // Wait a few seconds to observe flight
  await page.waitForTimeout(2500);
  const midFlightStore = await page.evaluate(() => {
    // @ts-ignore
    const s = window.__GAME_STORE__ ? window.__GAME_STORE__.getState() : null;
    return {
      flightState: s ? s.flightState : null,
      distance: s ? s.distance : null,
      altitude: s ? s.altitude : null,
      speed: s ? s.speed : null
    };
  });
  console.log('Store state mid-flight (t+2.5s):', midFlightStore);
  await page.screenshot({ path: path.join(screenshotsDir, '06_mid_flight.png') });
  console.log('Captured 06_mid_flight.png');

  console.log('\n--- Console Logs ---');
  for (const log of consoleMessages) {
    console.log(`[${log.type}] ${log.text}`);
  }

  await browser.close();
}

examineGameplay().catch(err => {
  console.error(err);
  process.exit(1);
});
