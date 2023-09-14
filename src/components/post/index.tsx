import Image from "next/image";
import Link from "next/link";
import { api } from "~/utils/api";
import { ProfileImage } from "../ProfileImage";
import { CommentButton, HeartButton, RePostButton } from "./Buttons";
import { Post } from "./Posts";
import Attachments from "./FileAttachment";
import Modal from "../Modal";
import { useState, useRef, useEffect } from "react";
import CommentModal from "./CommentModal";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { isDark } from "../DarkSwitch";
import { useSession } from "next-auth/react";
import { AiFillEdit } from "react-icons/ai";
import { AiOutlineRetweet } from "react-icons/ai";
import RepostModal from "./RepostModal";

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const yourDivRef = useRef<HTMLDivElement | null>(null); // Ref for the div whose height you want to set
  const scrollHeightRef = useRef<HTMLDivElement | null>(null); // Ref for the element whose scroll height you want to measure

  useEffect(() => {
    // Ensure that both refs exist before proceeding
    if (yourDivRef.current && scrollHeightRef.current) {
      // Get the scroll height of the other element
      const scrollHeight = scrollHeightRef.current.clientHeight ;

      // Set the height of your div to match the scroll height
      yourDivRef.current.style.height = `${scrollHeight}px`;
    }
  }, []); 
  const session = useSession();

  const {
    id,
    user,
    content,
    createdAt,
    likeCount,
    likedByMe,
    files,
    commentCount,
    repostCount,
    commentTO,
    repostTo,
  } = post;
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

  const createPost = api.post.create.useMutation({
    onSuccess: ({ post: newPost }) => {
      if (session.status !== "authenticated") return;
      trpcUtils.post.infiniteFeed.setInfiniteData({}, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;

        oldData.pages.map((page, index) => {
          page.posts.map((post) => {
            if (post.id === id) {
              post.comments = [
                ...post.comments,
                {
                  id: newPost.id,
                  content: newPost.content,
                  createdAt: newPost.createdAt,
                  files: newPost.files,
                  likeCount: 0,
                  commentCount: 0,
                  repostCount: 0,
                  likedByMe: false,
                  user: newPost.user,
                },
              ];
              post.repostCount++;
            }
          });
        });

        const newCachePost = {
          ...newPost,
          likeCount: 0,
          commentCount: 0,
          repostCount: 0,
          likedByMe: false,
          user: {
            id: session.data.user?.id,
            name: session.data.user.name || null,
            image: session.data.user.image || null,
            username: session.data.user.username || null,
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          files: newPost.files,
          isComment: true,
          commentTO: {
            ...newPost.commentTO,
            likeCount: newPost.commentTO?._count.likes ?? 0,
            commentCount: newPost.commentTO?._count.comments ?? 0,
            repostCount: newPost.commentTO?._count.reposts ?? 0,
            likedByMe: false,
            content: newPost.commentTO?.content as string,
            id: newPost.commentTO?.id as string,
            createdAt: newPost.commentTO?.createdAt as Date,

            user: {
              image: newPost.commentTO?.user!.image as string | null,
              id: newPost.commentTO?.user.id as string,
              name: newPost.commentTO?.user.name as string | null,
              username: newPost.commentTO?.user.username as string | null,
            },
            files: newPost.commentTO?.files.map((file) => {
              return {
                id: file.id,
                width: file.width,
                url: file.url,
                height: file.height,
                size: file.size,
                name: file.name,
              };
            }),
          },
          comments: newPost.comments.map((comment) => {
            return {
              ...comment,
              likeCount: comment._count.likes,
              commentCount: comment._count.comments,
              repostCount: comment._count.reposts,
              likedByMe: false,
              content: comment.content as string,
              user: {
                image: comment.user.image,
                id: comment.user.id,
                name: comment.user.name,
                username: comment.user.username,
              },
              files: comment.files.map((file) => {
                return {
                  id: file.id,
                  width: file.width,
                  url: file.url,
                  height: file.height,
                  size: file.size,
                  name: file.name,
                };
              }),
            };
          }),
          repostTo: {
            ...newPost.repostTo,
            likeCount: newPost.repostTo?._count.likes ?? 0,
            commentCount: newPost.repostTo?._count.comments ?? 0,
            repostCount: newPost.repostTo?._count.reposts ?? 0,
            likedByMe: false,
            content: newPost.repostTo?.content as string,
            id: newPost.repostTo?.id as string,
            createdAt: newPost.repostTo?.createdAt as Date,

            user: {
              image: newPost.repostTo?.user.image as string | null,
              id: newPost.repostTo?.user.id as string,
              name: newPost.repostTo?.user.name as string | null,
              username: newPost.repostTo?.user.username as string | null,
            },
            files: newPost.repostTo?.files.map((file) => {
              return {
                id: file.id,
                width: file.width,
                url: file.url,
                height: file.height,
                size: file.size,
                name: file.name,
              };
            }),
          },
          reposts: newPost.reposts.map((comment) => {
            return {
              ...comment,
              likeCount: comment._count.likes,
              commentCount: comment._count.comments,
              repostCount: comment._count.reposts,
              likedByMe: false,
              content: comment.content as string,
              user: {
                image: comment.user.image,
                id: comment.user.id,
                name: comment.user.name,
                username: comment.user.username,
              },
              files: comment.files.map((file) => {
                return {
                  id: file.id,
                  width: file.width,
                  url: file.url,
                  height: file.height,
                  size: file.size,
                  name: file.name,
                };
              }),
            };
          }),
        };
        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              posts: [newCachePost, ...oldData.pages[0].posts],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });

  function handleToggleLike() {
    toggleLike.mutate({ id });
  }

  const openRepost = Boolean(anchorEl);
  const handleClickRepost = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseRepost = () => {
    setAnchorEl(null);
  };

  const handleRepostDirectly = () => {
    const resp = createPost.mutate({
      isRepost: true,
      OriginalPostId: id,
    });
    handleCloseRepost();
  };


  return (
    <li className="flex flex-col border-b border-gray-700 px-4 py-4 ">
      {!!repostTo?.id && (
        <div className=" flex gap-2 pl-14 text-sm text-green-400">
          <AiOutlineRetweet className="my-auto" /> Reposted
        </div>
      )}
      <div className="flex">
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
            <RepostModal
              originalPost={post}
              handleClose={() => {
                setOpen(false);
              }}
            />
          )}
        </Modal>
        <div className="relative  overflow-hidden ">
          <Link href={`/profiles/${user.id}`}>
            <ProfileImage
              src={user.image}
              className="drop-shadow-white drop-shadow-sm"
            />
          </Link>
          {commentTO?.id && (
            <div
              ref={yourDivRef}
              className="mx-auto  w-[1px] bg-gray-300"
            ></div>
          )}
        </div>

        <div className="ml-2 flex max-w-full flex-grow flex-col">
          <div className="flex gap-1">
            <Link
              href={`/profiles/${user.id}`}
              className="flex justify-start gap-2 "
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

          {!!commentTO?.id && (
            <div
              ref={scrollHeightRef}
              className="my-4 ml-8 flex max-w-[400px] flex-grow flex-col rounded-lg border border-gray-700 px-4 py-2 "
            >
              <div className="flex gap-1">
                <Link
                  href={`/profiles/${user.id}`}
                  className="flex justify-start gap-2"
                >
                  <span className="font-bold outline-none hover:underline focus-visible:underline">
                    {commentTO.user.name}
                  </span>
                  <span className="text-sm text-gray-300">
                    @{commentTO.user.username}
                  </span>
                </Link>
                <span className="text-gray-500">·</span>
                <Link href={`/post/${commentTO.id}`}>
                  <span className="text-gray-500">
                    {formatTimeDifference(commentTO.createdAt)}
                  </span>
                </Link>
              </div>
              <Link href={`/post/${commentTO.id}`} className="w-full ">
                <p className="h-fit w-[90%] whitespace-pre-wrap break-words ">
                  {commentTO.content}
                </p>

                {commentTO.files?.length > 0 && (
                  <div className="mt-2 h-[250px] w-[95%] md:h-[320px]">
                    <Attachments attachments={commentTO.files} />
                  </div>
                )}
              </Link>
            </div>
          )}

          <Link href={`/post/${id}`} className=" overflow-x-hidden w-full max-w-[450px]">
            <p className="!m-0  h-fit w-[90%]  whitespace-pre-wrap break-words ">
              {content}
            </p>

            {files?.length > 0 && (
              <div className="mt-2 h-[250px]  w-[95%] md:h-[320px]">
                <Attachments attachments={files} />
              </div>
            )}
          </Link>
          {!!repostTo?.id && (
            <div className="my-4 ml-8 flex max-w-[400px] flex-grow flex-col rounded-lg border border-gray-700 px-4 py-2 ">
              <div className="flex gap-1">
                <Link
                  href={`/profiles/${user.id}`}
                  className="flex justify-start gap-2"
                >
                  <span className="font-bold outline-none hover:underline focus-visible:underline">
                    {repostTo.user.name}
                  </span>
                  <span className="text-sm text-gray-300">
                    @{repostTo.user.username}
                  </span>
                </Link>
                <span className="text-gray-500">·</span>
                <Link href={`/post/${repostTo.id}`}>
                  <span className="text-gray-500">
                    {formatTimeDifference(repostTo.createdAt)}
                  </span>
                </Link>
              </div>
              <Link href={`/post/${repostTo.id}`} className="w-full ">
                <p className="h-fit w-[87%] whitespace-pre-wrap break-words ">
                  {repostTo.content}
                </p>

                {repostTo.files?.length > 0 && (
                  <div className="mt-2 h-[250px] w-[87%] md:h-[320px]">
                    <Attachments attachments={repostTo.files} />
                  </div>
                )}
              </Link>
            </div>
          )}

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
            <RePostButton
              onClick={handleClickRepost}
              isLoading={toggleLike.isLoading}
              rePostCount={repostCount}
            />
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={openRepost}
              onClose={handleCloseRepost}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
              sx={{
                mt: "1px",
                "& .MuiMenu-paper": {
                  backgroundColor: isDark ? "#202020" : "white",
                  color: isDark ? "white" : "#000000",
                  boxShadow: isDark ? " 0 0 2px 0px rgba(255,255,255,0.8)" : "",
                  padding: "0",
                },
              }}
              // className="dark:bg-black"
            >
              <MenuItem onClick={handleRepostDirectly} className="text-center">
                Repost
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setOpen(true);
                  handleCloseRepost();
                }}
                className="flex gap-2"
              >
                {" "}
                <span>Quote</span>
                <AiFillEdit />
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </li>
  );
}

export default Post;
