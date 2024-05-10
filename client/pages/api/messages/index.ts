import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { conversationId } = req.query;
  const { messageContent } = req.body;
  const userId = session.user.sub;

  const conversation = prisma.conversation.findUnique({
    where: {
      id: parseInt(
        Array.isArray(conversationId) ? conversationId[0] : conversationId!
      ),
    },
    include: {
      users: true,
    },
  });

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  //check if the user is part of the conversation

  const usersInConversation = await conversation.users();

  // Check if the user is part of the conversation
  const userInConversation = usersInConversation?.some(
    (user: User) => user.id === userId
  );

  if (!userInConversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  if (req.method === "GET") {
    try {
      // Retrieve messages for the specified conversation ID
      const messages = await prisma.message.findMany({
        where: {
          conversationId: parseInt(
            Array.isArray(conversationId) ? conversationId[0] : conversationId!
          ),
        },
      });

      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else if (req.method === "POST") {
    try {
      // Create a new message
      const newMessage = await prisma.message.create({
        data: {
          conversationId: parseInt(
            Array.isArray(conversationId) ? conversationId[0] : conversationId!
          ),
          senderId: userId,
          messageContent,
        },
      });

      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
