# Assessment Tool

A modern web application for creating and taking assessments, built with React, TypeScript, and Vite.

## Features

- Multiple question types (single-choice, multiple-choice, text, boolean, rating)
- Progress tracking during assessments
- Timer support for timed assessments
- Results display with pass/fail status
- Responsive design

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Assessment/      # Assessment-specific components
│   └── Layout/          # Layout components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── styles/              # Global styles
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Path Aliases

The project uses path aliases for cleaner imports:

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@pages/*` → `src/pages/*`
- `@hooks/*` → `src/hooks/*`
- `@types/*` → `src/types/*`
- `@utils/*` → `src/utils/*`
- `@context/*` → `src/context/*`

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and formatting
4. Submit a pull request

## License

MIT
