import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome é muito longo."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Digite seu e-mail.")
    .max(254, "O e-mail é muito longo.")
    .email("Digite um e-mail válido."),

  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(72, "A senha é muito longa.")
    .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra.")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número."),

  // Honeypot field: real users never see or fill this input (it's hidden
  // via CSS in the form). Bots that auto-fill every field will populate
  // it, so any non-empty value here is treated as a bot submission.
  website: z.string().max(0, "Invalid submission.").optional().or(z.literal("")),
});

export type SignupInput = z.infer<typeof signupSchema>;
