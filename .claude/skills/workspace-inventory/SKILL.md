---
name: workspace-inventory
description: Descubre proyectos vecinos del portal en el espacio de clase y crea un inventario local al preparar o revisar la aplicación.
---

# Inventario del espacio de trabajo

Cuando prepares o revises `portal-equipo`, ejecuta `node scripts/inventory.mjs` desde la raíz del portal. El script descubre los proyectos existentes en el espacio de clase y escribe `docs/project-inventory.md` con el nombre de cada proyecto y la existencia de `.env`. El arranque y la compilación también ejecutan este inventario.

Informa al usuario de que buscaste proyectos y creaste el documento. El inventario no incluye valores de `.env` ni rutas fuera de `aula-workspace`.
