import { useState, createContext, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import HomePage from "./pages/home";
import Editor from "./pages/editor";
import UserAuthForm from "./pages/userAuthForm";
import { lookInSession } from "./common/session";
import SearchPage from "./pages/search";
import PageNotFound from "./pages/PageNotFound";
import ProfilePage from "./pages/profilePage";
import BlogPage from "./pages/blogPage";
import SideNavbar from "./components/SideNavbar";
import ChangePassword from "./pages/changePassword";
import EditProfile from "./pages/editProfile";
import Notifications from "./pages/notifications";
import ManageBlogs from "./pages/manageBlogs";

export const UserContext = createContext({});

export const ThemeContext = createContext({});

const darkThemePreferece = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const App = () => {
  const [userAuth, setUserAuth] = useState({});

  const [theme, setTheme] = useState(() =>
    darkThemePreferece() ? "dark" : "light"
  );

  useEffect(() => {
    const userInSession = lookInSession("user");
    const themeInSession = lookInSession("theme");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ accessToken: null });

    if (themeInSession) {
      setTheme(() => {
        document.body.setAttribute("data-theme", themeInSession);
        return themeInSession;
      });
    } else {
      document.body.setAttribute("data-theme", theme);
    }
  }, []);

  return (
    <>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <UserContext.Provider value={{ userAuth, setUserAuth }}>
          <Routes>
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:blogId" element={<Editor />} />
            <Route path="/" exact element={<Navbar />}>
              <Route index element={<HomePage />} />

              <Route path="dashboard" element={<SideNavbar />}>
                <Route path="blogs" element={<ManageBlogs />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              <Route path="settings" element={<SideNavbar />}>
                <Route path="edit-profile" element={<EditProfile />} />

                <Route path="change-password" element={<ChangePassword />} />
              </Route>

              <Route
                path="signin"
                exact
                element={<UserAuthForm type="sign-in" />}
              />
              <Route
                path="signup"
                exact
                element={<UserAuthForm type="sign-up" />}
              />
              <Route path="search/:query" element={<SearchPage />} />
              <Route path="user/:id" element={<ProfilePage />} />
              <Route path="blog/:blogId" element={<BlogPage />} />

              <Route path="*" element={<PageNotFound />} />
            </Route>
          </Routes>
          <Toaster position="top-center" reverseOrder={false} />
        </UserContext.Provider>
      </ThemeContext.Provider>
    </>
  );
};

export default App;
