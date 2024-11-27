export function nameValidator(name) {
  const usernamePattern = /^[a-zA-Z0-9_]{4,16}$/;
  if (!usernamePattern.test(name)) {
    return 'Invalid username. Must be 4-16 characters long and contain only letters, numbers, and underscores.';
  }
  return '';
}
