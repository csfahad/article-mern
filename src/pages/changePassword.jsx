import { useContext, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/InputBox";
import { UserContext } from "../App";

const ChangePassword = () => {
  const passwordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,20}$/;

  let changePasswordForm = useRef();

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const handleSubmit = (e) => {
    e.preventDefault();

    let form = new FormData(changePasswordForm.current);

    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { currentPassword, newPassword } = formData;

    if (!currentPassword?.length || !newPassword?.length) {
      return toast.error("All fields are required", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return toast.error(
        "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
        {
          style: {
            background: "#23272F",
            color: "#fff",
            textAlign: "center",
          },
        }
      );
    }

    e.target.setAttribute("disabled", true);

    let loadingToast = toast.loading("Updating...", {
      style: {
        background: "#23272F",
        color: "#fff",
        textAlign: "center",
      },
    });

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/auth/change-password`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(() => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.success("Password updated", {
          style: {
            background: "#23272F",
            color: "#fff",
            textAlign: "center",
          },
        });
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.error(response.data.error, {
          style: {
            background: "#23272F",
            color: "#fff",
            textAlign: "center",
          },
        });
      });
  };

  return (
    <AnimationWrapper>
      <form ref={changePasswordForm}>
        <h1 className="max-md:hidden">Change Password</h1>
        <div className="py-10 w-full md:max-w-[400px] flex flex-col justify-center">
          <InputBox
            name="currentPassword"
            type="password"
            className="profile-edit-input"
            placeholder="Current Password"
            icon="fi-rr-key"
          />

          <InputBox
            name="newPassword"
            type="password"
            className="profile-edit-input"
            placeholder="New Password"
            icon="fi-rr-key"
          />

          <button
            onClick={handleSubmit}
            className="btn-dark px-10 mt-5 mx-auto w-auto md:w-full"
            type="submit"
          >
            Update Password
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
