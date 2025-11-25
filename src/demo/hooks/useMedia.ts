/**
 * @file Media query matcher hook for demo pages.
 */
import * as React from "react";

const getInitialMatch = (mediaQuery: string): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(mediaQuery).matches;
};

export const useMedia = (mediaQuery: string): boolean => {
  if (!mediaQuery || mediaQuery.trim().length === 0) {
    throw new Error("useMedia requires a non-empty mediaQuery string.");
  }

  const [matches, setMatches] = React.useState<boolean>(() => getInitialMatch(mediaQuery));

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setMatches(false);
      return;
    }

    const mediaList = window.matchMedia(mediaQuery);
    const handleChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    setMatches(mediaList.matches);
    mediaList.addEventListener("change", handleChange);

    return () => {
      mediaList.removeEventListener("change", handleChange);
    };
  }, [mediaQuery]);

  return matches;
};
