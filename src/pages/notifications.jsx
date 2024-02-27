import { useContext, useEffect, useState } from "react";
import axios from "axios";

import { UserContext } from "../App";
import { filterPaginationNotificationData } from "../common/filter-pagination-notification-data";
import Loader from "../components/Loader";
import AnimationWrapper from "../common/page-animation";
import NoData from "../components/NoData";
import NotificationCard from "../components/NotificationCard";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(null);

  let filters = ["all", "like", "comment", "reply"];

  const {
    userAuth,
    setUserAuth,
    userAuth: { accessToken, newNotificationAvailable },
  } = useContext(UserContext);

  useEffect(() => {
    if (accessToken) {
      getNotificationData({ page: 1 });
    }
  }, [accessToken, filter]);

  const handleFilter = (e) => {
    const btn = e.target;

    setFilter(btn.innerHTML);

    setNotifications(null);
  };

  const getNotificationData = ({ page, deletedDocCount = 0 }) => {
    axios
      .post(
        `${
          import.meta.env.VITE_SERVER_DOMAIN
        }/notification/get-notification-data`,
        {
          page,
          filter,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(async ({ data: { notifications: data } }) => {
        if (newNotificationAvailable) {
          setUserAuth({ ...userAuth, newNotificationAvailable: false });
        }

        let formattedData = await filterPaginationNotificationData({
          state: notifications,
          data,
          page,
          countRoute: "all-notifications-count",
          dataToSend: { filter },
          user: accessToken,
        });

        setNotifications(formattedData);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <h1 className="max-md:hidden">Recent Notifications</h1>

      <div className="my-8 flex gap-6">
        {filters?.map((filtername, i) => {
          return (
            <button
              key={i}
              onClick={handleFilter}
              className={`${
                filter === filtername ? "btn-dark" : "btn-light"
              } px-4 py-2 capitalize`}
            >
              {filtername}
            </button>
          );
        })}
      </div>

      {notifications === null ? (
        <Loader />
      ) : (
        <>
          {notifications.results?.length ? (
            notifications.results?.map((notification, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                  <NotificationCard
                    data={notification}
                    index={i}
                    notificationState={{ notifications, setNotifications }}
                  />
                </AnimationWrapper>
              );
            })
          ) : (
            <NoData message="No new notification available" />
          )}

          <LoadMoreDataBtn
            state={notifications}
            fetchDataFunc={getNotificationData}
            additionalParams={{
              deletedDocCount: notifications.deletedDocCount,
            }}
          />
        </>
      )}
    </div>
  );
};

export default Notifications;
