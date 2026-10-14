import { useTranslation } from '@/lib/i18n'
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

function Label({ className, ...props }) {
  const { t } = useTranslation()
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {React.Children.map(props.children, child => typeof child === 'string' ? t(child) : child)}
    </LabelPrimitive.Root>
  )
}

export { Label }
