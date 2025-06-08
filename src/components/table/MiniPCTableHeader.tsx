import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
} from '@mui/material';
import type { SortKey, SortConfig } from './tableUtils';

interface MiniPCTableHeaderProps {
  sortConfig: SortConfig;
  onSort: (key: SortKey) => void;
}

export function MiniPCTableHeader({ sortConfig, onSort }: MiniPCTableHeaderProps) {
  const renderSortLabel = (label: string, key: SortKey) => (
    <TableSortLabel
      active={sortConfig.key === key}
      direction={sortConfig.key === key ? sortConfig.direction : 'asc'}
      onClick={() => onSort(key)}
      sx={{
        display: 'flex',
        width: '100%', 
        justifyContent: key === 'cpu.cores' || key === 'cpu.tdp' || key === 'memory.speed' ? 'flex-end' : 'flex-start',
        '& .MuiTableSortLabel-icon': {
          marginTop: '2px'
        }
      }}
    >
      {label}
    </TableSortLabel>
  );

  const headerCellStyle = {
    background: (theme: any) => theme.palette.mode === 'dark' 
      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
    fontWeight: 'bold',
    color: (theme: any) => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
    borderBottom: (theme: any) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  };

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
        >GPU</TableCell>
        <TableCell 
          align="right"
          sx={{ 
            ...headerCellStyle,
            width: 80,
            minWidth: 80,
          }}
        >{renderSortLabel('Cores', 'cpu.cores')}</TableCell>
        <TableCell
          sx={{ 
            ...headerCellStyle,
            width: 120,
            minWidth: 100,
          }}
        >{renderSortLabel('Memory', 'memory.type')}</TableCell>
        <TableCell
          sx={{ 
            ...headerCellStyle,
            width: 90,
            minWidth: 90,
          }}
        >{renderSortLabel('Module', 'memory.module_type')}</TableCell>
        <TableCell 
          align="right"
          sx={{ 
            ...headerCellStyle,
            width: 90,
            minWidth: 90,
          }}
        >{renderSortLabel('Speed', 'memory.speed')}</TableCell>
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