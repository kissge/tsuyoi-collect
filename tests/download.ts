import { expect, type Download } from '@playwright/test';

if (!process.env.downloadDirectory) {
  throw new Error('downloadDirectory environment variable is not set');
}

export default async function processDownload(download: Download, pattern: string | RegExp) {
  const suggested = download.suggestedFilename();
  expect(suggested).toMatch(pattern);

  const saved = process.env.downloadDirectory!.replace(/\/+$/, '') + '/' + suggested;
  await download.saveAs(saved);

  console.log('Saved to', saved);
}

export async function processDownloadAs(download: Download, fileName: string) {
  const saved = process.env.downloadDirectory!.replace(/\/+$/, '') + '/' + fileName;
  await download.saveAs(saved);

  console.log('Saved to', saved);
}
