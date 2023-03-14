import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
    ],
    callbacks: {
        async session({ session, user }: any) {
            // eslint-disable-next-line no-param-reassign
            session.user = user;
            return session;
        },
        async signIn({
            user,
            email,
        }: {
            user: any;
            email?: { verificationRequest?: boolean | undefined } | undefined;
        }) {
            const userCount = await prisma.user.count();
            const allowedUsers =
                ((
                    await prisma.systemConfigSetting.findUnique({
                        where: { key: 'allowedUsers' },
                    })
                )?.value as Prisma.JsonArray) ?? [];

            if (email?.verificationRequest) {
                // block them if more than one user signed in and they are not in the allowed list
                // first user gets by and is added to the allowed list
                if (userCount > 0 && !allowedUsers.includes(user.email)) {
                    return false;
                }

                // add this user to allowed users if they are first signin
                if (!allowedUsers.includes(user.email)) {
                    await prisma.systemConfigSetting.upsert({
                        where: { key: 'allowedUsers' },
                        update: {
                            value: [user.email],
                        },
                        create: {
                            key: 'allowedUsers',
                            value: [user.email],
                        },
                    });
                }

                return true;
            }
            return true;
        },
    },
    theme: {
        colorScheme: 'dark' as const,
        brandColor: '#0f766e',
        buttonText: '#ffffff',
    },
};

export default NextAuth(authOptions);
