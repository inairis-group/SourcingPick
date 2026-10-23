# Publier un article de blog

Le blog (`/blog`, `/blog/<adresse>`) est en place mais vide : tant qu'il n'a
aucun article, `/blog` répond 404, n'est lié nulle part et n'est pas dans le
sitemap. Dès le premier article, il apparaît dans le sitemap.

## Où

`src/content/blog/index.ts`, dans la liste `BLOG_ARTICLES`. Une entrée par
article :

```ts
{
  slug: "consolider-commandes-alibaba-1688-chine",      // → /blog/consolider-commandes-alibaba-1688-chine
  date: "2026-11-03",
  title: "Comment regrouper les commandes de plusieurs fournisseurs Alibaba et 1688 ?", // le H1
  metaTitle: "Regrouper ses commandes Alibaba et 1688 en Chine | Sourcing Pick",          // 55 à 65 caractères
  metaDescription: "…",                                                                    // 150 à 160 caractères
  lead: "Le premier paragraphe, en Markdown.",
  body: `## Premier intertitre

Le texte, en Markdown : **gras**, listes, tableaux, liens vers /services, /tarifs…`,
  faq: [
    { question: "…", answer: "…" },   // affichées en fin d'article et données à Google (FAQPage)
  ],
},
```

Les champs sont ceux du bloc YAML que demande le « Master Prompt » du pack SEO
(`title`, `metaTitle`, `metaDescription`, `slug`), plus la date. Le
`<script type="application/ld+json">` que le prompt fait générer n'est pas à
recopier : la page le produit à partir de `faq`.

## Avant de publier

- Liens internes : utiliser les adresses françaises (`/services`,
  `/tarifs`, `/entrepot`, `/demande` pour un devis).
- Pas d'adresse d'entrepôt tant que le déménagement n'est pas terminé.
- Les encadrés « Ce que nous voyons sur le terrain » doivent raconter de vrais
  cas : un article ne doit pas inventer d'anecdote.
