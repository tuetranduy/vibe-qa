import { z } from 'zod';

/**
 * Zod schema for updating user profile
 * Only name field is allowed to be updated
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).trim(),
}).strict(); // Reject any fields not explicitly defined

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
