# Prueba Tecnica

Este repositorio contiene dos proyectos:

- `api`: cliente en TypeScript para Rick and Morty API.
- `ui`: aplicacion Next.js que consume el cliente local.

## Minimo requerido

- Node.js 18 o superior (recomendado Node.js 20).
- npm.
- Tener disponible el archivo `api/rickmortyapi-2.3.1.tgz` (ya incluido en este repo, dentro de la carpeta api).

## Instalacion

Instala dependencias.

### UI

```bash
cd ../ui
npm ci
```

### Crea archivo de configuracion

```bash
Crea un archivo de configuración .env en la carpeta ui,
con este valor NEXT_PUBLIC_JSON_SERVER_PORT=4000
Ejemplo: .env.example
```

## Levantar el proyecto

Para desarrollo, usa 2 terminales dentro del workspace.

### Terminal 1: UI (Next.js)

```bash
cd ui
npm run dev
```

### Terminal 2: Base de datos mock (json-server)

```bash
cd ui
npm run dev:db
```

La UI quedara disponible en:

- `http://localhost:3000`

El json-server quedara disponible en:

- `http://localhost:4000`

## Correr pruebas unitarias

### Pruebas de UI

```bash
cd ui
npm test
```

## ¿Qué es lo que más te gustó de TU desarrollo?

La interacción con la api, saber que existen muchos personajes de la serie que ni conocia.

## Si hubieras tenido más tiempo ¿qué hubieras mejorado o qué más hubieras hecho?

El paginado y algun dashboard por usuario para mostrar datos estadisticos relevantes.

## Descríbenos un pain point o bug con el que te hayas encontrado y como lo solucionaste

No pude usar node 24 solo node 20, con Node 24 falla por una dependencia nativa antigua (iltorb)

Estoy en Windows y el comando rm no lo reconoce, esta definido en package.json del la api, instale rimraf en la api para no usar rm, tuve que recompilar la api npm run build

El diseño de las caracteristicas del personaje no pude ver sus detalles css por que es una captura de pantalla

El wallpaper no lo encontré, tuve que crear algo parecido en paint

Scary Terry es un personaje unico, para probar la ultima funcionalidad cuando solo existe una considencia.
