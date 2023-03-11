import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<object>,
) {
    res.status(200).json({
        m: 'Hello there! I hope you have an excellent day!',
    });
}
