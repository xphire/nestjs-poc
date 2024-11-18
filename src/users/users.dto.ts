import { TypeOf, object, string, boolean, number } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

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
  pageSize: number({
    coerce: true,
  }),
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
  .refine(
    (fields) =>
      Object.keys(fields).length >= 1 || Object.values(fields).every((x) => x !== undefined),
    { message: 'One of the fields must be defined' },
  );

export const updateUserQuerySchema = object({
  id: number({
    coerce: true,
    message: 'expecting a number',
  }),
  uuid: string().uuid(),
})
  .partial()
  .strict()
  .refine(
    (fields) =>
      Object.keys(fields).length &&
      Object.keys(fields).length === 1 &&
      Object.values(fields).every((x) => x !== undefined),
    { message: 'kindly provide one of uuid or id ONLY as a query param', path: ['id', 'uuid'] },
  );

export const fullUpdateUserRequestSchema = updateBaseSchema.required();

export const updateCurrentUserSchema = object({
  lastName: string().min(1),
  firstName: string().min(1),
})
  .partial()
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

export type UpdateUserQueryType = TypeOf<typeof updateUserQuerySchema>;

///DTOs

export class CreateUserDto implements CreateUserRequestType {
  @ApiProperty()
  email!: string;
  @ApiProperty()
  lastName!: string;
  @ApiProperty()
  firstName!: string;
  @ApiProperty()
  password!: string;
  @ApiProperty({ required: false })
  isAdmin!: boolean;
}

export class FetchUsersQueryDto implements FetchUsersQueryType {
  @ApiProperty({ required: false })
  pageSize!: number;
  @ApiProperty({ required: false })
  page!: number;
}

export class FetchUserQueryDto implements FetchUserQueryType {
  @ApiProperty({ required: false })
  email!: string;
  @ApiProperty({ required: false })
  id!: number;
  @ApiProperty({ required: false })
  uuid!: string;
}

export class UpdateUserQueryDto implements UpdateUserQueryType {
  @ApiProperty({ required: false })
  id!: number;
  @ApiProperty({ required: false })
  uuid!: string;
}

export class PartialUpdateUserDto implements PartialUpdateRequestType {
  @ApiProperty({ required: false })
  email!: string;
  @ApiProperty({ required: false })
  lastName!: string;
  @ApiProperty({ required: false })
  firstName!: string;
  @ApiProperty({ required: false })
  isAdmin!: boolean;
}

export class FullUpdateUserDto implements FullUpdateRequestType {
  @ApiProperty()
  email!: string;
  @ApiProperty()
  lastName!: string;
  @ApiProperty()
  firstName!: string;
  @ApiProperty()
  isAdmin!: boolean;
}

export class UpdateCurrentUserDto implements Omit<PartialUpdateRequestType, 'email' | 'isAdmin'> {
  @ApiProperty({ required: false })
  lastName!: string;
  @ApiProperty({ required: false })
  firstName!: string;
}
