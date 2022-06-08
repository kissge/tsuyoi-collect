import { test, expect } from '@playwright/test';
import processDownload from './download';
import { passwords } from './passwords';

// TODO: 画像認証される場合がある

test('Yahooカード', async ({ page }) => {
  await page.goto('https://member1.card.yahoo.co.jp/');

  await page.locator('#username').fill(passwords.yahoo.username);

  await Promise.all([
    page.waitForNavigation(/*{ url: 'https://login.yahoo.co.jp/config/login?.src=ycrd&auth_lv=capin&.done=https%3A%2F%2Fmember1.card.yahoo.co.jp%2F&isAfterChangeTradeName=true&afterTradeName=true' }*/),
    page.locator('button:has-text("次へ")').click(),
  ]);

  await page.locator('#passwd').fill(passwords.yahoo.password);

  await page.locator('button:has-text("ログイン")').click();

  if ((await page.locator('text=あとで設定する').count()) > 0) {
    await Promise.all([
      page.waitForNavigation(/*{ url: 'https://member1.card.yahoo.co.jp/' }*/),
      page.locator('text=あとで設定する').click(),
    ]);
  }

  await page.locator('a:has-text("ご利用明細を確認する")').click();
  await expect(page).toHaveURL('https://member1.card.yahoo.co.jp/usage/detail');

  {
    await page.locator('#timeperiod li:last-of-type a').click();

    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('text=CSVダウンロード').click()]);
    await processDownload(download, /^detail20.{10}\.csv$/);
  }

  {
    await page.locator('#timeperiod li:last-nth-of-type(2) a').click();

    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('text=CSVダウンロード').click()]);
    await processDownload(download, /^detail20.{10}\.csv$/);
  }
});
