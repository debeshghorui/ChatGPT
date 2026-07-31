"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { z } from "zod";

import type { MessageRole, MessageStatus } from "@/lib/generated/prisma/client";

export type MessageItem = {
    id: string;
    conversationId: string;
    role: MessageRole;
    status: MessageStatus;
    content: string;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * Verifies that a conversation exists and belongs to the given user.
 *
 * @throws {Error} When the conversation is not found.
 */
async function assertConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId: userId,
        },
    });

    if (!conversation) {
        throw new Error("Conversation not found or access denied");
    }

    return conversation;
}

/** Load messages for a conversation (oldest → newest). */
export async function listMessages(
    conversationId: string,
): Promise<MessageItem[]> {
    const user = await requireUser();
    await assertConversation(conversationId, user.id);

    return (await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            conversationId: true,
            role: true,
            status: true,
            content: true,
            createdAt: true,
            updatedAt: true,
        },
    })) as MessageItem[];
}

/**
 * Create a user message in a conversation.
 * No AI reply yet — this only persists the user's text.
 * Optionally renames "New Chat" using the first message.
 */
export async function createMessage(conversationId: string, content: string) {
    const user = await requireUser();
    const conversation = await assertConversation(conversationId, user.id);

    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
        throw new Error("Content is required");
    }

    const message = await prisma.message.create({
        data: {
            conversationId,
            role: "USER",
            status: "COMPLETE",
            content: trimmedContent,
        },
    });

    const shouldRename =
        conversation.title === "New Chat" || conversation.title.trim() === "";

    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            ...(shouldRename
                ? {
                      title:
                          trimmedContent.length > 48
                              ? `${trimmedContent.slice(0, 48)}…`
                              : trimmedContent,
                  }
                : {}),
            lastMessageAt: new Date(),
            updatedAt: new Date(),
        },
    });

    revalidatePath("/");
    revalidatePath(`/c/${conversationId}`);

    return message;
}

/** Update message text (e.g. edit). */
export async function updateMessage(messageId: string, content: string) {
    const user = await requireUser();
    const trimmed = content.trim();

    if (!trimmed) {
        throw new Error("Message cannot be empty");
    }

    const existing = await prisma.message.findUnique({
        where: { id: messageId },
        include: { conversation: true },
    });

    if (!existing || existing.conversation.userId !== user.id) {
        throw new Error("Message not found");
    }

    const message = await prisma.message.update({
        where: { id: messageId },
        data: { content: trimmed },
    });

    revalidatePath(`/c/${existing.conversationId}`);
    return message;
}

/** Delete a single message. */
export async function deleteMessage(messageId: string) {
    const user = await requireUser();

    const existing = await prisma.message.findUnique({
        where: { id: messageId },
        include: { conversation: true },
    });

    if (!existing || existing.conversation.userId !== user.id) {
        throw new Error("Message not found");
    }

    await prisma.message.delete({ where: { id: messageId } });

    revalidatePath(`/c/${existing.conversationId}`);
    return { id: messageId, conversationId: existing.conversationId };
}
