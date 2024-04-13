import { getServerAuthSession } from "~/server/auth";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Link from "next/link";
import { PageLayout } from "../_components/page-layout";
import { api } from "~/trpc/server";
import Image from "next/image";

dayjs.extend(relativeTime);

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session?.user) return null;

  const user = await api.profile.getUserByUsername({ name: session.user.name! });

  return (
    <PageLayout>
      <div className="relative h-36 flex flex-col p-4 border-b items-start justify-center gap-4 bg-slate-500">
        <Image 
          src={user.image!}
          alt={`${user.name} Profile Image`}
          width={128}
          height={128}
          className="absolute bottom-0 left-0 -mb-[48px] rounded-full border-4 border-black ml-8 bg-black"
        />
      </div>
      <div className="h-[56px]"></div>
      <div className="font-bold text-2xl px-5 pb-8">@{user.name}</div>
      <div className="border-b border-slate-400 bg-black"></div>
    </PageLayout>
  );
}