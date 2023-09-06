
import Image from 'next/image';
import Link from "next/link";
import { api } from "~/utils/api";
import { ProfileImage } from "../ProfileImage";
import { HeartButton } from './Buttons';
import { Post } from './Posts';
import Attachments from './FileAttachment';


const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});



function Post({
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
       
          {files?.length > 0 && (
            <div className="mt-2 h-[250px] md:h-[320px]">
              <Attachments attachments={files} />
            </div>
          )}
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


export default Post 