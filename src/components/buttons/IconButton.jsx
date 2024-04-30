import React from "react";
import { Button } from "antd";

const IconButton = ({ handleClick, children }) => {
  return (
    <Button
      type="circle"
      onClick={handleClick}
      style={{
        color: "black",
        background: "red",
        // padding: "2px",
        border: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </Button>
  );
};

export default IconButton;
