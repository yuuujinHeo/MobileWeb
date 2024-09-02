/* eslint-disable @next/next/no-img-element */

import React, { useContext } from "react";
import { LayoutContext } from "./context/layoutcontext";

const AppFooter = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const date = new Date();
  const year = date.getFullYear();

  return (
    <div className="layout-footer">
      <p>Copyright © {year} RAINBOW ROBOTICS Inc. All Rights Reserved.</p>
    </div>
  );
};

export default AppFooter;
