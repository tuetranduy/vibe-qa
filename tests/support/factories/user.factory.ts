import { faker } from '@faker-js/faker';

/**
 * User Factory - Generates random user data for testing
 * Uses faker for realistic, non-colliding test data
 */

export interface UserData {
  email: string;
  password: string;
  name: string;
}

/**
 * Create a single user with optional overrides
 * Password meets backend requirements:
 * - Min 8 chars
 * - 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export function createUser(overrides?: Partial<UserData>): UserData {
  const defaultPassword = 'Test123!@#'; // Meets all password requirements
  
  return {
    email: faker.internet.email(),
    password: defaultPassword,
    name: faker.person.fullName(),
    ...overrides,
  };
}

/**
 * Create multiple users with optional overrides
 */
export function createUsers(count: number, overrides?: Partial<UserData>): UserData[] {
  return Array.from({ length: count }, () => createUser(overrides));
}

/**
 * Create user data with weak password (for validation testing)
 */
export function createUserWithWeakPassword(): UserData {
  return createUser({ password: 'weak' });
}

/**
 * Create user data with invalid email (for validation testing)
 */
export function createUserWithInvalidEmail(): UserData {
  return createUser({ email: 'not-an-email' });
}
