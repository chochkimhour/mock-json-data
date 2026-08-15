import { describe, it, expect } from "vitest";
import { matchPath } from "./routing";
import { renderTemplate } from "./templates";
describe("routing", () => {
  it("extracts path parameters", () =>
    expect(
      matchPath("/users/:id/orders/:orderId", "/users/7/orders/a"),
    ).toEqual({ id: "7", orderId: "a" }));
  it("rejects unmatched paths", () =>
    expect(matchPath("/users/:id", "/users")).toBeNull());
});
describe("templates", () =>
  it("uses request and path variables", () =>
    expect(
      renderTemplate(
        { name: "{{request.name}}", id: "{{params.id}}" },
        { request: { name: "Kimhour" }, params: { id: "2" }, query: {} },
      ),
    ).toEqual({ name: "Kimhour", id: "2" })));
