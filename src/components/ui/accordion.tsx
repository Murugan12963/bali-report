import React from 'react';

interface AccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  children?: React.ReactNode;
  className?: string;
}

interface AccordionItemProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

interface AccordionTriggerProps {
  children?: React.ReactNode;
  className?: string;
}

interface AccordionContentProps {
  children?: React.ReactNode;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  type = 'single',
  collapsible = false,
  children,
  className
}) => {
  return (
    <div className={`w-full ${className || ''}`}>
      {children}
    </div>
  );
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  children,
  className
}) => {
  return (
    <div className={`border-b ${className || ''}`}>
      {children}
    </div>
  );
};

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  className
}) => {
  return (
    <button className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 ${className || ''}`}>
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 transition-transform duration-200"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
};

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={`overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down ${className || ''}`}>
      <div className="pb-4 pt-0">
        {children}
      </div>
    </div>
  );
};
