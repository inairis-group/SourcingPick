import { test } from "node:test";
import assert from "node:assert/strict";
import {
  frenchAddressOf,
  frenchRouteOf,
  isOtherAppRoute,
  pageOf,
  sitePath,
} from "../src/lib/i18n/site-paths";

test("French pages are addressed at the root, under French slugs", () => {
  assert.equal(sitePath("fr", "/"), "/");
  assert.equal(sitePath("fr", "/pricing"), "/tarifs");
  assert.equal(sitePath("fr", "/about"), "/a-propos");
  assert.equal(sitePath("fr", "/legal/mentions-legales"), "/mentions");
  assert.equal(sitePath("fr", "/legal/privacy"), "/confidentialite");
  assert.equal(sitePath("fr", "/legal/terms"), "/cgv");
  assert.equal(sitePath("fr", "/legal/cookies"), "/cookies");
  assert.equal(sitePath("fr", "/services/controle-qualite-chine"), "/services/controle-qualite-chine");
});

test("fragments and queries ride along", () => {
  assert.equal(sitePath("fr", "/#verite"), "/#verite");
  assert.equal(sitePath("fr", "/pricing#remuneration"), "/tarifs#remuneration");
  assert.equal(sitePath("en", "/#verite"), "/en#verite");
  assert.equal(sitePath("en", "/pricing#remuneration"), "/en/pricing#remuneration");
});

test("the other languages keep /<lang>/<route>", () => {
  assert.equal(sitePath("en", "/"), "/en");
  assert.equal(sitePath("de", "/pricing"), "/de/pricing");
  assert.equal(sitePath("ar", "/legal/terms"), "/ar/legal/terms");
});

test("the other application's French pages are its root addresses", () => {
  assert.equal(sitePath("fr", "/devis"), "/demande");
  assert.equal(sitePath("fr", "/contact"), "/contact");
  assert.equal(sitePath("en", "/devis"), "/en/devis");
  assert.equal(isOtherAppRoute("/devis"), true);
  assert.equal(isOtherAppRoute("/pricing"), false);
});

test("routes without a French address stay under /fr", () => {
  assert.equal(sitePath("fr", "/login"), "/fr/login");
  assert.equal(frenchAddressOf("/login"), null);
  assert.equal(frenchAddressOf("/client/orders"), null);
});

test("French addresses and routes map both ways", () => {
  assert.equal(frenchRouteOf("/"), "/");
  assert.equal(frenchRouteOf("/tarifs"), "/pricing");
  assert.equal(frenchRouteOf("/tarifs/"), "/pricing");
  assert.equal(frenchRouteOf("/blog/un-article"), "/blog/un-article");
  assert.equal(frenchRouteOf("/blog/"), "/blog");
  assert.equal(frenchRouteOf("/pricing"), null);
  assert.equal(frenchRouteOf("/connexion"), null);
  assert.equal(frenchAddressOf("/pricing"), "/tarifs");
  assert.equal(frenchAddressOf("/"), "/");
});

test("a page is read the same from any of its addresses", () => {
  assert.deepEqual(pageOf("/tarifs"), { lang: "fr", route: "/pricing" });
  assert.deepEqual(pageOf("/fr/pricing"), { lang: "fr", route: "/pricing" });
  assert.deepEqual(pageOf("/en/pricing"), { lang: "en", route: "/pricing" });
  assert.deepEqual(pageOf("/en"), { lang: "en", route: "/" });
  assert.deepEqual(pageOf("/"), { lang: "fr", route: "/" });
});
