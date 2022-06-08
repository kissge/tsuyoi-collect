import { test, expect } from '@playwright/test';
import processDownload from './download';
import { passwords } from './passwords';

test('三菱UFJ銀行', async ({ page }) => {
  await page.goto('https://entry11.bk.mufg.jp/ibg/dfw/APLIN/loginib/login?_TRANID=AA000_001');

  await page.locator('[name="KEIYAKU_NO"]').click();

  await page.locator('[name="KEIYAKU_NO"]').fill(passwords.mufg.username);

  await page.locator('[name="PASSWORD"]').click();

  await page.locator('[name="PASSWORD"]').fill(passwords.mufg.password);

  await Promise.all([page.waitForNavigation(), page.locator('[name="PASSWORD"]').press('Enter')]);

  await page.locator('.total >> text=入出金明細').click();
  await expect(page).toHaveURL('https://direct11.bk.mufg.jp/ib/dfw/APL/bnkib/banking');

  await page.locator('img[alt="明細をダウンロード"]').click();
  await expect(page).toHaveURL('https://direct11.bk.mufg.jp/ib/dfw/APL/bnkib/banking');

  await page.locator('text=前月').click();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('button:has([alt="ダウンロード（CSV形式）"])').click(),
  ]);

  await processDownload(download, /^[0-9]+_[0-9]+\.csv$/);
});
