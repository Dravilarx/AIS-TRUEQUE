# Módulo de Administración - AIS Trueque

## 📋 Descripción

El módulo de administración permite a usuarios con privilegios especiales gestionar la plataforma AIS Trueque, incluyendo:

- **Gestión de Usuarios**: Ver, editar, habilitar/deshabilitar y eliminar usuarios
- **Roles de Administrador**: Asignar y revocar privilegios de administrador
- **Estadísticas**: Ver métricas de usuarios activos, deshabilitados y administradores
- **Auditoría**: Revisar información detallada de cada usuario

## 🔐 Seguridad

El módulo de administración está protegido mediante:

1. **Firebase Custom Claims**: Se usa el claim `admin: true` en el token JWT
2. **Middleware Backend**: Verifica el rol de admin en cada solicitud
3. **Rutas Frontend**: Redirecciona usuarios no autorizados
4. **Hooks Personalizados**: `useAdmin()` verifica privilegios en componentes

## 🚀 Configuración Inicial

### 1. Descargar Service Account Key

Para ejecutar scripts de administración localmente, necesitas una clave de cuenta de servicio:

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto `ais-trueque`
3. Ve a **Configuración del proyecto** (⚙️) > **Cuentas de servicio**
4. Haz clic en **Generar nueva clave privada**
5. Guarda el archivo JSON como `firebase-service-account.json` en la raíz del proyecto

⚠️ **IMPORTANTE**: Nunca commitees este archivo al repositorio. Ya está incluido en `.gitignore`

### 2. Asignar Primer Administrador

Para asignar el rol de administrador a tu primer usuario:

```bash
# Desde la raíz del proyecto
cd scripts
npm install firebase-admin  # Solo la primera vez
node set-admin.js tu-email@ejemplo.com true
```

El usuario deberá **cerrar sesión y volver a iniciar sesión** para que los cambios surtan efecto.

## 📊 Funcionalidades del Panel

### Vista General (Dashboard)

El panel muestra 4 tarjetas estadísticas:
- **Total de Usuarios**: Todos los usuarios registrados
- **Usuarios Activos**: Usuarios que pueden acceder a la plataforma
- **Usuarios Deshabilitados**: Usuarios bloqueados temporalmente
- **Administradores**: Usuarios con privilegios administrativos

### Tabla de Gestión de Usuarios

Muestra información detallada de cada usuario:

| Columna | Descripción |
|---------|-------------|
| Email | Correo electrónico del usuario |
| Nombre | Nombre completo o nombre mostrado |
| Estado | Activo / Deshabilitado |
| Rol | Usuario / Admin |
| Fecha de Creación | Cuándo se registró el usuario |
| Acciones | Botones de acción rápida |

### Acciones Disponibles

#### 👁️ Ver Detalles
Abre un modal con información completa del usuario:
- UID (identificador único)
- Email y nombre
- Estado y rol
- Fecha de creación
- Último inicio de sesión

#### ⭐ Gestión de Roles
- **Hacer Admin**: Asigna privilegios de administrador
- **Quitar Admin**: Revoca privilegios de administrador

⚠️ **Precaución**: Los administradores tienen acceso completo al sistema

#### ✅/⛔ Estado del Usuario
- **Deshabilitar**: Bloquea el acceso del usuario temporalmente
- **Habilitar**: Restaura el acceso del usuario

💡 **Uso**: Útil para suspender cuentas sin eliminarlas

#### 🗑️ Eliminar Usuario
- Elimina permanentemente la cuenta de Firebase Auth
- Elimina el documento del usuario en Firestore
- **⚠️ IRREVERSIBLE**: Solicita confirmación antes de proceder

## 🔧 API Endpoints

### Backend (Express)

Todos los endpoints requieren autenticación con token Firebase y rol de admin:

```
GET    /api/admin/users              # Listar usuarios
GET    /api/admin/users/stats        # Obtener estadísticas
GET    /api/admin/users/:uid         # Obtener usuario por ID
PUT    /api/admin/users/:uid         # Actualizar usuario
POST   /api/admin/users/:uid/set-admin     # Asignar/quitar rol admin
POST   /api/admin/users/:uid/set-status    # Habilitar/deshabilitar
DELETE /api/admin/users/:uid         # Eliminar usuario
```

