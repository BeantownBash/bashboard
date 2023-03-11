import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { Year } from '@prisma/client';
import { generateRandomKey } from '@/lib/utils';

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

        let vote;
        if (req.body.id && req.body.id.length > 0) {
            vote = await prisma.vote.findUnique({ where: { id: req.body.id } });
        }

        const ballotUsers = await prisma.user.findMany({
            where: {
                projectId: {
                    in: req.body.canVote,
                },
            },
        });

        if (!vote) {
            await prisma.vote.create({
                data: {
                    year: Year.Y23,
                    title:
                        req.body.title && req.body.title.length > 0
                            ? req.body.title.substring(0, 32)
                            : 'Untitled Vote',
                    description: req.body.description,
                    linkedForm: req.body.linkedForm,
                    open: req.body.open,
                    canVote: {
                        connect: req.body.canVote.map((id: string) => ({ id })),
                    },
                    voteFor: {
                        connect: req.body.voteFor.map((id: string) => ({ id })),
                    },
                    ballots: {
                        createMany: {
                            data: ballotUsers.map((user) => ({
                                userId: user.id,
                                securityKey: generateRandomKey(),
                                projectId: user.projectId as string,
                            })),
                        },
                    },
                },
            });
        } else {
            // delete old ballots
            console.log(ballotUsers);
            await prisma.ballot.deleteMany({
                where: {
                    voteId: req.body.id,
                    userId: {
                        notIn: ballotUsers.map((user) => user.id),
                    },
                },
            });

            await prisma.vote.update({
                where: {
                    id: req.body.id,
                },
                data: {
                    title:
                        req.body.title && req.body.title.length > 0
                            ? req.body.title.substring(0, 32)
                            : 'Untitled Vote',
                    description: req.body.description,
                    linkedForm: req.body.linkedForm,
                    open: req.body.open,
                    canVote: {
                        set: req.body.canVote.map((id: string) => ({ id })),
                    },
                    voteFor: {
                        set: req.body.voteFor.map((id: string) => ({ id })),
                    },
                    ballots: {
                        createMany: {
                            data: ballotUsers.map((user) => ({
                                userId: user.id,
                                securityKey: generateRandomKey(),
                                projectId: user.projectId as string,
                            })),
                            skipDuplicates: true,
                        },
                    },
                },
            });
        }

        res.status(200).json({ m: 'Success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ e: 'Internal Server Error' });
    }
}
