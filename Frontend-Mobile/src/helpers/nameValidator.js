export function nameValidator(name) {
  const usernamePattern = /^[a-zA-Z0-9_]{4,16}$/;
  if (!usernamePattern.test(name)) {
    return 'Username must be between 4 and 16 characters.';
  }
  return '';
}
