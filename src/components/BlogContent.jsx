import { useEffect, useState } from "react";
import "highlight.js/styles/github-dark-dimmed.css";
import hljs from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";

hljs.registerLanguage("javascript", javascript);

const Img = ({ url, caption }) => {
  return (
    <div>
      <img src={url} />
      {caption?.length ? (
        <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">
          {caption}
        </p>
      ) : (
        ""
      )}
    </div>
  );
};

const Quote = ({ quote, caption }) => {
  return (
    <div className="bg-twitter/10 p-3 pl-5 border-l-4 border-twitter">
      <p className="text-xl leading-10 md:text-2xl">{quote}</p>
      {caption?.length ? (
        <p className="w-full text-twitter text-base">{caption}</p>
      ) : (
        ""
      )}
    </div>
  );
};

const List = ({ style, items }) => {
  return (
    <ol className={`pl-5 ${style == "ordered" ? "list-decimal" : "list-disc"}`}>
      {items?.map((listItem, i) => {
        return (
          <li
            key={i}
            className="my-4"
            dangerouslySetInnerHTML={{ __html: listItem }}
          ></li>
        );
      })}
    </ol>
  );
};

const BlogContent = ({ block }) => {
  const [isCopied, setIsCopied] = useState(false);
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data.code);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (error) {
      setIsCopied(false);
    }
  };

  useEffect(() => {
    hljs.highlightAll();
  }, []);

  let { type, data } = block;

  if (type === "paragraph") {
    return (
      <p
        dangerouslySetInnerHTML={{ __html: data.text }}
        className="text-black"
      ></p>
    );
  }

  if (type === "header") {
    if (data.level == 3) {
      return (
        <h3
          dangerouslySetInnerHTML={{ __html: data.text }}
          className="text-3xl font-bold"
        ></h3>
      );
    }
    return (
      <h2
        dangerouslySetInnerHTML={{ __html: data.text }}
        className="text-4xl font-bold"
      ></h2>
    );
  }

  if (type === "image") {
    return <Img url={data?.file?.url} caption={data?.caption} />;
  }

  if (type === "list") {
    return <List style={data.style} items={data.items} />;
  }

  if (type === "quote") {
    return <Quote quote={data.text} caption={data.caption} />;
  }

  if (type === "code") {
    return (
      <>
        <pre className=" p-3 rounded-md overflow-x-auto ">
          <div className="flex justify-end bg-[#22272E] pt-3 pr-3">
            <button onClick={copyToClipboard}>
              <i
                className={`fi fi-sr-${
                  isCopied ? "assept-document" : "duplicate"
                } text-3xl ${isCopied ? "text-green" : "text-dark-grey"}`}
              ></i>
            </button>
          </div>
          <code className="javascript" value={data.code}>
            {data.code}
          </code>
        </pre>
      </>
    );
  }
};

export default BlogContent;
