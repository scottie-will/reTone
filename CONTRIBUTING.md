# Contributing to reTone

Thank you for your interest in contributing to reTone! We welcome contributions of all kinds.

## How to Contribute

1. Fork the repository
2. Create a new branch for your feature or fix
3. Make your changes
4. Test your changes locally
5. Commit your changes using the conventional commit format (see below)
6. Open a Pull Request

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

**Format:** `type(scope): description`

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc)
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

### Examples
- `feat(adapters): add Twitter adapter`
- `fix(queue): handle empty posts correctly`
- `refactor(ui): simplify button logic`
- `docs(readme): update installation instructions`
- `style(components): fix indentation in RewriteButton`

## Testing

Before submitting a PR, please test your changes:

1. Run `npm run dev` to start the development server
2. Test on the local test page (`http://localhost:8080/test-page.html`)
3. Test on live Reddit and/or LinkedIn if your changes affect those adapters
4. Verify both manual and auto modes work as expected

## Questions?

Feel free to open an issue if you have questions or need clarification on anything!
