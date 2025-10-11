# KnowGraph
#Cosas por hacer:
#
#1.Conectar logica de java con spring.

#2.Conectar frontend con backend.

#3.Usar lo del profe para hacer un wizard para construir querys e integrar una consola para usar algun llm que te genere la query y que el usuario se logee con google para usarla.

#4.Implementar funcionalidades de visualizacion de datos con plotly+dash.

#5.Implementar visualizacion de los grafos.

#6. Añadir manera de importar datos de distintos tipos y pasarlos a formato grafos.

#Como probar la aplicacion.
Para correr el spring backend mvn spring-boot:run.
Por default tomcat corre en localhost:8080.
Un endpoint de ejemplo es localhost:8080/hello.

En otra consola se va ejecutar el frontend.
Para correr la aplicacion web en el browser.
Ir a la carpeta de vite+react-ts y ejecutar el siguiente comando
npm run dev para probar en desarrllo.
Imprime por mensaje donde se esta corriendo.

Opcionalmente si se desea correr en una aplicacion standalone con electron.
Ubicarse en la carpeta de electron-app y ejecutar npm run builder.
De la manera que se ejecuta no hay forma de hacer hot reaload porque hace la build de la aplicacion de vite y copia los fuentes para mostrarlos.

#Para hacer builds
Spring: desde la carpeta spring/ ejecutar el comando mvn clean package y para probarlo java -jar target/backend-0.0.1-SNAPSHOT.jar .
Vite: desde la carpeta vite+react-ts/ ejecutar npm run build y despues npm run preview.
Electron: como ya se menciono antes ejecutar npm run builder y esto va a crear una aplicacion en la carpeta /out/my-app-linux-x64/my-app que se puede ejecutar.


#Detalles si hay tiempo
Hacer algo con machine learning con apache spark
Hacer deploy en algun servicio gratuito para probarlo.
