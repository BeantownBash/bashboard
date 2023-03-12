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

        const project = await prisma.user
            .findUnique({
                where: { email: session.user.email },
            })
            .project({
                include: {
                    members: true,
                },
            });

        if (!project) {
            res.status(400).json({
                e: 'Bad Request: Not currently in a project.',
            });
            return;
        }

        if (project.members.length === 4) {
            res.status(400).json({
                e: 'Bad Request: Project is full.',
            });
            return;
        }

        const providedEmail = req.body?.email;

        if (!providedEmail || providedEmail.length === 0) {
            res.status(400).json({
                e: 'Bad Request: No email provided.',
            });
            return;
        }

        if (project.members.some((m) => m.email === providedEmail)) {
            res.status(400).json({
                e: 'Bad Request: User already in project.',
            });
            return;
        }

        const invitedUser = await prisma.user.findUnique({
            where: {
                email: providedEmail,
            },
        });

        if (!invitedUser) {
            res.status(400).json({
                e: 'Bad Request: No user found with that email.',
            });
            return;
        }

        await prisma.teamInvite.create({
            data: {
                projectId: project.id,
                userId: invitedUser.id,
            },
        });

        res.status(200).json({
            m: 'Success',
            user: {
                id: invitedUser.id,
                name: invitedUser.name,
                email: invitedUser.email,
                isAdmin: invitedUser.isAdmin,
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ e: 'Internal Server Error' });
    }
}
