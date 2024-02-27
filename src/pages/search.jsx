import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import InpageNavigation, { activeTabRef } from "../components/InpageNavigation";
import Loader from "../components/Loader";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/BlogPostCard";
import NoData from "../components/NoData";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/UserCard";

const SearchPage = () => {
  const { query } = useParams();

  const [blogs, setBlogs] = useState(null);
  const [users, setUsers] = useState(null);

  const searchBlogs = ({ page = 1, createNewArray = false }) => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/blog/search-blogs`, {
        query,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data?.blogs,
          page,
          countRoute: "/count-search-blogs",
          dataToSend: { query },
          createNewArray,
        });
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchUsers = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/user/search-user`, {
        query,
      })
      .then(({ data: { users } }) => {
        setUsers(users);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  useEffect(() => {
    activeTabRef.current.click();
    resetState();
    searchBlogs({ page: 1, createNewArray: true });
    fetchUsers();
  }, [query]);

  const UserCardWrapper = () => {
    return (
      <>
        {users === null ? (
          <Loader />
        ) : users?.length ? (
          users?.map((user, i) => {
            return (
              <AnimationWrapper
                key={i}
                transition={{ duration: 1, delay: i * 0.08 }}
              >
                <UserCard user={user} />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoData message="No user found" />
        )}
      </>
    );
  };

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InpageNavigation
          routes={[`Search results for ${query}`, `Accounts Matched`]}
          defaultHidden={["Accounts Matched"]}
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
              <NoData message="No article published based on your search" />
            )}
            <LoadMoreDataBtn state={blogs} fetchDataFunc={searchBlogs} />
          </>

          <UserCardWrapper />
        </InpageNavigation>
      </div>

      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
        <h1 className="font-medium text-xl mb-8">
          {" "}
          Accounts related to search <i className="fi fi-rr-user mt-2"></i>
        </h1>

        <UserCardWrapper />
      </div>
    </section>
  );
};

export default SearchPage;
