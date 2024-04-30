import { getSession } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession(req, res);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;

  const request = await prisma.chatRequest.findUnique({
    where: {
      id: parseInt(Array.isArray(id) ? id[0] : id!),
    },
  });

  if (!request) {
    return res.status(404).json({ message: "Chat request not found" });
  }
  if (req.method === "PUT") {
    // Accept or reject the chat request
    const { status } = req.body;
    if (status !== "accepted" && status !== "rejected") {
      return res.status(400).json({ message: "Invalid status" });
    }
    const updatedChatRequest = await prisma.chatRequest.update({
      where: {
        id: parseInt(Array.isArray(id) ? id[0] : id!),
      },
      data: {
        status,
      },
      include: {
        sender: true,
      },
    });
    if (status === "accepted") {
      await prisma.conversation.create({
        data: {
          users: {
            connect: [
              { id: updatedChatRequest.receiverId },
              { id: updatedChatRequest.senderId },
            ],
          },
        },
        include: {
          users: true,
          messages: true,
        },
      });
    }
    res.status(200).json(updatedChatRequest);
  } else if (req.method === "DELETE") {
    // Delete the chat request
    await prisma.chatRequest.delete({
      where: {
        id: parseInt(Array.isArray(id) ? id[0] : id!),
      },
    });
    res.status(204).end();
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
