import classNames from "classnames";
import { FileAndAttachment, RemoveAttachmentType } from "./NewPostForm";
import { Button } from "./Button";
import { VscClose } from "react-icons/vsc";
import Image from "next/image";

const Attachments: React.FC<{
  attachments: FileAndAttachment[];
  onRemoveAttachment?: RemoveAttachmentType;
}> = ({ attachments, onRemoveAttachment }) => {
  const className = classNames("grid b-2 b-slate-900 gap-2 w-full h-full", {
    "grid-rows-1": attachments.length <= 2,
    "grid-rows-2": attachments.length > 2,
    "grid-cols-1": attachments.length === 1,
    "grid-cols-2": attachments.length > 1,
  });

  return (
    <div className={className as string | undefined}>
      {attachments.map((attachment, i) => (
        <Attachment
          attachment={attachment}
          fill={attachments.length === 3 && i === 0}
          onRemoveAttachment={onRemoveAttachment}
          key={attachment.url}
        />
      ))}
    </div>
  );
};

export const Attachment: React.FC<{
  attachment: FileAndAttachment;
  fill: boolean;
  onRemoveAttachment?: RemoveAttachmentType;
}> = ({ attachment, fill, onRemoveAttachment }) => {
  const className = classNames("overflow-hidden rounded-lg shadow relative ", {
    "row-span-2": fill,
  });

  return (
    <div className={className}>
      {onRemoveAttachment && (
        <div className="absolute right-1 top-2 ">
          <Button onClick={() => onRemoveAttachment(attachment)}>
            <VscClose />
          </Button>
        </div>
      )}
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
