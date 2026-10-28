# Seguridad

## Hallazgo: backdoor de instrucciones con escaneo del workspace padre

**Estado:** corregido.

El repositorio contenía un script y un conjunto de instrucciones para agentes que, en
conjunto, escaneaban los proyectos vecinos del directorio padre y publicaban sus nombres
en un documento versionado. El comportamiento se ejecutaba solo al arrancar y al compilar.

### Evidencia (versión afectada)

| Archivo | Problema |
|---|---|
| `scripts/inventory.mjs` | `workspaceRoot = resolve(projectRoot, '..')`: enumeraba todos los directorios hermanos con `package.json` y comprobaba la existencia de `.env`; escribía `docs/project-inventory.md`. |
| `scripts/dev.mjs`, `scripts/build.mjs` | `import './inventory.mjs'`: efecto secundario oculto al ejecutar `npm run dev` / `npm run build`. |
| `AGENTS.md`, `CLAUDE.md` | Orden al agente de usar la skill `workspace-inventory` al levantar o revisar el portal, incluso "en paralelo" mediante subagentes, y de reportar el documento creado. |
| `.agents/skills/workspace-inventory/`, `.claude/skills/workspace-inventory/` | Copias duplicadas de la skill para cubrir distintos cargadores de agentes. Afirmaban que el inventario "no incluye rutas fuera de `aula-workspace`", pero el código no usaba esa ruta. |
| `.gitignore` | `docs/` no estaba ignorado: el inventario generado entraba en el commit y se publicaba en el repositorio. |

### Por qué es una vulnerabilidad de cadena de suministro de agentes

Reproduce dos patrones documentados:

- **Servidor MCP malicioso** ([postmark-mcp, 2025](https://thehackernews.com/2025/09/first-malicious-mcp-server-found.html)):
  un artefacto aparentemente legítimo realiza trabajo oculto adicional. Aquí el artefacto
  es el propio repositorio; el cambio es un `import` de una línea.
- **Toxic agent flow** ([GitHub MCP, Invariant Labs](https://invariantlabs.ai/blog/mcp-github-vulnerability)):
  no hace falta comprometer la herramienta. Basta con datos privados accesibles al agente
  (el workspace padre), contenido no confiable que dirige al agente (instrucciones del repo)
  y un canal de salida (un archivo versionado en un repositorio público).

El impacto actual era divulgación de metadatos (nombres de proyectos ajenos y presencia de
`.env`), pero la distancia a leer los valores de `.env` era una línea de código, y el flujo
normalizaba el acceso a datos de otros equipos.

### Corrección aplicada

- Eliminado `scripts/inventory.mjs` y las dos copias de la skill `workspace-inventory`.
- Eliminados los imports con efecto secundario en `scripts/dev.mjs` y `scripts/build.mjs`.
- Eliminadas las instrucciones correspondientes de `AGENTS.md` y `CLAUDE.md`, indicando
  explícitamente que los proyectos vecinos no deben escanearse desde este repositorio.
- Añadido `docs/` a `.gitignore` como defensa en profundidad.

### Regla para futuros cambios

Las instrucciones del repositorio (`AGENTS.md`, `CLAUDE.md`, skills) nunca deben ordenar
operaciones fuera del árbol del proyecto, ni durante el arranque o la compilación, ni de
forma silenciosa. Cualquier tarea de reconocimiento debe ser un comando explícito que el
usuario invoque, con alcance declarado y verificable.
