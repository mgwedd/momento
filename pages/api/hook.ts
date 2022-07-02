import prismaClient from '../../lib/prisma';

import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, firstName, lastName, secret } = req.body;

  if (req.method !== 'POST') {
    return res.status(403).json({ message: 'Method not allowed' });
  }

  if (secret !== process.env.AUTH0_HOOK_SECRET) {
    return res
      .status(403)
      .json({ message: `You must provide the auth secret 🤫` });
  }

  if (email && firstName && lastName) {
    await prismaClient.user.create({
      data: { email, firstName, lastName }
    });
    return res.status(200).json({
      message: `User with email: ${email} has been created successfully!`
    });
  }

  return res.status(404).json({
    message:
      'email, firstName, lastName are all required. Invalid data received.'
  });
};

export default handler;
