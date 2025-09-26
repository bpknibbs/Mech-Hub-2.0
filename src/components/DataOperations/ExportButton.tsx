import React, { useState } from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import Button from '../UI/Button';
import ExportDialog from './ExportDialog';
import { useDataOperations } from '../../contexts/DataOperationsContext';

interface ExportButtonProps {
  category: string;
  items: any[];
  selectedItems?: string[];
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ExportButton({
  category,
  items,
  selectedItems,
  variant = 'outline',
  size = 'sm',
  className = ''
}: ExportButtonProps) {
  const { exportData } = useDataOperations();
  const [showDialog, setShowDialog] = useState(false);

  const handleExport = (options: any) => {
    const itemIds = selectedItems?.length 
      ? selectedItems 
      : items.map(item => item.id);
    
    exportData(category, itemIds, options);
  };

  const exportCount = selectedItems?.length || items.length;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowDialog(true)}
        className={className}
        disabled={items.length === 0}
      >
        <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
        Export {selectedItems?.length ? `(${selectedItems.length})` : 'All'}
      </Button>

      <ExportDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onExport={handleExport}
        category={category}
        itemCount={exportCount}
      />
    </>
  );
}