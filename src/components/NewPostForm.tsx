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

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea == null) return;
  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}

export const NewPostForm = () => {
  const session = useSession();
  if (session.status !== "authenticated") return null;

  return <Form />;
};

function Form() {
  const session = useSession();
  const [inputValue, setInputValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  if (session.status !== "authenticated") return null;

  const createPost = api.post.create.useMutation({
    onSuccess: (newPost) => {
      console.log(newPost);

      setInputValue("")
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createPost.mutate({ content: inputValue });
  }

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
      </div>
      <Button className="self-end">New Post</Button>
    </form>
  );
}
