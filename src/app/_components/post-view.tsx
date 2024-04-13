import { PostWrapper } from "~/app/_components/create-post";
import { getServerAuthSession } from "~/server/auth";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { type RouterOutputs, api } from "~/trpc/server";


type PostWithUser = RouterOutputs["post"]["getAllPosts"][number]

export default async function PostView(props: PostWithUser) {
  const { post, author } = props;

  return (<div className="flex border-b border-slate-400 p-4">
    <Image 
      alt={`@${author.name}'s profile picture`} 
      src={author.image!} 
      className="w-14 h-14 rounded-full" 
      width={56} 
      height={56} 
    />
    <div className="flex flex-col mx-4">
      <div className="flex text-slate-400 gap-2">
        <Link href={`@${author.name}`}>
          <span>{`@${author.name}`}</span>
        </Link>
        <Link href={`/post/${post.id}`}>
          <span className="font-light">{`∙ ${dayjs(post.createdAt).fromNow()}`}</span>
        </Link>
      </div>
      {/* <span>{post.name}</span> */}
      <div className="flex text-slate-400">
        <span>{post.content}</span>
      </div>
    </div>
  </div>)
}



