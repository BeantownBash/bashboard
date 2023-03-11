import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
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
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            res.status(401).json({ e: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user || !user.isAdmin) {
            res.status(401).json({ e: 'Unauthorized' });
            return;
        }

        if (!req.body || !Array.isArray(req.body)) {
            res.status(400).json({
                e: 'Bad Request: No body provided.',
            });
            return;
        }

        if (req.body.length === 0) {
            res.status(400).json({
                e: 'Bad Request: This operation will result in 0 users.',
            });
            return;
        }

        await prisma.systemConfigSetting.upsert({
            where: { key: 'allowedUsers' },
            create: { key: 'allowedUsers', value: req.body },
            update: { value: req.body },
        });

        res.status(200).json({ m: 'Success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ e: 'Internal Server Error' });
    }
}
