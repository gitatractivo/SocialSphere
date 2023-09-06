import { VscComment, VscHeart, VscHeartFilled } from "react-icons/vsc";
import { IconHoverEffect } from "../IconHoverEffect";
import { useSession } from "next-auth/react";


export type HeartButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  likedByMe: boolean;
  likeCount: number;
};

export const HeartButton = ({
  isLoading,
  onClick,
  likedByMe,
  likeCount,
}: HeartButtonProps) => {
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
      className={`group ml-2  flex items-center gap-1 self-start transition-colors duration-200 ${
        likedByMe
          ? "text-red-500"
          : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
      }`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200 ${
            likedByMe
              ? "fill-red-500"
              : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
          }`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
};

type CommentButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  commentByMe: boolean;
  commentCount: number;
};

export const CommentButton = ({
  isLoading,
  onClick,
  commentByMe,
  commentCount,
}: CommentButtonProps) => {
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
};
