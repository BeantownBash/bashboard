import type { NextApiRequest, NextApiResponse } from 'next';
import { createId } from '@paralleldrive/cuid2';
import * as fs from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
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

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        res.status(401).json({ e: 'Unauthorized' });
        return;
    }

    const providedName = req.body?.name;
    let newName = null;
    if (providedName && providedName.length > 0) {
        // maximum name length 32 characters
        newName = providedName.substring(0, 32);
    }

    try {
        await prisma.user.update({
            where: {
                email: session.user.email,
            },
            data: {
                name: newName,
            },
        });
        res.status(200).json({ m: 'Success' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ e: 'Internal Server Error' });
    }
}
