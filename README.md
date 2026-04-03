# jessicaalesuarez - Catálogo

Sistema de administración de catálogo con Firebase y React.

## 🚀 Características

- ✨ Catálogo público responsive
- 🎨 553+ colores con procesador de tonos inteligente
- 🌓 Modo oscuro/claro
- 📱 WhatsApp integrado
- 🔒 Panel admin con Firebase Auth
- 🖼️ Compresor de imágenes (Canvas)
- 🔍 Búsqueda por nombre y colores

## 📦 Instalación

### Frontend
```bash
cd frontend
yarn install
yarn start
```

### Backend (Opcional)
```bash
cd backend
pip install -r requirements.txt
python server.py
```

## 🔧 Configuración Firebase

1. Las credenciales ya están en `frontend/src/lib/firebase.js`
2. Configura las reglas de Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /productos/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🌐 Rutas

- `/` - Admin (login requerido)
- `/catalogo` - Catálogo público

## 👤 Usuario Demo

- Email: edgar561737@gmail.com
- Password: Edgar123e

## 📱 Contacto

WhatsApp: +52 729 744 1082

---

© 2026 jessicaalesuarez
