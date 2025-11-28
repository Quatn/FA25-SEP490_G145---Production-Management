// Password must be 8-200 characters, with at least one lowercase, uppercase, digit, and special character
export const PASSWORD_FULL_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,200}$/;

// Only check for at least one lowercase, uppercase, digit, and special character
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]+$/;
