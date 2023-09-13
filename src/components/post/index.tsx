import Image from "next/image";
import Link from "next/link";
import { api } from "~/utils/api";
import { ProfileImage } from "../ProfileImage";
import { CommentButton, HeartButton } from "./Buttons";
import { Post } from "./Posts";
import Attachments from "./FileAttachment";
import Modal from "../Modal";
import { useState } from "react";
import CommentModal from "./CommentModal";

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

export function formatTimeDifference(createdAt: Date) {
  const now = new Date();

  const timeDifferenceInMilliseconds = now.getTime() - createdAt.getTime();
  const timeDifferenceInSeconds = Math.floor(
    timeDifferenceInMilliseconds / 1000
  );

  if (timeDifferenceInSeconds < 60) {
    // Less than 60 seconds, show in seconds
    return `${timeDifferenceInSeconds}s`;
  } else if (timeDifferenceInSeconds < 3600) {
    // Less than 1 hour, show in minutes
    const minutes = Math.floor(timeDifferenceInSeconds / 60);
    return `${minutes}m`;
  } else if (timeDifferenceInSeconds < 86400) {
    // Less than 24 hours, show in hours
    const hours = Math.floor(timeDifferenceInSeconds / 3600);
    return `${hours}hr`;
  } else {
    // More than 24 hours, show the date
    return dateTimeFormatter.format(createdAt);
  }
}

function Post(post: Post) {
  const [open, setOpen] = useState<boolean>(false);
  const [comment, setComment] = useState<boolean>(false);

  const { id, user, content, createdAt, likeCount, likedByMe, files,commentCount } = post;
  const trpcUtils = api.useContext();
  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
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
      trpcUtils.post.infiniteFeed.setInfiniteData(
        { onlyFollowing: true },
        updateData
      );
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
    <li className="flex border-b border-gray-700 px-4 py-4 ">
      <Modal
        open={open || comment}
        handleClose={() => {
          setOpen(false);
          setComment(false);
        }}
        label="and"
        classes="dark:shadow-[0_0_15px_-3px_rgba(255,255,255,0.4)] w-10/12 lg:w-1/2 top-[]"
      >
        {comment ? (
          <CommentModal
            originalPost={post}
            handleClose={() => setComment(false)}
          />
        ) : (
          <div>hello</div>
        )}
      </Modal>
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage
          src={user.image}
          className="drop-shadow-white drop-shadow-sm"
        />
      </Link>

      <div className="ml-2 flex max-w-full flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${user.id}`}
            className="flex justify-start gap-2"
          >
            <span className="font-bold outline-none hover:underline focus-visible:underline">
              {user.name}
            </span>
            <span className="text-sm text-gray-300">@{user.username}</span>
          </Link>
          <span className="text-gray-500">·</span>
          <Link href={`/post/${id}`}>
            <span className="text-gray-500">
              {formatTimeDifference(createdAt)}
            </span>
          </Link>
        </div>
        <Link href={`/post/${id}`} className="w-full ">
          <p className="h-fit w-[87%] whitespace-pre-wrap break-words ">
            {content}
          </p>

          {files?.length > 0 && (
            <div className="mt-2 h-[250px] w-[87%] md:h-[320px]">
              <Attachments attachments={files} />
            </div>
          )}
        </Link>
        <div className="my-3 flex w-5/6 justify-between">
          <HeartButton
            onClick={handleToggleLike}
            isLoading={toggleLike.isLoading}
            likedByMe={likedByMe}
            likeCount={likeCount}
          />
          <CommentButton
            onClick={() => {
              setComment(true);
            }}
            isLoading={toggleLike.isLoading}
            // commentByMe={true}
            commentCount={commentCount}
          />
          <HeartButton
            onClick={handleToggleLike}
            isLoading={toggleLike.isLoading}
            likedByMe={likedByMe}
            likeCount={likeCount}
          />
        </div>
      </div>
    </li>
  );
}

export default Post;
