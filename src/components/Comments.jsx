import { useContext } from "react";
import { BlogContext } from "../pages/blogPage";
import CommentField from "./CommentField";
import axios from "axios";
import NoData from "./NoData";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./CommentCard";

export const fetchComments = async ({
  skip = 0,
  blogId,
  setParentCommentCountFunc,
  commentArray = null,
}) => {
  let res;

  await axios
    .post(`${import.meta.env.VITE_SERVER_DOMAIN}/comment/get-blog-comments`, {
      blogId,
      skip,
    })
    .then(({ data }) => {
      data?.map((comment) => {
        comment.childrenLevel = 0;
      });

      setParentCommentCountFunc((preVal) => preVal + data?.length);

      if (commentArray == null) {
        res = { results: data };
      } else {
        res = { results: [...commentArray, ...data] };
      }
    });

  return res;
};

const CommentsContainer = () => {
  let {
    blog,
    blog: {
      _id,
      title,
      comments: { results: commentsArr },
      activity: { totalComments, totalParentComments },
    },
    commentsWrapper,
    setCommentsWrapper,
    totalParentCommentsLoaded,
    setTotalParentCommentsLoaded,
    setBlog,
  } = useContext(BlogContext);

  const loadMoreComments = async () => {
    let newCommentsArr = await fetchComments({
      skip: totalParentCommentsLoaded,
      blogId: _id,
      setParentCommentCountFunc: setTotalParentCommentsLoaded,
      commentArray: commentsArr,
    });

    setBlog({ ...blog, comments: newCommentsArr });
  };

  return (
    <div
      className={`max-sm:w-full fixed ${
        commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]"
      } duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden`}
    >
      <div className="relative">
        <h1 className="font-bold text-2xl">{totalComments} Comments</h1>
        <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">
          {title}
        </p>

        <button
          onClick={() => setCommentsWrapper((preVal) => !preVal)}
          className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey"
        >
          <i className="fi fi-rr-cross-small text-2xl flex items-center"></i>
        </button>
      </div>

      <hr className="border-grey my-8 w-[120%] -ml-10" />

      <CommentField action="Comment" />

      {commentsArr && commentsArr?.length ? (
        commentsArr?.map((comment, i) => {
          return (
            <AnimationWrapper key={i}>
              <CommentCard
                index={i}
                leftVal={comment.childrenLevel * 4}
                commentData={comment}
              />
            </AnimationWrapper>
          );
        })
      ) : (
        <NoData message="No Comments" />
      )}

      {totalParentComments > totalParentCommentsLoaded ? (
        <button
          onClick={loadMoreComments}
          className="text-dark-grey m-auto p-2 px-5 hover:bg-dark-grey/30 rounded-full flex items-center justify-center gap-2"
        >
          Load more
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default CommentsContainer;
