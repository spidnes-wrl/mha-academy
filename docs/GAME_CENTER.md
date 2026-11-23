# MHA Academy — Espace Jeux

## Jeux jouables dans cette première version
- Quiz à choix multiples : anime, manga, culture générale et technologie.
- Devinettes avec indices et vérification de réponse.
- Morpion stratégique à deux joueurs sur le même appareil.
- Jeu de mémoire avec paires.

## Échecs en ligne — prochaine intégration
Ne pas présenter un échiquier local comme un service multijoueur. Le mode en ligne doit inclure :
1. Création d'un salon privé avec code d'invitation et file publique.
2. Authentification des deux joueurs et vérification de leur appartenance à la partie.
3. Moteur d'échecs côté serveur pour valider chaque coup légalement ; ne jamais faire confiance au FEN ou au coup envoyé par le navigateur.
4. Persistance atomique des coups, FEN courant, joueur au trait, horloge et statut de partie.
5. Synchronisation Supabase Realtime et reprise après reconnexion.
6. Gestion des abandons, échecs et mats, nuls, expiration et signalements.
7. Tests de concurrence et RLS avant activation.

## Points et progression
Les jeux de cette version ne créditent pas encore de points académiques ou de clan. Les points doivent être attribués par un endpoint serveur après validation d'une session terminée, avec identifiant d'événement unique, limite quotidienne, règles par mode et protection contre les répétitions. Les points d'un clan ne peuvent être attribués qu'à un membre actif au moment de la partie.

## Prochaines étapes
- Catalogue de quiz géré par les enseignants et modérateurs autorisés.
- Défis asynchrones et tournois de clan.
- Service d'échecs multijoueur avec moteur serveur.
- Historique, statistiques, classements et récompenses.
