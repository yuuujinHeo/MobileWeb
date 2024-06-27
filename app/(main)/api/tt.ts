import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("fetch!");
  res.status(200).json({ current: Date.now() });
}
