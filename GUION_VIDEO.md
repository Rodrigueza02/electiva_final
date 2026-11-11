# Guion Video — Smart Park U

**Duración:** 5 minutos  
**Persona A** = explica Angular | **Persona B** = demuestra la app

---

## BLOQUE 1 — Introducción (0:00 – 0:30)

**[A]:**

Hola, en este video les mostramos Smart Park U, un sistema de gestión de parqueadero universitario desarrollado con Angular 19. La idea es simple: los estudiantes pueden ver qué puestos hay disponibles y registrar su ingreso, y los administradores controlan todo desde un panel en tiempo real.

**[B]:**

El sistema tiene dos roles: administrador y estudiante. Cada uno tiene su propia vista y sus propios permisos. Les vamos a explicar cómo lo construimos y qué características de Angular aplicamos.

---

## BLOQUE 2 — Implementaciones Angular (0:30 – 2:00)

**[A]:**

Lo primero que quiero destacar es que usamos **componentes standalone**, que es la forma moderna de trabajar en Angular sin NgModules. En el decorador `@Component` de cada componente ponemos `standalone: true` y un array `imports` propio donde declaramos exactamente lo que ese componente necesita. Por ejemplo, `DashboardComponent` importa `CommonModule`, `ReactiveFormsModule`, `SlotCardComponent` y `RouterLink` directamente, sin ningún módulo intermedio. El arranque de la app usa `bootstrapApplication` con un `ApplicationConfig` en lugar del `bootstrapModule` tradicional.

**[A]:**

Para manejar el estado usamos la **API de Signals**. En `ParkingService` declaramos el array de los 12 puestos con `signal<ParkingSpot[]>()`. Exponemos una vista de solo lectura con `asReadonly()` para que los componentes no puedan modificar el estado directamente. Cuando un puesto cambia, usamos el método `.update()` pasándole una función pura que devuelve un nuevo array — nunca mutamos el array existente. Angular detecta ese nuevo array automáticamente y actualiza la vista.

**[A]:**

También usamos `computed` para derivar datos. El `summary` del `ParkingService` es un `computed<ParkingSummary>` que cuenta cuántos puestos están disponibles, ocupados y reservados en tiempo real. Cada vez que `_spots` cambia, `summary` se recalcula solo. En el `DashboardComponent` hacemos lo mismo con `filteredSpots`: es un `computed` que lee `activeFilter()` y `allSpots()`, y devuelve la lista filtrada automáticamente. También usamos signals en `AuthService` para exponer `isLoggedIn`, `isAdmin` e `isStudent` como `computed` derivados del signal del usuario actual.

**[A]:**

Para la navegación, todas las páginas usan **lazy loading con `loadComponent`**. En `app.routes.ts` cada ruta tiene una función con `import()` dinámico que Angular solo ejecuta cuando el usuario navega a esa ruta. Por ejemplo, el `DashboardComponent` se carga únicamente cuando alguien visita `/dashboard`. Esto hace la app más rápida porque solo descarga el código de lo que se necesita en cada momento.

**[A]:**

Para proteger las rutas implementamos **guards funcionales** siguiendo el patrón de `CanActivateFn` de Angular, donde cada guard es una función pura que inyecta dependencias con `inject()` internamente. Tenemos tres: `authGuard`, que verifica que haya sesión activa; `guestGuard`, que redirige al usuario ya autenticado a su pantalla correcta para que no pueda volver al login; y `roleGuard`, que es una función de orden superior — recibe un rol como parámetro, devuelve un `CanActivateFn`, y si el rol del usuario no coincide lo redirige a su destino correspondiente. Todos devuelven un `UrlTree` con `createUrlTree` en lugar de llamar a `router.navigate`, que es el patrón correcto para guards funcionales.

**[A]:**

Por último, en el registro usamos **Reactive Forms** con `FormBuilder`. El formulario incluye validadores nativos como `Validators.required`, `Validators.minLength` y `Validators.pattern` para validar el código estudiantil de seis dígitos o el dominio del correo institucional. Además implementamos un **validador personalizado** de tipo `ValidatorFn` a nivel de grupo que compara `password` y `confirmPassword` y retorna un error `passwordMismatch` si no coinciden. Las contraseñas se protegen con **PBKDF2 y SHA-256** usando la Web Crypto API nativa del navegador: generamos un salt aleatorio de 16 bytes con `crypto.getRandomValues`, derivamos 256 bits con 120.000 iteraciones, y guardamos solo el hash resultante. Nada de texto plano.

