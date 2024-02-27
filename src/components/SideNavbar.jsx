import { useContext, useEffect, useRef, useState } from "react";
import { Navigate, Outlet, NavLink } from "react-router-dom";
import { UserContext } from "../App";

const SideNavbar = () => {
  let {
    userAuth: { accessToken, newNotificationAvailable },
  } = useContext(UserContext);

  let page = location.pathname.split("/")[2];

  let [pageState, setPageState] = useState(page.replace("-", " "));
  const [showSideNav, setShowSideNav] = useState(false);

  let activeTabLine = useRef();
  let sideBarIconTab = useRef();
  let pageStateTab = useRef();

  const changePageState = (e) => {
    let { offsetWidth, offsetLeft } = e.target;

    activeTabLine.current.style.width = `${offsetWidth}px`;
    activeTabLine.current.style.left = `${offsetLeft}px`;

    if (e.target == sideBarIconTab.current) {
      setShowSideNav(true);
    } else {
      setShowSideNav(false);
    }
  };

  useEffect(() => {
    setShowSideNav(false);
    pageStateTab.current.click();
  }, [pageState]);

  return accessToken === null ? (
    <Navigate to="/signin" />
  ) : (
    <>
      <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
        <div className="sticky top-[80px] z-30">
          <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto">
            <button
              ref={sideBarIconTab}
              className="p-5 capitalize"
              onClick={changePageState}
            >
              <i className="fi fi-rr-bars-staggered pointer-events-none"></i>
            </button>

            <button
              ref={pageStateTab}
              className="p-5 capitalize"
              onClick={changePageState}
            >
              {pageState}
            </button>

            <hr
              ref={activeTabLine}
              className="absolute bottom-0 bg-black duration-500"
            />
          </div>

          <div
            className={`min-w-[200px] h-[calc(100vh-80px-60px)] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500 ${
              !showSideNav
                ? "max-md:opacity-0 max-md:pointer-events-none"
                : "opacity-100 pointer-events-auto"
            }`}
          >
            <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
            <hr className="border-grey -ml-6 mb-8 mr-6" />

            <NavLink
              to="/dashboard/blogs"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link text-xl flex items-center"
            >
              <i className="fi fi-rr-document mt-1 text-xl"></i>
              Articles
            </NavLink>

            <NavLink
              to="/dashboard/notifications"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link text-xl flex items-center"
            >
              <div className="relative">
                <i className="fi fi-rr-bell mt-1 text-xl"></i>
                {newNotificationAvailable ? (
                  <span className="bg-red w-2 h-2 rounded-full absolute z-10 top-0 right-0"></span>
                ) : (
                  ""
                )}
              </div>
              Notifications
            </NavLink>

            <NavLink
              to="/editor"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link text-xl flex items-center"
            >
              <i className="fi fi-rr-file-edit mt-1 text-xl"></i>
              Write
            </NavLink>

            <h1 className="text-xl text-dark-grey mb-3 mt-20">Settings</h1>
            <hr className="border-grey -ml-6 mb-8 mr-6" />

            <NavLink
              to="/settings/edit-profile"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link text-xl flex items-center"
            >
              <i className="fi fi-rr-user mt-1 text-xl"></i>
              Edit Profile
            </NavLink>

            <NavLink
              to="/settings/change-password"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link text-xl flex items-center"
            >
              <i className="fi fi-rr-key mt-1 text-xl"></i>
              Change Password
            </NavLink>
          </div>
        </div>

        <div className="max-md:-mt-8 mt-5 w-full">
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default SideNavbar;
