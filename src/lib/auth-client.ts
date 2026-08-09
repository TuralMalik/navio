"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
});

export const {
  signIn, signUp, signOut, useSession,
  sendVerificationEmail, requestPasswordReset, resetPassword,
} = authClient;
