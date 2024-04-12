"use client";

import { SessionProvider, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";
import { LoadingSpinner } from "./loading";

import toast, { Toaster } from 'react-hot-toast';

export function CreatePost() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const utils = api.useUtils();

  const { data } = useSession()
  const user = data?.user

  console.log(user, "data.......................")

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setContent("");
      void utils.post.getAllPosts.invalidate();
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors.content![0];
      console.log(error.data?.zodError?.fieldErrors.content![0], "Error.........");
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to post! Please try again later!");
      }
    }
  });


  return (
    
  <div className="flex w-full gap-3">
    {user?.image && <Image 
      src={user.image} 
      alt="Profile Image" 
      className="h-14 w-14 rounded-full" 
      width={56} 
      height={56} 
    />}
    <input 
      type="text" 
      placeholder="Type some emojis!" 
      className="grow bg-transparent outline-none" 
      value={content}
      onKeyDown={(e) => {
        e.preventDefault();
        if ((e.key === "Enter")) {
          createPost.mutate({ name: "Richeek", content })
        }
      }}
      onChange={(e) => setContent(e.target.value)}
    />
    <button
      type="button"
      className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
      disabled={createPost.isPending || content === ""}
      onClick={() => createPost.mutate({ name: "Richeek", content })}
    >
      {createPost.isPending ? <LoadingSpinner /> : "Post"}
    </button>
  </div>
  );
}

export const PostWrapper = () => {
  return (
    <SessionProvider>
      <Toaster />
      <CreatePost />
    </SessionProvider>
  )
}
