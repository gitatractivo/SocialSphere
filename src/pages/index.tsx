import { NextPageContext, type NextPage } from "next";
import { CreatePost } from "~/components/post/CreatePost";
import { getSession, useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useState } from "react";
import { Posts, Post } from "~/components/post/Posts";
import { toast } from "react-hot-toast";
import cn from "~/utils/cn";

const TABS = ["Recent", "Following"] as const;

const Home: NextPage = () => {
  const [selectedTab, setSelectedTab] =
    useState<(typeof TABS)[number]>("Recent");
  const session = useSession();
  // toast.success("hello")

  return (
    <div className="max-w-[600px]flex  box-border w-full   gap-0 ">
      <div className="mx-auto box-border max-w-[600px] border-x border-gray-700  sm:mx-0 ">
        <div className="sticky top-0 z-10  backdrop-blur-2xl transition-colors duration-200 dark:backdrop-blur-xl dark:backdrop-brightness-90  ">
          <header className="  h-[50px]    pt-2 ">
            <h1 className=" mb-2 px-4 text-lg font-bold text-black transition-colors duration-0 dark:text-white">
              Home
            </h1>
          </header>
          {session.status === "authenticated" &&
            !!session.data.user.username && (
              <div className="flex   transition-colors  duration-0  ">
                {TABS.map((tab) => {
                  return (
                    <button
                      key={tab}
                      className={`flex-grow p-2 dark:hover:bg-gray-900 hover:bg-gray-200 focus-visible:bg-gray-200 ${
                        tab === selectedTab
                          ? "border-b-4 border-blue-500 font-bold "
                          : "border-b border-gray-700"
                      }`}
                      onClick={() => setSelectedTab(tab)}
                    >
                      {tab}
                      
                    </button>
                  );
                })}
              </div>
            )}
        </div>
        <CreatePost />
        {selectedTab === "Recent" ? <RecentPosts /> : <FollowingPosts />}
      </div>
      <div className="hidden lg:flex "></div>
    </div>
  );
};

function RecentPosts() {
  const posts = api.post.infiniteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  console.log({ posts });

  return (
    <Posts
      posts={posts.data?.pages.flatMap((page) => page.posts as Post[])}
      isError={posts.isError}
      isLoading={posts.isLoading}
      hasMore={posts.hasNextPage || false}
      fetchNewPosts={posts.fetchNextPage}
    />
  );
}

function FollowingPosts() {
  const posts = api.post.infiniteFeed.useInfiniteQuery(
    { onlyFollowing: true },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <Posts
      posts={posts.data?.pages.flatMap((page) => page.posts as Post[])}
      isError={posts.isError}
      isLoading={posts.isLoading}
      hasMore={posts.hasNextPage || false}
      fetchNewPosts={posts.fetchNextPage}
    />
  );
}

export default Home;

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  return {
    props: {
      session,
    },
  };
}
