FROM b0nam/docker-doom:latest

# Ajout des métadonnées
LABEL maintainer="student@example.com"
LABEL project="Docker Exam Doom"

# Définition des variables d'environnement par défaut pour le mot de passe VNC (peut être surchargé)
ENV VNC_PASSWORD=doom-pass
ENV TIGER_VNC_PASSWORD=doom-pass
ENV VNC_PW=doom-pass
ENV ENVIRONMENT=production

# Expose le port (pour documentation, l'image de base le fait probablement déjà)
EXPOSE 8080
