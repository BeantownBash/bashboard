import { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>,
) {
    const { id } = req.query;
    const path = `./data/uploads/${id}.jpg`;
    const stat = await fs.promises.stat(path);
    res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': stat.size,
    });
    fs.createReadStream(path).pipe(res);
}

// reduce server load
export const config = {
    api: {
        bodyParser: false,
    },
};
