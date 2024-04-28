import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  try {
    // Create users
    const user1 = await prisma.user.create({
      data: {
        username: "user1",
        email: "user1@example.com",
        id: "user1",
      },
    });

    const user2 = await prisma.user.create({
      data: {
        username: "user2",
        email: "user2@example.com",
        id: "user2",
      },
    });

    // Create a conversation
    const conversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [{ id: user1.id }, { id: user2.id }],
        },
      },
    });

    // Create messages
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: user1.id,
          messageContent: "Hello from user1",
        },
        {
          conversationId: conversation.id,
          senderId: user2.id,
          messageContent: "Hi user1, how are you?",
        },
      ],
    });

    // Create chat request
    await prisma.chatRequest.create({
      data: {
        senderId: user1.id,
        receiverId: user2.id,
        status: "pending",
      },
    });

    console.log("Seed data inserted successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
