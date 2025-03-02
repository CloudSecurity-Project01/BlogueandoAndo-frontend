import { createContext, useContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "../styles/toast.css";

const ToastContext = createContext();

const toastIcons = {
  success: <FaCheckCircle className="me-2" />,
  error: <FaExclamationCircle className="me-2" />,
  info: <FaInfoCircle className="me-2" />
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  
    const showToast = (message, variant = "success") => {
      setToast({ show: true, message, variant });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
    };
  
    return (
      <ToastContext.Provider value={showToast}>
        {children}
        <ToastContainer
          className="toast-container-custom p-3"
        >
          <Toast
            show={toast.show}
            bg={toast.variant}
            onClose={() => setToast({ show: false })}
            className={`toast-custom toast-${toast.variant} ${toast.show ? "" : "toast-exit"}`}
          >
            <Toast.Body className="text-white d-flex align-items-center">
              {toastIcons[toast.variant]} {toast.message}
              <button className="close-btn" onClick={() => setToast({ show: false })}>
                <FaTimes />
              </button>
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </ToastContext.Provider>
    );
  };
  

export const useToast = () => useContext(ToastContext);
