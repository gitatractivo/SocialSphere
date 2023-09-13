/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import clsx from "clsx";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { ILogin } from "~/utils/types";
import { BiHide , BiShow} from 'react-icons/bi/';
import { CiCircleCheck, CiCircleRemove } from "react-icons/ci/";
import { useState } from "react";
import { AVAILABLE } from "./auth/SIgnUp";
import { CircularProgress } from "@mui/material";

interface InputProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  disabled?: boolean;
  available?: (typeof AVAILABLE)[number];
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  register,
  required,
  errors,
  type = "text",
  disabled,
  available=null
}) => {
    const [passwordShown, setPasswordShown] = useState<boolean>(false);

    const togglePasswordVisibility = () => {
      setPasswordShown(!passwordShown);
    };
  return (
    <div className="group/form">
      <label
        htmlFor={id}
        className="
          block 
          text-lg
          font-bold 
          leading-6 
          text-gray-900
          mb-2
        "
      >
        {label}
      </label>
      <div className="relative ">
        <input
          id={id}
          type={
            type === "password" ? (passwordShown ? "text" : "password") : type
          }
          autoComplete={id}
          disabled={disabled}
          {...register(id, { required })}
          placeholder={label}
          className={clsx(
            `
            form-input
            block 
            w-full 
            rounded-lg 
            border-0 
            border-gray-300
            bg-white 
            py-2
            text-lg
            font-medium
            text-gray-900 
            shadow-md ring-1
            ring-inset 
            ring-gray-300 
            transition-all 
            duration-500 
            placeholder:text-gray-300 
            dark:placeholder:text-gray-400 
            focus:ring-2 
            focus:ring-inset
            focus:ring-sky-600
            dark:bg-gray-200 
            sm:leading-6`,
            errors[id] && "focus:ring-rose-500",
            disabled && "cursor-default opacity-50",
            type === "password" && "pr-10",
            id === "username" && "pr-10"
          )}
        />
        {type === "password" && (
          <button
            type="button"
            className="background-none absolute inset-y-0 right-0 my-auto flex h-fit items-center pr-3  leading-5 text-gray-500 outline-none transition-all duration-500 focus:outline-none"
            onClick={togglePasswordVisibility}
          >
            {passwordShown ? (
              <BiHide
                fill="black"
                className="transition-all duration-500"
                size={24}
              />
            ) : (
              <BiShow
                fill="black"
                className="transition-all duration-500"
                size={24}
              />
            )}
          </button>
        )}

        <div className="absolute inset-y-0 right-3 my-auto flex flex-col justify-center">
          {available === true ? (
            <CiCircleCheck
              className="stroke-custom  fill-green-700 transition duration-200 "
              size={24}
              stroke-width="0.125"
            />
          ) : available === "Loading" ? (
            <CircularProgress
              size={20}
              className="my-auto transition duration-200 "
            />
          ) : available === false ? (
            <CiCircleRemove
              className="stroke-custom my-auto fill-red-700 transition duration-200"
              size={28}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Input;
