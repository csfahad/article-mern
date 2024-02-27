import moment from "moment";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import NotificationCommentField from "./NotificationCommentField";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCard = ({ data, index, notificationState }) => {
  const [isReplying, setIsReplying] = useState(false);

  let {
    type,
    seen,
    comment,
    repliedOnComment,
    reply,
    user,
    user: {
      personalInfo: { fullname, username, profileImg },
    },
    blog: { _id, blogId, title },
    createdAt,
    _id: notificationId,
  } = data;

  let {
    userAuth: {
      accessToken,
      username: authorUsername,
      profileImg: authorProfileImg,
    },
  } = useContext(UserContext);

  let {
    notifications,
    notifications: { results, totalDocs },
    setNotifications,
  } = notificationState;

  const handleReplyClick = () => {
    setIsReplying((preVal) => !preVal);
  };

  const handleDelete = (commentId, type, target) => {
    target.setAttribute("disabled", "true");

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/comment/delete-comment`,
        { _id: commentId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(() => {
        if (type == "comment") {
          results.splice(index, 1);
        } else {
          delete results[index].reply;
        }

        target.removeAttribute("disabled");
        setNotifications({
          ...notifications,
          results,
          totalDocs: -1,
          deletedDocCount: notifications.deletedDocCount + 1,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div
      className={`p-3 border-b border-grey border-l-black ${
        !seen ? "border-l-2" : ""
      }`}
    >
      <div className="flex gap-5 mb-2 items-start">
        <img src={profileImg} className="w-10 h-10 flex-none rounded-full" />
        <div className="w-full">
          <h1 className="font-medium text-xl test-dark-grey">
            <span className="lg:inline-block hidden capitalize">
              {fullname}
            </span>
            <Link to={`/user/${username}`} className="mx-1 text-blue-500">
              @{username}
            </Link>
            <span className="font-normal  ">
              {type == "like"
                ? "liked your article"
                : type == "comment"
                ? "commented on"
                : "replied on your comment"}{" "}
              {"•"} {moment(createdAt).fromNow()}
            </span>
          </h1>

          {type == "reply" ? (
            <>
              <Link to={`/blog/${blogId}`}>
                <Link
                  to={`/blog/${blogId}`}
                  className="font-medium text-dark-grey mt-1 hover:underline line-clamp-1"
                >{`${title}`}</Link>

                <div className="p-4 mt-4 rounded-2xl bg-grey">
                  <div className="flex items-start">
                    <i className="fi fi-rs-comment ml-2"></i>
                    <p className="ml-2">{repliedOnComment.comment}</p>
                  </div>
                  <div className="flex items-start">
                    <i className="fi fi-rs-redo mt-3 ml-6"></i>
                    <p className="mt-2 ml-2">{comment.comment}</p>
                  </div>
                </div>
              </Link>
            </>
          ) : type === "comment" ? (
            <>
              <Link
                to={`/blog/${blogId}`}
                className="font-medium text-dark-grey mt-1 hover:underline line-clamp-1"
              >
                {`${title}`}
              </Link>
              <div className="p-4 mt-4 rounded-2xl bg-grey">
                <div className="flex items-start">
                  <i className="fi fi-rs-comment ml-2"></i>
                  <p className="ml-2">{comment?.comment}</p>
                </div>
              </div>
            </>
          ) : (
            <Link
              to={`/blog/${blogId}`}
              className="font-medium text-dark-grey mt-1 hover:underline line-clamp-1"
            >{`${title}`}</Link>
          )}

          <div className="pl-5 mt-3 text-dark-grey flex gap-8">
            {type != "like" ? (
              <>
                {!reply ? (
                  <button
                    onClick={handleReplyClick}
                    className="text-dark-grey p-2 px-4 hover:bg-dark-grey/30 rounded-full flex items-center gap-2"
                  >
                    <i className="fi fi-rs-redo"></i>Reply
                  </button>
                ) : (
                  ""
                )}

                <button
                  onClick={(e) => {
                    handleDelete(reply._id, "comment", e.target);
                  }}
                  className="text-red p-2 px-3 hover:bg-red/30 rounded-full flex items-center gap-2"
                >
                  <i className="fi fi-rr-trash"></i>Delete
                </button>
              </>
            ) : (
              ""
            )}
          </div>

          {isReplying ? (
            <NotificationCommentField
              _id={_id}
              blogAuthor={user}
              index={index}
              replyingTo={comment?._id}
              setIsReplying={setIsReplying}
              notificationId={notificationId}
              notificationData={notificationState}
            />
          ) : (
            ""
          )}
        </div>
      </div>

      {/* <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8">
        {type != "like" ? (
          <>
            <button
              onClick={handleReplyClick}
              className="text-dark-grey p-2 px-4 hover:bg-dark-grey/30 rounded-full flex items-center gap-2"
            >
              <i className="fi fi-rs-redo"></i>Reply
            </button>
            <button className="text-red p-2 px-3 hover:bg-red/30 rounded-full flex items-center gap-2">
              <i className="fi fi-rr-trash"></i>Delete
            </button>
          </>
        ) : (
          ""
        )}
      </div> */}

      {/* {isReplying ? (
        <NotificationCommentField
          _id={_id}
          blogAuthor={user}
          index={index}
          replyingTo={comment?._id}
          setIsReplying={setIsReplying}
          notificationId={notificationId}
          notificationData={notificationState}
        />
      ) : (
        ""
      )} */}

      {reply ? (
        <>
          <div className="ml-24 p-4 mt-4 bg-grey rounded-2xl">
            <div className="flex gap-3 ">
              <img src={authorProfileImg} className="w-8 h-8 rounded-full" />

              <div>
                <h1 className="font-medium text-xl text-dark-grey">
                  <Link
                    to={`/user/${authorUsername}`}
                    className="mx-1  text-blue-500"
                  >
                    @{authorUsername}
                  </Link>

                  <span className="font-normal">replied to</span>

                  <Link to={`/user/${username}`} className="mx-1 text-blue-500">
                    @{username}
                  </Link>
                </h1>
              </div>
            </div>
            <p className="ml-12 mt-0">{reply?.comment}</p>
          </div>
          <button
            onClick={(e) => {
              handleDelete(comment._id, "reply", e.target);
            }}
            className="text-red mt-3 ml-28 p-2 px-3 hover:bg-red/30 rounded-full flex items-center gap-2"
          >
            <i className="fi fi-rr-trash"></i>Delete
          </button>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default NotificationCard;
