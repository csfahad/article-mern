import moment from "moment";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import axios from "axios";

const BlogStats = ({ stats }) => {
  return (
    <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
      {Object.keys(stats)?.map((key, i) => {
        return !key.includes("Parent") ? (
          <div
            key={i}
            className={`flex items-center w-full h-full justify-center lg:p-4 lg:px-6 text-2xl gap-2 ${
              i != 0 ? "border-grey border-l" : ""
            }`}
          >
            {key.includes("totalLikes") ? (
              <i className="fi fi-rr-heart text-xl md:text-2xl"></i>
            ) : key.includes("totalComments") ? (
              <i className="fi fi-rs-comment text-xl md:text-2xl"></i>
            ) : key.includes("totalReads") ? (
              <i className="fi fi-rr-eye text-xl md:text-2xl"></i>
            ) : (
              ""
            )}
            <h1 className="text-xl md:texl-2xl">
              {stats[key].toLocaleString()}
            </h1>

            {/* <p>{key.split("total")}</p> */}
          </div>
        ) : (
          ""
        );
      })}
    </div>
  );
};

export const ManageBlogcard = ({ blog }) => {
  let { blogId, title, banner, publishedAt, activity } = blog;

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const [showStat, setShowStat] = useState(false);

  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-3 items-center">
        <img
          src={banner}
          className="max-xl:hidden xl:block w-96 h-48 flex-none bg-grey object-cover aspect-square rounded-xl"
        />

        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div>
            <Link to={`/blog/${blogId}`} className="blog-title mb-4 ">
              {title}
            </Link>

            <p className="line-clamp-1">
              Published on {moment(publishedAt).format("ll")}
            </p>
          </div>

          <div className="flex gap-6 mt-3">
            <Link
              to={`/editor/${blogId}`}
              className="text-dark-grey p-2 px-4 hover:bg-dark-grey/30 rounded-full flex items-center gap-2"
            >
              <i className="fi fi-rr-file-edit"></i>
              Edit
            </Link>

            <button
              onClick={() => {
                setShowStat((preVal) => !preVal);
              }}
              className="lg:hidden text-dark-grey p-2 px-4 hover:bg-dark-grey/30 rounded-full flex items-center gap-2"
            >
              <i className="fi fi-rr-stats"></i>Stats
            </button>

            <button
              onClick={(e) => deleteBlog(blog, accessToken, e.target)}
              className="text-red p-2 px-3 hover:bg-red/30 rounded-full flex items-center gap-2"
            >
              <i className="fi fi-rr-trash"></i>Delete
            </button>
          </div>
        </div>

        <div className="max-lg:hidden">
          <BlogStats stats={activity} />
        </div>
      </div>

      {showStat ? (
        <div className="lg:hidden">
          <BlogStats stats={activity} />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export const ManageDraftcard = ({ blog }) => {
  let { title, desc, blogId, banner, index } = blog;

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  index++;

  return (
    <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey items-center">
      {/* <h1 className="text-4xl sm:text-3xl lg:text-5xl font-bold text-dark-grey leading-none text-center pl-4 md:pl-6 flex-none">
        {index < 10 ? "0" + index : index}
      </h1> */}

      <img
        src={banner}
        className="max-xl:hidden xl:block w-96 h-48 flex-none bg-grey object-cover aspect-square rounded-xl"
      />

      <div>
        <h1 className="blog-title mb-3 line-clamp-2">{title}</h1>

        <p className="line-clamp-2">{desc?.length ? desc : "No Description"}</p>

        <div className="flex gap-6 mt-3">
          <Link
            to={`/editor/${blogId}`}
            className="text-dark-grey p-2 px-4 hover:bg-dark-grey/30 rounded-full flex items-center gap-2 mt-1"
          >
            <i className="fi fi-rr-file-edit"></i>
            Edit
          </Link>

          <button
            onClick={(e) => deleteBlog(blog, accessToken, e.target)}
            className="text-red p-2 px-3 hover:bg-red/30 rounded-full flex items-center gap-2 mt-1"
          >
            <i className="fi fi-rr-trash"></i>Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const deleteBlog = (blog, accessToken, target) => {
  let { index, blogId, setStateFunc } = blog;

  target.setAttribute("disabled", true);

  axios
    .post(
      `${import.meta.env.VITE_SERVER_DOMAIN}/blog/delete-blog`,
      { blogId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then(({ data }) => {
      target.removeAttribute("disabled");

      setStateFunc((preVal) => {
        let { deletedDocCount, totalDocs, results } = preVal;

        results.splice(index, 1);

        if (!deletedDocCount) {
          deletedDocCount = 0;
        }

        if (!results?.length && totalDocs - 1 > 0) {
          return null;
        }

        return {
          ...preVal,
          totalDocs: totalDocs - 1,
          deletedDocCount: deletedDocCount + 1,
          results,
        };
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
