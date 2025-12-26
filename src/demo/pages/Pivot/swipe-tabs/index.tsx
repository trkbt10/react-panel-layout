/**
 * @file Pivot - Swipe Tabs demo page
 */
import * as React from "react";
import { SwipeTabsPivot } from "../components/SwipeTabsPivot.js";

const Page: React.FC = () => {
  return (
    <div style={{ height: "100%", padding: "16px" }}>
      <SwipeTabsPivot />
    </div>
  );
};

export default Page;
