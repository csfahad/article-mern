import moment from "moment";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./CommentField";
import { BlogContext } from "../pages/blogPage";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {
  let {
    commentedBy: {
      personalInfo: { profileImg, fullname, username: commentedByUsername },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentData;

  let {
    blog,
    blog: {
      comments,
      activity,
      activity: { totalParentComments },
      comments: { results: commentsArr },
      author: {
        personalInfo: { username: blogAuthor },
      },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  let {
    userAuth: { accessToken, username },
  } = useContext(UserContext);

  const [isReplying, setIsReplying] = useState(false);

  const handleReplyClick = () => {
    if (!accessToken) {
      return toast.error("Please Sign in", {
        style: {
          background: "#23272F",
          color: "#fff",
          textAlign: "center",
        },
      });
    }

    setIsReplying((preVal) => !preVal);
  };

  const getParentIndex = () => {
    let startingPoint = index - 1;

    try {
      while (
        commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }

    return startingPoint;
  };

  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (
        commentsArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentsArr.splice(startingPoint, 1);

        if (commentsArr[startingPoint]) {
          break;
        }
      }
    }

    if (isDelete) {
      let parentIndex = getParentIndex();

      if (parentIndex != undefined) {
        commentsArr[parentIndex].children = commentsArr[
          parentIndex
        ].children.filter((child) => child != _id);

        if (!commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }
      commentsArr.splice(index, 1);
    }

    if (commentData.childrenLevel == 0 && isDelete) {
      setTotalParentCommentsLoaded((preVal) => preVal - 1);
    }

    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        totalParentComments:
          totalParentComments -
          (commentData.childrenLevel == 0 && isDelete ? 1 : 0),
      },
    });
  };

  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentsCards(index + 1, commentData.childrenLevel);
  };

  const loadReplies = ({ skip = 0, currentIndex = index }) => {
    if (commentsArr[currentIndex].children.length) {
      hideReplies();

      axios
        .post(`${import.meta.env.VITE_SERVER_DOMAIN}/comment/get-replies`, {
          _id: commentsArr[currentIndex]._id,
          skip,
        })
        .then(({ data: { replies } }) => {
          commentsArr[currentIndex].isReplyLoaded = true;

          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel =
              commentsArr[currentIndex].childrenLevel + 1;
            commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }

          setBlog({ ...blog, comments: { results: commentsArr } });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const deleteComment = (e) => {
    e.target.setAttribute("disabled", true);

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/comment/delete-comment`,
        {
          _id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(() => {
        e.target.removeAttribute("disabled");
        removeCommentsCards(index + 1, true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const LoadMoreRepliesButton = () => {
    let parentIndex = getParentIndex();

    let button = (
      <button
        onClick={() =>
          loadReplies({
            skip: index - parentIndex,
            currentIndex: parentIndex,
          })
        }
        className="text-dark-grey m-auto p-2 px-5 bg-dark-grey/30 hover:bg-dark-grey/40 rounded-full flex items-center justify-center gap-2"
      >
        Load more replies{" "}
      </button>
    );

    if (commentsArr[index + 1]) {
      if (
        commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel
      ) {
        if (index - parentIndex < commentsArr[parentIndex].children.length) {
          return button;
        }
      }
    } else {
      if (parentIndex) {
        if (index - parentIndex < commentsArr[parentIndex].children.length) {
          return button;
        }
      }
    }
  };

  return (
    <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="my-1 p-2 ">
        {/* rounded-md border border-grey */}
        <div className="flex gap-3 items-center mb-1">
          <img src={profileImg} className="w-8 h-8 rounded-full" />
          <p className="line-clamp-1">
            @{commentedByUsername} {"•"}
          </p>
          <p className="min-w-fit">{moment(commentedAt).fromNow()}</p>
        </div>

        <p className="text-xl ml-11">{comment}</p>

        <div className="flex gap-2 items-center mt-2">
          <button
            onClick={handleReplyClick}
            className="text-dark-grey p-2 px-3 ml-8 hover:bg-dark-grey/30 rounded-full flex items-center gap-2"
          >
            <i className="fi fi-rs-redo"></i>
            Reply
          </button>

          {commentData.isReplyLoaded ? (
            <button
              onClick={hideReplies}
              className="text-dark-grey p-2 px-3 hover:bg-dark-grey/30 rounded-full flex items-center gap-2"
            >
              <i className="fi fi-rs-comment-dots"></i>Hide replies
            </button>
          ) : (
            <button
              onClick={loadReplies}
              className="text-dark-grey p-2 px-3 hover:bg-dark-grey/30 rounded-full flex items-center gap-2"
            >
              {children?.length ? children?.length + " replies" : ""}
            </button>
          )}

          {username == commentedByUsername || username == blogAuthor ? (
            <button
              onClick={deleteComment}
              className="text-red p-2 px-3 hover:bg-red/30 rounded-full flex items-center gap-2"
            >
              <i className="fi fi-rr-trash pointer-events-none"></i>Delete
            </button>
          ) : (
            ""
          )}
        </div>

        {isReplying ? (
          <div className="mt-5 ml-10">
            <CommentField
              action="Reply"
              index={index}
              replyingTo={_id}
              setIsReplying={setIsReplying}
            />
          </div>
        ) : (
          ""
        )}
      </div>

      <LoadMoreRepliesButton />
    </div>
  );
};

export default CommentCard;
