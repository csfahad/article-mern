import { useState, useContext, createContext, useEffect } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";

import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";
import Loader from "../components/Loader";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  desc: "",
  author: { personalInfo: {} },
};

export const EditorContext = createContext({});

const Editor = () => {
  const { blogId } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const [loading, setLoading] = useState(true);

  let {
    userAuth: { accessToken },
  } = useContext(UserContext);

  useEffect(() => {
    if (!blogId) {
      return setLoading(false);
    }

    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/blog/get-blog`, {
        blogId,
        draft: true,
        mode: "edit",
      })
      .then(({ data: { blog } }) => {
        setBlog(blog);
        setLoading(false);
      })
      .catch((err) => {
        setBlog(null);
        setLoading(false);
      });
  }, []);

  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {accessToken === null ? (
        <Navigate to="/signin" />
      ) : loading ? (
        <Loader />
      ) : editorState == "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
};

export default Editor;
