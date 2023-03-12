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
                if (userCount > 1 && !allowedUsers.includes(user.email)) {
                    return false;
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
