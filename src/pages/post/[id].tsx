import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import React from "react";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import ErrorPage from 'next/error';
import Link from "next/link";
import { ProfileImage } from "~/components/ProfileImage";
import Image from "next/image";
import { File } from "~/components/post/Posts";
import { HeartButton } from "~/components/post/Buttons";





const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});
const PostPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
    const postQuery = api.post.getById.useQuery({id})
    const {data:post} =postQuery
  const trpcUtils = api.useContext();
  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess:({addedLike})=>{
        trpcUtils.post.getById.setData({id},(oldData)=>{
            if(oldData==null)return;
            const countModifier = addedLike?1:-1;
            return {
                ...oldData,
                _count:{
                    ...oldData._count,
                    likes:oldData._count.likes + countModifier
                },
                isLiked:addedLike
            }
        })
    }
  })


  if(post==null)    return<ErrorPage statusCode={404} title="Post Not Found" withDarkMode={true}/>


   function handleToggleLike() {
     toggleLike.mutate({ id });
   }





  return (
    <div className="flex">
      <Link href={`/profiles/${post.user.id}`}>
        <ProfileImage src={post.user.image} />
      </Link>

      <div className="ml-2 flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${post.user.id}`}
            className="font-bold outline-none hover:underline focus-visible:underline"
          >
            {post.user.name}
          </Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">
            {dateTimeFormatter.format(post.createdAt)}
          </span>
        </div>
        <Link href={`/post/${id}`}>
          <p className="whitespace-pre-wrap">{post.content}</p>
          <p className="flex gap-4">
            {post.files?.length > 0 &&
              post.files?.map((fileN:File) => {
                return (
                  <Image
                    src={fileN.url}
                    alt={fileN.name}
                    width={500}
                    height={500}
                    key={fileN.id}
                    className="rounded-lg"
                  />
                );
              })}
          </p>
        </Link>
        <HeartButton
          onClick={handleToggleLike}
          isLoading={toggleLike.isLoading}
          likedByMe={post.isLiked}
          likeCount={post._count.likes}
        />
      </div>
    </div>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>
) {
  const id = context.params?.id;
  if (id == null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const ssg = ssgHelper();
  await ssg.post.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}
export default PostPage;
