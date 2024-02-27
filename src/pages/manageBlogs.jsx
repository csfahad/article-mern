import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import InpageNavigation from "../components/InpageNavigation";
import Loader from "../components/Loader";
import NoData from "../components/NoData";
import AnimationWrapper from "../common/page-animation";
import { ManageBlogcard, ManageDraftcard } from "../components/ManageBlogcard";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [query, setQuery] = useState("");

  let activeTab = useSearchParams()[0].get("tab");

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/blog/user-blogs`,
        {
          page,
          draft,
          query,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: draft ? drafts : blogs,
          data: data?.blogs,
          page,
          user: accessToken,
          countRoute: "/user-blogs-count",
          dataToSend: { draft, query },
        });

        if (draft) {
          setDrafts(formattedData);
        } else {
          setBlogs(formattedData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (accessToken) {
      if (blogs == null) {
        getBlogs({ page: 1, draft: false });
      }

      if (drafts == null) {
        getBlogs({ page: 1, draft: true });
      }
    }
  }, [accessToken, blogs, drafts, query]);

  const handleChange = (e) => {
    let searchQuery = e.target.value;
    setQuery(searchQuery);

    if (e.keyCode === 13 && searchQuery?.length) {
      setBlogs(null);
      setDrafts(null);
    }
  };

  const handleSearch = (e) => {
    if (!e.target.value?.length) {
      setQuery("");
      setBlogs(null);
      setDrafts(null);
    }
  };

  return (
    <>
      <h1 className="max-md:hidden">Manage Articles</h1>

      <div className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          onChange={handleChange}
          onKeyDown={handleSearch}
          type="search"
          placeholder="Search Articles"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
      </div>

      <InpageNavigation
        routes={["Published Articles", "Drafts"]}
        defaultActiveIndex={activeTab != "draft" ? 0 : 1}
      >
        {blogs == null ? (
          <Loader />
        ) : blogs.results?.length ? (
          <>
            {blogs.results?.map((blog, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManageBlogcard
                    blog={{ ...blog, index: i, setStateFunc: setBlogs }}
                  />
                </AnimationWrapper>
              );
            })}

            <LoadMoreDataBtn
              state={blogs}
              fetchDataFunc={getBlogs}
              additionalParams={{
                draft: false,
                deletedDocCount: blogs.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoData message="You have not published any article yet" />
        )}

        {drafts == null ? (
          <Loader />
        ) : drafts.results?.length ? (
          <>
            {drafts.results?.map((blog, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManageDraftcard
                    blog={{ ...blog, index: i, setStateFunc: setDrafts }}
                  />
                </AnimationWrapper>
              );
            })}

            <LoadMoreDataBtn
              state={drafts}
              fetchDataFunc={getBlogs}
              additionalParams={{
                draft: true,
                deletedDocCount: drafts.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoData message="No draft article saved" />
        )}
      </InpageNavigation>
    </>
  );
};

export default ManageBlogs;
