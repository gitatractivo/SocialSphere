import classNames from "classnames";
import Image from "next/image";
import { File } from "./Posts";

const Attachments: React.FC<{
  attachments: File[];
}> = ({ attachments,  }) => {
  const className = classNames(
    "grid  b-2 b-slate-900 border-[0.25px] border-gray-700 overflow-hidden gap-[4px] rounded-xl  w-full h-full",
    {
      "grid-rows-1": attachments.length <= 2,
      "grid-rows-2": attachments.length > 2,
      "grid-cols-1": attachments.length === 1,
      "grid-cols-2": attachments.length > 1,
    }
  );

  return (
    <div className={className as string | undefined}>
      {attachments.map((attachment, i) => (
        <Attachment
          attachment={attachment}
          fill={attachments.length === 3 && i === 0}
          key={attachment.url}
        />
      ))}
    </div>
  );
};

export const Attachment: React.FC<{
  attachment: File;
  fill: boolean;
}> = ({ attachment, fill }) => {
  const className = classNames("  border-[0.25px] border-gray-900 ", {
    "row-span-2": fill,
  });

  return (
    <div className={className}>
      
      <Image
        className="h-full w-full object-cover "
        alt="Attachment"
        src={attachment.url}
        width={500}
        height={500}
      />
    </div>
  );
};

export default Attachments;
