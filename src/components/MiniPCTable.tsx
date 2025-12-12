import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import React, { useState } from 'react';
import type { MiniPC } from '../types/minipc';
import { MiniPCTableHeader } from './table/MiniPCTableHeader';
import { MiniPCTableRow } from './table/MiniPCTableRow';
import { DeviceDetailDialog } from './table/DeviceDetailDialog';
import { getSortValue, type SortKey, type SortConfig } from './table/tableUtils';
import { groupDevicesByFamily, type DeviceFamily } from '../utils/deviceGrouping';

interface MiniPCTableProps {
  devices: MiniPC[];
  selectedDevices: Set<string>;
  onDeviceSelect: (deviceId: string) => void;
  isCompareMode: boolean;
}

// Mobile column definitions
export const MOBILE_COLUMN_OPTIONS = [
  { key: 'device', label: 'Device', default: true, always: true },
  { key: 'cpu', label: 'CPU', default: true, always: false },
  { key: 'memory', label: 'Memory', default: true, always: false },
  { key: 'gpu', label: 'GPU', default: false, always: false },
  { key: 'cores', label: 'Cores', default: false, always: false },
  { key: 'storage', label: 'Storage', default: false, always: false },
  { key: 'ethernet', label: 'Ethernet', default: false, always: false },
  { key: 'wifi', label: 'WiFi', default: false, always: false },
  { key: 'volume', label: 'Volume', default: false, always: false },
  { key: 'details', label: 'Details', default: true, always: true },
] as const;

export type MobileColumnKey = typeof MOBILE_COLUMN_OPTIONS[number]['key'];

export function MiniPCTable({ devices, selectedDevices, onDeviceSelect, isCompareMode }: MiniPCTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'brand',
    direction: 'asc',
  });
  const [detailDevice, setDetailDevice] = useState<MiniPC | null>(null);
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);

  // Mobile column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<MobileColumnKey>>(() => {
    // Load from localStorage or use defaults
    try {
      const saved = localStorage.getItem('mini-pc-mobile-columns');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load mobile column preferences:', error);
    }
    // Default to columns marked as default: true
    return new Set(MOBILE_COLUMN_OPTIONS.filter(col => col.default).map(col => col.key));
  });

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

  // Mobile column management
  const handleColumnToggle = React.useCallback((columnKey: MobileColumnKey, checked: boolean) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(columnKey);
      } else {
        // Don't allow removing always-visible columns
        const columnDef = MOBILE_COLUMN_OPTIONS.find(col => col.key === columnKey);
        if (!columnDef?.always) {
          newSet.delete(columnKey);
        }
      }

      // Save to localStorage
      try {
        localStorage.setItem('mini-pc-mobile-columns', JSON.stringify(Array.from(newSet)));
      } catch (error) {
        console.warn('Failed to save mobile column preferences:', error);
      }

      return newSet;
    });
  }, []);

  const handleColumnDialogOpen = React.useCallback(() => {
    setColumnDialogOpen(true);
  }, []);

  const handleColumnDialogClose = React.useCallback(() => {
    setColumnDialogOpen(false);
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

  const headerCellStyle = React.useMemo(() => ({
    background: (theme: any) => theme.palette.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)'
      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
    fontWeight: 'bold',
    color: (theme: any) => theme.palette.mode === 'dark'
      ? theme.palette.primary.contrastText
      : theme.palette.primary.dark,
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
          <Button
            startIcon={<ViewColumnIcon />}
            onClick={handleColumnDialogOpen}
            size="small"
            variant="outlined"
            sx={{
              fontSize: '0.75rem',
              minHeight: 32,
              borderColor: theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.5)' : 'rgba(25,118,210,0.5)',
              color: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
              '&:hover': {
                borderColor: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.08)' : 'rgba(25,118,210,0.08)',
              },
            }}
          >
            Columns
          </Button>
        </Box>

        {isMobile ? (
          // Mobile table view - compact with fewer columns
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
                background: theme.palette.mode === 'dark' ? '#2c2c2c' : '#f5f5f5',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.mode === 'dark' ? '#555' : '#bbb',
                borderRadius: '4px',
              },
            }}
          >
            <Table size="small" sx={{
              tableLayout: 'fixed',
              width: '100%',
              '& .MuiTableCell-head': {
                py: 1,
                px: 0.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              },
              '& .MuiTableCell-body': {
                py: 1,
                px: 0.5,
                fontSize: '0.75rem',
                whiteSpace: 'normal',
                overflow: 'visible',
              }
            }}>
              <TableHead>
                <TableRow>
                  {(() => {
                    const visibleColumnList = MOBILE_COLUMN_OPTIONS.filter(col => visibleColumns.has(col.key));
                    const totalColumns = visibleColumnList.length;
                    return visibleColumnList.map(column => (
                      <TableCell
                        key={column.key}
                        sx={{
                          ...headerCellStyle,
                          padding: '6px 4px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          width: `${100 / totalColumns}%`,
                          minWidth: column.key === 'device' ? '120px' :
                                   column.key === 'details' ? '60px' : '80px',
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ));
                  })()}
                </TableRow>
              </TableHead>
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
                    mobile={isMobile}
                    visibleColumns={visibleColumns}
                    onDeviceSelect={onDeviceSelect}
                    onOpenDetails={handleOpenDetails}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
                    mobile={isMobile}
                    visibleColumns={visibleColumns}
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

      {/* Column Customization Dialog */}
      <Dialog
        open={columnDialogOpen}
        onClose={handleColumnDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundImage: theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, rgba(24,24,24,1) 0%, rgba(33,33,33,1) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,250,250,1) 100%)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: theme.palette.divider,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(90deg, rgba(21,101,192,0.1) 0%, rgba(30,136,229,0.1) 100%)'
            : 'linear-gradient(90deg, rgba(33,150,243,0.05) 0%, rgba(66,165,245,0.05) 100%)',
          px: 3,
          py: 2,
        }}>
          <Typography variant="h6" component="div" sx={{
            fontWeight: 600,
            color: theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <ViewColumnIcon fontSize="small" />
            Customize Columns
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose which columns to display in the mobile table view:
          </Typography>
          <FormGroup>
            {MOBILE_COLUMN_OPTIONS.map(column => (
              <FormControlLabel
                key={column.key}
                control={
                  <Checkbox
                    checked={visibleColumns.has(column.key)}
                    onChange={(e) => handleColumnToggle(column.key, e.target.checked)}
                    disabled={column.always}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{column.label}</Typography>
                    {column.always && (
                      <Chip
                        label="Required"
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 16 }}
                      />
                    )}
                  </Box>
                }
                sx={{
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: 1,
                  },
                }}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleColumnDialogClose} variant="outlined">
            Done
          </Button>
        </DialogActions>
      </Dialog>

      <DeviceDetailDialog
        device={detailDevice}
        open={!!detailDevice}
        onClose={handleCloseDetails}
      />
    </>
  );
} 