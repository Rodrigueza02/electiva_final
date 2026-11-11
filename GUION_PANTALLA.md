# Guía de pantalla — Smart Park U
> Qué mostrar en pantalla según lo que se va hablando

---

## BLOQUE 1 — Introducción (0:00 – 0:30)

| Quién habla | Qué mostrar |
|---|---|
| A habla de Smart Park U | Pantalla de login de la app abierta en el navegador |
| B menciona los dos roles | Puedes tener abierto el login y señalar el formulario |

---

## BLOQUE 2 — Implementaciones Angular (0:30 – 2:00)

| Quién habla | Qué mostrar |
|---|---|
| A habla de **standalone components** | Abrir `dashboard.component.ts` y mostrar las líneas `standalone: true` e `imports: [...]` del decorador `@Component` |
| A habla de **Signals / `signal()`** | Abrir `parking.service.ts` y mostrar la línea `private readonly _spots = signal<ParkingSpot[]>(...)` y el método `updateSpot` con `.update()` |
| A habla de **`asReadonly()`** | Seguir en `parking.service.ts`, mostrar `readonly spots = this._spots.asReadonly()` |
| A habla de **`computed` / `summary`** | Seguir en `parking.service.ts`, mostrar el bloque `readonly summary = computed<ParkingSummary>(...)` |
| A habla de **`filteredSpots`** | Cambiar a `dashboard.component.ts`, mostrar `readonly filteredSpots = computed(...)` |
| A habla de **`isLoggedIn`, `isAdmin`, `isStudent`** | Abrir `auth.service.ts`, mostrar las tres líneas `readonly isLoggedIn = computed(...)`, etc. |
| A habla de **lazy loading / `loadComponent`** | Abrir `app.routes.ts` y mostrar cualquiera de las rutas con `loadComponent: () => import(...)` |
| A habla de **`authGuard` y `guestGuard`** | Abrir `auth.guard.ts`, mostrar las funciones `authGuard` y `guestGuard` |
| A habla de **`roleGuard`** | Seguir en `auth.guard.ts`, mostrar la función `roleGuard` completa con el `return () => { ... }` |
| A habla de **Reactive Forms / validadores** | Abrir `register.component.ts`, mostrar el `fb.group({...})` con los `Validators.pattern` del email y del `studentCode` |
| A habla del **validador personalizado `passwordsMatch`** | Seguir en `register.component.ts`, mostrar la función `passwordsMatch: ValidatorFn` |
| A habla de **PBKDF2 / Web Crypto API** | Abrir `auth.service.ts`, mostrar el método `hashPassword` con `crypto.subtle.importKey` y `crypto.subtle.deriveBits` |

---

## BLOQUE 3 — Demo: administrador (2:00 – 3:30)

| Quién habla | Qué mostrar |
|---|---|
| B: "sin sesión activa, el guard nos redirige al login" | Abrir la app en el navegador sin sesión → se ve la redirección a `/login` |
| B: "entramos como administrador" | Escribir `admin@ucc.edu.co` / `admin123` y hacer login |
| B: "cuatro tarjetas con los números" | Vista del dashboard con las tarjetas de resumen en la parte superior |
| B: "grilla con los 12 puestos" | Hacer scroll para que se vean todas las tarjetas de puestos |
| B: "filtrar por estado" | Hacer clic en el botón "Disponibles" y mostrar cómo la lista cambia |
| B: "reservar el puesto P-05" | Hacer clic en Reservar del P-05 y mostrar cómo cambia a amarillo |
| B: "ocupar el P-01, se abre un modal" | Hacer clic en Ocupar del P-01 y mostrar el modal con los campos QR y placa |
| B: "ingresamos los datos y confirmamos" | Llenar el QR y la placa, hacer clic en Confirmar |
| B: "P-01 aparece ocupado" | Mostrar la tarjeta del P-01 con la placa y la hora de entrada |
| B: "presiono Liberar" | Hacer clic en Liberar y mostrar cómo vuelve a verde |

---

## BLOQUE 4 — Demo: estudiante (3:30 – 4:30)

| Quién habla | Qué mostrar |
|---|---|
| B: "cerramos sesión" | Hacer clic en el botón de logout |
| B: "entramos como estudiante" | Escribir `estudiante@campusucc.edu.co` / `est123` y hacer login |
| B: "el guard nos lleva directamente a `/parking`" | Mostrar que la URL cambia a `/parking` automáticamente, sin pasar por el dashboard |
| B: "mapa del parqueadero con los 12 puestos" | Vista de student-parking con la grilla de puestos |
| B: "puestos en rojo o amarillo están bloqueados" | Señalar visualmente un puesto ocupado y uno reservado |
| B: "seleccionar el P-03" | Hacer clic en el puesto P-03 disponible |
| B: "la vista cambia al formulario de ingreso" | Mostrar el formulario con la placa pre-llenada |
| B: "la placa ya viene pre-llenada" | Señalar el campo de placa con el valor del vehículo predeterminado |
| B: "ingresar el código QR y confirmar" | Escribir el QR y hacer clic en Confirmar |
| B: "pantalla de confirmación" | Mostrar la pantalla de éxito con el número de puesto y la hora |
| B: "presiona Liberar mi puesto" | Hacer clic en Liberar y mostrar el puesto disponible nuevamente |
| A: "historial en el perfil" | Navegar a `/profile` y mostrar la sección de historial con el registro recién creado |

---

## BLOQUE 5 — Cierre (4:30 – 5:00)

| Quién habla | Qué mostrar |
|---|---|
| A hace el resumen de Angular | Puedes volver a mostrar `app.routes.ts` o `parking.service.ts` como fondo visual mientras habla |
| B habla del prototipo y siguientes pasos | Vista del dashboard o del mapa del estudiante como cierre visual |
| Despedida | Puedes dejar la pantalla de login o el dashboard como última imagen |
