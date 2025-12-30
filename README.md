# Projet : Dockerized Doom (Examen Docker)

Ce projet a pour but de conteneuriser le jeu Doom (version classique) et de fournir deux environnements distincts : **Développement** et **Production**.

## Prérequis

- Docker
- Docker Compose
- Git

## Installation

Avant de démarrer, exécutez le script d'initialisation pour télécharger le code source de Doom (nécessaire pour l'environnement de développement) :

```powershell
.\init.ps1
```

## Démarrage rapide

Vous pouvez lancer les environnements indépendamment.

### 1. Environnement de Développement (`dev`)

Cet environnement **construit l'image localement** à partir du code source téléchargé dans `doom-source/`. Idéal pour tester des modifications sur le Dockerfile.

Pour lancer la version de développement :

```bash
docker compose up doom-dev
```

- **URL :** [http://localhost:8080](http://localhost:8080)
- **Mot de passe VNC :** `developer`
- **Configuration :** Les fichiers de configuration sont montés depuis le dossier local `./dev-config`.
- **Logging :** Les logs sont activé avec __Verbose=ON__ et __debug=ON__
### 2. Environnement de Production (`prod`)

Cet environnement utilise par défaut l'**image officielle** du Docker Hub. Vous pouvez changer ce comportement dans `.env.prod` pour utiliser l'image construite localement (`doom-local:dev`).

Pour lancer la version de production en prenant en compte la configuration `.env.prod` :

```bash
docker compose --env-file .env.prod up doom-prod
```

- **URL :** [http://localhost:8081](http://localhost:8081)

- **URL :** [http://localhost:8081](http://localhost:8081)
- **Mot de passe VNC :** `YourSuperStrongPassword123!`
- **Configuration :** Les sauvegardes sont stockées dans un volume Docker nommé `doom_saves` (persistant).
## Différences entre Dev et Prod

| Caractéristique | Développement (`doom-dev`) | Production (`doom-prod`) |
|-----------------|----------------------------|--------------------------|
| **Source** | Build local (`./doom-source`) | Image Hub (ou locale via `.env`) |
| **Port** | `8080` | `8081` |
| **Mot de passe** | `developer` | `SuperStrongPassword123!` |
| **Persistance** | Bind mount (`./dev-config`) | Volume nommé (`doom_saves`) |
| **Restart Policy** | `no` | `unless-stopped` |
| **Logs** | Verbeux (`Verbose=ON`) | Silencieux |

## Structure du projet

- `init.ps1` : Script pour télécharger le code source de Doom.
- `docker-compose.yml` : Définition des services et des différences entre les environnements.
- `doom-source/` : Code source cloné (ignoré par git).
- `README.md` : Documentation du projet.services et des différences entre les environnements.
- `Dockerfile` : Construction de l'image personnalisée basée sur `b0nam/docker-doom`.
- `README.md` : Documentation du projet.
