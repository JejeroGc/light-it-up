# Publicar Light It Up en GitHub Pages

1. Creá un repositorio nuevo en GitHub.
2. Subí todo el contenido de esta carpeta a la rama `main`.
3. En GitHub abrí **Settings → Pages**.
4. En **Build and deployment → Source**, elegí **GitHub Actions**.
5. Abrí la pestaña **Actions** y esperá a que termine “Deploy Light It Up to GitHub Pages”.
6. El link público aparecerá en el resultado del deploy y en Settings → Pages.

El proyecto usa rutas relativas (`base: "./"`), por lo que funciona tanto en un repositorio de usuario como en uno de proyecto.

## Prueba local del build

```bash
npm install
npm run build
npm run preview
```

Los archivos `.lightitup` se guardan y abren desde el navegador. Los proyectos recientes permanecen solamente en el navegador y dispositivo donde fueron usados.
