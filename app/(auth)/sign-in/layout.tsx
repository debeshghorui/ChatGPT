import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="flex h-screen flex-col items-center justify-center">
            <div className="w-full max-w-md">{children}</div>
        </section>
    );
}
