// pages/api/users/[id].js
import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient, User } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | { message: string }>
) {
  const session = await getSession(req, res);

  if (!session) {
    // If the user is not authenticated, return a 401 Unauthorized status
    res.status(401).json({ message: "Unauthorized" });
  }
  const id = req?.query?.id;

  if (req.method === "GET") {
    // Get user by ID
    const user = await prisma.user.findUnique({
      where: {
        id: Array.isArray(id) ? id[0] : id!,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json(user);
    }
  } else if (req.method === "PUT") {
    // Update user by ID
    const user = prisma.user.findUnique({
      where: {
        id: Array.isArray(id) ? id[0] : id!,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { username } = req.body;
    const updatedUser = await prisma.user.update({
      where: {
        id: Array.isArray(id) ? id[0] : id!,
      },
      data: {
        username,
      },
    });
    res.status(200).json(updatedUser);
  } else if (req.method === "DELETE") {
    // Delete user by ID
    const user = prisma.user.findUnique({
      where: {
        id: Array.isArray(id) ? id[0] : id!,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: {
        id: Array.isArray(id) ? id[0] : id!,
      },
    });
    res.status(204).end();
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
