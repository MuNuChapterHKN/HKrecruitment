import React, { useState, useEffect } from "react";

function AvaiabilitiesCell(props) {
  const [className, setClassName] = useState("");

  return (
    <div onClick={() => setClassName("active")}>
      <a>{props.name}</a>
    </div>
  );
}
export default AvaiabilitiesCell;
