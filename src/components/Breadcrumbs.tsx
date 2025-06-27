// src/components/Breadcrumbs.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    path?: string; // '?' makes this property optional
  }

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.path ? (
            <Link
              to={item.path}
              className={cn(
                "hover:text-primary transition-colors",
                index === items.length - 1 && "text-foreground font-medium"
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export type { BreadcrumbItem };
export default Breadcrumbs;