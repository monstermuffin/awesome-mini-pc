import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  Typography,
  Box,
} from '@mui/material';
import { useState } from 'react';
import type { MiniPC } from '../types/minipc';
import { MiniPCTableHeader } from './table/MiniPCTableHeader';
import { MiniPCTableRow } from './table/MiniPCTableRow';
import { DeviceDetailDialog } from './table/DeviceDetailDialog';
import { getSortValue, type SortKey, type SortConfig } from './table/tableUtils';

interface MiniPCTableProps {
  devices: MiniPC[];
  selectedDevices: Set<string>;
  onDeviceSelect: (deviceId: string) => void;
  isCompareMode: boolean;
}

export function MiniPCTable({ devices, selectedDevices, onDeviceSelect, isCompareMode }: MiniPCTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'brand',
    direction: 'asc',
  });
  const [detailDevice, setDetailDevice] = useState<MiniPC | null>(null);

  const sortedDevices = [...devices].sort((a, b) => {
    const aValue = getSortValue(a, sortConfig.key);
    const bValue = getSortValue(b, sortConfig.key);
    
    if (aValue === bValue) return 0;
    
    const modifier = sortConfig.direction === 'asc' ? 1 : -1;
    return aValue > bValue ? modifier : -modifier;
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenDetails = (device: MiniPC, event: React.MouseEvent) => {
    event.stopPropagation(); // Stop the event from bubbling up to the row
    setDetailDevice(device);
  };

  const handleCloseDetails = () => {
    setDetailDevice(null);
  };

  const displayedDevices = isCompareMode 
    ? sortedDevices.filter(device => selectedDevices.has(device.id))
    : sortedDevices;

  return (
    <>
      <Paper 
        elevation={3} 
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          background: 'transparent',
          transition: 'all 0.3s ease',
          height: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: theme => theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          background: theme => theme.palette.mode === 'dark' 
            ? 'linear-gradient(to right, rgba(41,98,255,0.15), rgba(0,176,255,0.15))'
            : 'linear-gradient(to right, rgba(41,98,255,0.1), rgba(0,176,255,0.1))',
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
            textShadow: theme => theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          }}>
            {devices.length} {devices.length === 1 ? 'result' : 'results'}
          </Typography>
        </Box>
        
        <TableContainer 
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme => theme.palette.mode === 'dark' ? '#2c2c2c' : '#f5f5f5',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme => theme.palette.mode === 'dark' ? '#555' : '#bbb',
              borderRadius: '4px',
              border: theme => theme.palette.mode === 'dark' ? '2px solid #2c2c2c' : '2px solid #f5f5f5',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme => theme.palette.mode === 'dark' ? '#777' : '#999',
            },
            position: 'absolute',
            top: 55,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <Table stickyHeader size="small" sx={{ 
            tableLayout: 'fixed',
            '& .MuiTableCell-head': {
              py: 1.5,
              verticalAlign: 'bottom',
              lineHeight: 1.3
            }
          }}>
            <MiniPCTableHeader
              sortConfig={sortConfig}
              onSort={handleSort}
            />
            <TableBody>
              {displayedDevices.map((device) => (
                <MiniPCTableRow
                  key={device.id}
                  device={device}
                  isSelected={selectedDevices.has(device.id)}
                  isCompareMode={isCompareMode}
                  onDeviceSelect={onDeviceSelect}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <DeviceDetailDialog
        device={detailDevice}
        open={!!detailDevice}
        onClose={handleCloseDetails}
      />
    </>
  );
} 