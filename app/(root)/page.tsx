import { redirect } from "next/navigation";

import { startNewChat } from "@/features/home/actions/start-new-chat";

export default async function page() {
    const conversationId = await startNewChat();
    redirect(`/c/${conversationId}`);
}
