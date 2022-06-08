import { test, expect } from '@playwright/test';
import processDownload from './download';
import { passwords } from './passwords';

test('楽天カード', async ({ page }) => {
  await page.goto('https://www.rakuten-card.co.jp/e-navi/index.xhtml');

  await page.locator('input[name="u"]').fill(passwords.rakuten.username);

  await page.locator('input[name="p"]').fill(passwords.rakuten.password);

  await page.locator('input:has-text("ログイン")').click();

  if ((await page.locator('input[alt="住所を訂正しない"]').count()) > 0) {
    await page.locator('input[alt="住所を訂正しない"]').click();
  }

  await expect(page).toHaveURL('https://www.rakuten-card.co.jp/e-navi/members/index.xhtml');

  await page.goto(
    'https://www.rakuten-card.co.jp/e-navi/members/statement/index.xhtml?l-id=enavi_all_glonavi_statement',
  );

  {
    await page.locator('text=前月').click();
    await expect(page).toHaveURL('https://www.rakuten-card.co.jp/e-navi/members/statement/index.xhtml?tabNo=1');

    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('text=CSV').click()]);
    await processDownload(download, /^enavi[0-9()]+\.csv$/);
  }

  {
    await page.locator('text=前月').click();
    await expect(page).toHaveURL('https://www.rakuten-card.co.jp/e-navi/members/statement/index.xhtml?tabNo=2');

    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('text=CSV').click()]);

    await processDownload(download, /^enavi[0-9()]+\.csv$/);
  }
});
