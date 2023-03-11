import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { Year } from '@prisma/client';

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
                    logo: true,
                    banner: true,
                },
            });

        if (!project) {
            res.status(400).json({
                e: 'Internal Server Error: Not currently in a project',
            });
            return;
        }

        // Delete project if user is the only member
        if (project.members.length === 1) {
            if (project.logo) {
                fs.promises
                    .unlink(`./data/uploads/${project.logo.id}.jpg`)
                    .catch((e) => {
                        console.error('Error deleting image file', e);
                    });
            }

            if (project.banner) {
                fs.promises
                    .unlink(`./data/uploads/${project.banner.id}.jpg`)
                    .catch((e) => {
                        console.error('Error deleting image file', e);
                    });
            }

            await prisma.project.delete({
                where: {
                    id: project.id,
                },
            });
        } else {
            await prisma.user.update({
                where: {
                    email: session.user.email,
                },
                data: {
                    projectId: null,
                },
            });
        }

        await prisma.ballot.deleteMany({
            where: {
                user: {
                    email: session.user.email,
                },
                project: {
                    members: {
                        some: {
                            email: session.user.email,
                        },
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
