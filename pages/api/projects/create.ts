import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import { getServerSession } from 'next-auth';
import { Year } from '@prisma/client';
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

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            res.status(500).json({
                e: 'Internal Server Error: Self not found',
            });
            return;
        }

        if (user.isAdmin) {
            res.status(400).json({
                e: 'Bad Request: Admins cannot join projects.',
            });
            return;
        }

        if (user.projectId) {
            res.status(400).json({ e: 'Bad Request: Already in a project' });
            return;
        }

        await prisma.user.update({
            where: {
                email: session.user.email,
            },
            data: {
                project: {
                    create: {
                        year: Year.Y23,
                        title: 'Untitled Project',
                    },
                },
            },
        });

        res.status(200).json({ m: 'Success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ e: 'Internal Server Error' });
    }
}
