"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type ConversationIsItem = {
    id: string;
    title: string;
    isPinned: boolean;
    isArchived: boolean;
    lastMessageAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * Lists non-archived conversations for the current user.
 * Pinned conversations appear first, then sorted by most recent activity.
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

/**
 * Fetches a single conversation owned by the current user.
 *
 * @param conversationId - The conversation to load.
 * @throws {Error} When the conversation is not found.
 */
export async function getConversationById(
    conversationId: string,
): Promise<ConversationIsItem | null> {
    const user = await requireUser();
    await assertConversation(conversationId, user.id);

    return assertConversation(conversationId, user.id);
}

export async function listConversations(): Promise<ConversationIsItem[]> {
    const user = await requireUser();

    return await prisma.conversation.findMany({
        where: { userId: user.id, isArchived: false },
        orderBy: [{ isPinned: "desc" }, { lastMessageAt: "desc" }],
        select: {
            id: true,
            title: true,
            isPinned: true,
            isArchived: true,
            lastMessageAt: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function createConversation(title: string = "New Chat") {
    const user = await requireUser();

    return await prisma.conversation.create({
        data: {
            title: title.trim() || "New Chat",
            userId: user.id,
        },
    });
}

export async function updateConversation(
    conversationId: string,
    data: { titel?: string; isPinned?: boolean; isArchive?: boolean },
) {
    const user = await requireUser();
    await assertConversation(conversationId, user.id);

    const updatedConversation = await prisma.conversation.update({
        where: {
            id: conversationId,
        },
        data: {
            ...(data.titel !== undefined
                ? { title: data.titel.trim() || "New Chat" }
                : {}),
            ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
            ...(data.isArchive !== undefined
                ? { isArchived: data.isArchive }
                : {}),
        },
    });

    revalidatePath("/");
    revalidatePath(`/c/${conversationId}`);

    return updatedConversation;
}

export async function deleteConversation(conversationId: string) {
    const user = await requireUser();
    await assertConversation(conversationId, user.id);

    await prisma.conversation.delete({
        where: {
            id: conversationId,
        },
    });

    revalidatePath("/conversations");

    return {
        id: conversationId,
    };
}
