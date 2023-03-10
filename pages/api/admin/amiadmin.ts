import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<object>,
) {
    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            res.status(401).json({ e: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            res.status(401).json({ e: 'Unauthorized' });
            return;
        }

        const userCount = await prisma.user.count();
        const adminUsers = await prisma.systemConfigSetting.findUnique({
            where: {
                key: 'adminUsers',
            },
        });

        // only allowed if ONLY 1 user exists or if the user is in the admin list
        if (
            userCount > 1 &&
            (!adminUsers ||
                !Array.isArray(adminUsers.value) ||
                !adminUsers.value.includes(session.user.email))
        ) {
            res.status(400).json({
                e: 'Bad Request: This operation is only allowed when there is 1 user. You will have to be added to the admin user list or edit the database directly to create an admin.',
            });
            return;
        }

        await prisma.user.update({
            where: {
                email: session.user.email,
            },
            data: {
                isAdmin: true,
            },
        });

        res.status(200).json({ m: 'Success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ e: 'Internal Server Error' });
    }
}
