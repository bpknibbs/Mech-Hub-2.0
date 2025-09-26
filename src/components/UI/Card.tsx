import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`
      bg-teal-50 rounded-lg shadow-sm border border-teal-200 
      ${hover ? 'hover:shadow-md hover:border-teal-400 hover:shadow-teal-500/20 transition-all duration-200' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}