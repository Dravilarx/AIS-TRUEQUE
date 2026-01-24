# 🚀 Guía Rápida: Configurar Primer Administrador

## Paso 1: Descargar Service Account Key

Ya tienes la consola de Firebase abierta. Ahora:

1. **Haz clic en el botón azul** "Generar nueva clave privada"
2. Confirma en el diálogo que aparece
3. Se descargará un archivo `.json`

## Paso 2: Configurar el Archivo

```bash
# Mueve el archivo descargado a la raíz del proyecto
# El archivo debería llamarse algo como: ais-trueque-firebase-adminsdk-xxxxx.json

mv ~/Downloads/ais-trueque-*.json /Users/dravilarx/PROYECTOS/AIS:TRUEQUE/firebase-service-account.json
```

## Paso 3: Instalar Dependencias del Script

```bash
cd /Users/dravilarx/PROYECTOS/AIS:TRUEQUE/scripts
npm install firebase-admin
```

## Paso 4: Asignar Rol de Administrador

Reemplaza `tu-email@ejemplo.com` con tu email real:

```bash
node set-admin.js tu-email@ejemplo.com true
```

**Salida esperada:**
```
Setting admin role for: tu-email@ejemplo.com
Admin status: true

Found user: tu-email@ejemplo.com (UID: abc123...)
✅ Successfully set admin=true for tu-email@ejemplo.com

Note: The user will need to sign out and sign in again for the changes to take effect.
✅ Updated Firestore user document
```

## Paso 5: Refrescar Sesión

1. En la aplicación web (http://localhost:5174)
2. **Cierra sesión** completamente
3. **Inicia sesión** nuevamente
4. Ahora deberías ver el icono 🛡️ en el header

## Paso 6: Acceder al Panel de Administración

- **Desktop**: Haz clic en el icono 🛡️ (escudo naranja) en la barra superior
- **Mobile**: Abre el menú hamburguesa → "Panel de Administración"

## ✨ Nuevas Funcionalidades del Panel

### 📊 Dashboard con Estadísticas
- Total de usuarios
- Usuarios activos
- Usuarios deshabilitados
- Total de administradores

### 3 Pestañas Principales

#### 1️⃣ **Usuarios** 👥
- Ver todos los usuarios registrados
- Promover/degradar administradores
- Habilitar/deshabilitar cuentas
- Eliminar usuarios
- Ver detalles completos de cada usuario

#### 2️⃣ **Artículos** 📦
- Ver todos los artículos publicados
- Filtrar por: Todos / Disponibles / Vendidos
- Ver imágenes y detalles
- Marcar como vendido/disponible
- Eliminar artículos inapropiados

#### 3️⃣ **Servicios** 💼
- Ver todos los servicios ofrecidos
- Filtrar por: Todos / Activos / Completados
- Ver ratings y reseñas
- Cambiar estado (activo/completado)
- Eliminar servicios

### 🎨 Características de UI/UX

- **Diseño moderno** con gradientes vibrantes
- **Filtros interactivos** para búsqueda rápida
- **Modales con imágenes** para vista detallada
- **Animaciones suaves** en todas las interacciones
- **Totalmente responsive** (móvil y desktop)
- **Badges de estado** para identificación visual rápida

## 🔐 Seguridad

- ✅ Rutas protegidas con Firebase Custom Claims
- ✅ Verificación en backend con middleware
- ✅ UI oculta para usuarios no autorizados
- ✅ Confirmaciones antes de acciones destructivas

## 🎯 Próximos Pasos Sugeridos

1. **Registra un usuario de prueba** para probar las funcionalidades
2. **Publica algunos artículos y servicios** de prueba
3. **Prueba todas las acciones** del panel (ver, editar, eliminar)
4. **Asigna admin a otro usuario** para verificar el flujo

## ⚠️ Recordatorios Importantes

- Nunca subas `firebase-service-account.json` al repositorio
- El archivo ya está en `.gitignore` por seguridad
- Los cambios de rol requieren cerrar sesión y volver a iniciar
- Las eliminaciones son **permanentes** e irreversibles

## 💡 Comandos Útiles

```bash
# Ver el estado del backend
cd /Users/dravilarx/PROYECTOS/AIS:TRUEQUE/backend
npm run dev

# Ver el estado del frontend
cd /Users/dravilarx/PROYECTOS/AIS:TRUEQUE/frontend
npm run dev

# Asignar admin a otro usuario
cd /Users/dravilarx/PROYECTOS/AIS:TRUEQUE/scripts
node set-admin.js email@ejemplo.com true

# Quitar admin a un usuario
node set-admin.js email@ejemplo.com false
```

---

**¡Felicidades! 🎉**  
Tu módulo de administración está completamente configurado y listo para usar.
