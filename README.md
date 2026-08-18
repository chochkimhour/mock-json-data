# Mock JSON Data

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Ready-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

Create realistic GET API mocks before your backend is ready. Organize resources in one API, return custom JSON, and share protected public endpoints.

Built with Next.js App Router, Prisma, PostgreSQL, Zod, and Tailwind CSS.

## Tech Stack

- Next.js 15 with the App Router
- React 19 and TypeScript
- Tailwind CSS 3.4 and Lucide React
- Prisma ORM with PostgreSQL/Neon
- Zod for validation
- bcryptjs and HTTP-only cookies for authentication
- Vercel for deployment

## Features

- Username/password authentication with bcrypt and secure HTTP-only sessions
- Public mock APIs protected by a shared per-user API key
- GET endpoints for collections and individual records
- Fully custom JSON response bodies
- Short readable URLs such as `/api/sms-a9dhds/users`
- CORS support, scenarios, templates, delays, and request logs
- Dynamic values including uuid, datetime, request fields, route params, and query values
- Automatic API deletion 30 days after creation
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

| Variable            | Description                       |
| ------------------- | --------------------------------- |
| DATABASE_URL        | PostgreSQL connection string      |
| AUTH_SECRET         | Long random authentication secret |
| NEXT_PUBLIC_APP_URL | Public application URL            |
| DEMO_USERNAME       | Optional seed username            |
| DEMO_PASSWORD       | Optional seed password            |

Never commit .env. Keep .env.example safe for GitHub.

## Using the dashboard

1. Register with a username and password of at least 4 characters.
2. Create an API.
3. Generate your user API key from the workspace panel.
4. Add a GET endpoint such as `/users` or `/users/:id`.
5. Add custom JSON response data and copy the public URL.

Public URLs use this format (using your API slug):

    https://your-domain.com/api/sms-a9dhds/users

### Postman

Create a new `GET` request using the public URL, for example:

    https://your-domain.com/api/sms-a9dhds/users

In the request **Headers** tab, add:

| Key         | Value              |
| ----------- | ------------------ |
| `X-API-Key` | `mjd_your_api_key` |

For an API with no matching endpoint, the server returns a JSON `404` response. The API key is required for every public request. Header names are case-insensitive, so `X-API-Key` and `x-api-key` are equivalent; the API-key value itself is case-sensitive. You can also use:

    Authorization: Bearer mjd_your_api_key

Every public request requires the user API key:

    X-API-Key: mjd_your_api_key

or:

    Authorization: Bearer mjd_your_api_key

## Scenarios and templates

Choose a scenario with `?scenario=empty` or the `X-Mock-Scenario: empty` header.

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

Configure DATABASE_URL, AUTH_SECRET, and NEXT_PUBLIC_APP_URL on Vercel or another Node-compatible host, then run `prisma migrate deploy`. Pushes to `main` are verified and deployed by GitHub Actions.

## Security

Passwords are bcrypt-hashed, sessions use HTTP-only cookies, resources are checked against their owner, payloads and delays are capped, unsafe response headers are filtered, and sensitive request headers are excluded from logs.

## License

Copyright (c) 2026 Mock JSON Data contributors.

This project is licensed under the MIT License. See the LICENSE file for the complete license text.
