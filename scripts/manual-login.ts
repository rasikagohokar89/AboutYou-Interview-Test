import { chromium } from '@playwright/test';
import * as path from 'path';

// Parse command line argument to specify account: 1 or 2
const args = process.argv.slice(2);
const accountNum = args[0] || '1';
const authFileName = accountNum === '2' ? 'user-1.json' : 'user.json';
const storageStatePath = path.resolve(__dirname, `../.auth/${authFileName}`);
const loginUrl = 'https://en.aboutyou.de/';

async function manualLogin() {
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome', // Use the actual installed Google Chrome to avoid detection
    args: [
      '--disable-blink-features=AutomationControlled'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const context = await browser.newContext({
    viewport: null
  });
  const page = await context.newPage();

  await page.goto(loginUrl);

  console.log('---------------------------------------------------------');
  console.log(`🤖 ANTI-BOT BYPASS SCRIPT FOR ACCOUNT ${accountNum}`);
  console.log('---------------------------------------------------------');
  console.log('1. A Google Chrome browser window has opened.');
  console.log(`2. Please click the Account/Login icon and log in manually to Account ${accountNum}.`);
  console.log('3. Complete the Cloudflare CAPTCHA if prompted.');
  console.log('4. Once you are successfully logged in (and see your account name/icon),');
  console.log('   return to this terminal and press ENTER.');
  console.log('---------------------------------------------------------');

  // Wait until the user presses Enter in the terminal
  await new Promise<void>((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', () => resolve());
  });

  await context.storageState({
    path: storageStatePath
  });

  console.log(`✅ Session saved successfully to: ${storageStatePath}`);
  console.log('You can now run your Playwright tests and they will use this session!');

  await browser.close();
  process.exit(0);
}

manualLogin().catch(console.error);
