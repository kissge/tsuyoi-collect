import { test, expect } from '@playwright/test';
import processDownload from './download';
import { passwords } from './passwords';

test('セブン銀行', async ({ page }) => {
  await page.goto('https://ib.sevenbank.co.jp/IB/IB_U_CO_002/IB_U_CO_002_100.aspx?Lang=ja-JP');

  await page.locator('[name="ctl00$cphBizConf$txtLogonId"]').click();

  await page.locator('[name="ctl00$cphBizConf$txtLogonId"]').fill(passwords.sevenbank.username);

  await page.locator('input[name="ctl00\\$cphBizConf\\$txtLogonPw"]').click();

  await page.locator('input[name="ctl00\\$cphBizConf\\$txtLogonPw"]').fill(passwords.sevenbank.password);

  await page.locator('input[name="ctl00\\$cphBizConf\\$txtLogonPw"]').press('Enter');

  await page.locator('input[name="ctl00\\$cphBizConf\\$txtLogonPw"]').press('Enter');
  await expect(page).toHaveURL('https://ib.sevenbank.co.jp/IB/IB_U_CT_001/IB_U_CT_001_000.aspx');

  await page.locator('input[name="ctl00\\$mpheader\\$passBook"]').click();
  await expect(page).toHaveURL('https://ib.sevenbank.co.jp/IB/IB_U_PI_001/IB_U_PI_001_000.aspx');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.pdf_list li:first-of-type a').click(),
  ]);

  await processDownload(download, /^statement_.{6}\.pdf$/);
});
