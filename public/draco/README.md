# Decodificador Draco

Archivos de `three/examples/jsm/libs/draco/gltf/`, copiados acá para servirlos
desde el propio dominio en lugar de depender de un CDN externo.

Los carga `LarynxCanvas` sólo cuando el modelo .glb usa compresión Draco
(`KHR_draco_mesh_compression`). Un modelo comprimido con meshopt no los descarga.

Licencia: Apache-2.0 (Google). Para actualizarlos, volver a copiarlos tras
cambiar la versión de `three`.
