
````markdown
# Cosas por hacer

## 6. Añadir manera de importar datos de distintos tipos y pasarlos a formato grafo
- Implementar una funcionalidad para importar datos desde diversos formatos y convertirlos a grafos.

# Cómo probar la aplicación

## Backend (Spring)
- Para correr el backend con Spring Boot, ejecuta el siguiente comando:
  ```bash
  mvn spring-boot:run
````

* Por defecto, Tomcat corre en `localhost:8080`. Un endpoint de ejemplo es:

  ```
  http://localhost:8080/sparql/clearDataset
  ```

## Frontend (Vite + React)

* En una nueva consola, ve a la carpeta `vite+react-ts` y ejecuta el siguiente comando para iniciar el servidor de desarrollo:

  ```bash
  npm run dev
  ```

  Esto mostrará el puerto en el que se está ejecutando el frontend, típicamente en `localhost:3000`.

## Aplicación standalone (Electron)

* Si deseas correr la aplicación como una aplicación standalone, ve a la carpeta `electron-app` y ejecuta el siguiente comando:

  ```bash
  npm run builder
  ```

  * Nota: **No hay hot reload** en este caso, ya que hace la build de la aplicación de Vite y copia los fuentes para mostrarlos.

# Para hacer builds

## Backend (Spring)

* Para hacer un build del backend, ejecuta:

  ```bash
  mvn clean package
  ```
* Para probarlo después de hacer el build:

  ```bash
  java -jar target/backend-0.0.1-SNAPSHOT.jar
  ```

## Backend (Flask)

* Para correr hay simplemente hay que instalar los paquetes en requirements.txt con pip
* Luego correr ambos archivos con python y el nombre del archivo y se van a abrir servidores en los puertos 5000 y 5001


## Frontend (Vite)

* Para hacer un build del frontend, ejecuta:

  ```bash
  npm run build
  ```
* Luego, para probar el build:

  ```bash
  npm run preview
  ```

## Aplicación standalone (Electron)

* Como se mencionó antes, ejecuta:

  ```bash
  npm run builder
  ```

  Esto creará una aplicación en la carpeta `/out/my-app-linux-x64/my-app` que se puede ejecutar.

# Detalles si hay tiempo

* **Machine Learning**: Hacer algo con Apache Spark y TensorFlow.
* **Deploy**: Hacer deploy en algún servicio gratuito para probarlo.

```
