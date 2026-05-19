import * as React from "react";
import { cn } from "~/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  size?: "default" | "sm";
  container?: boolean;
}

export function Section({
  className,
  size = "default",
  container = true,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        size === "default" ? "section" : "section-sm",
        className
      )}
      {...props}
    >
      {container ? (
        <div className="container mx-auto container-padding">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
