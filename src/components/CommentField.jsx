import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blogPage";

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setIsReplying,
}) => {
  let {
    blog,
    blog: {
      _id,
      author: { _id: blogAuthor },
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { totalComments, totalParentComments },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  let {
    userAuth: { accessToken, username, fullname, profileImg },
  } = useContext(UserContext);

  const [comment, setComment] = useState("");

  const handleComment = () => {
    if (!accessToken) {
      return toast.error("Sign in to add comment", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    if (!comment?.length) {
      return toast.error("Write something to comment", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/comment/add-comment`,
        {
          _id,
          blogAuthor,
          comment,
          replyingTo: replyingTo,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(({ data }) => {
        setComment("");
        data.commentedBy = { personalInfo: { username, profileImg, fullname } };

        let newCommentArr;

        if (replyingTo) {
          commentsArr[index].children.push(data._id);

          data.childrenLevel = commentsArr[index].childrenLevel + 1;
          data.parentIndex = index;

          commentsArr[index].isReplyLoaded = true;

          commentsArr.splice(index + 1, 0, data);
          newCommentArr = commentsArr;

          setIsReplying(false);
        } else {
          data.childrenLevel = 0;
          newCommentArr = [data, ...commentsArr];
        }

        let parentCommentIncrementVal = replyingTo ? 0 : 1;

        setBlog({
          ...blog,
          comments: { ...comments, results: newCommentArr },
          activity: {
            ...activity,
            totalComments: totalComments + 1,
            totalParentComments:
              totalParentComments + parentCommentIncrementVal,
          },
        });

        setTotalParentCommentsLoaded(
          (preVal) => preVal + parentCommentIncrementVal
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <textarea
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
      ></textarea>

      <button
        onClick={handleComment}
        className="btn-dark mt-5 mb-5 px-10 w-full"
      >
        {action}
      </button>
    </>
  );
};

export default CommentField;
