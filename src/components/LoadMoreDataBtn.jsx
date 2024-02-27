const LoadMoreDataBtn = ({ state, fetchDataFunc, additionalParams }) => {
  if (state !== null && state.totalDocs > state.results?.length) {
    return (
      <button
        onClick={() =>
          fetchDataFunc({ ...additionalParams, page: state.page + 1 })
        }
        className="text-dark-grey p-2 px-5 hover:bg-dark-grey/30 rounded-full flex m-auto items-center justify-center gap-2"
      >
        Load more
      </button>
    );
  }
};

export default LoadMoreDataBtn;
