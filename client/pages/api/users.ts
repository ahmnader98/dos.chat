import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, User } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

interface Usernames {
  usernames: string[];
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Usernames | User | { message: string }>
) {
  const session = await getSession(req, res);

  if (!session) {
    // If the user is not authenticated, return a 401 Unauthorized status
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.method === "GET") {
    const users = await prisma.user.findMany();
    const usernames: Usernames = {
      usernames: users.map((user) => user.username),
    };
    res.status(200).json(usernames);
  } else if (req.method === "POST") {
    const { username } = req.body;
    const newUser = await prisma.user.create({
      data: {
        username,
        email: session?.user?.email,
        id: session?.user?.sub,
      },
    });
    res.status(201).json(newUser);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
