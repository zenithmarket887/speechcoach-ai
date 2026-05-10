export type Difficulty = 'debutant' | 'elementaire' | 'intermediaire' | 'avance' | 'expert'

export interface Exercise {
  id: string
  title: string
  text: string
  tip: string
  focus: string
}

export const DIFFICULTIES: Record<Difficulty, { label: string; color: string; description: string; scoringNote: string }> = {
  debutant: {
    label: 'Doux',
    color: 'green',
    description: 'Phrases courtes, mots simples, rythme lent',
    scoringNote: 'Critères très souples — focus sur la confiance',
  },
  elementaire: {
    label: 'Régulier',
    color: 'teal',
    description: 'Phrases plus longues, vocabulaire courant',
    scoringNote: 'Critères souples — hésitations légères tolérées',
  },
  intermediaire: {
    label: 'Soutenu',
    color: 'amber',
    description: 'Paragraphes variés, rythme plus rapide',
    scoringNote: 'Critères standards — hésitations et répétitions pénalisées',
  },
  avance: {
    label: 'Exigeant',
    color: 'orange',
    description: 'Textes complexes, sons difficiles',
    scoringNote: 'Critères stricts — précision et fluidité demandées',
  },
  expert: {
    label: 'Maîtrise',
    color: 'red',
    description: 'Virelangues, textes techniques, poésie',
    scoringNote: 'Critères très exigeants — pour challenger votre articulation',
  },
}

