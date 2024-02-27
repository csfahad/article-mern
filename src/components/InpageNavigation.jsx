import { useEffect, useRef, useState } from "react";

export let activeTabLineRef;
export let activeTabRef;

const InpageNavigation = ({
  routes,
  defaultHidden = [],
  defaultActiveIndex = 0,
  children,
}) => {
  activeTabLineRef = useRef();
  activeTabRef = useRef();

  const [inPageNavIndex, setInPageNavIndex] = useState(null);

  const [isResizeEventAdded, setIsResizeEventAdded] = useState(false);

  const [width, setWidth] = useState(window.innerWidth);

  const changePageState = (btn, index) => {
    let { offsetWidth, offsetLeft } = btn;

    activeTabLineRef.current.style.width = `${offsetWidth}px`;
    activeTabLineRef.current.style.left = `${offsetLeft}px`;

    setInPageNavIndex(index);
  };

  useEffect(() => {
    if (width > 766 && inPageNavIndex != defaultActiveIndex) {
      changePageState(activeTabRef.current, defaultActiveIndex);
    }

    if (!isResizeEventAdded) {
      window.addEventListener("resize", () => {
        if (!isResizeEventAdded) {
          setIsResizeEventAdded(true);
        }
        setWidth(window.innerWidth);
      });
    }
  }, [width]);

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {routes?.map((route, index) => {
          return (
            <button
              ref={index == defaultActiveIndex ? activeTabRef : null}
              key={index}
              className={`p-4 px-5 capitalize ${
                inPageNavIndex == index ? "text-black" : "text-dark-grey"
              } ${defaultHidden.includes(route) ? "md:hidden" : ""}`}
              onClick={(e) => {
                changePageState(e.target, index);
              }}
            >
              {route}
            </button>
          );
        })}

        <hr
          ref={activeTabLineRef}
          className="absolute border-dark-grey bottom-0 duration-300"
        />
      </div>

      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InpageNavigation;