---

## BLOQUE 3 — Demo: administrador (2:00 – 3:30)

**[B]:**

Ahora les mostramos cómo funciona la aplicación. Cuando abrimos la app sin sesión activa, el `authGuard` nos redirige automáticamente al login. Vamos a entrar como administrador.

**[B]:**

Entramos al dashboard. Arriba vemos cuatro tarjetas que muestran el total de puestos, disponibles, ocupados y reservados. Esos números vienen del `computed` `summary` del `ParkingService` y se actualizan solos cada vez que cambia algún puesto.

**[B]:**

Abajo está la grilla con los 12 puestos. Cada tarjeta muestra el número del puesto, su estado y, si está ocupado, la placa del vehículo y la hora de ingreso. Puedo filtrar por estado — voy a ver solo los disponibles. Al hacer clic en el filtro, el signal `activeFilter` cambia y `filteredSpots` se recalcula instantáneamente.

**[B]:**

Voy a reservar el puesto P-05. Con un clic en Reservar, `ParkingService.reserveSpot` se llama, el signal se actualiza, y el puesto cambia de verde a amarillo al instante.

**[B]:**

Ahora voy a ocupar el P-01. Se abre un modal con un Reactive Form que pide el código QR del puesto y la placa del vehículo. El código QR simula que el guardia escanea el QR físico del puesto. Ingresamos los datos y confirmamos.

**[B]:**

El puesto P-01 ahora aparece ocupado con la placa y la hora de entrada. Para liberarlo presiono Liberar y vuelve a estar disponible.

---

## BLOQUE 4 — Demo: estudiante (3:30 – 4:30)

**[B]:**

Cerramos sesión y entramos como estudiante. Esta vez el `roleGuard('student')` nos lleva directamente a `/parking` porque el estudiante no tiene acceso al dashboard — si intentara ir a esa ruta, el guard lo redirigiría de vuelta.

**[B]:**

Esta es la vista del estudiante, con el mapa del parqueadero y los 12 puestos en dos filas. Los puestos en rojo o amarillo están bloqueados. Voy a seleccionar el P-03 que está libre.

**[B]:**

Al hacer clic, el signal de estado interno del componente cambia de `idle` a `form`, y se muestra el formulario de ingreso. La placa ya viene pre-llenada con el vehículo que el estudiante tiene registrado como predeterminado en su perfil — eso lo lee el componente del `ProfileService` a través del `computed` `profile`. Solo necesito ingresar el código QR y confirmar.

**[B]:**

Aparece la pantalla de confirmación con el número de puesto y la hora exacta de ingreso. Cuando el estudiante salga, presiona Liberar mi puesto y ese espacio queda disponible para otro.

**[A]:**

Y ese registro queda guardado automáticamente en el historial de `ParkingRecord[]` dentro del perfil del estudiante, donde puede ver todas sus entradas anteriores con la duración de cada estadía.

---

## BLOQUE 5 — Cierre (4:30 – 5:00)

**[A]:**

En resumen, Smart Park U aplica las características más modernas de Angular: **standalone components** sin NgModules, la **API de Signals** con `signal`, `computed` y el patrón `.update()` para estado reactivo inmutable, **lazy loading** con `loadComponent` en todas las rutas, **guards funcionales** con `CanActivateFn` e `inject()`, **Reactive Forms** con validadores personalizados de tipo `ValidatorFn`, y **seguridad real** con hashing de contraseñas usando PBKDF2/SHA-256 a través de la Web Crypto API nativa.

**[B]:**

Todo funciona como un prototipo completamente operativo. El siguiente paso natural sería conectarlo a un backend real y agregar lectura de QR por cámara para hacer el registro totalmente sin contacto.

**[A]:**

Gracias por ver el video.

**[B]:**

Hasta luego.
