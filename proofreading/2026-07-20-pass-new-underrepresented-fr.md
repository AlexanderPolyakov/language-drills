# Proof-reading pass — 2026-07-20 (new FR items, underrepresented categories)

Targeted content **and** structure proof-reading of the **newly authored** FR
items only, added by the content-authoring run in commit `19024d9`
(*content: author 10 EN + 10 FR items in underrepresented complex categories*).
Scope was fixed by diffing each file against `HEAD~1` (before authoring) vs
`HEAD` (after) to isolate exactly the last items of each `items[]` array.
Pre-existing items were left untouched. Every item was checked against the
engine's real rendering rules in `js/types/fill.js` (one `{n}` per blank,
non-empty `cue` without `(`, non-empty `answer` array, non-empty `explanation`).

Files and new items reviewed (10 items total):

- `content/fr/accord-participe-passe-c1.json` — 4 new `fill` items (17 → 21)
- `content/fr/concordance-des-temps-c2.json` — 3 new `fill` items (18 → 21)
- `content/fr/subjonctif-passe-b2.json` — 3 new `fill` items (17 → 20)

## Verdicts

### `accord-participe-passe-c1.json`

1. *« Les tartes qu'elle a {1} pour la kermesse… »* → **préparées** — **OK.**
   `avoir` + preceding direct object « que » = *les tartes* (f.pl.) → agreement.
   Explanation and contrast (« elle a préparé des tartes ») exact.
2. *« Les deux amies se sont {1} presque tous les jours… »* → **téléphoné** —
   **OK.** Pronominal built on *téléphoner À qqn*; « se » is COI → invariable.
   The list of parallel COI verbs (« se parler / se sourire / se succéder »)
   is accurate.
3. *« Des romans policiers, il en a {1} des dizaines… »* → **lu** — **OK.** The
   pronoun « en » as direct object does not trigger agreement (standard rule);
   participle stays invariable. Contrast « les romans qu'il a lus » correct.
4. *« Les enfants que nous avons {1} grandir… »* → **vus** — **OK.** Participle
   + infinitive: the preceding object *les enfants* performs « grandir » →
   agreement. Counter-example « les airs que j'ai entendu jouer » exact.

### `concordance-des-temps-c2.json`

5. *« Le témoin déclara qu'il {1} parfaitement l'homme… »* → **connaissait** —
   **OK.** Past frame (« déclara », passé simple); present of simultaneity →
   imparfait.
6. *« … que le groupe {1} le refuge bien avant la tombée de la nuit. »* →
   **aurait atteint** — **OK.** Futur antérieur in direct speech → conditionnel
   passé after a past main verb (*futur antérieur dans le passé*). Participle
   « atteint » invariable (COD « le refuge » follows).
7. *« L'inspecteur soupçonnait que le comptable {1} les registres depuis
   plusieurs mois. »* → **avait falsifié** — **OK.** Past frame; passé composé
   of the direct thought → plus-que-parfait for anteriority. Note kept for the
   record: with « depuis plusieurs mois » the imparfait « falsifiait » would
   also be idiomatic (durative reading), but the item deliberately teaches
   PC → PQP anteriority, and « avait falsifié … depuis plusieurs mois » is
   grammatical, so the single answer is left as authored.

### `subjonctif-passe-b2.json`

8. *« … avant que la nuit ne {1} tout à fait. »* → **soit tombée** — **OK.**
   « avant que » + subjunctive; past subjunctive marks the completed event;
   *tomber* takes « être » → agreement with « la nuit » (f.sg.); « ne » correctly
   identified as explétif.
9. *« C'est la meilleure décision que nous {1} de toute l'année. »* →
   **ayons prise** — **OK.** Superlative antecedent → subjunctive; *prendre*
   takes « avoir »; preceding COD « que » = *la décision* (f.sg.) → agreement.
10. *« Je doute qu'elle {1} à temps… »* → **soit arrivée** — **OK.** « douter
    que » → subjunctive; *arriver* takes « être » → agreement with feminine
    subject.

## Structure / style

- One `{n}` per blank in all 10 items; every `cue` non-empty and free of `(`;
  every `answer` a non-empty array; every `explanation` non-empty.
- Apostrophe/guillemet style consistent with the pre-existing corpus (straight
  apostrophes, « … » guillemets throughout — no stray curly apostrophes).
- No item text duplicates an existing item in its file.

## Result

**No defects found — no content corrections were needed.** All 10 new items are
grammatically correct in standard French, idiomatic, and schema-conforming. No
pre-existing item was modified.

`scripts/build-manifest.mjs` → **OK — manifest regenerated.** (en 48/1205,
fr 41/1355; no file changes, corpus already consistent.)
