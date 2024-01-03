import React, { useState, useEffect } from "react";

function AvaiabilitiesCell(props) {
  const [className, setClassName] = useState("name");

  return (
    <td
      onClick={() =>
        className == "name active"
          ? setClassName("name")
          : setClassName("name active")
      }
      className={className}
    >
      <a>{props.name}</a>
    </td>
  );
}
export default AvaiabilitiesCell;
