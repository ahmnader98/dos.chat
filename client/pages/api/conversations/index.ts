import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Conversation } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    // Get all conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: {
            id: session.user.sub,
          },
        },
      },
      include: {
        users: true,
        messages: true,
      },
    });
    res.status(200).json(conversations);
  } else if (req.method === "POST") {
    // Create a new conversation
    const { userIds } = req.body;
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: userIds.map((userId: number) => ({ id: userId })),
        },
      },
      include: {
        users: true,
        messages: true,
      },
    });
    res.status(201).json(newConversation);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
