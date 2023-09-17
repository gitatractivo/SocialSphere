import { useSession } from 'next-auth/react';
import React from 'react'



const Message = () => {
    const session = useSession();
  return (
    <div className="max-w-[600px]flex  box-border w-full   gap-0 ">
      <div className="mx-auto box-border max-w-[600px] border-x border-gray-700 min-h-screen sm:mx-0 ">
        <div className="sticky top-0 z-10  backdrop-blur-2xl transition-colors duration-200 dark:backdrop-blur-xl dark:backdrop-brightness-90  ">
          <header className="  h-[50px]  flex justify-between  pt-2 " >
            <h1 className=" mb-2 px-4 text-lg font-bold text-black transition-colors duration-0 dark:text-white">
              Messages
            </h1>
          </header>
          
        </div>
        
      </div>
      <div className="hidden lg:flex "></div>
    </div>
  );
}

export default Message