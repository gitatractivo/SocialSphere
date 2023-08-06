import { useSession } from "next-auth/react";
import { Button } from "./Button";
import { ProfileImage } from "./ProfileImage";
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
import { IconHoverEffect } from './IconHoverEffect';

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

export const NewPostForm = () => {
  const session = useSession();
  if (session.status !== "authenticated") return null;

  return <Form />;
};

function Form() {
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
      console.log("fileResp", newPost);
      setInputValue("");
      setPreviewAttachments([]);

      if (session.status !== "authenticated") return;
      trpcUtils.post.infiniteFeed.setInfiniteData({}, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;

        const newCachePost = {
          ...newPost,
          likeCount: 0,
          commentCount:0,
          repostCount:0,
          likedByMe: false,
          user: {
            id: session.data.user.id,
            name: session.data.user.name || null,
            image: session.data.user.image || null,
          },
          files: newPost.files,
          // fil
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

  async  function compress(imageFile: File) {
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
  }/image/upload`;

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
    console.log(files);

    createPost.mutate({ content: inputValue, files });
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

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-2 border-b px-4 py-2"
    >
      <div className="flex gap-4">
        <ProfileImage src={session.data.user.image} />
        <textarea
          ref={inputRef}
          style={{ height: "0px" }}
          className="flex-grow resize-none overflow-hidden  p-4 text-lg outline-none"
          placeholder="What's Happening?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <input
          type="file"
          className="hidden"
          multiple
          ref={imgInputRef}
          id=""
          onChange={onFileChange}
        />
      </div>
      {previewAttachments.length > 0 && (
        <Attachments
          onRemoveAttachment={onRemoveFile}
          attachments={previewAttachments}
        />
      )}
      <div className="flex justify-between">
        <div className="flex w-[70%] justify-stretch">
          <button type="button" onClick={() => imgInputRef.current?.click()}>
            <IconHoverEffect>
              <VscDeviceCamera />
            </IconHoverEffect>
          </button>
        </div>

        <Button type="submit" className="self-end">
          New Post
        </Button>
      </div>
    </form>
  );
}

export type RemoveAttachmentType = (attachment: FileAndAttachment) => void;
