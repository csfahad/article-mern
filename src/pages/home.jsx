import { useState, useEffect } from "react";
import axios from "axios";

import AnimationWrapper from "../common/page-animation";
import InpageNavigation from "../components/InpageNavigation";
import Loader from "../components/Loader";
import BlogPostCard from "../components/BlogPostCard";
import MinimalBlogPost from "../components/MinimalBlogPost";
import { activeTabRef } from "../components/InpageNavigation";
import NoData from "../components/NoData";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingblogs, setTrendingBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");

  const categories = [
    "react.js",
    "next.js",
    "node.js",
    "mongodb",
    "webrtc",
    "aws",
    "lambda",
    "frontend",
    "backend",
    "fullstack",
    "webdev",
    "cloud",
    "devops",
    "javascript",
    "python",
    "java",
    "c++",
    "c",
    "golang",
    "kubernetes",
    "docker",
    "microservices",
    "serverless",
    "graphql",
    "restapis",
    "api",
  ];

  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/blog/latest-blogs`, { page })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data?.blogs,
          page,
          countRoute: "/count-latest-blogs",
        });
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/blog/search-blogs`, {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data?.blogs,
          page,
          countRoute: "/count-search-blogs",
          dataToSend: { tag: pageState },
        });

        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(`${import.meta.env.VITE_SERVER_DOMAIN}/blog/trending-blogs`)
      .then(({ data }) => {
        setTrendingBlogs(data?.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadBlogByCategory = (e) => {
    const category = e.target.innerText.toLowerCase();
    setBlogs(null);

    if (pageState === category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  useEffect(() => {
    activeTabRef.current.click();
    if (pageState == "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }

    if (!trendingblogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* ======== latest blogs ======== */}
        <div className="w-full">
          <InpageNavigation
            routes={[pageState, "trending"]}
            defaultHidden={["trending"]}
          >
            <>
              {blogs === null ? (
                <Loader />
              ) : blogs?.results?.length ? (
                blogs?.results?.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personalInfo}
                      />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoData message="No article published based on this category" />
              )}
              <LoadMoreDataBtn
                state={blogs}
                fetchDataFunc={
                  pageState === "home" ? fetchLatestBlogs : fetchBlogsByCategory
                }
              />
            </>

            {trendingblogs === null ? (
              <Loader />
            ) : trendingblogs?.length ? (
              trendingblogs?.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoData message="No article trending right now" />
            )}
          </InpageNavigation>
        </div>

        {/* ======== filters and trending blogs ======== */}

        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">
                Discover more of what matters to you
              </h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => {
                  return (
                    <button
                      onClick={loadBlogByCategory}
                      className={`tag ${
                        pageState === category ? "bg-black text-white" : ""
                      } capitalize text-dark-grey`}
                      key={i}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h1 className="font-medium flex items-center text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up mt-2 ml-1"></i>
              </h1>

              {trendingblogs === null ? (
                <Loader />
              ) : trendingblogs?.length ? (
                trendingblogs?.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoData message="No article trending right now" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
