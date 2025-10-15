# Torii Indexer Configuration

This directory contains the configuration for the Torii indexer, which indexes on-chain data from Dojo-powered games.

## Structure

```
/indexer
  ├── torii.toml           # Torii configuration
  ├── schema.graphql       # GraphQL schema for queries
  ├── docker-compose.yml   # Docker setup for Torii + PostgreSQL
  └── README.md           # This file
```

## Prerequisites

- Docker and Docker Compose
- Torii (Dojo indexer)
- PostgreSQL (for data storage)

## Setup

1. **Install Torii:**
   ```bash
   curl -L https://install.dojoengine.org | bash
   dojoup
   ```

2. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

3. **Run Torii:**
   ```bash
   torii --config torii.toml
   ```

## Configuration

The `torii.toml` file configures:
- World contract address(es) to index
- RPC endpoint
- Database connection
- GraphQL API settings

## GraphQL API

Once running, Torii provides a GraphQL API at:
- Endpoint: `http://localhost:8080/graphql`
- Playground: `http://localhost:8080/graphql/playground`

## Queries

Example query to get all assets:
```graphql
query GetAssets($owner: String!) {
  entities(
    where: { 
      keys: [$owner]
    }
  ) {
    id
    keys
    models {
      __typename
      ... on Asset {
        id
        name
        owner
      }
    }
  }
}
```

## Indexed Games

Currently configured to index:
1. Game 1 - [Contract Address]
2. Game 2 - [Contract Address]

## Troubleshooting

**Torii won't start:**
- Check PostgreSQL is running: `docker ps`
- Verify RPC endpoint is accessible
- Check world contract address is correct

**No data appearing:**
- Verify game contracts have events
- Check Torii logs for errors
- Ensure world address is deployed

**GraphQL errors:**
- Check schema matches game models
- Verify query syntax
- Review Torii documentation
