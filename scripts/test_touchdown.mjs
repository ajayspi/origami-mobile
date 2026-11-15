import { chromium } from 'playwright';

async function testTouchdownFlow() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(800);

  // Splash -> Select -> Deploy
  await page.locator('button:has-text("LAUNCH INTO CANYON")').first().click();
  await page.waitForTimeout(400);
  await page.locator('button:has-text("DEPLOY TO CLIFF")').first().click();
  await page.waitForTimeout(1000);

  // Launch from cliff
  const canvas = await page.$('canvas');
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 100, { steps: 5 });
  await page.waitForTimeout(200);
  await page.mouse.up();

  console.log('Launched! Waiting for landing or 12 seconds...');
  for (let i = 0; i < 24; i++) {
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => {
      // @ts-ignore
      const s = window.__GAME_STORE__ ? window.__GAME_STORE__.getState() : null;
      return {
        flightState: s?.flightState,
        altitude: s?.altitude?.toFixed(1),
        distance: s?.distance,
        speed: s?.speed?.toFixed(1)
      };
    });
    console.log(`t=${(i * 0.5).toFixed(1)}s: state=${state.flightState}, alt=${state.altitude}m, dist=${state.distance}m, spd=${state.speed}m/s`);
    if (state.flightState === 'landed') {
      console.log('Plane has landed!');
      break;
    }
  }

  await page.screenshot({ path: './screenshots/07_touchdown_screen.png' });
  console.log('Captured 07_touchdown_screen.png');

  // Check if Fly Again works
  const flyAgainBtn = page.locator('button:has-text("Fly Again")');
  if (await flyAgainBtn.count() > 0) {
    console.log('Clicking Fly Again...');
    await flyAgainBtn.click();
    await page.waitForTimeout(1000);

    const postState = await page.evaluate(() => {
      // @ts-ignore
      const s = window.__GAME_STORE__ ? window.__GAME_STORE__.getState() : null;
      return {
        flightState: s?.flightState,
        altitude: s?.altitude,
        distance: s?.distance
      };
    });
    console.log('State after Fly Again:', postState);
    await page.screenshot({ path: './screenshots/08_after_fly_again.png' });
    console.log('Captured 08_after_fly_again.png');
  }

  await browser.close();
}

testTouchdownFlow().catch(console.error);
