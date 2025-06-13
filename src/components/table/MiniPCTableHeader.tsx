import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
} from '@mui/material';
import React from 'react';
import type { SortKey, SortConfig } from './tableUtils';

interface MiniPCTableHeaderProps {
  sortConfig: SortConfig;
  onSort: (key: SortKey) => void;
}

export function MiniPCTableHeader({ sortConfig, onSort }: MiniPCTableHeaderProps) {
  const renderSortLabel = React.useCallback((label: string, key: SortKey) => (
    <TableSortLabel
      active={sortConfig.key === key}
      direction={sortConfig.key === key ? sortConfig.direction : 'asc'}
      onClick={() => onSort(key)}
      sx={{
        display: 'flex',
        width: '100%', 
        justifyContent: key === 'cpu.tdp' || key === 'memory.speed' ? 'flex-end' : 'flex-start',
        '& .MuiTableSortLabel-icon': {
          marginTop: '2px'
        },
        '&:hover': {
          color: (theme: any) => theme.palette.primary.main,
        },
        '&:focus-visible': {
          outline: (theme: any) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
          borderRadius: 1,
        }
      }}
      aria-label={`Sort by ${label} ${sortConfig.key === key && sortConfig.direction === 'asc' ? 'descending' : 'ascending'}`}
    >
      {label}
    </TableSortLabel>
  ), [sortConfig, onSort]);

  const headerCellStyle = React.useMemo(() => ({
    background: (theme: any) => theme.palette.mode === 'dark' 
      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
    fontWeight: 'bold',
    color: (theme: any) => theme.palette.mode === 'dark' 
      ? theme.palette.primary.contrastText 
      : theme.palette.primary.dark,
    borderBottom: (theme: any) => `1px solid ${theme.palette.divider}`,
    position: 'sticky',
    top: 0,
    zIndex: (theme: any) => theme.zIndex.appBar - 1,
  }), []);

  return (
    <TableHead>
      <TableRow>
        <TableCell 
          sx={{ 
            ...headerCellStyle,
            width: 100,
            minWidth: 80,
            textAlign: 'left',
          }}
        >{renderSortLabel('Brand', 'brand')}</TableCell>
        <TableCell
          sx={{ 
            ...headerCellStyle,
            width: 140,
            minWidth: 120,
            textAlign: 'left',
          }}
        >{renderSortLabel('Model', 'model')}</TableCell>
        <TableCell
          sx={{ 
            ...headerCellStyle,
            width: 170,
            minWidth: 150,
          }}
        >{renderSortLabel('CPU', 'cpu.model')}</TableCell>
        <TableCell
          sx={{ 
            ...headerCellStyle,
            width: 120,
            minWidth: 100,
          }}
        >{renderSortLabel('GPU', 'gpu.model')}</TableCell>
        <TableCell 
          sx={{ 
            ...headerCellStyle,
            width: 55,
            minWidth: 55,
          }}
        >{renderSortLabel('Cores', 'cpu.cores')}</TableCell>
        <TableCell
          sx={{ 
            ...headerCellStyle,
            width: 150,
            minWidth: 130,
          }}
        >{renderSortLabel('Memory', 'memory.type')}</TableCell>
        <TableCell
          align="left"
          sx={{ 
            ...headerCellStyle,
            width: 120,
            minWidth: 100,
          }}
        >Storage</TableCell>
        <TableCell
          align="left"
          sx={{ 
            ...headerCellStyle,
            width: 120,
            minWidth: 100,
          }}
        >Ethernet</TableCell>
        <TableCell
          align="left"
          sx={{ 
            ...headerCellStyle,
            width: 120,
            minWidth: 100,
          }}
        >WiFi</TableCell>
        <TableCell
          sx={{ 
            ...headerCellStyle,
            width: 80,
            minWidth: 80,
          }}
        >{renderSortLabel('Liters', 'dimensions.volume')}</TableCell>
        <TableCell
          sx={{ 
            ...headerCellStyle,
            width: 70,
            minWidth: 70,
            padding: '6px 8px',
          }}
        >Details</TableCell>
      </TableRow>
    </TableHead>
  );
} 