### Headers Requeridos

```javascript
{
  "Authorization": "Bearer <firebase-id-token>",
  "Content-Type": "application/json"
}
```

### Ejemplo de Respuesta

```json
{
  "success": true,
  "data": {
    "totalUsers": 15,
    "activeUsers": 12,
    "disabledUsers": 3,
    "adminUsers": 2
  }
}
```

## 🎨 Diseño UI/UX

El panel de administración sigue el diseño moderno de AIS Trueque:

- **Gradientes vibrantes**: Fondo con degradado púrpura
- **Tarjetas glassmorphism**: Fondo blanco semi-transparente
- **Animaciones suaves**: Transiciones en hover
- **Iconos expresivos**: Emojis para acciones intuitivas
- **Responsive**: Adaptado para móvil y desktop
- **Tabla interactiva**: Resalta filas al pasar el cursor

## 📱 Acceso al Panel

### Desktop
- Icono de escudo (🛡️) naranja en la barra superior
- Solo visible para administradores

### Mobile
- Menú hamburguesa > "Panel de Administración"
- Aparece después del botón "Publicar Artículo"

## ⚡ Flujo de Trabajo Típico

### Nuevo Usuario se Registra
1. Usuario crea cuenta en el sistema
2. Por defecto, **NO tiene rol de admin**
3. Solo tiene acceso a funciones básicas del marketplace

### Promover a Administrador
1. Admin actual accede al panel (`/admin`)
2. Busca al usuario en la tabla
3. Click en ⭐ (botón de admin)
4. Usuario debe cerrar sesión y volver a entrar
5. Ahora tiene acceso al panel de administración

### Suspender Usuario Problemático
1. Admin detecta comportamiento inadecuado
2. Accede al panel de administración
3. Click en ⛔ (deshabilitar)
4. Usuario no puede iniciar sesión hasta ser reactivado

### Eliminar Spammer
1. Admin confirma que es una cuenta spam
2. Click en 🗑️ (eliminar)
3. Confirma la acción en el diálogo
4. Cuenta eliminada permanentemente

## 🔍 Solución de Problemas

### "No tienes permisos de administrador"
**Causa**: El custom claim `admin: true` no está configurado
**Solución**: Ejecuta el script `set-admin.js` con tu email

### "Los cambios no se reflejan"
**Causa**: Los custom claims se cachean en el token
**Solución**: Cierra sesión y vuelve a iniciar sesión

### "Error 401 Unauthorized"
**Causa**: Token expirado o inválido
**Solución**: Refresca la página para obtener un nuevo token

### El panel no aparece en el menú
**Causa**: El hook `useAdmin()` aún está cargando
**Solución**: Espera unos segundos, debería aparecer automáticamente

## 🚨 Mejores Prácticas

### ✅ DO (Hacer)
- Asigna admin solo a usuarios de confianza
- Revisa regularmente la lista de administradores
- Usa "Deshabilitar" en lugar de "Eliminar" cuando sea posible
- Documenta cambios importantes (quién y por qué)

### ❌ DON'T (No Hacer)
- No compartas credenciales de admin
- No elimines usuarios sin confirmar primero
- No asignes admin masivamente
- No dejes sesiones de admin abiertas

## 📈 Futuras Mejoras

Funcionalidades planificadas para versiones futuras:

- [ ] **Logs de auditoría**: Registro de todas las acciones administrativas
- [ ] **Gestión de artículos**: Aprobar/rechazar publicaciones
- [ ] **Gestión de servicios**: Moderación de servicios ofrecidos
- [ ] **Reportes**: Sistema de reportes de usuarios
- [ ] **Mensajería masiva**: Enviar notificaciones a todos los usuarios
- [ ] **Analíticas**: Gráficos y métricas avanzadas
- [ ] **Exportación de datos**: Descargar reportes en CSV/PDF

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:
1. Revisa esta documentación primero
2. Verifica los logs del navegador (F12 > Console)
3. Contacta al equipo de desarrollo

---

**AIS Trueque Admin Module v1.0**  
*Última actualización: Enero 2026*
