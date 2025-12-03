# Projet : Dockerized Doom (Examen Docker)

Ce projet a pour but de conteneuriser le jeu Doom (version classique) et de fournir deux environnements distincts : **Développement** et **Production**.

## Prérequis

- Docker
- Docker Compose

## Démarrage rapide

Vous pouvez lancer les environnements indépendamment.

### 1. Environnement de Développement (`dev`)

Pour lancer la version de développement :

```bash
docker compose up doom-dev
```

- **URL :** [http://localhost:8080](http://localhost:8080)
- **Mot de passe VNC :** `developer`
- **Configuration :** Les fichiers de configuration sont montés depuis le dossier local `./dev-config`.
- **Logging :** Les logs sont activé avec __Verbose=ON__ et __debug=ON__
- **Redémarrage :** Pas de redémarrage automatique (`restart: "no"`).

### 2. Environnement de Production (`prod`)

Pour lancer la version de production :

```bash
docker compose up doom-prod
```

- **URL :** [http://localhost:8081](http://localhost:8081)
- **Mot de passe VNC :** `YourSuperStrongPassword123!`
- **Configuration :** Les sauvegardes sont stockées dans un volume Docker nommé `doom_saves` (persistant).
- **Redémarrage :** Redémarre automatiquement sauf si arrêté manuellement (`restart: unless-stopped`).

## Différences entre Dev et Prod

| Caractéristique | Développement (`doom-dev`) | Production (`doom-prod`) |
|-----------------|----------------------------|--------------------------|
| **Port** | `8080` | `8081` |
| **Mot de passe** | `developer` | `SuperStrongPassword123!` |
| **Persistance** | Bind mount (`./dev-config`) | Volume nommé (`doom_saves`) |
| **Restart Policy** | `no` | `unless-stopped` |

## Structure du projet

- `docker-compose.yml` : Définition des services et des différences entre les environnements.
- `Dockerfile` : Construction de l'image personnalisée basée sur `b0nam/docker-doom`.
- `README.md` : Documentation du projet.
