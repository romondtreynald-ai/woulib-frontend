# Woulib Plus — Frontend

React app konekte ak backend Woulib Plus ki sou Railway.

## Sa ki ladan
- Login & enskripsyon (pasaje oswa chofè)
- Bwoke kous (rider)
- Peman MonCash / NatCash
- Istwa kous (chofè)

## Kòman pou demare li sou òdinatè ou

```
npm install
npm start
```

L ap louvri sou http://localhost:3000

## Kòman pou deplwaye li sou Vercel (pou jwenn yon lyen piblik)

1. Voye dosye sa a sou GitHub (menm jan ak backend la):
```
git init
git add .
git commit -m "woulib plus frontend"
git branch -M main
git remote add origin https://github.com/TON-NON-ITILIZATÈ/woulib-frontend.git
git push -u origin main
```

2. Ale sou vercel.com → Login ak GitHub → "Add New Project" → chwazi `woulib-frontend`

3. Klike "Deploy" — Vercel ap detekte se yon app React epi konfigire tout bagay otomatikman

4. Apre 1-2 minit, w ap jwenn yon lyen tankou:
```
woulib-frontend.vercel.app
```

Pataje lyen sa a ak tout moun ou vle itilize Woulib Plus!

## Enpòtan

Fichye `src/App.js` deja konekte ak backend Railway ou a:
```
https://woulib-backend-production.up.railway.app
```

Si ou chanje URL backend ou pita, ranplase valè `API` anlè nan `src/App.js`.
