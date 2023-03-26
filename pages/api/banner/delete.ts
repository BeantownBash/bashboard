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

        const banner = await prisma.user
            .findUnique({
                where: { email: session.user.email },
            })
            .project()
            .banner();

        if (!banner) {
            res.status(400).json({ e: 'Bad Request: No banner found' });
            return;
        }

        await prisma.bannerImage.delete({
            where: {
                id: banner.id,
            },
        });

        await fs.promises.unlink(`./data/uploads/${banner.id}.jpg`);

        res.status(200).json({ m: 'Success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ e: 'Internal Server Error' });
    }
}
