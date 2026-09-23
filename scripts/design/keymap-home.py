"""
Node index -> dictionary key for the redesigned home page.

Written against the extracted content tree, which is identical across fr/en/
zh/ar (224 nodes, same tag sequence). That alignment is what makes generating
four locales safe: every key gets its own locale's real copy, with no
translation step and no chance of a row drifting.

Indices are positional, so this file is only valid for the 2026-09 canvas
version it was built from. Re-extract before trusting it against a new one.
"""
K = {}

def put(start, keys):
    for off, k in enumerate(keys):
        K[start + off] = k

put(0,  ["nav.announce", "nav.announceLink"])
put(2,  [f"nav.link{i}" for i in range(1, 6)])
put(7,  ["nav.locale", "nav.login", "nav.quote"])

put(10, ["hero.eyebrow", "hero.title1", "hero.title2", "hero.title3",
         "hero.body", "hero.ctaPrimary", "hero.ctaSecondary",
         "hero.stat1", "hero.stat2", "hero.stat3",
         "hero.caption1", "hero.caption2", "hero.caption3", "hero.caption4"])

put(24, ["ops.title", "ops.intro"])
for i in range(6):                      # 26..43 : num, title, body
    put(26 + i * 3, [f"ops.step{i+1}.num", f"ops.step{i+1}.title", f"ops.step{i+1}.body"])
put(44, ["ops.sourcing.tag", "ops.sourcing.title", "ops.sourcing.body", "ops.sourcing.cta",
         "ops.future.tag", "ops.future.title", "ops.future.body"])

put(51, ["flow.eyebrow", "flow.title", "flow.intro"])
for i in range(6):                      # 54..71 : title, body, status
    put(54 + i * 3, [f"flow.step{i+1}.title", f"flow.step{i+1}.body", f"flow.step{i+1}.status"])

put(72, ["trust.eyebrow", "trust.title", "trust.intro",
         "trust.addressLabel", "trust.addressZh", "trust.addressLatin",
         "trust.trueTitle"])
put(79, [f"trust.true{i}" for i in range(1, 6)])
put(84, ["trust.wontTitle"])
put(85, [f"trust.wont{i}" for i in range(1, 5)])

put(89, ["app.eyebrow", "app.title", "app.intro"])
for i in range(6):                      # 92..103 : title, body
    put(92 + i * 2, [f"app.feature{i+1}.title", f"app.feature{i+1}.body"])
put(104, ["app.storeSoon1", "app.storeApple", "app.storeSoon2", "app.storeGoogle",
          "app.releaseLabel", "app.releaseDate", "app.releaseSep", "app.releaseLangs"])
put(112, ["app.demo.title", "app.demo.subtitle", "app.demo.product", "app.demo.volume"])
put(116, [f"app.demo.status{i}" for i in range(1, 7)])
put(121, ["app.demo.inProgress", "app.demo.status6b", "app.demo.photosCta",
          "app.demo.checkLabel", "app.demo.checkKind", "app.demo.photoTag",
          "app.demo.check1", "app.demo.check2", "app.demo.check3", "app.demo.agentNote"])

put(131, ["pricing.eyebrow", "pricing.title", "pricing.intro",
          "pricing.logistics.title", "pricing.logistics.note"])
put(136, ["pricing.logistics.row1", "pricing.logistics.row1Value",
          "pricing.logistics.row2", "pricing.logistics.row2Value",
          "pricing.logistics.row3", "pricing.logistics.row3Value",
          "pricing.logistics.row4", "pricing.logistics.row4Value",
          "pricing.logistics.row5", "pricing.logistics.row5Value",
          "pricing.logistics.row6", "pricing.logistics.row6Value",
          "pricing.logistics.cta"])
put(149, ["pricing.sourcing.title", "pricing.sourcing.note",
          "pricing.sourcing.tier1", "pricing.sourcing.tier1Fee", "pricing.sourcing.tier1Rate",
          "pricing.sourcing.tier2", "pricing.sourcing.tier2Fee", "pricing.sourcing.tier2Rate",
          "pricing.sourcing.tier3", "pricing.sourcing.tier3Fee", "pricing.sourcing.tier3Rate",
          "pricing.sourcing.source", "pricing.sourcing.sourceTbc", "pricing.sourcing.cta"])
put(163, ["pricing.payment", "pricing.paymentTbc", "pricing.paymentTail"])

put(166, ["faq.eyebrow", "faq.title", "faq.more", "faq.email"])
put(170, ["faq.q1", "faq.a1", "faq.q2", "faq.q3", "faq.q4", "faq.q5"])

put(176, ["cta.title", "cta.body1", "cta.delay", "cta.body2", "cta.primary", "cta.email"])

put(182, ["footer.tagline", "footer.body", "footer.email"])
put(185, ["footer.colServices"])
put(186, [f"footer.service{i}" for i in range(1, 8)])
put(193, ["footer.colCompany", "footer.company1", "footer.company2",
          "footer.company3", "footer.company4"])
put(198, ["footer.colHelp", "footer.help1", "footer.help2", "footer.help3", "footer.help4"])
put(203, ["footer.colLegal", "footer.legal1", "footer.legal2", "footer.legal3", "footer.legal4"])
put(208, ["footer.langsLabel"])
put(221, ["footer.copyright", "footer.entity", "footer.place"])
