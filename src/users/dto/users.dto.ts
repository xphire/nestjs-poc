import { TypeOf, object, string, boolean, number, z } from 'zod';

export const createUserRequestSchema = object({
  email: string().email().min(1),
  password: string().min(8),
  isAdmin: boolean().default(false).optional(),
  firstName: string().min(1),
  lastName: string().min(1),
}).strict();

export const fetchUserQuerySchema = object({
  email: string().email(),
  id: number({
    coerce: true,
  }),
  uuid: string().uuid(),
})
  .partial()
  .strict()
  .refine((fields) => Object.keys(fields).length === 1, {
    message: 'kindly provide one of id, uuid or email ONLY as a query param',
  });

export const fetchUsersQuerySchema = object({
  pageSize: z.enum(['5', '10', '15', '25', '50']),
  page: number({
    coerce: true,
  }),
})
  .partial()
  .strict();

const updateBaseSchema = object({
  email: string().email(),
  lastName: string().min(1),
  firstName: string().min(1),
  isAdmin: boolean(),
}).strict();

export const partialUpdateUserRequestSchema = updateBaseSchema
  .partial()
  .extend({
    id: number({
      coerce: true,
      message: 'expecting a number',
    }).optional(),
    uuid: string().uuid().optional(),
  })
  .refine(
    (fields) =>
      Object.keys(fields).length < 1 || Object.values(fields).every((x) => x === undefined),
    //name !== undefined || email !== undefined || password !== undefined,
    { message: 'One of the fields must be defined' },
  );

export const fullUpdateUserRequestSchema = updateBaseSchema.required().extend({
  id: number({
    coerce: true,
    message: 'expecting a number',
  }),
});

export const updateCurrentUserSchema = object({
  lastName: string().min(1).optional(),
  firstName: string().min(1).optional(),
})
  .strict()
  .refine((fields) => Object.keys(fields).length >= 1, {
    message: 'kindly provide one or both of first or last name',
    path: ['lastName', 'firstName'],
  });

export type CreateUserRequestType = TypeOf<typeof createUserRequestSchema>;

export type CreateUserResponseType = Omit<CreateUserRequestType, 'password' | 'isAdmin'> & {
  uuid: string;
};

export type FetchUserQueryType = TypeOf<typeof fetchUserQuerySchema>;

export type FetchUsersQueryType = TypeOf<typeof fetchUsersQuerySchema>;

export type PartialUpdateRequestType = TypeOf<typeof partialUpdateUserRequestSchema>;

export type FullUpdateRequestType = TypeOf<typeof fullUpdateUserRequestSchema>;

export type UpdateCurrentUserType = TypeOf<typeof updateCurrentUserSchema>;
