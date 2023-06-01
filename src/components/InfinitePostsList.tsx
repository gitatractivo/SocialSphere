import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
type Post = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    image: string | null;
    id: string;
    name: string | null;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

type InfiniteTweetListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean ;
  fetchNewPosts: () => Promise<unknown>;
  posts?: Post[];
};

export const InfinitePostsList = ({isError,isLoading,hasMore,fetchNewPosts,posts}: InfiniteTweetListProps) => {
  if (isError) return <h1>Error</h1>
  if (isLoading) return <h1>Loading...</h1>
  if(posts==null || posts.length===0) return <h2 className='my-4 text-center text-2xl text-gray-500'>No Posts Found</h2>
  return (
    <ul>
      <InfiniteScroll next={fetchNewPosts} hasMore={hasMore}  loader={"Loading"} dataLength={posts.length} >
        {posts.map((post,index) => (
          <div key={post.id}>{post.content}</div>
        ))}
      </InfiniteScroll>
    </ul>
  )
}

