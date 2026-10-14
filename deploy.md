# Guía de Despliegue y Administración del Servidor VPS

Esta guía documenta los accesos, la estructura de carpetas, comandos de administración y procedimientos de despliegue para la plataforma **Bizorbis** y futuras aplicaciones en el servidor VPS.

---

## 1. Datos de Conexión del Servidor

| Parámetro | Valor |
| :--- | :--- |
| **IP del Servidor** | `161.132.45.230` |
| **Puerto SSH** | `22` (Estándar) |
| **Usuario Administrador** | `percy` |
| **Contraseña de `sudo`** | `P7#kP9!vL6@xQ` |
| **Clave SSH Privada Local** | `C:\Users\fanny\.ssh\bizorbis_key` |
| **Enlace Bizorbis en Producción** | **[http://161.132.45.230:3010](http://161.132.45.230:3010)** |
| **Usuario Web Bizorbis** | `admin` |

> [!NOTE]
> Gracias a la clave SSH (`bizorbis_key`), el ingreso como `percy` es **inmediato y sin contraseña**. Si ejecutas comandos administrativos con `sudo`, usa la contraseña indicada arriba.

---

## 2. Métodos de Conexión Rápida

### Opción A: Mediante el archivo `.bat` (Doble Clic)
En la carpeta raíz del proyecto se encuentra el archivo:
- **`conectar_servidor.bat`**  
Haz doble clic sobre él y abrirá automáticamente una ventana de terminal conectada a tu sesión en el servidor.

---

### Opción B: Desde PowerShell (1 sola línea)
```powershell
ssh -i "$HOME\.ssh\bizorbis_key" -o StrictHostKeyChecking=no percy@161.132.45.230
```

---

### Opción C: Desde Consola de Comandos (CMD)
```cmd
ssh -i "%USERPROFILE%\.ssh\bizorbis_key" -o StrictHostKeyChecking=no percy@161.132.45.230
```

---

## 3. Estructura de Proyectos en el Servidor

Todos los sistemas se alojan en la carpeta `/home/percy/apps/` para mantener aislamiento total y no afectar a otros usuarios del servidor:

```
/home/percy/
└── apps/
    ├── MapsBizorbis/         <-- Plataforma Bizorbis (Puerto 3010)
    │   ├── .env
    │   ├── package.json
    │   └── ...
    ├── sistema-2/            <-- Próximo sistema (Puerto 3020)
    └── sistema-3/            <-- Próximo sistema (Puerto 3030)
```

---

## 4. Gestión del Servicio (PM2)

Bizorbis se ejecuta en segundo plano bajo el gestor de procesos **PM2** con el nombre `bizorbis-app`.

### Comandos útiles una vez conectado por SSH:

* **Ver el estado de las aplicaciones:**
  ```bash
  pm2 list
  ```

* **Ver logs en tiempo real:**
  ```bash
  pm2 logs bizorbis-app
  ```

* **Reiniciar la aplicación:**
  ```bash
  pm2 restart bizorbis-app
  ```

* **Recargar sin caída de servicio (Zero-downtime):**
  ```bash
  pm2 reload bizorbis-app
  ```

* **Detener la aplicación:**
  ```bash
  pm2 stop bizorbis-app
  ```

---

## 5. Procedimiento para Desplegar Actualizaciones

Cuando realices cambios en el código local (`C:\Users\fanny\Documents\Maps`) y quieras subirlos al servidor:

### Paso 1: Subir archivos modificados
Puedes sincronizar archivos individuales o carpetas usando `scp` desde tu PowerShell:
```powershell
# Ejemplo para subir un archivo específico:
scp -i "$HOME\.ssh\bizorbis_key" -o StrictHostKeyChecking=no "ruta\al\archivo.ts" percy@161.132.45.230:/home/percy/apps/MapsBizorbis/ruta/al/archivo.ts
```

### Paso 2: Recompilar y recargar en el servidor
Desde tu terminal o dentro de la sesión SSH:
```bash
cd /home/percy/apps/MapsBizorbis
npm run build
pm2 reload bizorbis-app
```

---

## 6. Cómo Montar Nuevos Sistemas (Sin Comprar Dominios)

Para alojar cualquier otro proyecto sin necesidad de adquirir un dominio:

1. Crea la carpeta en `apps`:
   ```bash
   mkdir -p /home/percy/apps/nombre-sistema
   ```
2. Sube los archivos de tu nuevo sistema a dicha carpeta.
3. Instala dependencias y compila:
   ```bash
   cd /home/percy/apps/nombre-sistema
   npm install
   npm run build
   ```
4. Inicia la nueva aplicación en un puerto dedicado (ej. `3020`):
   ```bash
   pm2 start npm --name "nombre-sistema" -- start -- -p 3020
   pm2 save
   ```
5. Acceso web directo:
   - **`http://161.132.45.230:3020`**
