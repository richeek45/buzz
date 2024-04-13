import { getServerAuthSession } from "~/server/auth";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Link from "next/link";
import { api } from "~/trpc/server";

dayjs.extend(relativeTime);

export default async function SinglePostPage() {
  const session = await getServerAuthSession();

  const data = await api.profile.getUserByUsername({ name: "richeek"});

  console.log(data, " ...data...");

  return (

    <main className="flex h-screen flex-col items-center justify-center text-white">
      <div className="h-full w-full border-x text-center border-slate-400 md:max-w-2xl">
        <div className="flex flex-col p-4 border-b items-start justify-center gap-4">
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-white/10 px-10 py-2 font-semibold no-underline transition hover:bg-white/20"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
        </div>
          Post View
      </div>
    </main>
  );
}