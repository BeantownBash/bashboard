import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { Session, Theme, User } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { createTransport } from 'nodemailer';
import prisma from '@/lib/prisma';
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';
import { Prisma } from '@prisma/client';

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
            // sendVerificationRequest: async ({
            //     identifier: email,
            //     url,
            //     provider: { server, from },
            //     theme,
            // }) => {
            //     // Place your whitelisted emails below
            //     // if (!['leahvashevko@gmail.com'].includes(email)) {
            //     //     throw new Error(
            //     //         `You must sign in with the email you registered for the hackathon with. If this is a problem, please talk to an organizer.`,
            //     //     );
            //     // }

            //     const { host } = new URL(url);
            //     const transport = createTransport(server);
            //     const result = await transport.sendMail({
            //         to: email,
            //         from,
            //         subject: `Sign in to ${host}`,
            //         text: text({ url, host }),
            //         html: html({ url, host, theme }),
            //     });
            //     const failed = result.rejected
            //         .concat(result.pending)
            //         .filter(Boolean);
            //     if (failed.length) {
            //         throw new Error(
            //             `Email (${failed.join(', ')}) could not be sent`,
            //         );
            //     }
            // },
        }),
    ],
    callbacks: {
        async session({ session, user }: any) {
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
        colorScheme: 'dark' as 'dark',
        brandColor: '#0f766e',
        buttonText: '#ffffff',
    },
};

export default NextAuth(authOptions);

// function html(params: { url: string; host: string; theme: Theme }) {
//     const { url, host, theme } = params;

//     const escapedHost = host.replace(/\./g, '&#8203;.');

//     const brandColor = theme.brandColor || '#346df1';
//     const buttonText = theme.buttonText || '#fff';

//     const color = {
//         background: '#f9f9f9',
//         text: '#444',
//         mainBackground: '#fff',
//         buttonBackground: brandColor,
//         buttonBorder: brandColor,
//         buttonText,
//     };

//     return `
//   <body style="background: ${color.background};">
//     <table width="100%" border="0" cellspacing="20" cellpadding="0"
//       style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
//       <tr>
//         <td align="center"
//           style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
//           Sign in to <strong>${escapedHost}</strong>
//         </td>
//       </tr>
//       <tr>
//         <td align="center" style="padding: 20px 0;">
//           <table border="0" cellspacing="0" cellpadding="0">
//             <tr>
//               <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
//                   target="_blank"
//                   style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
//                   in</a></td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//       <tr>
//         <td align="center"
//           style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
//           If you did not request this email you can safely ignore it.
//         </td>
//       </tr>
//     </table>
//   </body>
//   `;
// }

// /** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
// function text({ url, host }: { url: string; host: string }) {
//     return `Sign in to ${host}\n${url}\n\n`;
// }
