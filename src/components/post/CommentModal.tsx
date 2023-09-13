import React from 'react'
import { Post } from './Posts';
import {  formatTimeDifference } from './index';
import Image from 'next/image';
import { ProfileImage } from '../ProfileImage';
import Attachments from "./FileAttachment";
import { CreatePost } from './CommentContent';

type Props = {
  originalPost:Post,
  handleClose: ()=>void
};

const CommentModal = ({originalPost,handleClose}: Props) => {
    const { id, user, content, createdAt, likeCount, likedByMe, files } = originalPost;

  return (
    <div>
      <div className="flex max-w-full flex-row justify-start overflow-hidden">
        <div className="relative ">
          <ProfileImage
            src={user.image}
            className="drop-shadow-white absolute top-0 drop-shadow-sm"
          />
          <div className="mx-auto h-[89%] w-[1px] bg-gray-300"></div>
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
          <div className="flex flex-col w-10/12">
            <div className="mt-2 text-sm h-fit w-full whitespace-pre-wrap break-words ">
              {content}
            </div>
            {files?.length > 0 && (
              <div className="mt-2 h-[200px] md:h-[200px] w-full">
                <Attachments attachments={files} />
              </div>
            )}
          </div>

          <div className="mt-2 mb-0">
                Replying to <span className='text-[#1D9BF0]'>@{user.username}</span>
          </div>
        </div>
      </div>
      <CreatePost originalPost={originalPost} handleClose={handleClose}/>
    </div>
  );
}

export default CommentModal