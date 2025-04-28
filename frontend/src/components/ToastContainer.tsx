import React from "react";
import { ToastContainer as ReactToastContainer } from "react-toastify";

const ToastContainer: React.FC = () => {
  return (
    <ReactToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      toastClassName="shadow-md"
    />
  );
};

export default ToastContainer;
