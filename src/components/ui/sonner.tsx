import type { ComponentProps } from "react";
import { Toaster as Sonner, toast } from "sonner";

import { PROMPT_TOAST_CLASSNAMES } from "@/lib/prompt-toast";

type ToasterProps = ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      closeButton
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: PROMPT_TOAST_CLASSNAMES,
        duration: 2600,
      }}
      {...props}
    />
  );
}

export { toast };

