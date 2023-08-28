"use server";

import * as bcrypt from "bcrypt";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/schemas/register";
import { generateUsernameFromEmail } from "@/lib/utils";

export async function createUser(user: z.infer<typeof registerSchema>) {
  const res = registerSchema.safeParse(user);
  if (!res.success) {
    throw new Error(res.error.errors.at(0)?.message);
  }

  const foundUser = await prisma.user.findUnique({
    where: { email: user.email },
  });
  if (foundUser) {
    throw new Error("User with this email already exists");
  }

  const { passwordConfirmation, ...data } = user;

  const password = await bcrypt.hash(data.password, 10);
  return await prisma.user.create({
    data: {
      ...data,
      username: generateUsernameFromEmail(data.email),
      password,
    },
  });
}
