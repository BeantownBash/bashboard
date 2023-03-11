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
        if (!req.body) {
            res.status(400).json({
                e: 'Bad Request: No body provided.',
            });
            return;
        }

        if (!req.body.data || !req.body.data.fields) {
            res.status(400).json({
                e: 'Bad Request: No form data provided.',
            });
            return;
        }

        const securityKeyField = req.body.data.fields.find(
            (el: any) => el.label === 'securityKey',
        );
        const emailField = req.body.data.fields.find(
            (el: any) => el.label === 'email',
        );
        const voteIdField = req.body.data.fields.find(
            (el: any) => el.label === 'voteId',
        );

        if (!securityKeyField || !emailField || !voteIdField) {
            res.status(400).json({
                e: 'Bad Request: No security key, email, or vote ID provided.',
            });
            return;
        }

        const securityKey = securityKeyField.value;
        const email = emailField.value;
        const voteId = voteIdField.value;

        if (!securityKey || !email || !voteId) {
            res.status(400).json({
                e: 'Bad Request: No security key, email, or vote ID provided.',
            });
            return;
        }

        await prisma.ballot.updateMany({
            where: {
                securityKey,
                voteId,
                user: {
                    email,
                },
            },
            data: {
                isCast: true,
            },
        });

        res.status(200).json({ m: 'Success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ e: 'Internal Server Error' });
    }
}
