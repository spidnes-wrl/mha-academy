# MHA Academy — règles fonctionnelles

La nouvelle version conserve la base Supabase existante.

## Expérience application et PWA
- MHA Academy est une application mobile-first, pas un site vitrine.
- Navigation persistante et interface adaptée aux usages tactiles.
- Manifest, service worker et écran de repli hors connexion.
- Après une inscription réussie, proposition d'installation.
- Si l'installation automatique n'est pas disponible, instructions d'ajout à l'écran d'accueil.
- L'installation reste facultative ; l'application fonctionne aussi dans le navigateur.

## Clans
### Création et adhésion
- Un étudiant ne peut appartenir qu'à un seul clan actif.
- Un clan est limité à cinq membres.
- Le fondateur invite les étudiants ; une invitation doit être acceptée.
- Une demande de création reste en attente jusqu'à son examen et son approbation par l'administration.
- Un clan refusé n'est pas créé comme clan actif.

### Chef, élections et succession
- Le chef est choisi par les membres lors d'une élection.
- Le candidat ayant le plus de voix gagne.
- En cas d'égalité, le candidat ayant le plus de points individuels gagne.
- Après dix jours consécutifs sans activité du chef, le membre actif ayant le plus de points individuels devient chef automatiquement.
- L'ancien chef est retiré du clan lors de cette succession.
- Le traitement automatique doit être planifié côté serveur.

### Points et niveaux
- Jeux, publications, combats entre clans, tournois, quiz et jeux de manipulation peuvent rapporter des points collectifs.
- Les événements de points sont enregistrés pour éviter les doubles attributions.
- Les seuils de niveaux sont configurables ; les seuils définitifs restent à définir.

### Profil public et publications
- Les clans approuvés sont visibles par les étudiants.
- Les étudiants peuvent suivre un clan sans en devenir membres.
- Les publications publiques acceptent une image et une légende, pas de vidéos.
- Seul le chef publie au nom du clan et gère le clan.
- Les abonnés peuvent aimer et commenter les publications publiques.
- Le suivi ne donne aucun accès au chat privé ni aux activités internes.

### Vérification
- Le badge de vérification est une décision discrétionnaire de l'administration.
- Points et popularité peuvent aider à évaluer un clan, sans donner automatiquement le badge.

### Inspection administrative
- Une inspection doit être autorisée, limitée dans le temps et enregistrée.
- L'accès ne doit pas usurper l'identité d'un membre ni cacher l'accès aux personnes concernées.
- Un avis d'inspection doit être communiqué aux membres du clan.

## À décider avant la mise en service complète
- Barème exact des points par activité.
- Seuils exacts de chaque niveau.
- Fréquence des élections ordinaires.
- Règles précises de remplacement d'un membre et désignation du remplaçant.
- Signalements, sanctions, appels et modération.
- Durée maximale d'une inspection et rôles autorisés à la déclencher.

## Mise en production
1. Appliquer les migrations Supabase dans l'ordre, notamment la migration 004.
2. Configurer les URL d'authentification et la confirmation e-mail dans Supabase.
3. Planifier la succession automatique côté serveur avec Supabase Cron ou une Edge Function sécurisée.
4. Définir les seuils de niveaux et le barème des points.
5. Tester les politiques RLS avec plusieurs comptes étudiants et administrateurs.
