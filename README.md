# visit this, please!

Make others see your most and least favorite places, available at [visit-this-please.sinskiy.website](https://visit-this-please.sinskiy.website)

> [!WARNING]
> I use free tier of Render and server spins down after a period of inactivity, so you'll probably have to wait for about 30 seconds before you can use the website

## Features

- sign up with username and password, log in
- add places
- safely edit and delete places
- search, filter and sort places
- upvote and downvote places
- add a comment to your vote
- like comments
- reply to comments and replies

## Built with

### Frontend

TypeScript, webpack, React, React Query, React Router (lib), jest, Testing Library, Playwright, PostCSS, styled-components, Valibot

#### Previously

Vite, Vitest, Zod

### Backend

Express, MongoDB, mongoose, Passport.js, supertest, Zod

## Deployed on

Frontend: [visit-this-please.sinskiy.website](https://visit-this-please.sinskiy.website) - Netlify

Backend: [api.visit-this-please.sinskiy.website](https://api.visit-this-please.sinskiy.website) - Render

Database: MongoDB Atlas

##

0. create MongoDB database _(out of scope) of this README_

1.

```bash
git clone git@github.com:sinskiy/visit-this-please.git
cd visit-this-please
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. fill all `.env` by `.env.example`

3.

### First terminal, in `/frontend`

```bash
npm start
```

### Second terminal, in `/backend`

```bash
npm run dev
```
