import axios from "axios";
import toast from "react-hot-toast";

import { useContext, useState } from "react";
import { UserContext } from "../App";

const NotificationCommentField = ({
  _id,
  blogAuthor,
  index = undefined,
  replyingTo = undefined,
  setIsReplying,
  notificationId,
  notificationData,
}) => {
  const [comment, setComment] = useState("");

  let { _id: userId } = blogAuthor;
  let {
    userAuth: { accessToken },
  } = useContext(UserContext);
  let {
    notifications,
    notifications: { results },
    setNotifications,
  } = notificationData;

  const handleComment = () => {
    if (!comment?.length) {
      return toast.error("Write something for reply", {
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
          blogAuthor: userId,
          comment,
          replyingTo: replyingTo,
          notificationId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(({ data }) => {
        setIsReplying(false);

        results[index].reply = { comment, _id: data._id };

        setNotifications({ ...notifications, results });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <textarea
        className="input-box pl-5 mt-4 rounded-2xl placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a Reply..."
      ></textarea>

      <button
        onClick={handleComment}
        className="btn-dark mt-5 mb-5 px-10 w-auto mx-auto "
      >
        Reply
      </button>
    </>
  );
};

export default NotificationCommentField;
