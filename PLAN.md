# Vanshavali — Neon + Vercel Architecture

## Stack
- Frontend: Static HTML (existing join.html) served by Vercel
- Backend: Vercel Serverless Functions (Node.js)
- Database: Neon (PostgreSQL)
- No framework needed — pure HTML + fetch() calls to API

## Database Schema
Tables:
  trees       — one row per family tree (id, share_token, created_at)
  persons     — one row per person in a tree
  edges       — one row per relationship edge

## API Routes (Vercel /api/)
  POST /api/tree/create     — create new tree, return tree_id + share_token
  GET  /api/tree/:token     — load tree by share token
  POST /api/tree/:token/save — save full graph state
  GET  /api/invite/:token   — get inviter info for join page

## Frontend changes
  - Replace localStorage saveTree/loadTree with fetch() calls
  - Tree identified by share_token in URL (?t=abc123)
  - Share link = vanshavali.in/?t=abc123

## Files to create
  /api/tree/create.js
  /api/tree/[token].js  
  /api/invite/[token].js
  vercel.json
  package.json
  .env.example
