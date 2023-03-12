import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

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
        const allowEditing = await prisma.systemConfigSetting.findUnique({
            where: {
                key: 'allowEditing',
            },
        });

        if (!allowEditing) {
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

        const logo = await prisma.user
            .findUnique({
                where: { email: session.user.email },
            })
            .project()
            .logo();

        if (!logo) {
            res.status(400).json({ e: 'Bad Request: No logo found' });
            return;
        }

        await prisma.logoImage.delete({
            where: {
                id: logo.id,
            },
        });

        await fs.promises.unlink(`./data/uploads/${logo.id}.jpg`);

        res.status(200).json({ m: 'Success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ e: 'Internal Server Error' });
    }
}
