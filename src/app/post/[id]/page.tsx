import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { api } from "~/trpc/server";
import { PageLayout } from "~/app/_components/page-layout";
import PostView from "~/app/_components/post-view";
dayjs.extend(relativeTime);

export default async function SinglePostPage({ params} : { params: { id: string}}) {
  const postData = await api.post.getPostById({ id: Number(params.id)});

  return (
   <PageLayout>
    <PostView {...postData} />
   </PageLayout>
  );
}