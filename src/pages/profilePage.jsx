import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import NumericLabel from "react-pretty-numbers";

import AnimationWrapper from "../common/page-animation";
import Loader from "../components/Loader";
import { UserContext } from "../App";
import AboutUser from "../components/AboutUser";
import { filterPaginationData } from "../common/filter-pagination-data";
import InpageNavigation from "../components/InpageNavigation";
import BlogPostCard from "../components/BlogPostCard";
import NoData from "../components/NoData";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import PageNotFound from "./PageNotFound";

export const profileDataStructure = {
  personalInfo: {
    fullname: "",
    username: "",
    profileImg: "",
    bio: "",
  },
  accountInfo: {
    totalPosts: 0,
    totalReads: 0,
  },
  socialLinks: {},
  joinedAt: "",
};

const ProfilePage = () => {
  const { id: profileId } = useParams();

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState("");

  const {
    personalInfo: { fullname, username: profileUsername, profileImg, bio },
    accountInfo: { totalPosts, totalReads },
    socialLinks,
    joinedAt,
  } = profile;

  const {
    userAuth: { username },
  } = useContext(UserContext);

  const numFormatOptions = {
    justification: "C",
    locales: "en-IN",
    currency: false,
    currencyIndicator: "IND",
    percentage: false,
    precision: null,
    wholenumber: null,
    commafy: true,
    shortFormat: true,
    shortFormatMinValue: 1000,
    shortFormatPrecision: 1,
    title: true,
    cssClass: ["red"],
  };

  let posts = (
    <NumericLabel params={numFormatOptions}>{totalPosts}</NumericLabel>
  );
  let reads = (
    <NumericLabel params={numFormatOptions}>{totalReads}</NumericLabel>
  );

  const fetchUserProfile = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/user/get-profile`, {
        username: profileId,
      })
      .then(({ data: user }) => {
        if (user !== null) {
          setProfile(user);
        }
        setProfileLoaded(profileId);
        getBlogs({ userId: user._id });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getBlogs = ({ page = 1, userId }) => {
    userId = userId === undefined ? blogs?.userId : userId;
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/blog/search-blogs`, {
        author: userId,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data?.blogs,
          page,
          countRoute: "/count-search-blogs",
          dataToSend: { author: userId },
        });

        formatedData.userId = userId;
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const resetState = () => {
    setProfile(profileDataStructure);
    setLoading(true);
    setProfileLoaded("");
  };

  useEffect(() => {
    if (profileId != profileLoaded) {
      setBlogs(null);
    }

    if (blogs == null) {
      resetState();
      fetchUserProfile();
    }
  }, [profileId, blogs]);

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profileUsername?.length ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profileImg}
              className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
            />
            <h1 className="text-2xl capitalize h-3">{fullname}</h1>
            <p className="text-xl font-medium">@{profileUsername}</p>
            <div className="flex">
              {posts} {`\u00A0Articles •\u00A0`} {reads} {`\u00A0Reads`}
            </div>

            <div className="flex gap-4 mt-2">
              {profileId === username ? (
                <Link
                  to="/settings/edit-profile"
                  className="btn-light rounded-lg"
                >
                  Edit Profile
                </Link>
              ) : (
                ""
              )}
            </div>

            <AboutUser
              className="max-md:hidden"
              bio={bio}
              socialLinks={socialLinks}
              joinedAt={joinedAt}
            />
          </div>

          <div className="max-md:mt-12 w-full">
            <InpageNavigation
              routes={["Published Articles", "About"]}
              defaultHidden={["About"]}
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
                  <NoData message={`No article published by @${username}`} />
                )}
                <LoadMoreDataBtn state={blogs} fetchDataFunc={getBlogs} />
              </>

              <AboutUser
                bio={bio}
                socialLinks={socialLinks}
                joinedAt={joinedAt}
              />
            </InpageNavigation>
          </div>
        </section>
      ) : (
        <PageNotFound />
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
