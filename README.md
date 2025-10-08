# HKRecruitment

## Quick Start

In order to start the project in your local environment follow these steps:

- Clone this repository;
- Install all the npm packages with your prefered cli: `pnpm i`
- Define all the env variables in a `.env` file based on the `.env.example`
- Run the docker instance for the Postgres database (if you don't have a db already somewhere): `docker compose up -d postgres`
- Push all the migrations to the database with `pnpm db:push`
- Start Next in development with `pnpm dev`
