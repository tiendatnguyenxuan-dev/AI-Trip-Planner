import React from 'react';

interface TagBadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  className?: string;
}

const TagBadge: React.FC<TagBadgeProps> = ({ label, variant = 'outline', className = '' }) => {
  const baseStyles = 'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all';
  
  const variants = {
    primary: 'bg-primary text-white shadow-sm',
    secondary: 'bg-primary/10 text-primary',
    outline: 'border border-primary/10 text-text-muted',
    glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-white',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {label}
    </span>
  );
};

export default TagBadge;
