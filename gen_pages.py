# Génère les pages des Portes à partir d'un même gabarit.
DAYS = [
 (1, 'La Nuit des Morts', '31 octobre', 'Halloween. Les morts se lèvent, et l’un d’eux a des comptes à régler.'),
 (2, 'Le Procès des Écouteurs', '1er novembre', 'Une vieille affaire refait surface. La Cour des Ombres est en session.'),
 (3, 'Le 10 000 des Ombres', '2 novembre', 'Cinq dés, une taverne, et Stanley qui chauffe dans son coin.'),
 (4, 'La Rançon de Carlotta', '3 novembre', 'Quatre nuits au QG. Une impératrice n’est pas d’accord.'),
 (5, 'La Veillée d’Armes', '4 novembre', 'La dernière nuit avant le monde nouveau.'),
]
R = ['I','II','III','IV','V']
for n, title, date, desc in DAYS:
    html = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Porte {R[n-1]} · Le Calendrier des Ombres</title>
<meta name="description" content="Une porte du Calendrier des Ombres.">
<meta name="theme-color" content="#120a06">
<meta property="og:type" content="website">
<meta property="og:title" content="Porte {R[n-1]} · Le Calendrier des Ombres">
<meta property="og:description" content="Une porte s'ouvre chaque matin à 10 h. Brise le sceau.">
<meta property="og:image" content="https://paradisesecurite-web.github.io/Essaie/og.jpg">
<meta property="og:url" content="https://paradisesecurite-web.github.io/Essaie/jour{n}.html">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23a51d17'/%3E%3Cpath d='M32 8l4 30-4 4-4-4z M22 38h20v4H22z M30 42h4v10h-4z' fill='%23f3d27a'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cinzel+Decorative:wght@700;900&family=IM+Fell+English:ital@0;1&family=Pinyon+Script&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css?v=20261031b">
<link rel="stylesheet" href="jours.css?v=20261031b">
</head>
<body class="locked">
<main id="app" aria-hidden="true">
  <header class="door-head">
    <div class="seal-mini" id="headSeal"></div>
    <p class="kicker">Porte {R[n-1]} · {date}</p>
    <h1 class="door-title">{title}</h1>
    <p class="tag">{desc}</p>
  </header>
  <div id="content"></div>
</main>
<script src="calendrier.js?v=20261031b"></script>
<script src="commun.js?v=20261031b"></script>
<script src="j{n}.js?v=20261031b"></script>
</body>
</html>
'''
    open(f'jour{n}.html','w').write(html)
print('ok')
