import { test, expect } from '@playwright/test';
import processDownload from './download';
import { passwords } from './passwords';

test('楽天銀行', async ({ page }) => {
  await page.goto(
    'https://fes.rakuten-bank.co.jp/MS/main/RbS?COMMAND=LOGIN&&CurrentPageID=DIRECT_LOGIN_START&GROUP_ID=p014&USER_ID=prak0008',
  );

  await page.locator('input[name="LOGIN\\:USER_ID"]').fill(passwords.rakutenbank.username);

  await page.locator('input[name="LOGIN\\:LOGIN_PASSWORD"]').fill(passwords.rakutenbank.password);

  await Promise.all([page.waitForNavigation(), page.locator('a:has-text("ログイン")').click()]);

  const now = new Date();
  const lastYear = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 365).toLocaleDateString('en-ZA');
  const yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24).toLocaleDateString('en-ZA');

  for (let i = 0; i < 100; ++i) {
    // なんかよくわかんないけど何回かやるとうまくいくので100回やる
    await page
      .locator('input[name="FORM_DOWNLOAD_IND\\:datepicker_from"]')
      .evaluate((input: HTMLInputElement, value) => (input.value = value), lastYear);
    await page
      .locator('input[name="FORM_DOWNLOAD_IND\\:datepicker_to"]')
      .evaluate((input: HTMLInputElement, value) => (input.value = value), yesterday);

    if (
      (await page.locator('input[name="FORM_DOWNLOAD_IND\\:datepicker_from"]').getAttribute('value')) === lastYear &&
      (await page.locator('input[name="FORM_DOWNLOAD_IND\\:datepicker_to"]').getAttribute('value')) === yesterday
    ) {
      break;
    }

    console.log('Retrying...', i + 1);
  }

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('a:has-text("CSV形式でダウンロード")').click(),
  ]);

  await processDownload(download, 'RB-torihikimeisai.csv');
});
