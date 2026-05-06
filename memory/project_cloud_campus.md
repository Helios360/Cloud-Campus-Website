---
name: Cloud Campus project context
description: Static site for Cloud Campus school (alternance digital, Compiègne). Domain is cloud-campus.fr, hosted on OVH Web Hosting Pro (Apache).
type: project
---

Static HTML/CSS/JS site in `public/`. No build step, no package.json. PHP used only for the RSS feed in `api/`.

**Domain:** https://cloud-campus.fr

**Key pages:** index, formation-dev-web, chef-de-projet-cyber, se-renseigner-et-candidater, recruter-un-alternant, pedagogie-et-environnement, notre-equipe, financements, faq, blog, nous-contacter, mentions-legales (noindex), politique (noindex).

**Why:** OVH Web Hosting Pro deployment, SEO optimization done 2026-05-06.

**How to apply:** When suggesting deployment changes, assume Apache/.htaccess (OVH shared hosting). Clean URLs served via .htaccess rewrite (no .html in browser URL). og:image expected at /assets/og-image.png (1200×630px — needs to be created by the team).
