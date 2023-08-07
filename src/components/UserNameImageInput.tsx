import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "react-image-crop/dist/ReactCrop.css";
import {
  FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AVAILABLE } from "./SIgnUp";
import imageCompression from "browser-image-compression";
import Input from "./Input";
import { Button } from "./Button";
import { api } from "~/utils/api";
import { v4 as uuid } from "uuid";
import clsx from "clsx";
import { CiCircleCheck, CiCircleRemove } from "react-icons/ci";
import { AiFillCamera } from "react-icons/ai";
import { ImCross ,ImCheckmark } from "react-icons/im";
import { Avatar, Backdrop, Box, CircularProgress, Fade, Modal } from "@mui/material";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from "react-image-crop";
import { FileAndAttachment } from "./NewPostForm";
import { IFile } from "~/utils/types";

type Variant = "LOGIN" | "REGISTER";
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function UserNameImageInput() {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);
  const [available, setAvailable] = useState<(typeof AVAILABLE)[number]>(null);
  const [username, setUsername] = useState(session.data?.user.username as string);
  const [userImage, SetuserImage] = useState(session.data?.user.image);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [imgSrc, setImgSrc] = useState("");
  const [open, setOpen] = useState(false);
  const [imageCHange, setImageCHange] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null);

  // Call useQuery directly inside the component
  const resp = api.profile.findUsernameExists.useQuery({ ...(!!username?{username}:{}) });

  useEffect(() => {
    if (!username) {
      setAvailable(null);
      return;
    }

    username && !(username.length < 6) && setAvailable("Loading");

    resp.data && username && setAvailable(resp.data?.result.usernameAvailable);
  }, [username, resp]);

  const { mutateAsync, mutate } =
    api.profile.createUsernameOrImage.useMutation();
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (1) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, 1));
    }
  }
 

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
        setOpen(true)
      });
      reader.readAsDataURL(e?.target?.files[0] as File);
    }
  };

 const handleCheck = (e: React.MouseEvent<HTMLButtonElement>) => {
   if (completedCrop?.width && completedCrop?.height) {
     const canvas = document.createElement("canvas");
     const image = new Image();
     image.src = imgSrc;

     canvas.width = completedCrop.width;
     canvas.height = completedCrop.height;

     const ctx = canvas.getContext("2d");
     if (ctx && completedCrop.width && completedCrop.height) {
       // Calculate the actual size of the image
       const actualWidth = imgRef.current?.naturalWidth || completedCrop.width;
       const actualHeight =
         imgRef.current?.naturalHeight || completedCrop.height;

       // Calculate the scale factor based on the actual size and displayed size
       const scaleX = actualWidth / (imgRef.current?.width || 1);
       const scaleY = actualHeight / (imgRef.current?.height || 1);

       ctx.drawImage(
         image,
         completedCrop.x * scaleX,
         completedCrop.y * scaleY,
         completedCrop.width * scaleX,
         completedCrop.height * scaleY,
         0,
         0,
         completedCrop.width,
         completedCrop.height
       );

       const croppedImage = canvas.toDataURL("image/jpeg");

       // Set the cropped image to the userImage state
       SetuserImage(croppedImage);

       // Close the modal after cropping
       setOpen(false);
       setImageCHange(true)
     }
   }
 };


  const handleCross = (e: React.MouseEvent<HTMLButtonElement>) => {
    setImgSrc( "");
    setOpen(false);
  };



  const getDetails = api.post.getDetails.useQuery();

  const url = `https://api.cloudinary.com/v1_1/${
    getDetails?.data?.cloudName as string
  }/image/upload`;
  

  const upload = async (attachment: Blob) => {
    const formData = new FormData();
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const publicId = uuid() + (session?.data?.user?.name as string);
    // const signature = generateSignature(timestamp,publicId,apiSecret,apiKey);
    // const file = await compress(attachment);

    formData.append("folder", "SocialSphere/Post");
    formData.append("upload_preset", "srmau0vz");
    formData.append("api_key", getDetails?.data?.apiKey as string);
    formData.append(`file`, attachment);
    formData.append(`public_id`, publicId);
    // formData.append(`signature`, signature);
    // formData.append(`timestamp`, timestamp);

    const resp = await fetch(url, {
      method: "POST",
      body: formData,
    });

    return resp.json();
  };



  const onSubmit =  async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let attactment:IFile | undefined
    if(imageCHange){
      const imageBlob = await fetch(userImage as string).then((res) =>
        res.blob()
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      attactment = await upload(imageBlob);
    }
    if(!username){
      alert("Username Required")
      return;
    }


    const resp = await mutateAsync({
      ...(username===session.data?.user.username?{username}:{}),
      userId:session.data?.user.id as string,
      ...(!!attactment && imageCHange ? { image: attactment } : {}),
    });
    if(resp.status===201){
      const result=resp.result;
      void session.update({username:result.username,image:result.image})
    }

    
    
  };

  const style = {
    position: "absolute" ,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // width: 400,
    bgcolor: "background.paper",
    borderRadius:1,
    boxShadow: 24,
    p: 4,
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        className="
        bg-white
          px-4
          py-8
          shadow
          sm:rounded-lg
          sm:px-10
        "
      >
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
          className="h-screen w-screen"
        >
          <Fade in={open}>
            <Box sx={style} className=" h-fit w-fit ">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                // style={{ cursor: "crosshair" }}
                keepSelection
                className="relative"
                ruleOfThirds
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{ transform: `scale(${scale}) ` }}
                  // width={1000}
                  // height={1000}
                  onLoad={onImageLoad}
                />
                <div className="absolute right-3 top-3 z-50 flex flex-col justify-center gap-3">
                  <button onClick={handleCross} className="bg-slate-100 p-2">
                    <ImCross />
                  </button>
                  <button onClick={handleCheck} className="bg-slate-100 p-2">
                    <ImCheckmark />
                  </button>
                </div>
              </ReactCrop>
            </Box>
          </Fade>
        </Modal>
        <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <div className="my-6">
            <div className="relative mx-auto h-28 w-28 rounded-full">
              {!!userImage ? (
                <img
                  src={userImage}
                  alt=""
                  className="h-full w-full rounded-full"
                  // width={112}
                  // height={112}
                />
              ) : (
                <Avatar
                  className="h-full w-full"
                  sx={{ width: 112, height: 112 }}
                >
                  <AiFillCamera size={48} />
                </Avatar>
              )}
              <input
                type="file"
                accept="image/*,capture=camera"
                className="absolute bottom-0 left-0 right-0 top-0 h-full w-full rounded-full opacity-0"
                onChange={handlePhotoUpload}
              />
            </div>
          </div>

          <div>
            <label
              className="
          block 
          text-sm 
          font-medium 
          leading-6 
          text-gray-900
        "
            >
              {"Username"}
            </label>
            <div
              className={clsx(
                `form-input group 
          mt-1     
          flex  
            w-full 
            justify-stretch 
            rounded-md 
            border-0 
            px-3
            py-1 
            text-gray-900 
            shadow-sm 
            ring-1 
            ring-inset 
            ring-gray-300 
            placeholder:text-gray-400 
            
            sm:text-sm 
            sm:leading-6 `
              )}
            >
              <input
                type="text"
                // autoComplete={id}
                disabled={isLoading}
                placeholder={"Username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={clsx(
                  `
            form-input
            block 
            w-full 
            rounded-md 
            border-none 
            py-1.5
            text-gray-900 
            outline-none 
            placeholder:text-gray-400 
            focus:ring-inset 
            focus:ring-sky-600 
            group-focus:ring-2 
            sm:text-sm 
            sm:leading-6`
                )}
              />

              {available === true ? (
                <CiCircleCheck
                  className="stroke-custom my-auto h-7 w-7 fill-green-700  transition duration-200 "
                  size={20}
                />
              ) : available === "Loading" ? (
                <CircularProgress
                  size={20}
                  className="my-auto transition duration-200 "
                />
              ) : available === false ? (
                <CiCircleRemove
                  className="stroke-custom my-auto h-7 w-7 fill-green-700 transition duration-200"
                  size={20}
                />
              ) : null}
            </div>
          </div>

          <div>
            <Button
              disabled={isLoading}
              className="my-4"
              fullWidth
              type="submit"
            >
              {"Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
