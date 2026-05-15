# Parole+ AI — Plan de refonte gamification, UX et engagement

**Contexte produit** : application d'entraînement à la parole pour adultes post-AVC, sclérose en plaques, Parkinson, traumatisme crânien. Public souvent 50+, parfois en perte d'autonomie partielle, à forte charge émotionnelle. Toute la gamification doit **encourager sans infantiliser** et **réduire l'anxiété** plutôt que la créer.

**Comparables** étudiés : Duolingo (boucles de rétention), Habitica (RPG), Finch (compagnon émotionnel), Khan Academy (mastery learning), Headspace (calme, micro-engagement bienveillant).

---

## 1. AUDIT — État actuel et écart Duolingo

### 1.1 Ce qui existe déjà (`app/lib/gamification.ts`)

| Mécanique | Présent | Qualité |
|---|---|---|
| XP par séance avec multiplicateur difficulté (×1 à ×4) | ✅ | Bon |
| 5 niveaux nommés (Apprenti → Maître de Parole) | ✅ | Bon |
| 10 badges (première séance, streak 3/7, score 80/90, fluidité parfaite, explorateur, vétéran, grimpeur, expert) | ✅ | Trop peu, trop espacés |
| Streak (jours consécutifs) | ✅ basique | Pas de protection, pas d'encouragement quotidien |
| Personal best | ✅ | Bien |
| Reward post-séance (`computeSessionReward`) | ✅ | Bon socle |

### 1.2 Boucles de motivation actuelles

- **Boucle quotidienne** : ❌ inexistante. Aucun objectif quotidien, aucune notification, aucun « il te reste 1 séance pour ta journée ».
- **Boucle hebdomadaire** : ❌ inexistante. Pas de ligue, pas de bilan dimanche soir, pas de quête de la semaine.
- **Boucle long terme** : ⚠️ partielle. Niveaux et badges existent mais peu nombreux et peu désirables.
- **Retour après absence** : ❌ inexistant. Le streak casse silencieusement, pas de message « on est content de te revoir ».

### 1.3 Sources de friction et de décrochage

1. **Aucun engagement quotidien obligatoire** → dès qu'un patient saute 2-3 jours, plus rien ne le rappelle.
2. **Récompenses prévisibles** → XP = score × multiplicateur. Pas de variabilité (pas de crit, pas de bonus surprise, pas de coffre).
3. **Pas de feedback immédiat pendant l'enregistrement** → l'utilisateur parle dans le vide, l'analyse arrive après. Tension non récompensée.
4. **Score brut sans contextualisation émotionnelle** → un 62 reste un 62, sans « +12 vs hier » ou « tu as battu ta hesitation moyenne ».
5. **Niveau de difficulté à choisir manuellement à chaque séance** → friction cognitive. Duolingo te place automatiquement.
6. **Pas de mascotte / présence émotionnelle** → l'app est un outil neutre, pas un compagnon. Le contexte thérapeutique appelle pourtant un repère humain.
7. **Premium banner anxiogène** → la bannière jaune verrouillage Premium est visible avant même la première séance. (Actuellement désactivée en dev mais à repenser pour le retour.)
8. **Aucune carte de progression visuelle** → l'utilisateur ne « voit pas » son chemin. Duolingo a son path, Khan Academy son arbre, Headspace ses cours.
9. **Streak fragile** → casse au premier jour manqué. Aucune « streak freeze » ni « repair ».
10. **Pas de récompense sociale** → pas de partage, pas de league, pas de message du thérapeute.

### 1.4 Diagnostic émotionnel

Pour ce public, **trois émotions à éviter absolument** :
- Honte de mal performer (« mon score est 42, je suis nul »)
- Culpabilité d'avoir manqué (« j'ai cassé ma série de 12 jours »)
- Pression de performance (« je dois absolument battre mon record »)

