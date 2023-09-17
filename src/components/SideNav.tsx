// import { User } from '@prisma/client'
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BiBell, BiHomeCircle, BiSearchAlt2 } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { MdAddTask, MdOutlineMailOutline } from "react-icons/md";
import { VscSignIn, VscSignOut } from "react-icons/vsc";
import { Button } from "./Button";
import { IconHoverEffect } from "./IconHoverEffect";
import { useDarkMode } from "usehooks-ts";
import DarkSwitch from "./DarkSwitch";

// type Props = {}

function SideNav() {
  const session = useSession();
  const router = useRouter();
  const user = session.data?.user;

  return (
    <nav className="fixed top-0 box-border h-screen xl:w-[275px]  w-[88px] grow-0 px-2 py-4 text-black transition-colors  duration-0 dark:text-white ">
      {/* <div className="absolute h-screen w-[1px] bg-green-400 z-10 left-[17px]"></div> */}

      <ul className="flex flex-col items-start gap-3 whitespace-nowrap w-full ">
        <li>
          <Link href="/">
            <IconHoverEffect>
              <span className="flex items-center gap-4">
                <span className="hidden text-lg font-bold xl:inline">
                  SocialSphere
                </span>
              </span>
            </IconHoverEffect>
          </Link>
        </li>
        <li>
          <Link href="/">
            <IconHoverEffect>
              <span className="flex items-center gap-4">
                <BiHomeCircle className="h-8 w-8" />
                <span className="hidden text-lg font-medium xl:inline">
                  Home
                </span>
              </span>
            </IconHoverEffect>
          </Link>
        </li>

        {user && (
          <li>
            <Link href={`/profiles/${user?.id}`}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <BiSearchAlt2 className="h-8 w-8" />
                  <span className="hidden text-lg font-medium xl:inline">
                    Explore
                  </span>
                </span>
              </IconHoverEffect>
            </Link>
          </li>
        )}
        {user && (
          <li>
            <Link href={`/message`}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <MdOutlineMailOutline className="h-8 w-8" />
                  <span className="hidden text-lg font-medium xl:inline">
                    Messages
                  </span>
                </span>
              </IconHoverEffect>
            </Link>
          </li>
        )}
        {user && (
          <li>
            <Link href={`/chats`}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <BiBell className="h-8 w-8" />
                  <span className="hidden text-lg font-medium xl:inline">
                    Notifications
                  </span>
                </span>
              </IconHoverEffect>
            </Link>
          </li>
        )}

        {user && (
          <li>
            <Link href={`/profiles/${user?.id}`}>
              <IconHoverEffect>
                <span className="flex items-center gap-4">
                  <CgProfile className="h-8 w-8" />
                  <span className="hidden text-lg font-medium xl:inline">
                    Profile
                  </span>
                </span>
              </IconHoverEffect>
            </Link>
          </li>
        )}

        {user ? (
          <button onClick={() => void signOut()}>
            <IconHoverEffect>
              <span className="flex items-center gap-4 text-black transition-colors duration-75 dark:text-white">
                <VscSignOut className="h-8 w-8 " strokeWidth="0.25" />
                <span className="hidden text-lg font-medium xl:inline">
                  Log Out
                </span>
              </span>
            </IconHoverEffect>
          </button>
        ) : (
          <Link href={`/enter`}>
            <IconHoverEffect>
              <span className="flex items-center gap-4 text-black transition-colors duration-0 dark:text-white">
                <VscSignIn className="h-8 w-8 " strokeWidth="0.25" />
                <span className="hidden text-lg font-medium xl:inline">
                  Log In
                </span>
              </span>
            </IconHoverEffect>
          </Link>
        )}
        {user && (
          <li className=" ">
            <Button
              type="submit"
              className="hidden w-full py-3 text-xl font-bold xl:inline "
            >
              New Post
            </Button>
            <Button
              type="submit"
              className="px-2 mx-2 py-2 text-xl font-bold xl:hidden "
            >
              <MdAddTask />
            </Button>
          </li>
        )}
        <li className="mt-4 mx-1 ">
          <DarkSwitch small />
        </li>
      </ul>
    </nav>
  );
}

export default SideNav;
