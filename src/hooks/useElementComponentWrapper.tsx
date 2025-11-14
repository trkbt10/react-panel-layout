/**
 * @file Hook for building wrapper components that accept either an element or a component override.
 */
import * as React from "react";

type WrapperProps = React.HTMLAttributes<HTMLDivElement>;

type CloneableProps = WrapperProps & {
  ref?: React.Ref<HTMLDivElement>;
};

type UseElementComponentWrapperOptions = {
  element?: React.ReactElement<WrapperProps>;
  component?: React.ComponentType<WrapperProps & { ref?: React.Ref<HTMLDivElement> }>;
};

type WrapperComponent = React.ForwardRefExoticComponent<
  React.PropsWithChildren<WrapperProps> & React.RefAttributes<HTMLDivElement>
>;

const createWrapperComponent = ({
  element,
  component: Component,
}: UseElementComponentWrapperOptions): WrapperComponent =>
  React.forwardRef<HTMLDivElement, React.PropsWithChildren<WrapperProps>>(({ children, ...rest }, forwardedRef) => {
    if (element) {
      return React.cloneElement(
        element,
        { ...rest, ref: forwardedRef } as CloneableProps,
        children ?? element.props.children
      );
    }
    if (Component) {
      return (
        <Component {...rest} ref={forwardedRef}>
          {children}
        </Component>
      );
    }
    return (
      <div {...rest} ref={forwardedRef}>
        {children}
      </div>
    );
  });

/**
 * Memoizes a wrapper component that can render either a provided element, a provided component, or a default tag.
 * @returns Wrapper component honoring the overrides.
 */
export function useElementComponentWrapper({
  element,
  component,
}: UseElementComponentWrapperOptions): WrapperComponent {
  return React.useMemo(
    () =>
      createWrapperComponent({
        element,
        component,
      }),
    [component, element]
  );
}
