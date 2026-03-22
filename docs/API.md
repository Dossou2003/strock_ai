# 📚 Documentation API - Stroke Detection

API REST pour la détection d'AVC par analyse d'images CT cérébrales.

**Base URL:** `http://localhost:8000/api/`  
**Format:** JSON  
**Authentification:** JWT Bearer Token

---

## 🔐 Authentification

### Inscription

**Endpoint:** `POST /auth/register/`

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "patient",
  "phone": "+33612345678"
}
```

**Réponse (201):**
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "patient",
    "created_at": "2025-12-16T05:00:00Z"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

### Connexion

**Endpoint:** `POST /auth/login/`

**Body:**
```json
{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Réponse (200):**
```json
{
  "user": { ... },
  "tokens": {
    "refresh": "...",
    "access": "..."
  }
}
```

---

### Rafraîchir le token

**Endpoint:** `POST /auth/refresh/`

**Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Réponse (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### Profil utilisateur

**Endpoint:** `GET /auth/me/`  
**Auth:** Required

**Réponse (200):**
```json
{
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "patient",
  "phone": "+33612345678",
  "created_at": "2025-12-16T05:00:00Z"
}
```

---

## 🔬 Analyses

### Upload d'une image CT

**Endpoint:** `POST /analysis/`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

**Body:**
```
ct_image: [fichier image]
```

**Formats acceptés:** JPG, JPEG, PNG, DCM  
**Taille max:** 10 MB

**Réponse (201):**
```json
{
  "id": "uuid",
  "user": "user-uuid",
  "user_email": "john@example.com",
  "ct_image": "/media/uploads/2025/12/16/image.jpg",
  "status": "processing",
  "error_message": null,
  "processing_time": null,
  "created_at": "2025-12-16T05:00:00Z",
  "updated_at": "2025-12-16T05:00:00Z",
  "result": null
}
```

---

### Liste des analyses

**Endpoint:** `GET /analysis/`  
**Auth:** Required

**Query params:**
- `page`: Numéro de page (défaut: 1)
- `page_size`: Taille de page (défaut: 20)

**Réponse (200):**
```json
{
  "count": 42,
  "next": "http://localhost:8000/api/analysis/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "ct_image": "/media/uploads/...",
      "status": "completed",
      "has_stroke": true,
      "probability": 0.873,
      "created_at": "2025-12-16T05:00:00Z"
    },
    ...
  ]
}
```

---

### Détails d'une analyse

**Endpoint:** `GET /analysis/{id}/`  
**Auth:** Required

**Réponse (200):**
```json
{
  "id": "uuid",
  "user": "user-uuid",
  "user_email": "john@example.com",
  "ct_image": "/media/uploads/2025/12/16/image.jpg",
  "status": "completed",
  "error_message": null,
  "processing_time": 5.23,
  "created_at": "2025-12-16T05:00:00Z",
  "updated_at": "2025-12-16T05:00:10Z",
  "result": {
    "id": "result-uuid",
    "has_stroke": true,
    "probability": 0.873,
    "affected_territory": "ACM_g",
    "glcm_features": {
      "gauche": {
        "contrast": 0.234,
        "energy": 0.456,
        "homogeneity": 0.789,
        "correlation": 0.912,
        "entropy": 3.456
      },
      "droite": {
        "contrast": 0.123,
        "energy": 0.567,
        "homogeneity": 0.890,
        "correlation": 0.934,
        "entropy": 3.123
      },
      "asymetrie": {
        "delta_contrast": 0.111,
        "delta_energy": 0.111,
        "delta_homogeneity": 0.101,
        "delta_correlation": 0.022,
        "delta_entropy": 0.333
      }
    },
    "segmentation_image": "/media/results/segmentation/...",
    "heatmap_image": "/media/results/heatmap/...",
    "comparison_image": "/media/results/comparison/...",
    "created_at": "2025-12-16T05:00:10Z"
  }
}
```

---

### Statut du traitement

**Endpoint:** `GET /analysis/{id}/status/`  
**Auth:** Required

**Réponse (200):**
```json
{
  "id": "uuid",
  "status": "completed",
  "processing_time": 5.23,
  "error_message": null
}
```

**Statuts possibles:**
- `pending`: En attente
- `processing`: En cours
- `completed`: Terminé
- `failed`: Échoué

---

### Supprimer une analyse

**Endpoint:** `DELETE /analysis/{id}/`  
**Auth:** Required

**Réponse (204):** No Content

---

## 📊 Résultats

### Liste des résultats

**Endpoint:** `GET /results/`  
**Auth:** Required

**Réponse (200):**
```json
{
  "count": 35,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "analysis": "analysis-uuid",
      "has_stroke": true,
      "probability": 0.873,
      "affected_territory": "ACM_g",
      "glcm_features": { ... },
      "created_at": "2025-12-16T05:00:10Z"
    },
    ...
  ]
}
```

---

### Détails d'un résultat

**Endpoint:** `GET /results/{id}/`  
**Auth:** Required

**Réponse (200):** Même format que ci-dessus

---

### Résultat par analyse

**Endpoint:** `GET /results/analysis/{analysis_id}/`  
**Auth:** Required

**Réponse (200):** Résultat complet de l'analyse

---

## 💬 Chatbot

### Envoyer un message

**Endpoint:** `POST /chatbot/`  
**Auth:** Required

**Body:**
```json
{
  "message": "C'est quoi un effacement des sillons ?",
  "analysis_id": "uuid"  // Optionnel
}
```

**Réponse (201):**
```json
{
  "id": "uuid",
  "user": "user-uuid",
  "user_email": "john@example.com",
  "analysis": "analysis-uuid",
  "message": "C'est quoi un effacement des sillons ?",
  "response": "L'effacement des sillons corticaux est un signe radiologique précoce d'AVC ischémique. Les sillons sont les \"rainures\" à la surface du cerveau...",
  "timestamp": "2025-12-16T05:00:00Z"
}
```

---

### Historique des messages

**Endpoint:** `GET /chatbot/`  
**Auth:** Required

**Réponse (200):**
```json
{
  "count": 12,
  "results": [
    {
      "id": "uuid",
      "user_email": "john@example.com",
      "message": "...",
      "response": "...",
      "timestamp": "2025-12-16T05:00:00Z"
    },
    ...
  ]
}
```

---

### Effacer l'historique

**Endpoint:** `DELETE /chatbot/clear/`  
**Auth:** Required

**Réponse (200):**
```json
{
  "detail": "12 message(s) supprimé(s)."
}
```

---

## 📈 Statistiques (Admin/Doctor)

### Vue d'ensemble

**Endpoint:** `GET /stats/overview/`  
**Auth:** Required (role: doctor ou admin)

**Réponse (200):**
```json
{
  "total_analyses": 150,
  "completed_analyses": 142,
  "total_strokes": 45,
  "stroke_rate": 0.317
}
```

---

### Performance du modèle

**Endpoint:** `GET /stats/performance/`  
**Auth:** Required (role: doctor ou admin)

**Réponse (200):**
```json
{
  "accuracy": 0.89,
  "precision": 0.87,
  "recall": 0.91,
  "f1_score": 0.89,
  "auc_roc": 0.92
}
```

---

## ❌ Codes d'erreur

| Code | Signification |
|------|---------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (données invalides) |
| 401 | Unauthorized (token manquant/invalide) |
| 403 | Forbidden (permissions insuffisantes) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🔒 Permissions

| Endpoint | Permissions |
|----------|-------------|
| `/auth/*` | Public |
| `/analysis/*` | Authenticated + Owner |
| `/results/*` | Authenticated + Owner |
| `/chatbot/*` | Authenticated |
| `/stats/*` | Authenticated + Doctor/Admin |

---

## 📝 Notes

- Tous les IDs sont des UUID v4
- Les timestamps sont en UTC (ISO 8601)
- Les images sont servies via `/media/`
- La pagination utilise `page` et `page_size`
- Les tokens JWT expirent après 1h (access) et 7j (refresh)

---

## 🧪 Exemples avec cURL

### Upload d'image

```bash
curl -X POST http://localhost:8000/api/analysis/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "ct_image=@/path/to/image.jpg"
```

### Envoyer un message au chatbot

```bash
curl -X POST http://localhost:8000/api/chatbot/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Que signifie ma probabilité de 87% ?",
    "analysis_id": "uuid-de-lanalyse"
  }'
```

---

**Pour plus d'informations, consultez le code source ou contactez l'équipe de développement.**
