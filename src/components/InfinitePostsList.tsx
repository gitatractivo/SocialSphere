import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import { ProfileImage } from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscComment, VscHeart, VscHeartFilled } from "react-icons/vsc";
import { IconHoverEffect } from "./IconHoverEffect";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./LoadingSpinner";
import Image from 'next/image';
export type File = {
  id: string;
  name: string;
  url: string;
  size: number;
  height: number | null;
  width: number | null;
};


export type Post = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    image: string | null;
    id: string;
    name: string | null;
  };
  likeCount: number;
  // commentCount: number;
  likedByMe: boolean;
  files:File[]
};

type InfiniteTweetListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  fetchNewPosts: () => Promise<unknown>;
  posts?: Post[];
};

export const InfinitePostsList = ({
  isError,
  isLoading,
  hasMore,
  fetchNewPosts,
  posts,
}: InfiniteTweetListProps) => {
  if (isError) return <h1>Error</h1>;
  if (isLoading) return <LoadingSpinner />;
  if (posts == null || posts.length === 0)
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">
        No Posts Found
      </h2>
    );
  return (
    <ul>
      <InfiniteScroll
        next={fetchNewPosts}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
        dataLength={posts.length}
      >
        {posts.map((post, index) => (
          <PostCard key={post.id} {...post} />
        ))}
      </InfiniteScroll>
    </ul>
  );
};
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

function PostCard({
  id,
  user,
  content,
  createdAt,
  likeCount,
  likedByMe,
  files,
}: Post) {
  const trpcUtils = api.useContext();
  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      console.log(addedLike, "addedLike");
      const updateData: Parameters<
        typeof trpcUtils.post.infiniteProfileFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;
        const countModifier = addedLike ? 1 : -1;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === id)
                  return {
                    ...post,
                    likeCount: likeCount + countModifier,
                    likedByMe: addedLike,
                  };
                return post;
              }),
            };
          }),
        };
      };

      trpcUtils.post.infiniteFeed.setInfiniteData({}, updateData);
      trpcUtils.post.infiniteFeed.setInfiniteData({ onlyFollowing: true }, updateData);
      trpcUtils.post.infiniteProfileFeed.setInfiniteData(
        { userId: user.id },
        updateData
      );


    },
  });
  function handleToggleLike() {
    toggleLike.mutate({ id });
  }

  return (
    <li className="flex border-b px-4 py-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>

      <div className="ml-2 flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${user.id}`}
            className="font-bold outline-none hover:underline focus-visible:underline"
          >
            {user.name}
          </Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">
            {dateTimeFormatter.format(createdAt)}
          </span>
        </div>
        <Link href={`/post/${id}`}>

        <p className="whitespace-pre-wrap">{content}</p>
        <p className="flex gap-4">
          {files?.length > 0 &&
            files?.map((file) => {
              return (
                <Image
                  src={file.url}
                  alt={file.name}
                  width={500}
                  height={500}
                  key={file.id}
                  className="rounded-lg"
                />
              );
            })}
        </p>
        </Link>
        <HeartButton
          onClick={handleToggleLike}
          isLoading={toggleLike.isLoading}
          likedByMe={likedByMe}
          likeCount={likeCount}
        />
      </div>
    </li>
  );
}
export type HeartButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  likedByMe: boolean;
  likeCount: number;
};

export const HeartButton=({
  isLoading,
  onClick,
  likedByMe,
  likeCount,
}: HeartButtonProps)=> {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    );
  }

  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group ml-2  flex items-center gap-1 self-start transition-colors duration-200 ${likedByMe
          ? "text-red-500"
          : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
        }`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200 ${likedByMe
              ? "fill-red-500"
              : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
            }`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
}

type CommentButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  commentByMe: boolean;
  commentCount: number;
};

export const CommentButton=({
  isLoading,
  onClick,
  commentByMe,
  commentCount,
}: CommentButtonProps)=> {
  const session = useSession();
  // const HeartIcon = commentdByMe ? VscHeartFilled : VscHeart;

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <VscComment />
        <span>{commentCount}</span>
      </div>
    );
  }

  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group ml-2  flex items-center gap-1 self-start transition-colors duration-200 ${
        commentByMe
          ? "text-red-500"
          : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
      }`}
    >
      <IconHoverEffect red>
        <VscComment
          className={`transition-colors duration-200 ${
            commentByMe
              ? "fill-red-500"
              : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
          }`}
        />
      </IconHoverEffect>
      <span>{commentCount}</span>
    </button>
  );
}
