import InfiniteScroll from "react-infinite-scroll-component";

import PostCard from ".";
import { LoadingSpinner } from "../LoadingSpinner";



export type File = {
  id: string;
  name: string;
  url: string;
  size: number;
  height: number | null;
  width: number | null;
};


export type Post = {
  id: string;
  content?: string;
  createdAt: Date;
  user: {
    image: string | null;
    id: string;
    name: string | null;
    username: string | null;
  };
  likeCount: number;
  commentCount: number;
  repostCount: number;
  likedByMe: boolean;
  files: File[];
  commentTO?: OtherPost | null;
  comments: OtherPost[];
};

type OtherPost ={
    id: string,
    content?: string;
    createdAt: Date;
    user: {
      image: string | null;
      id: string;
      name: string | null;
      username: string | null;
    };
    likeCount: number;
    commentCount: number;
    repostCount: number;
    likedByMe: boolean;
    files: File[];
 
}

type PostListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  fetchNewPosts: () => Promise<unknown>;
  posts?: Post[];
};

export const Posts = ({
  isError,
  isLoading,
  hasMore,
  fetchNewPosts,
  posts,
}: PostListProps) => {
  if (isError) return <h1>Error</h1>;
  if (isLoading) return <LoadingSpinner />;
  if (posts == null || posts.length === 0)
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">
        No Posts Found
      </h2>
    );
  return (
    <ul>
      <InfiniteScroll
        next={fetchNewPosts}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
        dataLength={posts.length}
        className="max-w-full"
      >
        {posts.map((post, index) => (
          <PostCard  key={post.id} {...post} />
        ))}
      </InfiniteScroll>
    </ul>
  );
};



