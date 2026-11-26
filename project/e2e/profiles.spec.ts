import { expect, test } from '@playwright/test';

test.describe('Profiles page (Task 5)', () => {
  test('add, reload, edit, and archive profile (backup buttons hidden)', async ({ page }) => {
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {};
    });
    await page.goto('/pemain');

    await expect(page.getByRole('button', { name: /ekspor json|export json/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /impor json|import json/i })).toHaveCount(0);

    await page.getByRole('button', { name: /pemain baru|new player/i }).click();
    await page.getByLabel(/nama|name/i).fill('Ana');
    await page.getByRole('button', { name: /simpan|save/i }).click();

    await expect(page.getByText('Ana')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Ana')).toBeVisible();

    // Duplicate name is rejected
    await page.getByRole('button', { name: /pemain baru|new player/i }).click();
    await page.getByLabel(/nama|name/i).fill('ana');
    await page.getByRole('button', { name: /simpan|save/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await page.getByRole('button', { name: /batal|cancel/i }).click();

    // Edit name
    await page.getByRole('button', { name: /^ubah$|^edit$/i }).first().click();
    await page.getByLabel(/nama|name/i).fill('Anita');
    await page.getByRole('button', { name: /simpan|save/i }).click();
    await expect(page.getByText('Anita')).toBeVisible();

    // Delete asks for confirmation, cancel keeps profile, confirm removes it
    await page.getByRole('button', { name: /^hapus$|^delete$/i }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /batal|cancel/i }).click();
    await expect(page.getByText('Anita')).toBeVisible();

    await page.getByRole('button', { name: /^hapus$|^delete$/i }).first().click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /^hapus$|^delete$/i }).click();
    await expect(page.getByText('Anita')).toHaveCount(0);
  });
});
