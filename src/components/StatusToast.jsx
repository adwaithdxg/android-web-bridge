import React from "react";
import { styles } from "../styles/AppStyles";

const StatusToast = ({ type, message, icon: Icon }) => (
  <div style={{ ...styles.toast, ...(type === 'error' ? styles.errorToast : styles.successToast) }}>
    <Icon size={18} />
    <span>{message}</span>
  </div>
);

export default StatusToast;
