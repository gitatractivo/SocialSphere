import React from "react";
import { Post } from "./Posts";
import { formatTimeDifference } from "./index";
import Image from "next/image";
import { ProfileImage } from "../ProfileImage";
import Attachments from "./FileAttachment";
import { CreatePost } from "./RepostContent";

type Props = {
  originalPost: Post;
  handleClose: () => void;
};

const RepostModal = ({ originalPost, handleClose }: Props) => {
  const { id, user, content, createdAt, likeCount, likedByMe, files } =
    originalPost;

  return (
    <div>
      <div className="flex max-w-full flex-row justify-start overflow-hidden">
        <div className="ml-2 flex w-full max-w-full flex-col">
          <CreatePost originalPost={originalPost} handleClose={handleClose} />
          

          <div className="my-2  ml-12 rounded-2xl p-5 flex border border-gray-700">
            <div className="relative ">
              <ProfileImage
                src={user.image}
                className="drop-shadow-white absolute top-0 drop-shadow-sm w-6 h-6"
              />
            </div>

            <div className="ml-2 flex max-w-full flex-col">
              <div className=" flex justify-start gap-2 ">
                <span className="font-bold outline-none hover:underline focus-visible:underline">
                  {user.name}
                </span>
                <span className="text-sm text-gray-300">@{user.username}</span>

                <span className="text-gray-500">·</span>

                <span className="text-gray-600">
                  {formatTimeDifference(createdAt)}
                </span>
              </div>
              <div className="flex w-10/12 flex-col">
                <div className="mt-2 h-fit w-full whitespace-pre-wrap break-words text-sm ">
                  {content}
                </div>
                {files?.length > 0 && (
                  <div className="mt-2 h-[200px] w-full md:h-[200px]">
                    <Attachments attachments={files} />
                  </div>
                )}
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepostModal;
