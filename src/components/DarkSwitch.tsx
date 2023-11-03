import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import DarkSwitchSmall from "./DarkSwitchSmall";
// import { Button } from "@mui/material";
import React from "react";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Button } from "./Button";


// eslint-disable-next-line prefer-const
export let isDark = true;


const DarkSwitch = ({ small = false }: { small?: boolean }) => {
  const [checked, setChecked] = useState<boolean>(true);
  const { systemTheme, theme, setTheme } = useTheme();

  // isDark = checked;

  useEffect(() => {
    if (systemTheme && theme === "system") {
      console.log(systemTheme);
      setChecked(systemTheme === "dark" ?? true);
      return;
    }
    setChecked(theme === "dark" ?? true);
  }, [theme, systemTheme]);
  // toast.error("hit")
  const handleChange = () => {
    // toast.success("hit");
    setTheme(theme === "dark" ? "light" : "dark");
  };
  // if (isSmallScreen && small)
  //   return <DarkSwitchSmall handleChange={handleChange} checked={checked} />;

  return (
    <Button type="submit" className="px-2 mx-auto mt-auto py-2" onClick={handleChange}>
      {checked ? (
        <Brightness7Icon className="h-[20px] w-[20px]" />
      ) : (
        <Brightness4Icon className="h-[20px] w-[20px]" />
      )}
    </Button>
  );
};

export default DarkSwitch;