**Trois émotions à provoquer** :
- Sécurité (« peu importe le score, j'ai parlé aujourd'hui »)
- Continuité (« hier aussi j'étais là »)
- Fierté tranquille (« regarde le chemin parcouru depuis 30 jours »)

---

## 2. NOUVEAU SYSTÈME DE GAMIFICATION

### 2.1 Vue d'ensemble — Trois boucles imbriquées

```
┌──────────────────── BOUCLE LONG TERME (mois) ────────────────────┐
│  Niveaux (XP) · Badges rares · Carte de progression · Saisons    │
│                                                                  │
│  ┌────────────── BOUCLE HEBDOMADAIRE (7 jours) ──────────────┐   │
│  │   Ligue · Quête de la semaine · Bilan dimanche soir       │   │
│  │                                                           │   │
│  │   ┌──── BOUCLE QUOTIDIENNE (10 min) ────┐                 │   │
│  │   │  Objectif XP du jour                │                 │   │
│  │   │  Streak +1                          │                 │   │
│  │   │  Coffre quotidien                   │                 │   │
│  │   │  Mascotte qui t'accueille           │                 │   │
│  │   └─────────────────────────────────────┘                 │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Boucle quotidienne (la plus importante)

| Élément | Spec | Inspiration |
|---|---|---|
| **Objectif XP du jour** | 30 / 60 / 100 XP au choix à l'onboarding (« Doux / Régulier / Engagé »). Modifiable à tout moment. | Duolingo daily goal |
| **Anneau de progression** | Cercle SVG sur la home, se remplit au fur et à mesure. Animation de complétion + son discret. | Apple Watch rings + Duolingo |
| **Coffre quotidien** | Visible sur la home, s'ouvre quand l'objectif est atteint. Récompense variable : XP bonus (10-50), gemmes (5-15), badge cosmétique rare (1%), boost streak. | Duolingo treasure chest, Habitica |
| **Streak counter** | Flamme + nombre. Animation de +1 quand l'objectif du jour est validé. | Duolingo streak |
| **Streak freeze** | 2 disponibles en permanence, regagnés à chaque palier de 7 jours. Protègent automatiquement une journée manquée. | Duolingo streak freeze |
| **Streak repair** | À J+1 d'un break, écran « On répare ta série pour 50 gemmes ? ». | Duolingo |
| **Mascotte du jour** | Apparaît à l'ouverture, message contextualisé (cf. §5). | Duolingo Duo / Finch |

### 2.3 Boucle hebdomadaire

| Élément | Spec |
|---|---|
| **Ligue** | 5 ligues (Bronze, Argent, Or, Émeraude, Diamant). Promotion top 5/30, relégation bottom 5/30 chaque dimanche 23h59. **Anonyme par défaut** (« Patient #2847 ») pour respecter contexte santé. Opt-in pour pseudonyme. |
| **Quête hebdomadaire** | 3 objectifs cumulatifs sur la semaine. Ex : « 5 séances Soutenu », « Pratiquer 4 jours différents », « Score moyen ≥ 70 ». Récompense : 200 XP + 1 badge saisonnier. |
| **Bilan du dimanche soir** | Notification 19h dimanche : carte récap (jours pratiqués, XP, score moyen, progression vs semaine précédente, citation du thérapeute si lié). |
| **Boss hebdomadaire** | Optionnel, premium : un texte exigeant (Maîtrise) à 3 essais. Score ≥ 75 = trophée hebdo. |

### 2.4 Boucle long terme

- **Niveaux** : passer de 5 à **15 niveaux** avec courbes XP non-linéaires (paliers plus rapprochés au début pour dopamine immédiate, plus longs après). Chaque niveau débloque un thème de couleur, un avatar, ou un fond.
- **Carte de progression** : remplacer la liste de difficultés par un **chemin visuel à étapes** (style Duolingo path) : Doux → Régulier → Soutenu → Exigeant → Maîtrise → Étoiles bonus. Chaque étape = 5-10 textes à compléter avec étoiles (1 à 3) selon le score.
- **Badges étendus** : passer de 10 à **50 badges**, classés en 4 raretés (Commun, Rare, Épique, Légendaire). Catégories : régularité, performance, exploration, persévérance après absence, événements saisonniers, micro-victoires (« Premier 100 », « 30 jours sans hésitation »).
- **Saisons** : cycle de 8 semaines. Chaque saison a un thème (« Saison du Printemps », « Saison de la Voix »), une mascotte saisonnière, une couleur dominante, des badges exclusifs.

### 2.5 Récompenses variables (clé de la dopamine)

Trois types par séance :
1. **XP fixe** (déjà en place) : prévisible, fonde le contrat de progression.
2. **XP bonus aléatoire** : 10-30% de chance de recevoir +20 à +100% XP. Animation « COMBO ! » ou « ÉTINCELLE ! ».
3. **Drop rare** : 1-3% de chance de débloquer un badge cosmétique, un avatar, un thème.

Cela transforme chaque séance en un mini-événement, sans rendre le résultat thérapeutique aléatoire.

### 2.6 Monnaie virtuelle

- **Gemmes** (premium feel, rares) : gagnées via streak, ligue, quête. Servent à acheter streak freeze, repairs, cosmétiques.
- **Pétales** (commun, abondant) : gagnées à chaque séance. Servent au boost XP du jour suivant, à offrir des cartes d'encouragement à un autre patient (mode coopératif).

Pas de IAP sur les gemmes au lancement (éviter pay-to-win dans contexte santé). Premium = features fonctionnelles, pas raccourcis cosmétiques.

---

## 3. UX / UI — Refonte d'écran

### 3.1 Architecture d'écran proposée (mobile-first)

```
┌────────────────────────────────────┐
│   [Logo]      🔥 12      💎 240    │  ← top bar minimaliste
├────────────────────────────────────┤
│                                    │
│   « Bonjour Marie 👋               │  ← mascotte + nom
│     Prêt pour ta séance ? »        │
│                                    │
│   ┌──────────────────────────┐     │
│   │  ◯ Anneau XP du jour     │     │  ← anneau central animé
│   │      45 / 60 XP          │     │
│   │   ───────────────        │     │
│   │   Coffre dans 15 XP 🎁   │     │
│   └──────────────────────────┘     │
│                                    │
│   [ ▶  Démarrer ma séance ]        │  ← CTA primaire géant
│                                    │
│   Aujourd'hui ── ─ ─ ─ ─ ─ ─ ─    │
│   Texte conseillé : « La promenade »│  ← suggestion auto (pas de choix)
│   Niveau Doux · 2-3 min            │
│                                    │
│   [Voir le chemin →]               │  ← lien carte de progression
│                                    │
├────────────────────────────────────┤
│  🏠 Accueil  🗺️ Chemin  🏆 Ligue  👤│  ← bottom nav (4 onglets max)
└────────────────────────────────────┘
```

**Changements clés vs aujourd'hui** :
- Suppression du choix manuel de difficulté à chaque séance → suggestion intelligente basée sur historique (comme Duolingo).
- Top bar dédiée à streak + monnaie (visibilité permanente = ancrage psychologique).
- Anneau XP devient l'élément hero, pas le sélecteur de niveau.
- Bottom nav fixe pour navigation rapide sans menus.

### 3.2 Écran « Chemin » (carte de progression)

Inspiré de Duolingo path : un parcours sinueux visuel avec des nœuds (textes), regroupés par chapitres (niveaux Doux → Maîtrise). Chaque nœud :
- 🔒 Verrouillé (gris)
- ⭕ Disponible (couleur niveau + animation pulse)
- ⭐ ⭐ ⭐ Complété (étoiles selon score)

Permet à l'utilisateur de voir **où il est** et **ce qu'il y a après**. Effet « Zeigarnik » : tâches inachevées créent l'envie de revenir.

### 3.3 Écran post-séance (le moment dopamine)

Séquence animée de 6-10 secondes :

1. **Score qui se révèle** (compteur animé 0 → score, 1.5s)
2. **+XP qui vole vers la barre** (avec « +75 XP » et « ×1.5 Soutenu »)
3. **Si bonus** : flash doré « COMBO ! +25 XP bonus »
4. **Streak +1** : flamme qui grandit
5. **Anneau du jour** se remplit en temps réel
6. **Si objectif atteint** : confettis + coffre qui apparaît
7. **Si nouveau badge** : carte qui pop avec animation
8. **Mascotte** : phrase contextualisée (« Wow, tu as battu ton record d'hier ! »)
9. **CTA** : « Encore une ? » (chaîne) ou « Terminer ma journée »

C'est ce moment qui crée l'addiction saine. Aujourd'hui le post-séance est plat.

### 3.4 Mascotte — « Voci »

Proposition : un **petit oiseau stylisé** (chant = parole, vol = progression, douceur = thérapeutique). Pas humain (évite uncanny valley pour patients avec troubles), pas trop enfantin (Duo de Duolingo serait infantilisant ici).

Personnalité :
- Bienveillant, jamais culpabilisant
- Tutoie mais avec respect
- Connaît le contexte thérapeutique (référence pudique aux jours difficiles)
- Apparaît : home, post-séance, retour après absence, milestone

Variantes visuelles selon état émotionnel : repos, encouragement, célébration, accueil-après-absence.

### 3.5 Système de couleurs émotionnelles

| Contexte | Couleur dominante | Usage |
|---|---|---|
| Calme / accueil | Bleu doux #1E5BB8 (déjà la marque) | Headers, navigation |
| Progression | Vert prairie #2BA265 | Streak, validation |
| Récompense | Or chaud #D4A23E | Coffres, bonus, badges |
| Échec doux | Pêche #F4C8A8 (jamais rouge vif) | Score bas, jours manqués |
| Premium / rare | Violet #7B5EA7 | Légendaire, ligue Diamant |

**Règle absolue** : pas de rouge agressif. Pas de croix. Tout « négatif » est traité en pêche/ambre avec une formulation positive.

---

## 4. FONCTIONNALITÉS AVANCÉES (priorisées en §6)

### 4.1 Défis quotidiens (3 par jour, choisir 1)
Ex : « Lis un texte Doux à voix haute », « Fais une séance avant midi », « Bats ton score de la semaine ». Récompense : 30 XP + 5 gemmes.

### 4.2 Quêtes hebdo (cf. §2.3)

### 4.3 Coffre quotidien + Coffre de fin de semaine (cf. §2.2)

### 4.4 Avatar évolutif
Choisir un compagnon (variantes de Voci) ou un avatar humain abstrait. Évolue avec le niveau (vêtement, environnement, accessoires).

### 4.5 Boutique cosmétique
Thèmes visuels (fond clair/sombre/saisonnier), tenues de mascotte, fonds d'écran, sons de récompense. **Aucun avantage gameplay**.

### 4.6 Mode Famille / Thérapeute
- Famille : un proche reçoit un résumé hebdomadaire, peut envoyer une carte d'encouragement (« Bravo papa, fier de toi »).
- Thérapeute : tableau de bord (déjà en place côté ortho). Ajouter capacité d'envoyer un message court qui apparaîtra dans la home du patient (« Bon travail Marie, on se voit jeudi »).

### 4.7 Mode coopératif (V2)
Deux patients se « jumellent » avec accord. Chacun voit le streak de l'autre, peut envoyer une pétale d'encouragement. Crée une responsabilité douce.

### 4.8 Événements saisonniers
- Septembre : « Mois de la sensibilisation à l'aphasie »
- Décembre : « Voix d'hiver », textes thématiques, badge exclusif
- Mars : « Printemps de la parole », quête longue

### 4.9 « Boss » hebdomadaire
Texte difficile, 3 essais sur la semaine. Score moyen ≥ 75 = trophée. Optionnel.

---

## 5. SYSTÈME ÉMOTIONNEL — Microcopy et messages

### 5.1 Règles de ton (à coller dans le brief design)

✅ **À faire** :
- Tutoyer avec chaleur
- Reconnaître l'effort avant le résultat
- Phrases courtes, max 12 mots
- Une émotion par message (pas de surcharge)
- Citer l'utilisateur par son prénom occasionnellement
- Référencer le passé proche (« comme hier »)

❌ **À ne jamais faire** :
- « Vous avez échoué », « C'est faux », « Erreur »
- Émojis enfantins en excès (1 par message max)
- Comparaison directe avec d'autres utilisateurs
- Pression temporelle agressive (« Vite ! Plus que 2h ! »)
- Notification après 20h (sauf bilan dimanche)

### 5.2 Microcopy par moment

**Accueil (home)**
- Premier jour : « Bienvenue Marie 👋 On commence en douceur ? »
- Streak en cours : « Content de te revoir. Jour 12, tu construis quelque chose. »
- Après absence 1-3 jours : « Te revoilà. Pas de pression, on reprend où on en était. »
- Après absence 7+ jours : « Hey Marie. Quoi qu'il se soit passé, tu es là maintenant. C'est ce qui compte. »

**Démarrage séance**
- « Prends ton temps. Respire. On y va quand tu es prêt. »
- « Pas besoin d'être parfait. Juste présent. »

**Post-séance — score élevé (≥ 80)**
- « Magnifique. Ta voix porte. »
- « C'est ton meilleur score. Fier de toi. »

**Post-séance — score moyen (50-79)**
- « Bon travail. Chaque séance compte, peu importe le score. »
- « Tu as parlé aujourd'hui. C'est l'essentiel. »

**Post-séance — score bas (< 50)**
- « Les jours plus difficiles font partie du chemin. À demain. »
- « Tu as essayé. C'est la seule chose qui compte vraiment. »
- ❌ JAMAIS « Score insuffisant » ou équivalent.

**Streak +1**
- Jour 3 : « Trois jours. Une habitude qui s'installe. »
- Jour 7 : « Une semaine complète. Regarde ce que tu as construit. »
- Jour 30 : « 30 jours. Tu changes vraiment quelque chose. »

**Streak cassé (J+1 sans rien)**
- Avec freeze auto : « Une protection a été utilisée. Ta série continue. »
- Sans freeze : « Pas de pression. Une nouvelle série commence aujourd'hui. »

**Coffre ouvert**
- « Voilà ta récompense du jour ✨ »
- Drop rare : « Whoa. Tu viens de débloquer quelque chose de spécial. »

### 5.3 Notifications push (calendrier type)

| Quand | Pourquoi | Exemple |
|---|---|---|
| 9h00 (réglable) | Rappel doux | « Bonjour Marie. 5 minutes pour ta séance ? » |
| 18h00 (si rien fait) | Rappel objectif jour | « Il te reste 30 XP pour valider ta journée 🌱 » |
| 20h30 (uniquement si streak en danger) | Sauvetage streak | « Une petite séance pour garder ta série de 12 jours. Ou pas, on comprend. » |
| Dimanche 19h | Bilan hebdo | « Ta semaine en 30 secondes ? Voir mon bilan. » |
| J+3 sans activité | Reconnect doux | « On pense à toi. Quand tu es prêt, on est là. » |
| J+7 sans activité | Reconnect doux | « Un petit signe ? Même 2 minutes ça compte. » |
| Au-delà de J+14 | Stop notifications | (silence) |

**Règle d'or** : si l'utilisateur ignore 3 notifications d'affilée, baisser la fréquence de moitié. Jamais de spam, jamais de culpabilisation.

---

## 6. ROADMAP — MVP → V1 → V2

### 6.1 Priorisation (matrice Impact × Effort)

**🔥 MVP (4-6 semaines, max impact, effort modéré)**
1. Anneau XP quotidien sur la home + objectif au choix (Doux 30 / Régulier 60 / Engagé 100)
2. Coffre quotidien (récompense fixe au début, variable en V1)
3. Streak freeze automatique (2 dispos)
4. Refonte écran post-séance (séquence animée + microcopy par tranche de score)
5. Mascotte « Voci » statique + 5 phrases contextualisées
6. Microcopy bienveillante généralisée (cf. §5.2)
7. Notification quotidienne paramétrable (1 le matin, 1 le soir si rien fait)

**⚡ V1 (8-12 semaines après MVP)**
8. Carte de progression (path Duolingo-like)
9. Système de gemmes + boutique cosmétique simple (3 thèmes)
10. Quêtes hebdomadaires (3 par semaine)
11. Bilan dimanche (in-app + notification)
12. Étendre badges de 10 à 30, ajouter raretés
13. Suggestion intelligente du prochain texte (plus de sélection manuelle obligatoire)
14. Mascotte animée (4-5 états)
15. Avatar évolutif basique

**🚀 V2 (3-6 mois après V1)**
16. Ligues hebdomadaires (anonymes)
17. Saisons (8 semaines, badges exclusifs)
18. Mode famille (envoi cartes encouragement)
19. Mode thérapeute (message court qui apparaît dans la home patient)
20. Boss hebdomadaire
21. Récompenses variables (combo, drop rare 1-3%)
22. Mode coopératif jumelage patients (avec garde-fous santé)
23. Événements saisonniers automatisés

### 6.2 Suggestions techniques

**Architecture suggérée pour la gamification** :
- Garder `app/lib/gamification.ts` comme moteur, l'étendre :
  - Ajouter `dailyGoal`, `dailyXP`, `coffres`, `gems`, `petales` au type `GamificationState`
  - Ajouter un module `quests.ts` (quêtes hebdo, défis quotidiens)
  - Ajouter un module `mascot.ts` (sélection de phrase selon contexte)
  - Ajouter un module `notifications.ts` (côté serveur, via Vercel Cron + Resend ou web push)

**Stockage** :
- Étendre table Supabase `users` : colonnes `daily_goal`, `gems`, `petales`, `streak_freezes`, `current_avatar`, `notif_prefs_json`
- Nouvelle table `daily_progress` : `user_id`, `date`, `xp_earned`, `goal_met`, `chest_opened`
- Nouvelle table `quests` : `user_id`, `week_iso`, `quest_id`, `progress`, `completed_at`

**Animations** :
- Recommander `framer-motion` pour les transitions et la séquence post-séance.
- `react-confetti` pour les célébrations (léger, accessible).
- Lottie (`lottie-react`) pour la mascotte si on veut des animations vectorielles riches sans poids excessif.

**Notifications** :
- MVP : notifications email (Resend) + bannière in-app.
- V1 : web push (PWA + Service Worker, Next.js le supporte).
- V2 : push iOS/Android via Capacitor si vous packagez.

### 6.3 KPIs à suivre

**Engagement quotidien**
- DAU / MAU (Daily / Monthly Active Users) — cible : DAU/MAU ≥ 0.4 (Duolingo : ~0.7)
- % d'utilisateurs qui complètent leur objectif quotidien — cible : ≥ 50%
- Temps moyen passé par session — cible : 5-8 min (pas plus, c'est thérapeutique)

**Rétention**
- D1 / D7 / D30 retention — cibles : 60% / 35% / 20% (benchmarks app santé)
- Streak médian (jours consécutifs) — cible : 7 jours après 1 mois
- % d'utilisateurs avec streak ≥ 7 jours — cible : ≥ 25%

**Qualité émotionnelle**
- NPS / score satisfaction post-séance — cible : ≥ 8/10
- Taux d'usage des streak freezes — si > 80% utilisé, le seuil est trop strict
- Taux de retour après J+7 silence — cible : ≥ 30% reviennent

**Progression thérapeutique**
- Score moyen global par utilisateur sur 30 jours — doit augmenter
- Diversité des exercices complétés
- Nombre de séances par semaine — cible : 4-5 séances/semaine

---

## 7. WIREFRAMES TEXTUELS — Écrans clés

### 7.1 Onboarding (4 écrans, 90 secondes max)

**Écran 1 — Bienvenue**
```
        🐦 (Voci, animé doux)

      « Bonjour. Je suis Voci.
        Je vais t'accompagner. »

         [Continuer →]
```

**Écran 2 — Contexte (sans jugement)**
```
   Qu'est-ce qui t'amène ?
   (Tu pourras changer plus tard)

   ○ AVC
   ○ Sclérose en plaques
   ○ Parkinson
   ○ Traumatisme crânien
   ○ Autre / Je préfère ne pas dire

         [Continuer →]
```

**Écran 3 — Objectif quotidien**
```
   Combien de temps par jour ?

   🌱  Doux       2 min  (30 XP)
   🌿  Régulier   5 min  (60 XP)
   🌳  Engagé    10 min (100 XP)

   « Tu pourras ajuster à tout moment. »

         [Choisir →]
```

**Écran 4 — Première récompense**
```
        ✨ (animation)

   « Tu as déjà gagné ton premier badge :
      Premier Pas 🎙️ »

   [▶ Faire ma première séance]
```

### 7.2 Home après onboarding

(Voir § 3.1 ci-dessus)

### 7.3 Bilan dimanche soir

```
   ┌─────────────────────────────────┐
   │   Ta semaine, Marie 🌱          │
   │                                 │
   │   ●●●●●○○  5 jours sur 7        │
   │                                 │
   │   ┌──────┐  ┌──────┐  ┌──────┐  │
   │   │ 380  │  │  72  │  │  +8  │  │
   │   │  XP  │  │ Score│  │ vs   │  │
   │   │      │  │ moy. │  │ S-1  │  │
   │   └──────┘  └──────┘  └──────┘  │
   │                                 │
   │   Quête : ✅ 5 séances Soutenu  │
   │           ⏳ 4 jours différents │
   │                                 │
   │   « Continue comme ça. Chaque   │
   │     semaine compte. »           │
   │                                 │
   │   [Voir le détail]              │
   └─────────────────────────────────┘
```

---

## 8. COMPARAISON SYSTÉMATIQUE AVEC LES RÉFÉRENCES

| Mécanique | Duolingo | Habitica | Finch | Khan Academy | Headspace | Recommandation Parole+ |
|---|---|---|---|---|---|---|
| **Streak** | ✅ central, freeze | ⚠️ secondaire | ✅ doux | ❌ | ✅ doux | **Adopter style Finch** : visible mais déculpabilisant |
| **XP / Niveaux** | ✅ | ✅ | ❌ | ✅ mastery | ❌ | Garder, étendre à 15 niveaux |
| **Ligues** | ✅ moteur fort | ❌ | ❌ | ❌ | ❌ | **Adopter mais anonymisé** (contexte santé) |
| **Mascotte** | ✅ Duo | ❌ | ✅ poussin | ❌ | ⚠️ neutre | **Adopter style Finch** (compagnon doux, pas Duo enfantin) |
| **Coffres / drops** | ✅ | ✅ | ✅ | ❌ | ❌ | Adopter, sobre |
| **Quêtes** | ✅ | ✅ central | ✅ | ❌ | ❌ | Adopter (3 par semaine, pas plus) |
| **Path / carte** | ✅ central V2 | ❌ | ❌ | ✅ arbre | ✅ cours linéaires | **Adopter style Duolingo path** |
| **Ton bienveillant** | ⚠️ parfois passif-agressif | ⚠️ neutre | ✅ excellent | ⚠️ neutre | ✅ excellent | **Modéliser sur Headspace + Finch** |
| **Notifications** | ⚠️ trop agressives | ⚠️ moyen | ✅ douces | ⚠️ peu | ✅ douces | **Modéliser sur Headspace** |
| **Monétisation** | freemium agressif | freemium doux | freemium doux | gratuit | abonnement | Garder Premium fonctionnel, **JAMAIS pay-to-win** |
| **Récompenses sociales** | ✅ | ✅ guildes | ⚠️ | ❌ | ❌ | Mode famille + thérapeute, **pas de social public** |

**Le ADN Parole+ doit être** :
- Boucles et mécaniques de **Duolingo**
- Ton émotionnel de **Finch** + **Headspace**
- Maîtrise progressive de **Khan Academy**
- Sans le côté guildes/PvP de **Habitica**

---

## 9. RISQUES À MITIGER

| Risque | Mitigation |
|---|---|
| Patient se sent comparé / humilié par la ligue | Anonymisation par défaut, opt-in pseudonyme |
| Streak crée pression et abandon | Freeze auto + microcopy déculpabilisante + pause manuelle (« mode vacances ») |
| Mascotte infantilisante pour adulte 60+ | Voci sobre, ton respectueux, jamais bébé-talk |
| Notifications spam | Cap 2/jour, baisse auto si ignorées, jamais après 20h |
| Gamification masque l'objectif thérapeutique | Bilan thérapeute reste central, gamification = enrobage motivationnel, pas critère de progrès médical |
| Patient avec aphasie sévère démotivé par scores | Mode « Pratique libre » : compte la séance pour XP/streak sans afficher de score |

---

## 10. PROCHAINE ÉTAPE RECOMMANDÉE

Je suggère ce séquençage opérationnel :

1. **Cette semaine** : valider ce plan, choisir la mascotte (Voci ou autre), valider l'objectif XP par défaut.
2. **Semaines 1-2 du MVP** : implémenter anneau XP + objectif quotidien + microcopy bienveillante + écran post-séance refondu.
3. **Semaines 3-4 du MVP** : streak freeze + coffre + notifications.
4. **Test utilisateur** sur 5-10 patients réels (idéalement contactés via réseau ortho) avant V1.
5. **V1** : carte de progression + boutique + quêtes hebdo.

Tu peux me dire :
- Quel élément du plan tu veux que je commence à implémenter en code ?
- Si la mascotte Voci te parle ou tu veux explorer d'autres directions ?
- Si tu veux qu'on raffine une section en particulier (ex. microcopy plus poussée, wireframes plus détaillés) ?
