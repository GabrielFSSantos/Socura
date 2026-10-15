import { expect, test } from "@playwright/test";

test.describe("X preview — fluxos UI (sem API)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/preview-x.html");
    await page.getByRole("button", { name: /iniciar escaneamento/i }).click();
    await expect(page.getByRole("button", { name: /fora da lista branca/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("mostra rede X e lista de não seguidores (mock)", async ({ page }) => {
    await expect(page.getByText("X").first()).toBeVisible();
    await expect(page.getByText("alina.frames")).toBeVisible();
    await expect(page.getByText("brassandbone")).toBeVisible();
  });

  test("aba lista branca exibe contas protegidas", async ({ page }) => {
    await page.getByRole("button", { name: /na lista branca/i }).click();
    await expect(page.getByText("keystone.labs")).toBeVisible();
    await expect(page.getByText("lowlight.club")).toBeVisible();
    await page.getByRole("button", { name: /fora da lista branca/i }).click();
    await expect(page.getByText("keystone.labs")).not.toBeVisible();
  });

  test("selecionar todos habilita deixar de seguir", async ({ page }) => {
    const unfollow = page.getByRole("button", { name: /deixar de seguir/i });
    await expect(unfollow).toBeEnabled();
    await page.getByRole("checkbox", { name: /selecionar todos/i }).check();
    const label = await unfollow.textContent();
    expect(label).toMatch(/\([1-9]\d*\)/);
  });

  test("busca filtra a lista", async ({ page }) => {
    await page.getByPlaceholder(/buscar usuários/i).fill("alina");
    await expect(page.getByText("alina.frames")).toBeVisible();
    await expect(page.getByText("brassandbone")).toHaveCount(0);
  });

  test("exportar JSON dispara download", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /^json$/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename().toLowerCase()).toContain(".json");
  });

  test("confirmação leva à fila de unfollow (preview não chama API)", async ({ page }) => {
    page.on("dialog", async dialog => {
      await dialog.accept();
    });
    await page.getByRole("button", { name: /deixar de seguir/i }).click();
    await expect(page.getByText(/fila de unfollow|unfollow queue/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});

test("scan incompleto bloqueia unfollow em massa", async ({ page }) => {
  await page.goto("/preview-x.html?preview=scanning-incomplete");
  const unfollow = page.getByRole("button", { name: /deixar de seguir/i });
  await expect(unfollow).toBeDisabled();
  await expect(page.getByRole("alert")).toContainText(/incompleto/i);
});
