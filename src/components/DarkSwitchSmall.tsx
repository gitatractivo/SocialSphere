import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Button } from "@mui/material";
import React from "react";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";



const DarkSwitch = ({
  checked,
  handleChange,
}: {
  checked: boolean;
  handleChange: () => void;
}) => {
  return (
    <Button onClick={handleChange}>
      {checked ? (
        <Brightness7Icon />
      ) : (
        <Brightness4Icon />
      )}
    </Button>
  );
};

export default DarkSwitch;
