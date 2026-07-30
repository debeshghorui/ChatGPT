"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function requireUser() {
    try {
        const { userId } = await auth.protect();

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
        });

        if (!user) {
            throw new Error("Unauthorized");
        }

        return user;
    } catch (error) {
        console.error("Error in requireUser:", error);
        throw new Error("Unauthorized");
    }
}
