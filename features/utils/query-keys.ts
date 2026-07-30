export const queryKeys = {
    conversations: {
        all: ["conversations"] as const,
        detail: (id: string) => ["conversations", id] as const,
    },
    messages: {
        byConversationId: (conversationId: string) =>
            ["messages", conversationId] as const,
    },
};
