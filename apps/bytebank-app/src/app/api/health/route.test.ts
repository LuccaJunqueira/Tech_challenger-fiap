/**
 * @jest-environment node
 */

import { GET } from "./route";

describe("GET /api/health", () => {
  it("retorna 200 com status ok", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});
