import { useEffect, useState, useCallback } from "react";
import Empty from "./components/empty";
import AppList from "./components/appList";

export default function Home() {
  return (
    <div>
      {/* <Empty /> */}
      <AppList />
    </div>
  );
}
