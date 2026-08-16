# Mock JSON Data

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Ready-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

Create realistic REST API mocks before your backend is ready. Organize resources in one API, return predictable JSON, test CRUD flows, and share a public endpoint.

Built with Next.js App Router, Prisma, PostgreSQL, Zod, and Tailwind CSS.

## Features

- Username/password authentication with bcrypt and secure HTTP-only sessions
- Public and private mock APIs
- GET endpoints for collections and individual records
- Static responses and stateful CRUD data
- Request validation, scenarios, templates, delays, CORS, and request logs
- Dynamic values including uuid, datetime, request fields, route params, and query values
- Responsive dashboard with dark/light mode

## Requirements

- Node.js 20+
- PostgreSQL, including Neon
- npm

## Local setup

    git clone <your-repository-url>
    cd mock-json-data
    npm install

Copy .env.example to .env and set DATABASE_URL and AUTH_SECRET.

    npx prisma generate
    npx prisma migrate dev
    npm run dev

Open http://localhost:3000.

## Environment variables

| Variable | Description |
| --- | --- |
| DATABASE_URL | PostgreSQL connection string |
| AUTH_SECRET | Long random authentication secret |
| NEXT_PUBLIC_APP_URL | Public application URL |
| DEMO_USERNAME | Optional seed username |
| DEMO_PASSWORD | Optional seed password |

Never commit .env. Keep .env.example safe for GitHub.

## Using the dashboard

1. Register with a username and password of at least 4 characters.
2. Create an API.
3. Add an endpoint such as GET /users.
4. Select an endpoint to inspect, update, or delete it.
5. Copy the highlighted public URL.

Public URLs use this format:

    https://your-domain.com/api/your-api/users

## Stateful CRUD

Stateful mode can support:

    GET    /users
    POST   /users
    GET    /users/:id
    PATCH  /users/:id
    DELETE /users/:id

## Scenarios and templates

Choose a scenario with ?scenario=empty or the X-Mock-Scenario: empty header.

Supported template values include:

    {{uuid}}
    {{datetime}}
    {{request.name}}
    {{params.id}}
    {{query.page}}

Templates never execute arbitrary code.

## Database commands

    npx prisma generate
    npx prisma migrate dev
    npx prisma migrate deploy
    npx prisma db seed

If Prisma reports a locked Windows query engine, stop the running Next.js or Node process and run prisma generate again.

## Verification

    npx tsc --noEmit
    npm test
    npm run build

## Deployment

Configure DATABASE_URL, AUTH_SECRET, and NEXT_PUBLIC_APP_URL on Vercel or another Node-compatible host, then run prisma migrate deploy.

## Security

Passwords are bcrypt-hashed, sessions use HTTP-only cookies, resources are checked against their owner, payloads and delays are capped, unsafe response headers are filtered, and sensitive request headers are excluded from logs.

## License

Copyright (c) 2026 Mock JSON Data contributors.

This project is licensed under the MIT License. See the LICENSE file for the complete license text.
