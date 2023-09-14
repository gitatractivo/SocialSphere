import { useSession } from "next-auth/react";
import { Button } from "../Button";
import { ProfileImage } from "../ProfileImage";
import {
  FormEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { api } from "~/utils/api";
import { v4 as uuidv4 } from "uuid";
import Attachments from "./Attachments";
import { UploadApiResponse } from "cloudinary";
import { v4 as uuid } from "uuid";
import crypto from "crypto";
import imageCompression from "browser-image-compression";
import { VscDeviceCamera } from "react-icons/vsc";
import { IconHoverEffect } from "../IconHoverEffect";
import { CircularProgress } from "@mui/material";
import { Post } from "./Posts";

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea == null) return;
  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}
// type AttachmentType={
//   id: string,
//           postId: string,
//           fileId: string,
//           createdAt: Date,
//           file: {
//             id: string,
//             type: "IMAGE",
//             url:string,
//             mime: string,
//             name: string,
//             extension: string,
//             size: number,
//             height: number,
//             width: number,
//             createdAt: Date,
// }}

export type FileAndAttachment = { file: File; url: string };

export const CreatePost = ({
  originalPost,
  handleClose,

}: {
  originalPost: Post;
  handleClose: () => void;
}) => {
  const session = useSession();
  if (session.status !== "authenticated") return null;
  const {
    id: originalPostId,
    user,
    content,
    createdAt,
    likeCount,
    likedByMe,
    files,
  } = originalPost;
  return <Form OriginalPostId={originalPostId} handleClose={handleClose} OriginalPost={originalPost} />;
};

function Form({
  OriginalPostId,
  OriginalPost,
  handleClose,
}: {
  OriginalPostId: string;
  OriginalPost: Post;
  handleClose: () => void;
}) {
  const session = useSession();
  const [inputValue, setInputValue] = useState("");
  const [previewAttachments, setPreviewAttachments] = useState<
    FileAndAttachment[]
  >([]);
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  if (session.status !== "authenticated") return null;

  const trpcUtils = api.useContext();

  const createPost = api.post.create.useMutation({
    onSuccess: ({ post: newPost }) => {
      setInputValue("");
      setPreviewAttachments([]);
      handleClose();

      if (session.status !== "authenticated") return;
      trpcUtils.post.infiniteFeed.setInfiniteData({}, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;

        oldData.pages.map((page, index) => {
          page.posts.map((post) => {
            if (post.id === OriginalPostId) {
              post.comments = [
                ...post.comments,
                {
                  id:newPost.id,
                  content: newPost.content,
                  createdAt: newPost.createdAt,
                  files: newPost.files,
                  likeCount:0,
                  commentCount:0,
                  repostCount:0,
                  likedByMe:false,
                  user: newPost.user,
                  
                },
              ];
              post.commentCount++;
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

  const getDetails = api.post.getDetails.useQuery();

  async function compress(imageFile: File) {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(imageFile, options);

      return compressedFile; // write your own logic
    } catch (error) {
      console.log(error);
      return imageFile;
    }
  }

  const url = `https://api.cloudinary.com/v1_1/${
    getDetails?.data?.cloudName as string
  }/upload`;

  const upload = async (attachment: FileAndAttachment) => {
    const formData = new FormData();
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const publicId = uuid() + attachment.file.name;
    // const signature = generateSignature(timestamp,publicId,apiSecret,apiKey);
    const file = await compress(attachment.file);

    formData.append("folder", "SocialSphere/Post");
    formData.append("upload_preset", "srmau0vz");
    formData.append("api_key", getDetails?.data?.apiKey as string);
    formData.append(`file`, file);
    formData.append(`public_id`, publicId);
    // formData.append(`signature`, signature);
    // formData.append(`timestamp`, timestamp);

    const resp = await fetch(url, {
      method: "POST",
      body: formData,
    });

    return resp.json();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const files = await Promise.all(
      previewAttachments.map((attachment) => upload(attachment))
    );

    createPost.mutate({
      content: inputValue,
      files,
      isComment: true,
      OriginalPostId,
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPreviewAttachments = [];

      for (const file of e.target.files) {
        const url = URL.createObjectURL(file);
        newPreviewAttachments.push({
          file,
          url,
        });
      }

      setPreviewAttachments([...previewAttachments, ...newPreviewAttachments]);
    }
  };

  const onRemoveFile = (attachment: FileAndAttachment) => {
    const newPreviewAttachments = previewAttachments.filter(
      (a) => a.url !== attachment.url
    );
    setPreviewAttachments(newPreviewAttachments);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Check if the input value exceeds the maximum character limit (266)
    if (newValue.length <= 266) {
      setInputValue(newValue);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-2  py-2"
    >
      <div className="flex gap-2">
        <ProfileImage src={session.data.user.image} />
        <div className="flex max-h-[424px] w-full flex-col gap-1 overflow-y-scroll">
          <textarea
            ref={inputRef}
            style={{ height: "0px" }}
            className="text-md flex-grow resize-none  overflow-hidden border-none bg-white p-1 pl-0 outline-none ring-transparent transition-colors duration-300 dark:bg-black"
            placeholder="Add a comment"
            value={inputValue}
            onChange={handleChange}
          />
          {previewAttachments.length > 0 && (
            <div className="h-[180px] w-11/12 md:h-[200px]">
              <Attachments
                onRemoveAttachment={onRemoveFile}
                attachments={previewAttachments}
              />
            </div>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          multiple
          ref={imgInputRef}
          id=""
          onChange={onFileChange}
        />
      </div>

      <div className="mt-2 flex justify-between">
        <div className="flex w-[70%] justify-stretch">
          <button type="button" onClick={() => imgInputRef.current?.click()}>
            <IconHoverEffect>
              <VscDeviceCamera />
            </IconHoverEffect>
          </button>
        </div>

        <div className="flex gap-3">
          <CircularProgress
            variant="determinate"
            value={(inputValue.length / 265) * 100}
            size={20}
            className="my-auto"
          />

          <Button type="submit" className="min-w-[6rem] self-end px-4" small>
            {createPost.isLoading ? (
              <CircularProgress
                size={20}
                style={{
                  color: "white",
                }}
                className="my-auto"
              />
            ) : (
              "Comment"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export type RemoveAttachmentType = (attachment: FileAndAttachment) => void;
