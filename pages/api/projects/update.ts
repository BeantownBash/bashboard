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

        if (!req.body) {
            res.status(400).json({
                e: 'Bad Request: No body provided.',
            });
            return;
        }

        // get rid of all the previous links
        await prisma.extraLink.deleteMany({
            where: {
                projectId: project.id,
            },
        });

        await prisma.project.update({
            where: {
                id: project.id,
            },
            data: {
                title:
                    req.body.title && req.body.title.length > 0
                        ? req.body.title.substring(0, 32)
                        : 'Untitled Project',
                tagline:
                    req.body.tagline && req.body.tagline.length > 0
                        ? req.body.tagline.substring(0, 32)
                        : null,
                description:
                    req.body.description && req.body.description.length > 0
                        ? req.body.description
                        : null,
                githubLink:
                    req.body.githubLink && req.body.githubLink.length > 0
                        ? req.body.githubLink
                        : null,
                websiteLink:
                    req.body.websiteLink && req.body.websiteLink.length > 0
                        ? req.body.websiteLink
                        : null,
                videoLink:
                    req.body.videoLink && req.body.videoLink.length > 0
                        ? req.body.videoLink
                        : null,
                extraLinks: {
                    createMany: {
                        data:
                            req.body.extraLinks &&
                            req.body.extraLinks.length > 0
                                ? req.body.extraLinks.map((link: any) => ({
                                      name: link.name,
                                      url: link.url,
                                  }))
                                : [],
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
