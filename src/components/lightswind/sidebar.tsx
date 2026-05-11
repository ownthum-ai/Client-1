"use client";
import * as React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

function cn(...inputs: clsx.ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarContextType {
  expanded: boolean;
  onChange: (expanded: boolean) => void;
  activeMenuItem: string | null;
  setActiveMenuItem: (id: string | null) => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

interface SidebarProviderProps {
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children: React.ReactNode;
}

export function SidebarProvider({
  defaultExpanded = true,
  expanded: controlledExpanded,
  onExpandedChange,
  children,
}: SidebarProviderProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [activeMenuItem, setActiveMenuItem] = React.useState<string | null>(null);

  const isControlled = controlledExpanded !== undefined;
  const actualExpanded = isControlled ? controlledExpanded : expanded;

  const onExpandedChangeRef = React.useRef(onExpandedChange);

  React.useEffect(() => {
    onExpandedChangeRef.current = onExpandedChange;
  }, [onExpandedChange]);

  const handleExpandedChange = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setExpanded(value);
      }
      onExpandedChangeRef.current?.(value);
    },
    [isControlled]
  );

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const path = url.pathname;

    let potentialMenuItemValue: string | null = null;

    if (searchParams.has("component")) {
      potentialMenuItemValue = searchParams.get("component");
    } else {
      const pathSegments = path.split("/").filter((segment) => segment);
      if (pathSegments.length > 0) {
        potentialMenuItemValue = pathSegments[pathSegments.length - 1];
      }
    }
    setActiveMenuItem(potentialMenuItemValue);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        expanded: actualExpanded,
        onChange: handleExpandedChange,
        activeMenuItem,
        setActiveMenuItem,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  const { expanded } = useSidebar();

  return (
    <div
      className={cn(
        "h-full min-h-screen z-40 w-56 relative",
        "bg-white border-r border-[var(--border)] shadow-sm",
        "fixed lg:sticky top-0 md:top-0",
        expanded ? "left-0" : "md:left-0 -left-full",
        "transition-none",
        className
      )}
      role="complementary"
      data-collapsed={!expanded}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { expanded, onChange } = useSidebar();

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-[var(--text3)] hover:bg-gray-100 focus:outline-none",
        "fixed md:static z-50 left-4 top-20",
        "transition-none",
        className
      )}
      onClick={() => onChange(!expanded)}
      aria-label={expanded ? "Close sidebar" : "Open sidebar"}
      {...props}
    >
      <span className="sr-only">
        {expanded ? "Close sidebar" : "Open sidebar"}
      </span>
      {expanded ? (
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({
  className,
  children,
  ...props
}: SidebarHeaderProps) {
  const { expanded } = useSidebar();

  return (
    <div
      className={cn(
        "flex h-16 items-center border-b border-[var(--border)] px-4",
        expanded ? "justify-between" : "justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({
  className,
  children,
  ...props
}: SidebarContentProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-hidden h-[calc(100vh-4rem)] space-y-4",
        className
      )}
      {...props}
    >
      <div className="h-full pb-12 overflow-auto scrollbar-hide">
        {children}
      </div>
    </div>
  );
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroup({
  className,
  children,
  ...props
}: SidebarGroupProps) {
  return (
    <div className={cn("px-2 py-4", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupLabel({
  className,
  children,
  ...props
}: SidebarGroupLabelProps) {
  const { expanded } = useSidebar();

  if (!expanded) {
    return null;
  }

  return (
    <div
      className={cn(
        "mb-2 px-2 text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarGroupContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupContent({
  className,
  children,
  ...props
}: SidebarGroupContentProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({
  className,
  children,
  ...props
}: SidebarFooterProps) {
  const { expanded } = useSidebar();

  return (
    <div
      className={cn(
        "flex border-t border-[var(--border)] p-4",
        expanded
          ? "flex-row items-center justify-between"
          : "flex-col justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenu({
  className,
  children,
  ...props
}: SidebarMenuProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
}

export function SidebarMenuItem({
  className,
  children,
  value,
  ...props
}: SidebarMenuItemProps) {
  const { activeMenuItem } = useSidebar();
  const generatedId = React.useId();
  const menuItemId = value || generatedId;
  const isActive = activeMenuItem === menuItemId;

  return (
    <div
      className={cn("mb-1", className)}
      data-value={menuItemId}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarMenuButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  value?: string;
}

export function SidebarMenuButton({
  className,
  children,
  asChild = false,
  value,
  ...props
}: SidebarMenuButtonProps) {
  const {
    expanded,
    activeMenuItem,
    setActiveMenuItem,
  } = useSidebar();
  const generatedId = React.useId();
  const menuItemId = value || generatedId;
  const isActive = activeMenuItem === menuItemId;

  const handleClick = React.useCallback(() => {
    setActiveMenuItem(menuItemId);
    if (props.onClick && typeof props.onClick === "function") {
      const dummyEvent = {
        currentTarget: {} as EventTarget & HTMLDivElement,
        target: {} as EventTarget,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as React.MouseEvent<HTMLDivElement>;
      props.onClick(dummyEvent);
    }
  }, [menuItemId, setActiveMenuItem, props.onClick]);

  const sharedClassName =
    "flex cursor-pointer items-center rounded-lg px-3 py-2 text-[13px] font-bold tracking-tight transition-none ";

  if (!expanded) {
    return (
      <div
        className={cn(
          sharedClassName,
          "justify-center p-2",
          isActive ? "bg-gray-900 text-white" : "text-[var(--text3)] hover:bg-gray-100",
          className
        )}
        data-active={isActive ? "true" : "false"}
        onClick={handleClick}
        {...props}
      >
        {React.Children.toArray(children).find(
          (child) => React.isValidElement(child) && typeof child.type !== "string"
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        sharedClassName,
        "justify-start gap-3",
        isActive ? "bg-gray-900 text-white" : "text-[var(--text3)] hover:bg-gray-100",
        className
      )}
      data-active={isActive ? "true" : "false"}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}

export { Sidebar as SidebarRoot };
