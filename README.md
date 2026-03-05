
# Application Setup Guide

This document explains how to run the application using **Docker** and how to run each service locally for development.


# Running the Application with Docker 

## Prerequisites

* Install **Docker** and **Docker Compose**
* Ensure **port 80** is available on your machine
* Download or clone the source code

## Steps

### Build the Containers

Open a terminal in the root directory of the project and run:

```bash
docker compose build
```

Wait for the build process to complete.

###  Start the Containers

```bash
docker compose up -d
```

This will start all services in detached mode.

###  Access the Application

Once all containers are running, open your browser and go to:

```
http://localhost/
```

The application should now be accessible.

---

# Running the Application Locally (Development Mode)

If you prefer to run each service individually, follow the instructions below.

---

#  Frontend Service

Navigate to the `frontend` folder:

```bash
cd frontend
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

* Default port: **5173**

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

* Default preview port: **4173**

To list all available npm scripts:

```bash
npm run
```

>  Environment variables are preconfigured to use the default ports of the backend services.

---

#  SPARQL Backend Service

Navigate to the `Sparql-Backend` folder:

```bash
cd Sparql-Backend
```

## Prerequisites

* Install **Maven**
* Ensure Java is installed

## Install Dependencies

```bash
mvn install
```

## Run in Development Mode

```bash
mvn spring-boot:run
```

* Default port: **8080**

## Build the Application

```bash
mvn clean package
```

The generated `.jar` file will be located in:

```
target/backend-1.0.0.jar
```

## Run the Packaged Application

```bash
cd target
java -jar backend-1.0.0.jar
```

---

#  Visualization Service

Navigate to the `Visualization` folder:

```bash
cd Visualization
```

## Prerequisites

* Install **Python 3**

## Create a Virtual Environment

```bash
python -m venv venv
```

## Activate the Virtual Environment

**Linux / macOS:**

```bash
source venv/bin/activate
```

**Windows:**

```bash
venv\Scripts\activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run the Service

```bash
python visualizer.py
```

* Default port: **5000**

---

#  Importer Service

Navigate to the `Importer` folder:

```bash
cd Importer
```

## Prerequisites

* Install **Python 3**

## Create a Virtual Environment

```bash
python -m venv venv
```

## Activate the Virtual Environment

**Linux / macOS:**

```bash
source venv/bin/activate
```

**Windows:**

```bash
venv\Scripts\activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run the Service

```bash
python importer.py
```

* Default port: **5001**

---

# Default Ports 

| Service            | Default Port |
| ------------------ | ------------ |
| Frontend (dev)     | 5173         |
| Frontend (preview) | 4173         |
| SPARQL Backend     | 8080         |
| Visualization      | 5000         |
| Importer           | 5001         |
| Docker (app entry) | 80           |

---

#  Notes

* Ensure all required ports are available before starting the services.
* Docker setup is recommended for a fully integrated environment and easy of use of the app.
* Local development is ideal for debugging or developing on individual services.

---

