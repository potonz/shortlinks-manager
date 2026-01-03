# AGENTS.md

## Project Overview

This is a monorepo for a short links manager system that provides functionality for creating, managing, and resolving short URLs. The project consists of two main packages:

1. **`@potonz/shortlinks-manager`** - The core package that provides the logic for managing short links
2. **`@potonz/shortlinks-manager-cf-d1`** - A Cloudflare D1 database extension for the core package

## Technology Stack

- **Language**: TypeScript
- **Package Manager**: Bun (with workspace support)
- **Build System**: Bun build system
- **Linting**: ESLint with TypeScript ESLint and Stylistic plugin
- **Testing**: Bun test
- **Target Environment**: Node.js and Cloudflare Workers

## Project Structure

```
shortlinks-manager/
├── packages/
│   ├── shortlinks-manager/              # Core package
│   │   ├── src/
│   │   │   ├── cache.ts                 # Cache interface definition
│   │   │   ├── index.ts                 # Package exports
│   │   │   ├── manager.ts               # Main manager implementation
│   │   │   └── utils.ts                 # Utility functions
│   │   └── package.json
│   │
│   └── shortlinks-manager-cloudflare-d1/ # Cloudflare D1 extension
│       ├── src/
│       │   ├── backend.ts               # Cloudflare D1 backend implementation
│       │   ├── index.ts                 # Package exports
│       │   └── worker-configuration.d.ts # Worker type definitions
│       └── package.json
├── scripts/
│   ├── build.ts                         # Build script
│   ├── publish.ts                       # Publish script
│   └── release.ts                       # Release script
├── package.json                         # Root package with workspaces
├── tsconfig.json                        # Root TypeScript configuration
└── eslint.config.js                     # ESLint configuration
```

## Key Features

- **Short Link Generation**: Creates unique short IDs with collision handling
- **Caching Support**: Built-in caching layer to improve performance
- **Backend Abstraction**: Flexible backend interface for different storage systems
- **Cloudflare D1 Support**: Database backend implementation for Cloudflare D1
- **Automatic Cleanup**: Removes unused links based on age criteria
- **Last Accessed Tracking**: Tracks when links were last accessed for cleanup purposes

## Core Components

### 1. Main Manager Interface (`manager.ts`)
- **`createManager()`**: Creates a new short links manager instance
- **`createShortLink()`**: Generates a short ID linking to a target URL
- **`getTargetUrl()`**: Resolves a short ID to its target URL
- **`updateShortLinkLastAccessTime()`**: Updates last accessed timestamp
- **`cleanUnusedLinks()`**: Removes unused links older than specified age

### 2. Backend Interface (`IShortLinksManagerBackend`)
- **`getTargetUrl()`**: Get target URL for a given short ID
- **`createShortLink()`**: Create a short link mapping
- **`checkShortIdsExist()`**: Check if short IDs already exist
- **`updateShortLinkLastAccessTime()`**: Update last accessed time
- **`cleanUnusedLinks()`**: Clean up unused links

### 3. Cache Interface (`cache.ts`)
- **`get()`**: Retrieve cached value
- **`set()`**: Store value in cache
- **`init()`**: Initialize cache (optional)

### 4. Cloudflare D1 Backend (`backend.ts`)
- Implements the `IShortLinksManagerBackend` interface using Cloudflare D1
- Creates and manages the `sl_links_map` table
- Provides database operations for all manager functions

## Code Style and Conventions

- **Indentation**: 4 spaces
- **Semicolons**: Required
- **Quotes**: Double quotes
- **TypeScript**: Strict mode enabled
- **Imports**: Consistent type imports with `inline-type-imports` style
- **Naming**: PascalCase for interfaces, camelCase for functions and variables
- **Documentation**: JSDoc-style comments for all public APIs

## Package Dependencies

### Root Package (`package.json`)
- **Workspaces**: Defines the two packages as workspaces
- **Dev Dependencies**: ESLint, TypeScript, Bun development tools
- **Peer Dependencies**: Bun (latest version)

### Core Package (`packages/shortlinks-manager/package.json`)
- **Dependencies**: None
- **Dev Dependencies**: TypeScript, Bun types

### Cloudflare D1 Package (`packages/shortlinks-manager-cloudflare-d1/package.json`)
- **Dependencies**: 
  - `@potonz/shortlinks-manager` (workspace dependency)
  - `date-fns` (catalog dependency)
- **Dev Dependencies**: 
  - `miniflare` (for local testing)
  - `wrangler` (Cloudflare CLI)

## Build and Development

### Build Process
- Uses `scripts/build.ts` to bundle both packages
- Creates ES modules with TypeScript definitions
- Minifies output for production
- Generates proper package.json files for distribution

### Commands
- `bun run build`: Build both packages
- `bun run lint`: Run ESLint
- `bun run lint:fix`: Run ESLint with auto-fix
- `bun run test`: Run tests (in individual packages)

## Testing

Tests are located in the `test` directories of each package:
- `packages/shortlinks-manager/test/`
- `packages/shortlinks-manager-cloudflare-d1/test/`

Tests use Bun's built-in testing framework.

## Configuration Files

- **`.gitignore`**: Standard Git ignore patterns
- **`tsconfig.json`**: Root TypeScript configuration
- **`tsconfig.bundle.json`**: Bundle-specific TypeScript configuration
- **`eslint.config.js`**: ESLint configuration with TypeScript and Stylistic rules
- **`package.json`**: Root package with workspace definitions
- **`bun.lock`**: Bun dependency lock file

## Deployment

The project is designed to be published to npm and used in:
- Node.js applications
- Cloudflare Workers (with the Cloudflare D1 extension)

The build script handles proper packaging for distribution to npm.

## Environment Requirements

- **Node.js**: For development and building
- **Bun**: Required for development and build processes
- **Cloudflare Wrangler**: For Cloudflare D1 development and deployment

## Best Practices

1. **Use Workspaces**: Leverage the monorepo structure for consistent development
2. **Type Safety**: Maintain strict TypeScript typing throughout
3. **Interface Design**: Use interfaces for flexible backend implementations
4. **Caching**: Implement caching layers to improve performance
5. **Error Handling**: Properly handle errors in all operations
6. **Testing**: Write comprehensive tests for all functionality

This project follows modern TypeScript practices with a focus on reusability, performance, and flexibility across different hosting environments.
