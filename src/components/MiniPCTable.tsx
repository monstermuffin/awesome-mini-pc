import {
  Table,
  TableBody,
  TableContainer,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import React, { useState } from 'react';
import type { MiniPC } from '../types/minipc';
import { MiniPCTableHeader } from './table/MiniPCTableHeader';
import { MiniPCTableRow } from './table/MiniPCTableRow';
import { MobileDeviceCard } from './table/MobileDeviceCard';
import { DeviceDetailDialog } from './table/DeviceDetailDialog';
import { getSortValue, type SortKey, type SortConfig } from './table/tableUtils';
import { groupDevicesByFamily, type DeviceFamily } from '../utils/deviceGrouping';

interface MiniPCTableProps {
  devices: MiniPC[];
  selectedDevices: Set<string>;
  onDeviceSelect: (deviceId: string) => void;
  isCompareMode: boolean;
}

export function MiniPCTable({ devices, selectedDevices, onDeviceSelect, isCompareMode }: MiniPCTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'brand',
    direction: 'asc',
  });
  const [detailDevice, setDetailDevice] = useState<MiniPC | null>(null);
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

  const deviceFamilies = React.useMemo(() => groupDevicesByFamily(devices), [devices]);

  const sortedFamilies = React.useMemo(() => {
    return [...deviceFamilies].sort((a, b) => {
      const aValue = getSortValue(a.representative, sortConfig.key);
      const bValue = getSortValue(b.representative, sortConfig.key);
      
      if (aValue === bValue) return 0;
      
      const modifier = sortConfig.direction === 'asc' ? 1 : -1;
      return aValue > bValue ? modifier : -modifier;
    });
  }, [deviceFamilies, sortConfig]);

  // Memoize sorted devices for compare mode
  const sortedSelectedDevices = React.useMemo(() => {
    if (!isCompareMode) return [];
    
    return devices
      .filter(device => selectedDevices.has(device.id))
      .sort((a, b) => {
        const aValue = getSortValue(a, sortConfig.key);
        const bValue = getSortValue(b, sortConfig.key);
        if (aValue === bValue) return 0;
        const modifier = sortConfig.direction === 'asc' ? 1 : -1;
        return aValue > bValue ? modifier : -modifier;
      });
  }, [devices, selectedDevices, sortConfig, isCompareMode]);

  const handleSort = React.useCallback((key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleOpenDetails = React.useCallback((device: MiniPC, event: React.MouseEvent) => {
    event.stopPropagation();
    setDetailDevice(device);
  }, []);

  const handleCloseDetails = React.useCallback(() => {
    setDetailDevice(null);
  }, []);

  const handleToggleExpand = React.useCallback((familyId: string) => {
    setExpandedFamilies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(familyId)) {
        newSet.delete(familyId);
      } else {
        newSet.add(familyId);
      }
      return newSet;
    });
  }, []);

  const displayRows = React.useMemo(() => {
    const rows: Array<{ 
      type: 'family' | 'device', 
      family?: DeviceFamily, 
      device?: MiniPC, 
      isExpanded?: boolean,
      isVariant?: boolean 
    }> = [];

    if (isCompareMode) {
      // Compare mode - show only selected devices as individual rows
      sortedSelectedDevices.forEach(device => {
        rows.push({ type: 'device', device });
      });
    } else {
      // Normal mode - show families with expandable variants
      sortedFamilies.forEach(family => {
        const isExpanded = expandedFamilies.has(family.id);
        
        if (family.variantCount === 1) {
          rows.push({ type: 'device', device: family.representative });
        } else {
          // Multiple variants - show as family
          rows.push({ 
            type: 'family', 
            family, 
            isExpanded 
          });
          
          // If expanded, show all variants as sub-rows
          if (isExpanded) {
            family.variants.forEach(variant => {
              rows.push({ 
                type: 'device', 
                device: variant, 
                isVariant: true 
              });
            });
          }
        }
      });
    }

    return rows;
  }, [isCompareMode, sortedSelectedDevices, sortedFamilies, expandedFamilies]);

  const paperStyles = React.useMemo(() => ({
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'background.default',
  }), []);

  const headerStyles = React.useMemo(() => ({
    p: 2, 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: 'background.paper',
    borderBottom: (theme: any) => `1px solid ${theme.palette.divider}`,
  }), []);

  const tableContainerStyles = React.useMemo(() => ({
    flexGrow: 1,
    overflow: 'auto',
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: (theme: any) => theme.palette.mode === 'dark' ? '#2c2c2c' : '#f5f5f5',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: (theme: any) => theme.palette.mode === 'dark' ? '#555' : '#bbb',
      borderRadius: '4px',
      border: (theme: any) => theme.palette.mode === 'dark' ? '2px solid #2c2c2c' : '2px solid #f5f5f5',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: (theme: any) => theme.palette.mode === 'dark' ? '#777' : '#999',
    },
  }), []);

  // Flatten devices for mobile view (no family grouping)
  const flattenedDevices = React.useMemo(() => {
    if (isCompareMode) {
      return sortedSelectedDevices;
    }
    return devices.sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);
      if (aValue === bValue) return 0;
      const modifier = sortConfig.direction === 'asc' ? 1 : -1;
      return aValue > bValue ? modifier : -modifier;
    });
  }, [devices, sortedSelectedDevices, sortConfig, isCompareMode]);

  return (
    <>
      <Box sx={paperStyles}>
        <Box sx={headerStyles}>
          <Typography variant="h6" sx={{
            fontWeight: 600,
            color: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
          }}>
            {devices.length} {devices.length === 1 ? 'result' : 'results'}
          </Typography>
        </Box>

        {isMobile ? (
          // Mobile card view
          <Box sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.mode === 'dark' ? '#2c2c2c' : '#f5f5f5',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark' ? '#555' : '#bbb',
              borderRadius: '4px',
            },
          }}>
            {flattenedDevices
              .filter(device => device && device.id) // Filter out undefined or invalid devices
              .map((device, index) => (
              <Box
                key={device.id}
                sx={{
                  animation: `fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s both`,
                  '@keyframes fadeInUp': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(20px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                <MobileDeviceCard
                  device={device}
                  isSelected={selectedDevices.has(device.id)}
                  isCompareMode={isCompareMode}
                  onDeviceSelect={onDeviceSelect}
                  onOpenDetails={handleOpenDetails}
                />
              </Box>
            ))}
          </Box>
        ) : (
          // Desktop table view
          <TableContainer
            sx={tableContainerStyles}
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
                {displayRows.map((row, index) => (
                  <MiniPCTableRow
                    key={row.device?.id || row.family?.id || index}
                    device={row.device}
                    family={row.family}
                    isSelected={
                      row.device
                        ? selectedDevices.has(row.device.id)
                        : row.family
                          ? selectedDevices.has(row.family.representative.id)
                          : false
                    }
                    isCompareMode={isCompareMode}
                    isExpanded={row.isExpanded}
                    isVariant={row.isVariant}
                    onDeviceSelect={onDeviceSelect}
                    onOpenDetails={handleOpenDetails}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <DeviceDetailDialog
        device={detailDevice}
        open={!!detailDevice}
        onClose={handleCloseDetails}
      />
    </>
  );
} 