export const EXERCISES: Record<Difficulty, Exercise[]> = {
  debutant: [
    {
      id: 'd1',
      title: 'La promenade',
      text: 'Je marche dans le parc. Le soleil brille. Les oiseaux chantent doucement. Je respire l\'air frais. C\'est une belle journée. Je suis heureux d\'être ici.',
      tip: 'Parlez lentement. Faites une pause après chaque point.',
      focus: 'Rythme de base',
    },
    {
      id: 'd2',
      title: 'Ma journée',
      text: 'Le matin, je me lève tôt. Je prends mon petit-déjeuner. Je bois un café chaud. Je me lave les mains. Je suis prêt pour la journée.',
      tip: 'Articulez bien chaque mot. Pas de précipitation.',
      focus: 'Articulation simple',
    },
    {
      id: 'd3',
      title: 'La nature',
      text: 'La forêt est verte et calme. Les arbres sont très grands. Une rivière coule doucement. Les fleurs sont jolies et colorées. La nature est magnifique.',
      tip: 'Respirez calmement. Lisez comme si vous racontiez à un enfant.',
      focus: 'Respiration',
    },
    {
      id: 'd4',
      title: 'Les animaux',
      text: 'Le chat dort sur le canapé. Le chien joue dans le jardin. Les poissons nagent dans l\'eau froide. Les oiseaux volent dans le ciel bleu. Les animaux sont nos amis.',
      tip: 'Prononcez bien la fin de chaque mot.',
      focus: 'Finales de mots',
    },
    {
      id: 'd5',
      title: 'À la maison',
      text: 'Ma maison est grande et confortable. La cuisine est bien équipée. Le salon est clair et lumineux. Le jardin est fleuri en été. J\'aime beaucoup ma maison.',
      tip: 'Parlez avec le sourire, ça change la voix !',
      focus: 'Intonation positive',
    },
  ],
  elementaire: [
    {
      id: 'e1',
      title: 'Le marché',
      text: 'Chaque samedi matin, je vais au marché du village. Les stands sont colorés et bien garnis. Je choisis des fruits frais, des légumes de saison et parfois du fromage local. Les commerçants sont aimables et je m\'arrête souvent pour discuter avec eux.',
      tip: 'Respectez les virgules comme des pauses courtes.',
      focus: 'Ponctuation parlée',
    },
    {
      id: 'e2',
      title: 'Mon métier',
      text: 'Je travaille dans un bureau en ville. Chaque matin, je prends le bus ou le métro. Mes collègues sont sympathiques et compétents. Nous travaillons ensemble sur des projets variés. Le soir, je rentre chez moi fatigué mais satisfait de ma journée.',
      tip: 'Gardez une voix claire et audible du début à la fin.',
      focus: 'Volume constant',
    },
    {
      id: 'e3',
      title: 'Le sport',
      text: 'Faire du sport est important pour rester en bonne santé. Je fais du jogging trois fois par semaine dans le parc. Je nage aussi le dimanche matin à la piscine municipale. L\'exercice régulier améliore l\'humeur et donne de l\'énergie pour toute la journée.',
      tip: 'Évitez de monter la voix à la fin des phrases déclaratives.',
      focus: 'Intonation descendante',
    },
    {
      id: 'e4',
      title: 'Les saisons',
      text: 'Le printemps est la saison du renouveau. Les fleurs s\'épanouissent et les oiseaux reviennent. L\'été apporte chaleur et lumière. L\'automne habille les forêts de couleurs chaudes. L\'hiver, enfin, invite au repos et à la contemplation sous la neige.',
      tip: 'Variez votre ton selon le sentiment de chaque phrase.',
      focus: 'Expressivité',
    },
    {
      id: 'e5',
      title: 'La lecture',
      text: 'Lire est l\'une de mes activités préférées. Je lis tous les soirs avant de dormir pendant une demi-heure. J\'aime les romans policiers, les récits de voyage et parfois la poésie. Les livres m\'emmènent dans des mondes différents et élargissent ma vision des choses.',
      tip: 'Lisez comme si vous racontiez une histoire à quelqu\'un.',
      focus: 'Narration naturelle',
    },
  ],
  intermediaire: [
    {
      id: 'i1',
      title: 'Le voyage en train',
      text: 'Le train part à huit heures précises depuis la gare centrale. Les voyageurs s\'installent confortablement dans leurs compartiments. Le paysage défile rapidement derrière les vitres. Les champs verts laissent place aux collines boisées, puis aux vallées profondes. Chaque arrêt apporte son lot de nouveaux passagers et de nouveaux visages.',
      tip: 'Maintenez le rythme sans vous précipiter. Évitez les "euh".',
      focus: 'Fluidité soutenue',
    },
    {
      id: 'i2',
      title: 'La cuisine française',
      text: 'La gastronomie française est reconnue dans le monde entier pour sa richesse et sa diversité. Préparer un bon repas demande du temps, de la patience et de la précision. Les sauces mijotent lentement, les arômes se mélangent harmonieusement. Chaque plat raconte une histoire, chaque recette transmet un savoir-faire unique et précieux.',
      tip: 'Attention aux groupes de mots complexes. Respirez aux virgules.',
      focus: 'Gestion du souffle',
    },
    {
      id: 'i3',
      title: 'Le professeur',
      text: 'Un bon professeur sait captiver l\'attention de ses élèves tout au long de la leçon. Il adapte son discours selon le niveau de compréhension de chacun. Sa voix porte clairement jusqu\'au fond de la salle. Il questionne, explique, répète si nécessaire, et encourage ceux qui doutent encore d\'eux-mêmes.',
      tip: 'Variez votre intonation. Marquez bien la ponctuation.',
      focus: 'Intonation variée',
    },
    {
      id: 'i4',
      title: 'Le cinéma',
      text: 'Le cinéma est l\'un des arts les plus populaires du vingtième siècle. Il combine l\'image, le son, la musique et la narration en une expérience immersive unique. Certains films nous font rire aux éclats, d\'autres nous touchent profondément ou nous tiennent en haleine jusqu\'au dernier plan. C\'est un langage universel qui dépasse les frontières culturelles.',
      tip: 'Chaque virgule est une micro-pause. Ne les sautez pas.',
      focus: 'Pauses maîtrisées',
    },
    {
      id: 'i5',
      title: 'L\'innovation',
      text: 'Les technologies numériques transforment profondément notre façon de travailler et de communiquer. L\'intelligence artificielle, la robotique et les objets connectés redéfinissent les frontières du possible. Ces innovations soulèvent des questions importantes sur l\'avenir de l\'emploi, la vie privée et l\'éthique. Il appartient à notre société de définir collectivement les règles de ce nouveau monde.',
      tip: 'Attention à ne pas accélérer sur les listes.',
      focus: 'Débit régulier',
    },
  ],
  avance: [
    {
      id: 'a1',
      title: 'Consonnes explosives',
      text: 'Pierre, Paul et Patricia préparent prudemment plusieurs portions de poisson poché. Bernard bricole bravement de beaux bateaux blancs en bois brut. Thomas trace toujours des tableaux très travaillés, tandis que Damien dessine des diagrammes détaillés depuis des décennies.',
      tip: 'Chaque consonne initiale doit être nette et percutante.',
      focus: 'Consonnes P, B, T, D',
    },
    {
      id: 'a2',
      title: 'Fricatives sifflantes',
      text: 'Six cents chasseurs sachant chasser sans chien chassent en silence. Sous le ciel zébré de nuages, le zéphyr souffle doucement sur les zones sauvages. Zénaïde observe avec fascination les zèbres qui zigzaguent sans se soucier des saisons.',
      tip: 'Distinguez bien S et Z, CH et J. Pas de confusion.',
      focus: 'Sons S, Z, CH, J',
    },
    {
      id: 'a3',
      title: 'Le discours politique',
      text: 'Mes chers concitoyens, nous voici réunis pour débattre des enjeux fondamentaux qui détermineront l\'avenir de notre démocratie. La liberté d\'expression, la solidarité sociale et la responsabilité environnementale constituent les trois piliers indissociables de notre engagement collectif. Ensemble, nous construirons une société plus juste, plus équitable et plus respectueuse des générations futures.',
      tip: 'Parlez avec conviction. Marquez des pauses dramatiques intentionnelles.',
      focus: 'Eloquence et rythme',
    },
    {
      id: 'a4',
      title: 'Liaisons et enchaînements',
      text: 'Les enfants ont appris à écrire avec une ardoise et une éponge. Nous avons acheté un habit élégant en aout, avant un hiver assez rude. Ils ont insisté après une heure et ont obtenu un accord extraordinaire entre eux.',
      tip: 'Faites toutes les liaisons obligatoires. Pas de pause entre les mots liés.',
      focus: 'Liaisons obligatoires',
    },
    {
      id: 'a5',
      title: 'Poésie de Verlaine',
      text: 'Les sanglots longs des violons de l\'automne blessent mon cœur d\'une langueur monotone. Tout suffocant et blême, quand sonne l\'heure, je me souviens des jours anciens et je pleure. Et je m\'en vais au vent mauvais qui m\'emporte deçà, delà, pareil à la feuille morte.',
      tip: 'Respectez la musicalité du poème. Chaque mot compte.',
      focus: 'Musicalité et diction',
    },
  ],
  expert: [
    {
      id: 'ex1',
      title: 'Virelangues enchaînés',
      text: 'Les chaussettes de l\'archiduchesse sont-elles sèches, archi-sèches ? Un chasseur sachant chasser sans son chien est un bon chasseur. Cinq chiens chassent six chats. Trois gros rats gris dans trois gros trous ronds rongent trois gros croûtons ronds. Je suis ce que je suis, et si je suis ce que je suis, qu\'est-ce que je suis ?',
      tip: 'Commencez lentement, puis accélérez sans sacrifier la précision.',
      focus: 'Agilité articulatoire',
    },
    {
      id: 'ex2',
      title: 'Phonèmes rares',
      text: 'L\'épistémologie contemporaine remet en question les fondements méthodologiques des sciences expérimentales. La dichotomie entre rationalisme et empirisme, longtemps considérée irréductible, se révèle perméable aux approches interdisciplinaires. La phénoménologie husserlienne, revisitée par Merleau-Ponty, ouvre des perspectives herméneutiques et heuristiques insoupçonnées.',
      tip: 'Décomposez chaque mot difficile mentalement avant de le prononcer.',
      focus: 'Mots polysyllabiques',
    },
    {
      id: 'ex3',
      title: 'Discours rapide',
      text: 'Dans les profondeurs vertigineuses de l\'océan Pacifique, des créatures bioluminescentes tracent des sillages phosphorescents à travers l\'obscurité abyssale. Ces organismes extraordinairement adaptés survivent sous des pressions colossales là où aucune lumière solaire ne pénètre jamais. Leurs mécanismes physiologiques défient les lois biochimiques que nous pensions pourtant immuables et universelles.',
      tip: 'Maintenez l\'articulation même en fin de phrase longue. Ne relâchez pas.',
      focus: 'Endurance articulatoire',
    },
    {
      id: 'ex4',
      title: 'Sons R et L',
      text: 'Roland roula dans la rue sur un rail rouillé, rageant contre ce revers. Lili lira lentement les livres de la librairie de Léon. Le loriot lorgnait la lune lorsque le lapin leva l\'oreille. Les renardeaux riaient rondement, roulant les rires rouges et rugueux du rossignol remarquable.',
      tip: 'Le R français vient de la gorge, le L de la langue contre le palais.',
      focus: 'Sons R et L',
    },
    {
      id: 'ex5',
      title: 'Improvisation guidée',
      text: 'Mesdames et messieurs, permettez-moi de vous présenter aujourd\'hui les conclusions de notre analyse trimestrielle. Les indicateurs macroéconomiques révèlent une tendance structurellement positive, malgré les turbulences conjoncturelles observées sur les marchés financiers internationaux. Nos préconisations stratégiques s\'articulent autour de trois axes prioritaires que je développerai méthodiquement.',
      tip: 'Vous êtes en conférence. Imposez votre rythme, ne vous précipitez jamais.',
      focus: 'Autorité et prestance',
    },
  ],
}
