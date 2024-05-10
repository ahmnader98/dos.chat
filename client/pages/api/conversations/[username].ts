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

  const { username } = req.query;

  if (req.method === "DELETE") {
    try {
      // Delete the conversation and related messages where one is the username from the query and the other is the username from  the session object
      const conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            {
              users: {
                some: {
                  username: String(username),
                },
              },
            },
            {
              users: {
                some: {
                  id: session.user.sub,
                },
              },
            },
          ],
        },
        include: {
          messages: true,
        },
      });

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Delete the conversation and related messages
      await prisma.conversation.delete({
        where: {
          id: conversation.id,
        },
      });

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else if (req.method === "GET") {
    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            users: {
              some: {
                username: String(username),
              },
            },
          },
          {
            users: {
              some: {
                id: session.user.sub,
              },
            },
          },
        ],
      },
      include: {
        messages: true,
      },
    });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    res.status(200).json(conversation);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
