# 🅿 Smart Park U — Angular 19 Standalone

Gestor de puestos de parqueo para la Universidad Cooperativa de Colombia — Pasto.

## Stack
- **Angular 19** — Standalone Components
- **Signals** — estado reactivo
- **Reactive Forms** — formularios
- **SCSS** — diseño con variables CSS (paleta UCC)
- **localStorage** — persistencia local

## Credenciales de prueba
| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin@ucc.edu.co | admin123 | Administrador |
| operador@ucc.edu.co | op123 | Operador |

---

## 🌿 Flujo de ramas (Git Flow simplificado)

```
main                      ← producción estable
└── develop               ← integración de todas las features
    ├── feature/juliana/models
    ├── feature/juliana/services
    ├── feature/juliana/pages
    ├── feature/juliana/components
    ├── feature/helen/models
    ├── feature/helen/services
    ├── feature/helen/pages
    └── feature/helen/components
```

### Reglas del equipo
1. **Nunca** hacer push directo a `main` o `develop`.
2. Cada desarrolladora trabaja en sus ramas `feature/<nombre>/<capa>`.
3. Cuando terminas una capa, abres un **Pull Request** → `develop`.
4. Un compañero revisa y aprueba antes de hacer merge.
5. Al final del sprint, `develop` → `main` vía PR.

---

## ▶️ Correr el proyecto

```bash
npm install
ng serve
```
Abre http://localhost:4200

## 👩‍💻 Integrantes
| Integrante | GitHub | Rama base |
|-----------|--------|-----------|
| Juliana Rodríguez | [@Rodrigueza02](https://github.com/Rodrigueza02) | `feature/juliana/*` |
| Helen Moncayo | [@HMAlejandra](https://github.com/HMAlejandra) | `feature/helen/*` |
