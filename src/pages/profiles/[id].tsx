import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import ErrorPage from "next/error";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import Link from "next/link";
import { IconHoverEffect } from "../../components/IconHoverEffect";
import { VscArrowLeft } from "react-icons/vsc";
import { ProfileImage } from "~/components/ProfileImage";
import { useSession } from "next-auth/react";
import { Button } from "~/components/Button";
import { Posts, Post } from "~/components/post/Posts";

const ProfilePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const profileQuery = api.profile.getById.useQuery({ id });
  const { data: profile } = profileQuery;

  const trpcUtils = api.useContext()
  const toggleFollow = api.profile.toggleFollow.useMutation({
    onSuccess: ({addedFollow}) => {
      trpcUtils.profile.getById.setData({id},(oldData)=>{
        if(oldData==null) return;
        const countModifier = addedFollow?1:-1;
        return{
          ...oldData,
          isFollowing:addedFollow,
          followersCount:oldData.followersCount+countModifier,
        }
      })
    }
  })

  const posts = api.post.infiniteProfileFeed.useInfiniteQuery({userId:id},{getNextPageParam: (lastPage)=>lastPage.nextCursor})

  if (profileQuery.isLoading) return <LoadingSpinner />;
  if (profile == null || profile.name == null) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <>
      <Head>
        <title>{`SocialSphere | ${profile?.name}`}</title>
      </Head>
      <header className="top-0z-10 sticky flex items-center border-b bg-white px-4 py-2">
        <Link href=".." className="mr-2">
          <IconHoverEffect>
            <VscArrowLeft className="h-6 w-6" />
          </IconHoverEffect>
        </Link>
        <ProfileImage src={profile.image} className="flex-shrink-0" />
        <div className="ml-2 flex-grow">
          <h1 className="text-lg font-bold">{profile.name}</h1>
          <div className="text-gray-500">
            {profile.postsCount}{" "}
            {getPlural(profile.postsCount, "Post", "Posts")} -{" "}
            {profile.followersCount}{" "}
            {getPlural(profile.followersCount, "Follower", "Followers")} -{" "}
            {profile.followingCount} Following
          </div>
        </div>
        <FollowButton
          isFollowing={profile.isFollowing}
          isLoading={toggleFollow.isLoading}
          userId={id}
          onClick={() => toggleFollow.mutate({ userId: id })}
        />
      </header>

      <main>
        <Posts
          posts={posts.data?.pages.flatMap((page) => page.posts as Post[])}
          isError={posts.isError}
          isLoading={posts.isLoading}
          hasMore={posts.hasNextPage || false}
          fetchNewPosts={posts.fetchNextPage}
        />
      </main>
    </>
  );
};
export default ProfilePage;

function FollowButton({
  userId,
  isFollowing,
  isLoading,
  onClick,
}: {
  userId: string;
  isFollowing: boolean;
  isLoading: boolean;
  onClick: () => void;
}) {
  const session = useSession();

  if (session.status !== "authenticated" || session.data.user.id === userId) {
    return null;
  }

  return (
    <Button disabled={isLoading} onClick={onClick} small gray={isFollowing}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}

const pluralRules = new Intl.PluralRules();
function getPlural(number: number, singular: string, plural: string) {
  return pluralRules.select(number) === "one" ? singular : plural;
}

// export const getStaticPaths: GetStaticPaths=()=>{
//     return {
//         paths:[],
//         fallback:"blocking"
//         }
// }

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
  await ssg.profile.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}
