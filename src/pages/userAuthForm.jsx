import { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

import InputBox from "../components/InputBox";
import googleIcon from "../images/google.png";
import AnimationWrapper from "../common/page-animation";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {
  let {
    userAuth: { accessToken },
    setUserAuth,
  } = useContext(UserContext);

  const userAuthThroughServer = async (serverRoute, formData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}${"/auth"}${serverRoute}`,
        formData
      );
      storeInSession("user", JSON.stringify(response.data));
      setUserAuth(response.data);

      // toast.success(response.data.success);
    } catch (err) {
      toast.error(err.response.data.error, {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = type == "sign-in" ? "/signin" : "/signup";

    let form = new FormData(formElement);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,20}$/;

    const { fullname, email, password } = formData;

    // form validation

    if (fullname && fullname?.length < 3) {
      return toast.error("Name must be at least 3 letters long", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    if (!email?.length) {
      return toast.error("Enter email address", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    if (!emailRegex.test(email)) {
      return toast.error("Enter valid email address", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    if (!passwordRegex.test(password)) {
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

    userAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    try {
      const user = await authWithGoogle();
      let serverRoute = "/google-auth";

      let formData = {
        accessToken: user.accessToken,
      };
      userAuthThroughServer(serverRoute, formData);
    } catch (err) {
      toast.error("Error occured while sign in with Google", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
      return console.log(err);
    }
  };

  return accessToken ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="mt-14 bg-white md:mt-20 flex items-center justify-center">
        <form id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-3xl md:text-3xl font-inter text-center mb-14 md:mb-18">
            {type == "sign-in"
              ? "Sign-in to your Article account"
              : "Let's Join to write amazing articles"}
          </h1>

          {type != "sign-in" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          ) : (
            ""
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />

          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />

          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handleSubmit}
          >
            {type == "sign-in" ? "Sign in" : "Create Account"}
          </button>

          {type == "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Create one
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member?{" "}
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in
              </Link>
            </p>
          )}

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogleAuth}
          >
            <img src={googleIcon} className="w-5" />
            Sign in with Google
          </button>
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
