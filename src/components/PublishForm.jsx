import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import AnimationWrapper from "../common/page-animation";
import { EditorContext } from "../pages/editor";
import Tag from "./Tags";
import { UserContext } from "../App";

const PublishForm = () => {
  const characterLimit = 200;
  const tagLimit = 10;

  let { blogId } = useParams();

  const navigate = useNavigate();

  const {
    blog,
    blog: { banner, title, content, tags, desc },
    setEditorState,
    setBlog,
  } = useContext(EditorContext);

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e) => {
    const input = e.target;
    setBlog({ ...blog, title: input.value });
  };

  const handleBlogDescChange = (e) => {
    const input = e.target;
    setBlog({ ...blog, desc: input.value });
  };

  const handleDescKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();
      let tag = e.target.value;
      if (tags?.length < tagLimit) {
        if (!tags.includes(tag) && tag?.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error(`You can add maximum ${tagLimit} tags`, {
          style: {
            background: "#23272F",
            color: "#fff",
            textAlign: "center",
          },
        });
      }
      e.target.value = "";
    }
  };

  const handlePublishBlog = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title?.length) {
      return toast.error("Please give a title to your article", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    if (!desc?.length || desc?.length > 200) {
      return toast.error(
        `Please provide description about your article under ${characterLimit} characters`,
        {
          style: {
            background: "#23272F",
            color: "#fff",
            textAlign: "center",
          },
        }
      );
    }

    if (!tags?.length) {
      return toast.error(
        "Please add atleast one tag to help us rank your article",
        {
          style: {
            background: "#23272F",
            color: "#fff",
            textAlign: "center",
          },
        }
      );
    }

    let loadingToast = toast.loading("Publishing article...", {
      style: {
        background: "#23272F",
        color: "#fff",
        textAlign: "center",
      },
    });

    e.target.classList.add("disable");

    let blogObj = {
      title,
      banner,
      desc,
      content,
      tags,
      draft: false,
    };

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/blog/create-blog`,
        { ...blogObj, id: blogId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(() => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.success("Published 👍", {
          style: {
            background: "#23272F",
            color: "#fff",
            textAlign: "center",
          },
        });

        setTimeout(() => {
          navigate("/dashboard/blogs");
        }, 500);
      })
      .catch(({ response }) => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);

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
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
        <button
          className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
          onClick={handleCloseEvent}
        >
          <i className="fi fi-br-cross"></i>
        </button>

        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} />
          </div>

          <h1 className="text-3xl md:text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>
          <p className="font-inter line-clamp-2 text-xl leading-7 mt-4">
            {desc}
          </p>
        </div>

        <div className="border-grey lg:border-1 lg:pl-8">
          <p className="text-dark-grey mb-2 mt-9">Article Title</p>
          <input
            type="text"
            placeholder="Article Title"
            defaultValue={title}
            className="input-box pl-4"
            onChange={handleBlogTitleChange}
          />

          <p className="text-dark-grey mb-2 mt-9">
            Short description about the article
          </p>
          <textarea
            maxLength={characterLimit}
            defaultValue={desc}
            className="h-40 resize-none leading-7 input-box pl-4"
            onChange={handleBlogDescChange}
            onKeyDown={handleDescKeyDown}
          ></textarea>
          <p className="mt-1 text-dark-grey text-sm text-right">
            {characterLimit - desc.length} characters left
          </p>

          <p className="text-dark-grey mb-2 mt-9">
            Topics - (Help in searching and ranking your article)
          </p>

          <div className="relative input-box pl-2 py-2 pb-4">
            <input
              type="text"
              placeholder="Add Topics"
              className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
              onKeyDown={handleKeyDown}
            />

            {tags?.map((tag, index) => (
              <Tag tag={tag} tagIndex={index} key={index} />
            ))}
          </div>

          <p className="mt-1 mb-4 text-sm text-dark-grey text-right">
            {tagLimit - tags?.length} Tags left
          </p>

          <div className="flex flex-col items-center justify-center mt-9">
            <button
              className="btn-dark px-8 w-full"
              onClick={handlePublishBlog}
            >
              Publish
            </button>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
