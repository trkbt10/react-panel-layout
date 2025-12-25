/**
 * @file Pivot - Swipe Navigation demo page
 */
import * as React from "react";
import { SwipePivot } from "../components/SwipePivot";

// Temporarily render directly without SingleSamplePage to debug
const Page: React.FC = () => {
  return (
    <div style={{ height: "100%", padding: "16px" }}>
      <SwipePivot />
    </div>
  );
};

export default Page;
