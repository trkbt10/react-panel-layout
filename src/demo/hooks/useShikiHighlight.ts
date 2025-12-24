/**
 * @file useShikiHighlight hook for syntax highlighting with shiki
 */
import * as React from "react";
import { codeToHtml, type BundledLanguage, type BundledTheme } from "shiki";

export type UseShikiHighlightOptions = {
  code: string;
  language?: BundledLanguage;
  theme?: BundledTheme;
};

export type UseShikiHighlightResult = {
  html: string;
  isLoading: boolean;
};

/**
 * Hook to highlight code using shiki
 * Returns HTML string with syntax highlighting
 */
export function useShikiHighlight(options: UseShikiHighlightOptions): UseShikiHighlightResult {
  const { code, language = "typescript", theme = "github-dark" } = options;
  const [html, setHtml] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const abortController = new AbortController();
    setIsLoading(true);

    codeToHtml(code, {
      lang: language,
      theme: theme,
    })
      .then((result) => {
        if (!abortController.signal.aborted) {
          setHtml(result);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Shiki highlighting failed:", error);
        if (!abortController.signal.aborted) {
          setHtml("");
          setIsLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [code, language, theme]);

  return { html, isLoading };
}
