import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<object>,
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ e: 'Method Not Allowed' });
        return;
    }

    try {
        const forbidEditing = await prisma.systemConfigSetting.findUnique({
            where: {
                key: 'forbidEditing',
            },
        });

        if (forbidEditing?.value === true) {
            res.status(400).json({
                e: 'Bad Request: Project editing is not currently allowed',
            });
            return;
        }

        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            res.status(401).json({ e: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            res.status(500).json({
                e: 'Internal Server Error: Self not found.',
            });
            return;
        }

        if (user.projectId) {
            res.status(400).json({
                e: 'Bad Request: Already in a project.',
            });
            return;
        }

        const invite = await prisma.teamInvite.findFirst({
            where: {
                id: req.body?.id,
                userId: user.id,
            },
        });

        if (!invite) {
            res.status(400).json({
                e: 'Bad Request: Invite not found.',
            });
            return;
        }

        await prisma.teamInvite.delete({
            where: {
                id: invite.id,
            },
        });

        res.status(200).json({ m: 'Success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ e: 'Internal Server Error' });
    }
}
