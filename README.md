# FA25-SEP490_G145 — Production Management (Fork)

This repository is a fork of the original **FA25-SEP490_G145---Production Management** application source code. It introduces additional improvements to documentation and the build process compared to the originally submitted project.

---

# About

**FA25-SEP490_G145---Production Management** is an application developed for the FA25 capstone project at FPT University by group SEP490_G145.

The goal of this project is to design and develop a centralized **Production Management System (PMS)** for Xuan Cau Holdings as a foundational step toward future ERP implementation.

The system replaces paper-based workflows and manually maintained spreadsheets with an integrated digital platform that supports:

- Purchase order management
- Manufacturing order control
- Inventory management across:
  - Paper Roll warehouse
  - Semi-Finished Goods warehouse
  - Finished Goods warehouse

---

# Technical Details

The project follows a **3-tier architecture**:

- **Front-end (Web)**
- **Back-end (API)**
- **Database**

## Front-end

Built with **ReactJS** using the **Next.js** framework to provide a fast, reactive, and SEO-friendly user interface with Next.js's SSR (Server-Side Rendering).

### Technologies used:
- Chakra UI: UI framework
- Redux: application state management

## Back-end

The back-end is powered by **NestJS** and **MongoDB** (via Mongoose), with a strong focus on modularity, type safety, and scalability.

### Key features:
- Class-based validation
- Role-based access control (RBAC)
- Fine-grained authorization for all requests

## Authentication

The system uses stateless JWT-based authentication to protect against unauthorized and malicious requests.

---

# Installation

To install and use the project, clone the project source code and follow the installation guides below to build and run from source.

> **Note**:
> The React front-end application is always run on port **3000**, the API application always run on port **4000**, and the MongoDB container always run on port **27017**. Please make sure those ports are available.

## Using Docker (Recommended)

Using Docker is the recommended way to build and run the application because it simplifies environment setup and includes built-in database initialization and seeding.

### Requirements

- Docker engine.

The following guide will show how to use the Docker command cli to build and run the project. For guides related to Docker Desktop, see the [official guide on Docker Compose](https://docs.docker.com/compose/).

### Installation steps

#### 1. Clone the repository
```bash
git clone https://github.com/Quatn/FA25-SEP490_G145---Production-Management.git
cd FA25-SEP490_G145---Production-Management
```

#### 2. Create an environment file

Copy the template:
```bash
cp ./data/templates/compose-env-template.txt ./.env
```

Then insert environment variables into the empty fields.

Or use the example (for demo only):
```bash
cp ./data/examples/compose-env-example.txt ./.env
```

> ⚠️ **Warning:**
> The example environment file is publicly available and should only be used for demonstration purposes.
> For production use, it is heavily recommended that all default values are changed.

#### 3. Build and run the application

OPTIONAL: Clean previous containers and volumes:
```bash
docker compose down -v
```

Build and run the application:
```bash
docker compose up --build
```

This will create three containers:
- Front-end
- Back-end
- MongoDB (includes initialization and seeding scripts)

> ⚠️ **Warning:**
> Default seed data is also publicly available in `data/db-scripts/seeds/`.
> For production use, it is once again heavily recommended that all default values are changed.

## Running Services Manually

The following guide describes how to manually install, build, and run the services for the application independently without Docker.

### Requirements
- Node.js v24.13.0
- npm v11.9.0
- MongoDB v8.2

> These are recommended versions. Other versions may work but could introduce unexpected issues.

### 1. Database Initialization

Create a database user via `mongosh`:

```js
db.createUser({
  user: "your-db-username",
  pwd: "your-db-password",
  roles: [
    { role: "readWrite", db: "your-db-name" }
  ]
})
```


### 2. Database Seeding

Due to the strict application design to have every users be explicitly created by an admin, it is a requirement that a user with the privileges to create other users (system admin) be created first via database seeding.

To create a user:
1. Create a **role document**
2. Create an **employee document** referencing that role
3. Create a **user document** referencing the employee

Refer to:
```
data/db-scripts/02-seed.sh
```
and related JSON files for examples.

### 3. Provide environment variables
Both the front-end web service and the back-end API service require their own environment variable files. The files are named either ".env.development" or ".env.production" depending on the mode, and are to be placed in the respective root folders (`FE-DESKTOP/` for front-end and `BE/` for back-end).

See `data/templates/fe-env-template.txt` and `data/templates/be-env-template.txt` for the templates for each environment file.

### 4. Running the API

From the root of the cloned project:

#### Development
```bash
cd BE/
npm run start:dev
```

#### Production
```bash
cd BE/
npm run build
npm run start:prod
```

### 5. Running the front-end React web app

From the root of the cloned project:

#### Development
```bash
cd FE-DESKTOP/
npm run dev
```

#### Production
```bash
cd FE-DESKTOP/
npm run build
npm run start
```
