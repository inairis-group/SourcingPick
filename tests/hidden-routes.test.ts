import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HIDDEN_ROUTE_PREFIXES,
  isHiddenRoute,
  withoutLocale,
} from "../src/lib/permissions/hidden-routes";

/**
 * The canvas is the allow-list; this is the deny-list that enforces it.
 * Getting it wrong in one direction hides a section people use, and in the
 * other leaves a bookmark working that the interface no longer admits to.
 */

test("a hidden section takes its detail pages with it", () => {
  assert.equal(isHiddenRoute("/client/auctions"), true);
  assert.equal(isHiddenRoute("/client/auctions/abc123"), true);
  assert.equal(isHiddenRoute("/admin/marketplace/new"), true);
});

test("a drawn section stays reachable", () => {
  for (const path of [
    "/client/dashboard",
    "/client/requests",
    "/client/requests/abc123",
    "/client/orders",
    "/client/settings",
    "/agent/dashboard",
    "/agent/quotes",
    "/admin",
    "/admin/requests",
    "/admin/users",
    "/admin/users/abc123",
    "/admin/invoices",
    "/admin/audit",
    "/admin/agents",
    "/messages",
    "/login",
    "/signup",
  ]) {
    assert.equal(isHiddenRoute(path), false, `${path} should be reachable`);
  }
});

test("a prefix does not swallow a sibling that merely starts the same way", () => {
  // `/admin/settings` is drawn; `/admin/settings/payments` is not, but it is
  // listed nowhere — so it must stay reachable rather than be caught by a
  // loose match. Conversely `/admin/support` is hidden and must not take
  // `/admin/supporters` with it, were such a route ever added.
  assert.equal(isHiddenRoute("/admin/settings"), false);
  assert.equal(isHiddenRoute("/admin/supporters"), false);
  assert.equal(isHiddenRoute("/admin/support"), true);
  assert.equal(isHiddenRoute("/admin/support/chat"), true);
});

test("a trailing slash changes nothing", () => {
  assert.equal(isHiddenRoute("/client/auctions/"), true);
  assert.equal(isHiddenRoute("/client/dashboard/"), false);
});

test("the language prefix comes off before matching", () => {
  assert.equal(withoutLocale("/fr/client/auctions"), "/client/auctions");
  assert.equal(withoutLocale("/zh/admin"), "/admin");
  assert.equal(withoutLocale("/pt/"), "/");
  assert.equal(withoutLocale("/fr"), "/");
  // Not a language segment — left alone rather than eaten.
  assert.equal(withoutLocale("/client/orders"), "/client/orders");
});

test("every listed prefix is absolute and carries no trailing slash", () => {
  // A prefix written as "client/auctions" or "/client/auctions/" would match
  // nothing and fail silently, leaving a section visible that was meant to
  // be hidden.
  for (const prefix of HIDDEN_ROUTE_PREFIXES) {
    assert.ok(prefix.startsWith("/"), `${prefix} is not absolute`);
    assert.ok(!prefix.endsWith("/"), `${prefix} has a trailing slash`);
  }
});
