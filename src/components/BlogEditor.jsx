import { useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import EditorJS from "@editorjs/editorjs";
import axios from "axios";

import darkLogo from "../images/logo-dark.png";
import lightLogo from "../images/logo-light.png";
import AnimationWrapper from "../common/page-animation";
import lightBanner from "../images/blog-banner-light.png";
import darkBanner from "../images/blog-banner-dark.png";
import { uploadImage } from "../common/aws";
import { EditorContext } from "../pages/editor";
import { useEffect } from "react";
import { tools } from "./Tools";
import { ThemeContext, UserContext } from "../App";

const BlogEditor = () => {
  const { theme } = useContext(ThemeContext);

  let {
    blog,
    blog: { title, banner, content, tags, desc },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  let { blogId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "Article Content..",
        })
      );
    }
  }, []);

  const handleBannerUpload = (e) => {
    const img = e.target.files[0];
    if (img) {
      let loadingToast = toast.loading("Uploading...", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
      uploadImage(img)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("Uploaded 👍", {
              style: {
                background: "#23272F",
                color: "#fff",
                textAlign: "center",
              },
            });
            setBlog({ ...blog, banner: url });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          return toast.error(err, {
            style: {
              background: "#23272F",
              color: "#fff",
              textAlign: "center",
            },
          });
        });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  const handleError = (e) => {
    let img = e.target;
    img.src = theme === "light" ? lightBanner : darkBanner;
  };

  const handlePublishEvent = () => {
    if (!banner?.length) {
      return toast.error("Please upload a banner before Publish", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    if (!title?.length) {
      return toast.error("Please give a title to your article", {
        style: {
          borderRadius: "100px",
          background: "#333",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks?.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write article content before Publish", {
              style: {
                background: "#23272F",
                color: "#fff",
                textAlign: "center",
              },
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title?.length) {
      return toast.error(
        "Please give a title to your article before saving the draft",
        {
          style: {
            background: "#23272F",
            color: "#fff",
            textAlign: "center",
          },
        }
      );
    }

    let loadingToast = toast.loading("Saving Draft...", {
      style: {
        background: "#23272F",
        color: "#fff",
        textAlign: "center",
      },
    });

    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        let blogObj = {
          title,
          banner,
          desc,
          content,
          tags,
          draft: true,
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
            toast.success("Draft Saved 👍", {
              style: {
                borderRadius: "100px",
                background: "#333",
                color: "#fff",
                textAlign: "center",
              },
            });

            setTimeout(() => {
              navigate("/dashboard/blogs?tab=draft");
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
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={theme === "light" ? darkLogo : lightLogo} />
        </Link>

        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title?.length ? title : "New Article"}
        </p>

        <div className="flex gap-4 ml-auto">
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
        </div>
      </nav>

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  src={banner}
                  className="z-20 cursor-pointer"
                  onError={handleError}
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpeg, .jpeg, .avif"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder="Article Title"
              className="text-3xl md:text-4xl font-medium md:font-bold w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />
            <div id="textEditor"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
