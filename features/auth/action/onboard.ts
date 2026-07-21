"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";


export async function onBoard() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        throw new Error("Unauthorized");
    }

    const email = clerkUser.emailAddresses[0].emailAddress;

    return prisma.user.upsert({
        where: {
            clerkId: clerkUser.id,
        },
        create: {
            clerkId: clerkUser.id,
            email: email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
        },
        update: {
            email: email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
        },
    });
}
