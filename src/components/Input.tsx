/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import clsx from "clsx";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { ILogin } from "~/utils/types";
import { BiHide , BiShow} from 'react-icons/bi/';
import { CiCircleCheck, CiCircleRemove } from "react-icons/ci/";
import { useState } from "react";
import { AVAILABLE } from "./SIgnUp";
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
    <div>
      <label
        htmlFor={id}
        className="
          block 
          text-sm 
          font-medium 
          leading-6 
          text-gray-900
        "
      >
        {label}
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
            sm:leading-6 `,
          errors[id] && "focus:ring-rose-500",
          disabled && "cursor-default opacity-50"
        )}
      >
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
            sm:leading-6`,
            // errors[id] && "focus:ring-rose-500",
            disabled && "cursor-default opacity-50"
          )}
        />
        {type === "password" && (
          <button
            type="button"
            className="background-none my-auto h-fit text-sm text-gray-500 focus:outline-none"
            onClick={togglePasswordVisibility}
          >
            {passwordShown ? <BiHide size={24} /> : <BiShow size={24} />}
          </button>
        )}
        {available === true ? (
          <CiCircleCheck
            className="stroke-custom my-auto fill-green-700  transition duration-200 "
            size={28}
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
  );
};

export default Input;
