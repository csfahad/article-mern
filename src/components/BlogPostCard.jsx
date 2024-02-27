import moment from "moment";
import { Link } from "react-router-dom";

const BlogPostCard = ({ content, author }) => {
  let {
    publishedAt,
    tags,
    title,
    desc,
    banner,
    activity: { totalLikes },
    blogId: id,
  } = content;
  const { fullname, profileImg, username } = author;

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
            {moment(publishedAt).format("ll")}
          </p>
        </div>

        <h1 className="blog-title">{title}</h1>
        <p className="my-3 text-xl font-light text-dark-grey leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2">
          {desc}
        </p>

        <div className="gap-4 mt-5">
          <span className="btn-light text-base text-dark-grey py-1.5 px-4 normal-case mr-3">
            {tags[0]}
          </span>
          <span className="btn-light text-base text-dark-grey py-1.5 px-4 normal-case mr-3">
            {tags[1]}
          </span>
          <span className="btn-light text-base text-dark-grey py-1.5 px-4 normal-case mr-3">
            {tags[2]}
          </span>
          <span className="max-md:hidden btn-light text-base text-dark-grey py-1.5 px-4 normal-case mr-3">
            {tags[3]}
          </span>

          <span className="ml-1 flex items-center gap-2 text-dark-grey mt-3">
            <i className="fi fi-rr-heart text-xl"></i>
            <span className="mb-0.5 text-xl">{totalLikes}</span>
          </span>
        </div>
      </div>

      <div className="max-xl:hidden xl:block h-48 w-80 aspect-square bg-white">
        <img
          src={banner}
          className="w-full h-full aspect-square object-contain rounded-xl"
        />
      </div>
    </Link>
  );
};

export default BlogPostCard;
