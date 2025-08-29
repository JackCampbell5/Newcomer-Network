# Backend

The **Newcomer Network backend** is built with **Node.js, Express, and Prisma** and connects to a **PostgreSQL database**.  
It handles authentication, nonprofit and service management, and the search/recommendation APIs that power the refugee service matching tool.

## Inital Setup

### 0. npm install

### 1. Create .env file and add all the variables

- **MAPS_API_KEY** - The API key for the Google maps API
- **SESSION_SECRET** - Randomly generated key for session saving
- **DATABASE_URL** - The URL of the postgre SQL database
- **FRONTEND_URL** - The url of the frontend (For dev- http://localhost:5173/)
- **DEV** = true

### 2. Setup Prisma

- Have a postgreSQL server setup
- Add the url as database url- postgresql://user:password@host:port/database_name?schema=public"
- **Generate prisma client**- npx prisma generate
- **Build the prisma client**- npx prisma migrate dev

### 3. Install nodemon - npm install -g nodemon

## Dev Commands

Start Express Server:

```shell
nodemon index.js
```

Seed Database:

```shell
npx prisma db seed
```

Start Prisma Server:

```shell
npx prisma studio
```

## Google Maps API

- [Text Search API](https://developers.google.com/maps/documentation/places/web-service/text-Search) used for validating addresses
- [Longitude/ Latitude Calculations](https://gis.stackexchange.com/questions/2951/algorithm-for-offsetting-latitude-longitude-by-some-amount-of-meters#:~:text=//Position%2C%20decimal%20degrees,51%2C00089832%0A%20lonO%20%3D%200%2C001427437)

## Import Ordering

- Prisma
- Express
- routes
- errors
- utils
- seed
