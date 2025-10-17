import React from "react";
import Navigation from "@/components/Navigation";

function page() {
  return (
    <div className="min-h-screen">
      <Navigation currentPath="/profile" />
    </div>
  );
}

export default page;
