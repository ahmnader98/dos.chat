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

  if (req.method === "GET") {
    // Get all chat requests for the current user
    const chatRequests = await prisma.chatRequest.findMany({
      where: {
        AND: [
          {
            receiverId: session.user.sub,
          },
          {
            status: "pending",
          },
        ],
      },
      include: {
        sender: true,
      },
    });
    res.status(200).json(chatRequests);
  } else if (req.method === "POST") {
    // Create a new chat request
    const { receiverUsername } = req.body;
    const receiver = await prisma.user.findUnique({
      where: {
        username: receiverUsername,
      },
    });
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }
    const newChatRequest = await prisma.chatRequest.create({
      data: {
        senderId: session.user.sub,
        receiverId: receiver?.id!,
        status: "pending", // Initial status is set to pending
      },
      include: {
        sender: true,
      },
    });
    res.status(201).json(newChatRequest);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
