import { PostWrapper } from "~/app/_components/create-post";
import { getServerAuthSession } from "~/server/auth";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Link from "next/link";
import { api } from "~/trpc/server";
import PostView from "./_components/post-view";

dayjs.extend(relativeTime);

export default async function Home() {
  const session = await getServerAuthSession();

  return (

    <main className="flex h-screen flex-col items-center justify-center text-white">
      <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        <div className="flex flex-col p-4 border-b items-start justify-center gap-4">
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-white/10 px-10 py-2 font-semibold no-underline transition hover:bg-white/20"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
          {session && <PostWrapper />}
        </div>
        <PostListView />
      </div>
    </main>
  );
}

export async function PostListView() {
  const session = await getServerAuthSession();
  if (!session?.user) return null;

  const allPosts = await api.post.getAllPosts()

  return (
    <div className="w-full h-[80vh] flex flex-col overflow-scroll no-scrollbar">
      {allPosts.map((post) => (
        <PostView key={post.post.id} {...post} />
      ))}
    </div>
  );
}
