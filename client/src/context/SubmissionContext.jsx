 import { createContext, useEffect, useMemo, useState } from "react";
import { getMySubmissionsApi } from "../api/submissions.api";

export const SubmissionContext = createContext(null);

export function SubmissionProvider({ children }) {
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  async function reloadMySubmissions() {
    setLoadingSubs(true);
    try {
      const data = await getMySubmissionsApi();
      setMySubmissions(data);
    } finally {
      setLoadingSubs(false);
    }
  }

  useEffect(() => {
    reloadMySubmissions();
  }, []);

  const value = useMemo(
    () => ({ mySubmissions, loadingSubs, reloadMySubmissions }),
    [mySubmissions, loadingSubs]
  );

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
}
