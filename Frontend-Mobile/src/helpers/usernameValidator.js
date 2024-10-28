// helpers/usernameValidator.js

export const usernameValidator = (username) => {
    if (!username) return "Username can't be empty."
    if (username.length < 4 || username.length > 16)
      return 'Username must be between 4 and 16 characters.'
    const regex = /^[a-zA-Z0-9]+$/ // Only letters and numbers
    if (!regex.test(username))
      return 'Username can only contain letters and numbers.'
    return ''
  }
  