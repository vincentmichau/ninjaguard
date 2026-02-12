#!/bin/bash

# NightWatch - Script d'arrêt des services

echo "=========================================="
echo "NightWatch - Arrêt des Services"
echo "=========================================="
echo ""

# Lire les PIDs si disponibles
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "🛑 Arrêt du Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo "   ✅ Backend arrêté"
    else
        echo "⚠️  Backend déjà arrêté"
    fi
    rm logs/backend.pid
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🛑 Arrêt du Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo "   ✅ Frontend arrêté"
    else
        echo "⚠️  Frontend déjà arrêté"
    fi
    rm logs/frontend.pid
fi

# Arrêter tous les processus Node.js liés au projet
echo ""
echo "🧹 Nettoyage des processus Node.js..."
pkill -f "node.*backend" 2>/dev/null
pkill -f "vite.*frontend" 2>/dev/null

echo ""
echo "✅ Tous les services NightWatch ont été arrêtés"
echo ""