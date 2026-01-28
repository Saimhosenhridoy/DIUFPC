 import { useContext } from "react";
import { SubmissionContext } from "../context/SubmissionContext";

export function useSubmissions() {
  return useContext(SubmissionContext);
}
