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
// import { v4 as uuidv4 } from 'uuid';

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

type FileAndAttachment = { file: File;url: string  };



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
  const imgInputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  if (session.status !== "authenticated") return null;

  const trpcUtils = api.useContext();

  const createPost = api.post.create.useMutation({
    onSuccess: (newPost) => {
      setInputValue("");

      if (session.status !== "authenticated") return;
      trpcUtils.post.infiniteFeed.setInfiniteData({}, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;

        const newCachePost = {
          ...newPost,
          likeCount: 0,
          commentCount:0,
          likedByMe: false,
          user: {
            id: session.data.user.id,
            name: session.data.user.name || null,
            image: session.data.user.image || null,
          },
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createPost.mutate({ content: inputValue });
  }


  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPreviewAttachments = [];

      for (const file of e.target.files) {
        
        const url= URL.createObjectURL(file);
        newPreviewAttachments.push({
          file,
          url,
        });
      }

      setPreviewAttachments([...previewAttachments, ...newPreviewAttachments]);
    }
  };
  console.log(previewAttachments,"attachments array")


  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-b px-4 py-2"
    >
      <div className="flex gap-4">
        <ProfileImage src={session.data.user.image} />
        <textarea
          ref={inputRef}
          style={{ height: "0px" }}
          className="p--4 flex-grow resize-none overflow-hidden text-lg outline-none"
          placeholder="What's Happening?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          
        />
        <input type="file" className="invisible" multiple ref={imgInputRef} id=""  onChange={onFileChange}/>
          <Button onClick={()=>imgInputRef.current?.click()}>Images</Button>
      </div>
      {
        previewAttachments.length>0 && (
          null
        )
      }
      <Button className="self-end">New Post</Button>
    </form>
  );
}
