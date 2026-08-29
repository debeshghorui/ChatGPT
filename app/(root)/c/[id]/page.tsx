import { getConversationById } from "@/features/conversation/actions/conversations-actions";
import { notFound } from "next/navigation";

type ConversationPageProps = {
    params: Promise<{ id: string }>;
};

export default async function Page({ params }: ConversationPageProps) {
    const { id } = await params;

    try {
        const conversation = await getConversationById(id);

        if (!conversation) {
            notFound();
        }
    } catch (error) {
        console.error(error);
        notFound();
    }

    return (
        <div>
            <h1>{conversation ? conversation.title : "Loading..."}</h1>
        </div>
    );
}
