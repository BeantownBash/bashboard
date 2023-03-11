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

        if (!req.body) {
            res.status(400).json({
                e: 'Bad Request: No body provided.',
            });
            return;
        }

        let post;
        if (req.body.id && req.body.id.length > 0) {
            post = await prisma.post.findUnique({ where: { id: req.body.id } });
        }

        if (!post) {
            await prisma.post.create({
                data: {
                    title:
                        req.body.title && req.body.title.length > 0
                            ? req.body.title.substring(0, 32)
                            : 'Untitled Post',
                    slug:
                        req.body.slug && req.body.slug.length > 0
                            ? req.body.slug
                                  .substring(0, 32)
                                  .replace(/[^0-9a-z-]/gi, '')
                            : '',
                    content:
                        req.body.content && req.body.content.length > 0
                            ? req.body.content
                            : '',
                },
            });
        } else {
            await prisma.post.update({
                where: {
                    id: req.body.id,
                },
                data: {
                    title:
                        req.body.title && req.body.title.length > 0
                            ? req.body.title.substring(0, 32)
                            : 'Untitled Post',
                    slug:
                        req.body.slug && req.body.slug.length > 0
                            ? req.body.slug
                                  .substring(0, 32)
                                  .replace(/[^0-9a-z-]/gi, '')
                            : '',
                    content:
                        req.body.content && req.body.content.length > 0
                            ? req.body.content
                            : '',
                },
            });
        }

        res.status(200).json({ m: 'Success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ e: 'Internal Server Error' });
    }
}
