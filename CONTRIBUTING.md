# Contributing to mm2-next

First off, thank you for considering contributing to mm2-next! It's people like you that make this tool better for everyone.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

- **Check if the bug has already been reported** by searching on the [GitHub Issues](https://github.com/sukharenko/mm2-next/issues) page.
- If you can't find an open issue that describes the problem, [open a new one](https://github.com/sukharenko/mm2-next/issues/new).
- Use the **Bug Report** template to provide as much information as possible.

### Suggesting Enhancements

- **Check if the enhancement has already been suggested** by searching on the [GitHub Issues](https://github.com/sukharenko/mm2-next/issues) page.
- If it hasn't, [open a new issue](https://github.com/sukharenko/mm2-next/issues/new) using the **Feature Request** template.

### Pull Requests

1. **Fork the repository** and create your branch from `main`.
2. **Install dependencies**: `npm install`.
3. **Make your changes**.
4. **Ensure the code linting passes**: `npm run lint`.
5. **Update documentation** if necessary.
6. **Submit a pull request** with a clear description of what your changes do.

## Development Setup

### Environment Variables

Copy `.env.sample` to `.env` and fill in your values:

```bash
cp .env.sample .env
```

### Running Locally

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

## Styling and Standards

- We use **TypeScript** for everything.
- Styling is done with **Vanilla CSS** and **Tailwind CSS**.
- Follow the existing code style and naming conventions.

Thank you for contributing!
