"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    createConversation,
    deleteConversation,
    listConversations,
    updateConversation,
} from "@/features/conversation/actions/conversations-actions";
import { queryKeys } from "../utils/query-keys";

export function useConversations() {
    return useQuery({
        queryKey: queryKeys.conversations.all,
        queryFn: () => listConversations(),
    });
}

export function useCreateConversation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (title: string) => createConversation(title),
        onSuccess: (conversation) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });

            router.push(`/c/${conversation.id}`);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create conversation");
        },
    });
}

export function useUpdateConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            conversationId,
            data,
        }: {
            conversationId: string;
            data: { titel?: string; isPinned?: boolean; isArchive?: boolean };
        }) => updateConversation(conversationId, data),
        onSuccess: (conversation) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.detail(conversation.id),
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update conversation");
        },
    });
}

export function useDeleteConversation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (conversationId: string) =>
            deleteConversation(conversationId),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });

            router.push("/conversations");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete conversation");
        },
    });
}
