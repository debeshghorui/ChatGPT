import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <h1 className="text-2xl font-bold">Hello World</h1>
            <ModeToggle />
            <UserButton />
        </div>
    );
}
