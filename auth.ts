import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./schemas";
import { getUserByEmail } from "./data/user";
import bcryptjs from "bcryptjs";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;

        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          user = await getUserByEmail(email);

          if (!user || !user.password) {
            // No user found, so this is their first attempt to login
            // meaning this is also the place you could do registration
            return null;
          }
          const passwordMatch = await bcryptjs.compare(password, user.password);
          if (passwordMatch) return user;
          // return user object with the their profile data
          // return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
