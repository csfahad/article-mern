import { Link } from "react-router-dom";
import moment from "moment";

const MinimalBlogPost = ({ blog, index }) => {
  const {
    title,
    banner,
    blogId: id,
    tags,
    author: {
      personalInfo: { username, profileImg },
    },
    activity: { totalLikes },
    publishedAt,
  } = blog;

  return (
    <Link
      to={`/blog/${id}`}
      className="flex gap-8 items-center border-b border-grey pb-5 mb-4"
    >
      <div className="w-full">
        <div className="flex gap-2 items-center mb-4">
          <img src={profileImg} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1 text-dark-grey">
            @{username} {"•"}
          </p>
          <p className="min-w-fit text-dark-grey">
            {moment(publishedAt).fromNow()}
          </p>
        </div>

        {/* <div className="flex items-center">
          <h1 className="blog-index mr-4">
            {index < 10 ? "#" + (index + 1) : index}
          </h1> */}
        <h1 className="blog-title">{title}</h1>
        {/* </div> */}

        <div className="gap-4 mt-5">
          <span className="btn-light text-base text-green py-1.5 px-4 normal-case">
            {index < 10 ? "#" + (index + 1) + " on Trending" : index}
          </span>

          <span className="ml-1 flex items-center gap-2 text-dark-grey mt-3">
            <i className="fi fi-rr-heart text-xl"></i>
            <span className="mb-0.5 text-xl">{totalLikes}</span>
          </span>
        </div>
      </div>

      {/* <div className="h-28 md:h-40 flex flex-col aspect-square bg-white">
        <img
          src={banner}
          className="w-full h-full aspect-square object-cover rounded-xl"
        />
      </div> */}
    </Link>
  );
};

export default MinimalBlogPost;
