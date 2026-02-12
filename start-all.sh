#!/bin/bash

# NightWatch - Script de démarrage complet
# Ce script lance tous les services NightWatch

echo "=========================================="
echo "NightWatch - Démarrage des Services"
echo "=========================================="
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 20+."
    exit 1
fi

# Vérifier si MySQL est installé
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL n'est pas installé. Veuillez installer MySQL 8.0+."
    exit 1
fi

# Créer le dossier logs s'il n'existe pas
mkdir -p logs

echo "📦 Installation des dépendances..."
echo ""

# Installer les dépendances du backend
if [ -d "backend" ]; then
    echo "📥 Installation des dépendances Backend..."
    cd backend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    cd ..
else
    echo "⚠️  Dossier backend introuvable"
fi

# Installer les dépendances du frontend
if [ -d "frontend" ]; then
    echo "📥 Installation des dépendances Frontend..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    cd ..
else
    echo "⚠️  Dossier frontend introuvable"
fi

# Installer les dépendances de l'app mobile (optionnel)
if [ -d "NightWatchApp" ]; then
    echo "📥 Installation des dépendances Mobile (optionnel)..."
    cd NightWatchApp
    if [ ! -d "node_modules" ]; then
        npm install --legacy-peer-deps
    fi
    cd ..
fi

echo ""
echo "=========================================="
echo "🚀 Démarrage des Services"
echo "=========================================="
echo ""

# Démarrer le backend
echo "🔧 Démarrage du Backend (port 3000)..."
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
cd ..

# Attendre que le backend démarre
echo "⏳ Attente du démarrage du backend..."
sleep 5

# Vérifier si le backend a démarré
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Le backend n'a pas pu démarrer. Vérifiez logs/backend.log"
    exit 1
fi

# Démarrer le frontend
echo "🎨 Démarrage du Frontend (port 5173)..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "=========================================="
echo "✅ Services Démarrés avec Succès!"
echo "=========================================="
echo ""
echo "📊 Backend: http://localhost:3000"
echo "🌐 Frontend: http://localhost:5173"
echo "📱 Logs: ./logs/"
echo ""
echo "Identifiants par défaut:"
echo "   Email: admin@nightwatch.fr"
echo "   Mot de passe: Admin123!"
echo ""
echo "Pour arrêter les services, exécutez:"
echo "   ./stop-all.sh"
echo ""
echo "Pour voir les logs en temps réel:"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/frontend.log"
echo ""

# Sauvegarder les PIDs
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

echo "🎉 NightWatch est maintenant prêt!"