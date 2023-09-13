import { Backdrop, Box, Modal } from "@mui/material";
import { ReactElement } from "react";
import cn from "~/utils/cn";

type Props = {
  open: boolean;
  handleClose: () => void;
  label?: string;
  children: ReactElement;
  classes?:string;
};

const style = {
  position: "absolute",
  top: "450px",
  bottom:"0%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  //   bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const BasicModal = ({ open, handleClose, label, children ,classes }: Props) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          color: "blue",
          sx:{
            color:"fff"
          }
        },
      }}
      aria-labelledby={label}
      aria-describedby={label}
    >
      <Box
        sx={style}
        className={cn(" border-none rounded-xl bg-white h-fit dark:bg-black", classes)}
      >
        {children}
      </Box>
    </Modal>
  );
};

export default BasicModal;
