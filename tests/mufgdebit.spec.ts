import { test, expect } from '@playwright/test';
import { processDownloadAs } from './download';
import { passwords } from './passwords';

test('MUFGデビット', async ({ page }) => {
  await page.goto('https://debit.bk.mufg.jp/p/login/RW0312010001');

  await page.locator('input[name="loginUsrId"]').fill(passwords.mufgdebit.username);

  await page.locator('input[name="password"]').fill(passwords.mufgdebit.password);

  await page.locator('input:has-text("ログイン")').click();

  await page.locator('form[name="description"] >> text=ご利用明細照会').click();
  await expect(page).toHaveURL('https://debit.bk.mufg.jp/p/statementInquiry/RW0313010101');

  for (let index = 4; index > 1; --index) {
    await page.locator('select[name="W031301\\.referenceDate"]').selectOption({ index });

    while (true) {
      const month = await page.locator('h2.hdg-l2').innerText();
      expect(month).toMatch(/\d+年\d+月/);
      const pageNumber = await page.locator('.nablarch_currentPageNumber.center').first().textContent();
      expect(pageNumber).toMatch(/\d+\/\d+/);
      const [, pageCurrent, pageTotal] = pageNumber!.match(/(\d+)\/(\d+)/)!;
      await page.evaluate(() => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(
          new Blob(
            [
              [...document.querySelectorAll('.tbl-02:not(.table-toggle) tbody')]
                .map((tbody) => [...tbody.querySelectorAll('td')].map((td) => td.innerText.trim()).join('\t'))
                .join('\n'),
            ],
            { type: 'text/plain' },
          ),
        );
        a.download = 'download.tsv';
        a.id = 'tsuyoi-download';
        a.textContent = 'download';
        document.body.appendChild(a);
      });
      const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#tsuyoi-download').click()]);
      await processDownloadAs(download, 'mufg-debit-' + month + '-' + pageCurrent + '_' + pageTotal + '.tsv');

      const nextLink = page.locator('a.nablarch_nextSubmit');

      if ((await nextLink.count()) === 0) {
        await expect(page.locator('.nablarch_nextSubmit.is-disabled').first()).toBeVisible();
        break;
      }

      await nextLink.first().click();
    }
  }
});
