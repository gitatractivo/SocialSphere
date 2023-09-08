// import { User } from '@prisma/client'
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BiBell, BiHomeCircle, BiSearchAlt2 } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { MdOutlineMailOutline } from "react-icons/md";
import { VscSignIn, VscSignOut } from "react-icons/vsc";
import { Button } from "./Button";
import { IconHoverEffect } from "./IconHoverEffect";
import { useDarkMode } from "usehooks-ts";
import DarkSwitch from "./DarkSwitch";

// type Props = {}




function SideNav() {
  const session = useSession();
  const router = useRouter()
  const user = session.data?.user;

  
  return (
    <nav className="sticky top-0 h-screen w-[260px] max-w-[320px] border-l-2  px-2 py-4 ">
      {/* <div className="absolute h-screen w-[1px] bg-green-400 z-10 left-[17px]"></div> */}

      <ul className="flex flex-col items-start gap-3 whitespace-nowrap ">
        <li>
          <Link href="/">
            <IconHoverEffect>
              <span className="flex items-center gap-4">
                <span className="hidden text-lg font-bold md:inline">
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
                <span className="hidden text-lg font-medium md:inline">
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
                  <span className="hidden text-lg font-medium md:inline">
                    Explore
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
                  <MdOutlineMailOutline className="h-8 w-8" />
                  <span className="hidden text-lg font-medium md:inline">
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
                  <span className="hidden text-lg font-medium md:inline">
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
                  <span className="hidden text-lg font-medium md:inline">
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
              <span className="flex items-center gap-4">
                <VscSignOut className="h-8 w-8 " stroke-width="0.25" />
                <span className="hidden text-lg font-medium md:inline">
                  Log Out
                </span>
              </span>
            </IconHoverEffect>
          </button>
        ) : (
          <Link href={`/enter`}>
            <IconHoverEffect>
              <span className="flex items-center gap-4">
                <VscSignIn className="h-8 w-8 " stroke-width="0.25" />
                <span className="hidden text-lg font-medium md:inline">
                  Log In
                </span>
              </span>
            </IconHoverEffect>
          </Link>
        )}
        {user && (
          <li className="mx-auto w-11/12 my-2">
            <Button type="submit" className="w-full py-3 text-xl font-bold ">
              New Post
            </Button>
          </li>
        )}
          <li className="mx-auto w-11/12 my-2">
            <DarkSwitch />
          </li>
        
      </ul>
    </nav>
  );
}

export default SideNav;
