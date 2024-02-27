import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";

import AnimationWrapper from "../common/page-animation";
import Loader from "../components/Loader";
import BlogInteraction from "../components/BlogInteraction";
import BlogPostCard from "../components/BlogPostCard";
import BlogContent from "../components/BlogContent";
import CommentsContainer, { fetchComments } from "../components/Comments";

export const blogStructure = {
  title: "",
  desc: "",
  content: "",
  author: { personalInfo: {} },
  banner: "",
  publishedAt: "",
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blogId } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  const [similarBlogs, setSimilarBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

  let {
    title,
    desc,
    banner,
    content,
    author: {
      personalInfo: { fullname, username: authorUsername, profileImg },
    },
    publishedAt,
  } = blog;

  const fetchBlog = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/blog/get-blog`, {
        blogId,
      })
      .then(async ({ data: { blog } }) => {
        blog.comments = await fetchComments({
          blogId: blog._id,
          setParentCommentCountFunc: setTotalParentCommentsLoaded,
        });

        setBlog(blog);

        axios
          .post(`${import.meta.env.VITE_SERVER_DOMAIN}/blog/search-blogs`, {
            tag: blog.tags[0],
            limit: 6,
            eliminateBlog: blogId,
          })
          .then(({ data }) => {
            setSimilarBlogs(data.blogs);
          });

        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const resetState = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setIsLikedByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
  };

  useEffect(() => {
    resetState();
    fetchBlog();
  }, [blogId]);

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            isLikedByUser,
            setIsLikedByUser,
            commentsWrapper,
            setCommentsWrapper,
            totalParentCommentsLoaded,
            setTotalParentCommentsLoaded,
          }}
        >
          <CommentsContainer />

          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={banner} className="aspect-video rounded-2xl" />

            <div className="mt-12">
              <h2 className="text-center">{title}</h2>

              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-start">
                  <img src={profileImg} className="w-12 h-12 rounded-full" />

                  <p>
                    <Link className="capitalize" to={`/user/${authorUsername}`}>
                      {fullname}
                    </Link>
                    <br />@
                    <Link to={`/user/${authorUsername}`}>{authorUsername}</Link>
                  </p>
                </div>

                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Published on {moment(publishedAt).format("ll")}
                </p>
              </div>
            </div>

            <BlogInteraction />

            <div className="my-12 blog-page-content">
              {content[0].blocks?.map((block, i) => {
                return (
                  <div key={i} className="my-4 md:my-8">
                    <BlogContent block={block} />
                  </div>
                );
              })}
            </div>

            <BlogInteraction />

            {similarBlogs !== null && similarBlogs?.length ? (
              <>
                <h1 className="text-2xl mt-14 mb-10 font-medium">
                  Similar Articles
                </h1>
                {similarBlogs?.map((blog, i) => {
                  let {
                    author: { personalInfo },
                  } = blog;
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.08 }}
                    >
                      <BlogPostCard content={blog} author={personalInfo} />
                    </AnimationWrapper>
                  );
                })}
              </>
            ) : (
              ""
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
