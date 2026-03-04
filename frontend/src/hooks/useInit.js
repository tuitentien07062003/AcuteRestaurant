import { useEffect } from "react";

// Initialize component - call function when dependencies change
// Default behavior: run once on mount by passing empty array []
export default function useInit(fn, deps) {
  useEffect(() => {
    fn();
  }, deps);
}
