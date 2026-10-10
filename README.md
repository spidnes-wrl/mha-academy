# MHA Academy

Plateforme académique Next.js / Supabase pour la gestion des étudiants, les missions, les quiz, la boutique, la communauté et les événements.

## Structure de base

- `package.json` : dépendances et scripts du projet
- `tailwind.config.ts` : configuration du design du thème
- `src/app` : pages publiques et écrans de base
- `src/lib/supabase` : clients Supabase côté client et serveur
- `src/components` : composants réutilisables

## Développement local

```bash
npm install
npm run dev
```

## Variables d’environnement

Copier `.env.example` vers `.env.local` puis renseigner les valeurs Supabase.

```bash
cp .env.example .env.local
```

## Déploiement

- Connecter le dépôt GitHub à Vercel
- Configurer les variables d’environnement Supabase
- Déployer la branche principale

## Sécurité

- Ne jamais exposer les clés privées dans le navigateur
- Vérifier les permissions côté serveur
- Conserver les règles RLS et les transactions atomiques sur la base de données
