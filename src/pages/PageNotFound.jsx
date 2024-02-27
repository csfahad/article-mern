import { useContext } from "react";
import { Link } from "react-router-dom";

import lightPageNotFoundImg from "../images/404-light.png";
import darkPageNotFoundImg from "../images/404-dark.png";
import lightFullLogo from "../images/full-logo-light.png";
import darkFullLogo from "../images/full-logo-dark.png";
import { ThemeContext } from "../App";

const PageNotFound = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
      <img
        src={theme === "light" ? darkPageNotFoundImg : lightPageNotFoundImg}
        className="select-none border-2 border-grey w-72 aspect-square object-cover rounded-3xl"
      />
      <h1 className="text-4xl leading-7">Page not found</h1>
      <p className="text-dark-grey text-xl leading-7 -mt-8">
        The page you're looking for does not exist. Go back to{" "}
        <Link to="/" className="text-black underline">
          Home
        </Link>
      </p>

      <div className="mt-auto">
        <img
          src={theme === "light" ? darkFullLogo : lightFullLogo}
          className="h-8 object-contain block mx-auto select-none"
        />
        <p className="mt-5 text-dark-grey">
          Read millions of stories around the world
        </p>
      </div>
    </section>
  );
};

export default PageNotFound;
