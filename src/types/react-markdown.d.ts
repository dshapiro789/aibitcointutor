// Type definitions for react-markdown components
import { ReactNode } from 'react';

declare module 'react-markdown' {
  export interface CodeComponentProps {
    node: any;
    inline?: boolean;
    className?: string;
    children?: ReactNode;
  }
}
