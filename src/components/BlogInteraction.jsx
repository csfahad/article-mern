import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import { BlogContext } from "../pages/blogPage";
import { UserContext } from "../App";
// import Modal from "./Modal";

const BlogInteraction = () => {
  let {
    blog,
    blog: {
      _id,
      title,
      blogId,
      activity,
      activity: { totalLikes, totalComments },
      author: {
        personalInfo: { username: authorUsername },
      },
    },
    setBlog,
    isLikedByUser,
    setIsLikedByUser,
    setCommentsWrapper,
  } = useContext(BlogContext);

  let {
    userAuth: { username, accessToken },
  } = useContext(UserContext);

  useEffect(() => {
    if (accessToken) {
      axios
        .post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/blog/is-liked-by-user`,
          { _id },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        .then(({ data: { result } }) => {
          setIsLikedByUser(Boolean(result));
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  const handleLike = () => {
    if (accessToken) {
      setIsLikedByUser((preVal) => !preVal);

      !isLikedByUser ? totalLikes++ : totalLikes--;
      setBlog({ ...blog, activity: { ...activity, totalLikes } });

      axios
        .post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/blog/like-blog`,
          { _id, isLikedByUser },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        .then(({ data }) => {
          // console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      toast.error("Please sign in to like the article", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }
  };

  return (
    <>
      <hr className="border-grey my-2" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isLikedByUser ? "bg-twitter/20 text-twitter" : "bg-grey/80"
            }`}
            onClick={handleLike}
          >
            <i
              className={`fi ${
                isLikedByUser ? "fi-sr-heart" : "fi-rr-heart"
              } text-xl`}
            ></i>
          </button>
          <p
            className={`text-xl text-dark-grey ${
              isLikedByUser ? "text-twitter" : ""
            }`}
          >
            {totalLikes}
          </p>

          <button
            onClick={() => {
              setCommentsWrapper((preVal) => !preVal);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
          >
            <i className="fi fi-rs-comment text-xl"></i>
          </button>
          <p className="text-xl text-dark-grey">{totalComments}</p>
        </div>

        <div className="flex gap-6 items-center">
          {username === authorUsername ? (
            <Link
              to={`/editor/${blogId}`}
              className="hover:text-twitter text-xl flex items-center mb-1"
            >
              <i className="fi fi-rr-file-edit text-xl mt-1 mr-1"></i>
              Edit
            </Link>
          ) : (
            ""
          )}

          <Link
            to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}
            target={"_blank"}
          >
            <i className="fi fi-brands-twitter-alt text-xl hover:text-twitter"></i>
          </Link>
        </div>
      </div>
      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;
