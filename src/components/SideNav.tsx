// import { User } from '@prisma/client'
import Link from "next/link";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

// type Props = {}

function SideNav() {
  const session = useSession();
  const user = session.data?.user;
  return (
    <nav className="sticky top-0 px-2 py-4">
      <ul className="flex flex-col items-start gap-2 whitespace-nowrap">
        <li>
          <Link href="/">Home</Link>
        </li>
        {user && (
          <li>
            <Link href={`/profiles/${user?.id}`}>Profile</Link>
          </li>
        )}
        {user ? (
          <button onClick={() => void signOut()}>Log Out</button>
        ) : (
          <button onClick={() => void signIn()}>Log In</button>
        )}
      </ul>
    </nav>
  );
}

export default SideNav;
