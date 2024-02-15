import { z } from "zod";

export const FileInput = z.object({
  access_mode: z.string().optional(),
  asset_id: z.string(),
  bytes: z.number(),
  format: z.string(),
  url: z.string(),
  resource_type: z.string(),
  width: z.number(),
  height: z.number(),
  version: z.number(),
  public_id: z.string(),
});

export const loginSchema = z.object({
  email: z.string(),
  password: z.string().min(6),
});

export const signUpSchema = z
  .object({
    email: z.string().email(),
    name: z.string(),
    username: z.string().min(6),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password is too short")
      .refine(
        (value) => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).+$/.test(value),
        {
          message:
            "Password must contain at least one uppercase letter, one digit, and one special character",
        },
      ),

    passwordConfirmation: z.string({
      required_error: "Confirm Password is Required",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Password and Confirm Password do not match",
    path: ["passwordConfirmation"],
  });

export const changeUsernameSchema = z.object({
  username: z.string().min(6),
  userId: z.string(),
});
export const changeImageSchema = z.object({
  image: FileInput,
  userId: z.string(),
});

export const createUsernameOrImageSchema = z.object({
  image: FileInput.optional(),
  userId: z.string(),
  username: z.string().min(6).optional(),
});

export type ILogin = z.infer<typeof loginSchema>;
export type ISignUp = z.infer<typeof signUpSchema>;
export type IUsername = z.infer<typeof changeUsernameSchema>;
export type IImage = z.infer<typeof changeImageSchema>;
export type IImageUsername = z.infer<typeof createUsernameOrImageSchema>;
export type IFile = z.infer<typeof FileInput>;

export type NewSession = {
  username?: string;
  image?: string;
};
