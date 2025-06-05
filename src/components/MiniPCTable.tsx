import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Box,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  DialogActions,
  Button,
  Badge,
} from '@mui/material';
import { useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import type { MiniPC } from '../types/minipc';

interface MiniPCTableProps {
  devices: MiniPC[];
  selectedDevices: Set<string>;
  onDeviceSelect: (deviceId: string) => void;
  isCompareMode: boolean;
}

type SortKey = keyof MiniPC | 'cpu.cores' | 'cpu.tdp' | 'memory.speed' | 'cpu.model' | 'memory.type' | 'memory.module_type' | 'cpu.chipset' | 'release_date' | 'has_expansion' | 'dimensions.volume';

type SortConfig = {
  key: SortKey;
  direction: 'asc' | 'desc';
};

export function MiniPCTable({ devices, selectedDevices, onDeviceSelect, isCompareMode }: MiniPCTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'brand',
    direction: 'asc',
  });
  const [detailDevice, setDetailDevice] = useState<MiniPC | null>(null);

  const getSortValue = (device: MiniPC, key: SortKey): string | number | boolean => {
    switch (key) {
      case 'cpu.cores':
        return device.cpu.cores;
      case 'cpu.tdp':
        return device.cpu.tdp;
      case 'memory.speed':
        return device.memory.speed;
      case 'cpu.model':
        return device.cpu.model;
      case 'memory.type':
        return device.memory.type;
      case 'memory.module_type':
        return device.memory.module_type || '';
      case 'cpu.chipset':
        return device.cpu.chipset || '';
      case 'release_date':
        return device.release_date || '';
      case 'has_expansion':
        return !!device.expansion?.pcie_slots && device.expansion.pcie_slots.length > 0;
      case 'dimensions.volume':
        return device.dimensions?.volume || 0;
      default:
        return device[key] as string;
    }
  };

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

  const renderSortLabel = (label: string, key: SortKey) => (
    <TableSortLabel
      active={sortConfig.key === key}
      direction={sortConfig.key === key ? sortConfig.direction : 'asc'}
      onClick={() => handleSort(key)}
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

  const handleOpenDetails = (device: MiniPC, event: React.MouseEvent) => {
    event.stopPropagation(); // Stop the event from bubbling up to the row
    setDetailDevice(device);
  };

  const handleCloseDetails = () => {
    setDetailDevice(null);
  };

  const getDeviceAge = (releaseYear: string): string => {
    if (!releaseYear) return 'Unknown';
    const currentYear = new Date().getFullYear();
    const deviceYear = parseInt(releaseYear, 10);
    if (isNaN(deviceYear)) return 'Unknown';
    
    const age = currentYear - deviceYear;
    if (age === 0) return 'This year';
    if (age === 1) return '1 year old';
    return `${age} years old`;
  };

  const StorageCell = ({ device, showDetails = false }: { device: MiniPC; showDetails?: boolean }) => {
    const storageGroups: Record<string, Array<{ interface: string; form_factor?: string; alt_interface?: string }>> = {};

    device.storage.forEach(storage => {
      const type = storage.type;
      if (!storageGroups[type]) {
        storageGroups[type] = [];
      }
      storageGroups[type].push({
        interface: storage.interface,
        form_factor: storage.form_factor,
        alt_interface: storage.alt_interface
      });
    });

    return (
      <>
        {Object.entries(storageGroups).map(([type, details], index) => (
          <Box key={index} sx={{ mb: 0.5 }}>
            <Box sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', gap: 1 }}>
              {details.length > 1 && (
                <Chip 
                  label={`${details.length}×`} 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.1)',
                    color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                    fontWeight: 600,
                  }} 
                />
              )}
              {type}
            </Box>
            {details.map((detail, detailIndex) => (
              <Typography key={detailIndex} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {detail.interface}
                {showDetails && detail.alt_interface && (
                  detail.alt_interface === 'U.2' ? ' (supports U.2 via adapter)' :
                  detail.alt_interface === 'SATA' ? ' (supports SATA)' :
                  ` (supports ${detail.alt_interface})`
                )}
              </Typography>
            ))}
          </Box>
        ))}
      </>
    );
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
            position: 'absolute', // Make it absolute to prevent double scrollbars
            top: 55, // Height of the header box
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
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 100,
                    minWidth: 80,
                    textAlign: 'left',
                  }}
                >{renderSortLabel('Brand', 'brand')}</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 140,
                    minWidth: 120,
                    textAlign: 'left',
                  }}
                >{renderSortLabel('Model', 'model')}</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 170,
                    minWidth: 150,
                  }}
                >{renderSortLabel('CPU', 'cpu.model')}</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 120,
                    minWidth: 100,
                  }}
                >GPU</TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 80,
                    minWidth: 80,
                  }}
                >{renderSortLabel('Cores', 'cpu.cores')}</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 120,
                    minWidth: 100,
                  }}
                >{renderSortLabel('Memory', 'memory.type')}</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 90,
                    minWidth: 90,
                  }}
                >{renderSortLabel('Module', 'memory.module_type')}</TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 90,
                    minWidth: 90,
                  }}
                >{renderSortLabel('Speed', 'memory.speed')}</TableCell>
                <TableCell
                  align="left"
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 120,
                    minWidth: 100,
                  }}
                >Storage</TableCell>
                <TableCell
                  align="left"
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 120,
                    minWidth: 100,
                  }}
                >Ethernet</TableCell>
                <TableCell
                  align="left"
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 120,
                    minWidth: 100,
                  }}
                >WiFi</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 80,
                    minWidth: 80,
                  }}
                >{renderSortLabel('Liters', 'dimensions.volume')}</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 70,
                    minWidth: 70,
                    padding: '6px 8px',
                  }}
                >Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedDevices.map((device) => (
                <TableRow
                  key={device.id}
                  hover
                  onClick={() => !isCompareMode && onDeviceSelect(device.id)}
                  sx={{
                    cursor: isCompareMode ? 'default' : 'pointer',
                    bgcolor: selectedDevices.has(device.id) 
                      ? theme => theme.palette.mode === 'dark'
                        ? 'rgba(33, 150, 243, 0.15)'
                        : 'rgba(33, 150, 243, 0.08)'
                      : 'inherit',
                    '&:hover': {
                      bgcolor: theme => {
                        if (selectedDevices.has(device.id)) {
                          return theme.palette.mode === 'dark'
                            ? 'rgba(33, 150, 243, 0.2)'
                            : 'rgba(33, 150, 243, 0.12)';
                        }
                        if (isCompareMode) {
                          return 'inherit';
                        }
                        return theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.04)';
                      }
                    },
                  }}
                >
                  <TableCell>{device.brand}</TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div" sx={{ 
                      fontWeight: 500,
                      whiteSpace: 'normal',
                      overflow: 'visible',
                      lineHeight: 1.3,
                      mb: 0.3
                    }}>
                      {device.model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 0.5,
                      flexWrap: 'wrap',
                    }}>
                      {device.release_date} 
                      <Box component="span" sx={{ 
                        display: 'inline-flex', 
                        px: 0.7, 
                        py: 0.1, 
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.1)', 
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                      }}>
                        {getDeviceAge(device.release_date)}
                      </Box>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div" sx={{ 
                      fontWeight: 500,
                      whiteSpace: 'normal',
                      overflow: 'visible',
                      lineHeight: 1.3,
                      mb: 0.3
                    }}>
                      {device.cpu.brand} {device.cpu.model}
                    </Typography>
                    {device.cpu.model !== 'DIY' && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
                        {device.cpu.cores} cores ({device.cpu.threads} threads) • {device.cpu.base_clock}GHz - {device.cpu.boost_clock}GHz
                        {device.cpu.core_config && (
                          <Tooltip 
                            title={
                              <Box>
                                <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                                  Core Configuration:
                                </Typography>
                                {device.cpu.core_config.types.map((coreType, index) => (
                                  <Typography key={index} variant="caption" display="block">
                                    {coreType.count}× {coreType.type}: {coreType.boost_clock}GHz
                                  </Typography>
                                ))}
                              </Box>
                            } 
                            arrow
                          >
                            <Box 
                              component="span"
                              sx={{ 
                                ml: 0.5,
                                display: 'inline-flex',
                                alignItems: 'center',
                                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.1)',
                                color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                                borderRadius: '4px',
                                px: 0.5,
                                fontSize: '0.7rem',
                                cursor: 'help'
                              }}
                            >
                              Hybrid
                            </Box>
                          </Tooltip>
                        )}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
                      TDP: {device.cpu.tdp}W
                    </Typography>
                    {device.cpu.chipset && (
                      <Typography variant="caption" color="text.secondary" component="div" sx={{
                        whiteSpace: 'normal',
                        overflow: 'visible',
                        lineHeight: 1.3,
                      }}>
                        {device.cpu.chipset}
                      </Typography>
                    )}
                    {device.cpu.architecture && (
                      <Chip 
                        label={device.cpu.architecture} 
                        size="small" 
                        variant="outlined" 
                        sx={{ 
                          fontSize: '0.7rem', 
                          height: 20, 
                          mt: 0.5,
                          borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.5)' : 'rgba(25,118,210,0.5)',
                          color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2', 
                        }} 
                      />
                    )}
                    {device.cpu.socket && (
                      <Chip 
                        label={`${device.cpu.socket.type}${device.cpu.socket.supports_cpu_swap ? ' (Socketable)' : ''}`}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 20,
                          mt: 0.5,
                          ml: device.cpu.architecture ? 0.5 : 0,
                          borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.5)' : 'rgba(56,142,60,0.5)',
                          color: theme => theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {device.gpu && device.gpu.length > 0 ? (
                      device.gpu.map((gpu, index) => (
                        <Box key={index} sx={{ mb: index < device.gpu!.length - 1 ? 1 : 0 }}>
                          <Typography variant="body2" component="div" sx={{ 
                            fontWeight: 500,
                            whiteSpace: 'normal',
                            overflow: 'visible',
                            lineHeight: 1.3,
                          }}>
                            {gpu.model}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {gpu.type}{gpu.vram && ` • ${gpu.vram} VRAM`}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No Graphics
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ 
                      fontWeight: 'medium', 
                      color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2' 
                    }}>
                      {device.cpu.model === 'DIY' ? 'N/A' : device.cpu.cores}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div" sx={{ 
                      fontWeight: 500,
                      whiteSpace: 'normal',
                      overflow: 'visible',
                      lineHeight: 1.3,
                      mb: 0.3
                    }}>
                      {device.memory.type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{
                      whiteSpace: 'normal',
                      overflow: 'visible',
                      lineHeight: 1.3,
                    }}>
                      {device.memory.slots}x slots, Max {device.memory.max_capacity}GB
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'normal' }}>{device.memory.module_type}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ 
                      fontWeight: 'medium', 
                      color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2' 
                    }}>
                      {device.memory.speed}MT/s
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StorageCell device={device} showDetails={false} />
                  </TableCell>
                  <TableCell>
                    {device.networking?.ethernet && device.networking.ethernet.length > 0 ? (
                      (() => {
                        interface EthernetGroup {
                          count: number;
                          chipsets: string[];
                          interface: string;
                          speed: string;
                        }
                        
                        const ethernetGroups: Record<string, EthernetGroup> = {};
                        
                        device.networking.ethernet.forEach(eth => {
                          const key = `${eth.speed}_${eth.interface}`;
                          if (!ethernetGroups[key]) {
                            ethernetGroups[key] = { count: eth.ports, chipsets: [eth.chipset], interface: eth.interface, speed: eth.speed };
                          } else {
                            ethernetGroups[key].count += eth.ports;
                            if (!ethernetGroups[key].chipsets.includes(eth.chipset)) {
                              ethernetGroups[key].chipsets.push(eth.chipset);
                            }
                          }
                        });
                        
                        return (
                          <>
                            {Object.entries(ethernetGroups).map(([, info]: [string, EthernetGroup], index: number) => (
                              <Box key={index} sx={{ mb: 0.5 }}>
                                <Box sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {info.count > 1 && (
                                    <Chip 
                                      label={`${info.count}×`} 
                                      size="small" 
                                      sx={{ 
                                        height: 20, 
                                        fontSize: '0.7rem',
                                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.1)',
                                        color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                                        fontWeight: 600,
                                      }} 
                                    />
                                  )}
                                  {info.speed}
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {info.interface} • {info.chipsets.join(', ')}
                                </Typography>
                              </Box>
                            ))}
                          </>
                        );
                      })()
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No Ethernet
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {device.networking?.wifi ? (
                      <>
                        <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                          <Box component="span" sx={{ 
                            fontWeight: 'medium',
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1 
                          }}>
                            {device.networking.wifi.standard}
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {device.networking.wifi.chipset}
                          </Typography>
                        </Typography>
                        {device.networking.wifi.bluetooth && (
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mt: 0.3
                          }}>
                            <Typography variant="caption" color="text.secondary" component="div">
                              BT {device.networking.wifi.bluetooth}
                            </Typography>
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No WiFi
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {device.dimensions?.volume && (
                      <Box sx={{ 
                        fontWeight: 'medium'
                      }}>
                        {device.dimensions.volume.toFixed(2)}L
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ 
                    padding: '6px 8px',
                    width: 70,
                    minWidth: 70,
                  }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start'
                    }}>
                      <Badge 
                        badgeContent={
                          (device?.expansion?.pcie_slots?.length ?? 0) + 
                          (device?.expansion?.oculink_ports?.length ?? 0)
                        }
                        color="primary"
                        sx={{ 
                          '& .MuiBadge-badge': { 
                            display: (!device?.expansion?.pcie_slots?.length && !device?.expansion?.oculink_ports?.length) ? 'none' : 'flex',
                            fontSize: '0.6rem',
                            fontWeight: 'bold',
                            backgroundColor: theme => theme.palette.mode === 'dark' ? '#2196f3' : '#1976d2',
                            minWidth: '16px',
                            height: '16px',
                            padding: '0 4px',
                          }
                        }}
                      >
                        <Tooltip title={
                          ((device?.expansion?.pcie_slots?.length ?? 0) + (device?.expansion?.oculink_ports?.length ?? 0)) > 0
                            ? `${device?.expansion?.pcie_slots?.length ?? 0} PCIe slot(s)${device?.expansion?.oculink_ports?.length ? `, ${device.expansion.oculink_ports.length} OCuLink port(s)` : ''} available`
                            : "View details"
                        }>
                          <IconButton 
                            size="small" 
                            onClick={(event) => handleOpenDetails(device, event)}
                            sx={{
                              padding: 0.75,
                              transition: 'all 0.2s ease',
                              backgroundColor: theme => theme.palette.mode === 'dark' 
                                ? 'rgba(33,150,243,0.2)'
                                : 'rgba(33,150,243,0.1)',
                              color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                              boxShadow: theme => theme.palette.mode === 'dark'
                                ? '0 2px 8px rgba(0,0,0,0.2)'
                                : '0 2px 4px rgba(0,0,0,0.1)',
                              '&:hover': {
                                backgroundColor: theme => theme.palette.mode === 'dark'
                                  ? 'rgba(33,150,243,0.3)'
                                  : 'rgba(33,150,243,0.2)',
                                transform: 'scale(1.1)',
                                boxShadow: theme => theme.palette.mode === 'dark'
                                  ? '0 4px 12px rgba(0,0,0,0.3)'
                                  : '0 4px 8px rgba(0,0,0,0.15)',
                              }
                            }}
                          >
                            <InfoIcon sx={{ fontSize: '1.1rem' }} />
                          </IconButton>
                        </Tooltip>
                      </Badge>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Detailed device dialog */}
      <Dialog
        open={!!detailDevice}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundImage: theme => theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, rgba(24,24,24,1) 0%, rgba(33,33,33,1) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,250,250,1) 100%)',
            boxShadow: theme => theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        {detailDevice && (
          <>
            <DialogTitle sx={{ 
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, rgba(21,101,192,0.1) 0%, rgba(30,136,229,0.1) 100%)'
                : 'linear-gradient(90deg, rgba(33,150,243,0.05) 0%, rgba(66,165,245,0.05) 100%)',
              px: 3,
              py: 2,
            }}>
              <Typography variant="h6" component="div" sx={{ 
                fontWeight: 600,
                color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
              }}>
                {detailDevice.brand} {detailDevice.model}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Released: {detailDevice.release_date}
              </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ px: 3, py: 2 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                    color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      display: 'block',
                      width: 3,
                      height: 16,
                      backgroundColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                      marginRight: 1,
                      borderRadius: 1,
                    }
                  }}>CPU</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {detailDevice.cpu.brand} {detailDevice.cpu.model}
                  </Typography>
                  {detailDevice.cpu.model !== 'DIY' && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Cores: {detailDevice.cpu.cores} (Threads: {detailDevice.cpu.threads})
                    </Typography>
                  )}
                  {detailDevice.cpu.core_config && (
                    <Box sx={{ mb: 1, pl: 1.5 }}>
                      <Typography variant="body2" fontStyle="italic" sx={{ mb: 0.5 }}>
                        Core Configuration:
                      </Typography>
                      {detailDevice.cpu.core_config.types.map((coreType, idx) => (
                        <Typography key={idx} variant="body2" sx={{ pl: 1, mb: 0.5 }}>
                          • {coreType.count}× {coreType.type}: {coreType.boost_clock}GHz
                        </Typography>
                      ))}
                    </Box>
                  )}
                  <Typography variant="body2" sx={{ mb: 0.5 }}>TDP: {detailDevice.cpu.tdp}W</Typography>
                  {detailDevice.cpu.chipset && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>Chipset: {detailDevice.cpu.chipset}</Typography>
                  )}
                  {detailDevice.cpu.architecture && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>Architecture: {detailDevice.cpu.architecture}</Typography>
                  )}
                  {detailDevice.cpu.socket && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Socket: {detailDevice.cpu.socket.type}
                      {detailDevice.cpu.socket.supports_cpu_swap ? ' (Socketable)' : ''}
                    </Typography>
                  )}
                </Grid>
                
                <Grid
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                    color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      display: 'block',
                      width: 3,
                      height: 16,
                      backgroundColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                      marginRight: 1,
                      borderRadius: 1,
                    }
                  }}>Memory</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Type: {detailDevice.memory.type} {detailDevice.memory.module_type}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Speed: {detailDevice.memory.speed}MT/s
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Slots: {detailDevice.memory.slots} ({detailDevice.memory.module_type})
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Max Capacity: {detailDevice.memory.max_capacity}GB
                  </Typography>
                </Grid>
                
                {detailDevice?.gpu && (
                  <Grid
                    size={{
                      xs: 12,
                      md: 6
                    }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
                      display: 'flex',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        width: 3,
                        height: 16,
                        backgroundColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                        marginRight: 1,
                        borderRadius: 1,
                      }
                    }}>Graphics</Typography>
                    {detailDevice.gpu.map((gpu, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {gpu.model}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Type: {gpu.type}
                          {gpu.vram && ` • VRAM: ${gpu.vram}`}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                )}
                
                {/* Storage and Expansion sections */}
                <Grid
                  sx={{ 
                    pt: 2, 
                    mt: 2, 
                    borderTop: theme => `1px solid ${theme.palette.divider}`
                  }}
                  size={12}>
                  <Grid container spacing={3}>
                    <Grid
                      size={{
                        xs: 12,
                        md: 6
                      }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                        color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
                        display: 'flex',
                        alignItems: 'center',
                        '&::before': {
                          content: '""',
                          display: 'block',
                          width: 3,
                          height: 16,
                          backgroundColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                          marginRight: 1,
                          borderRadius: 1,
                        }
                      }}>Storage</Typography>
                      
                      <StorageCell device={detailDevice} showDetails={true} />
                    </Grid>

                    {((detailDevice?.expansion?.pcie_slots?.length ?? 0) > 0 || (detailDevice?.expansion?.oculink_ports?.length ?? 0) > 0) && (
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                          color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
                          display: 'flex',
                          alignItems: 'center',
                          '&::before': {
                            content: '""',
                            display: 'block',
                            width: 3,
                            height: 16,
                            backgroundColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                            marginRight: 1,
                            borderRadius: 1,
                          }
                        }}>Expansion</Typography>
                        <Box sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                        }}>
                          {/* PCIe Slots */}
                          {detailDevice?.expansion?.pcie_slots?.map((slot, index) => (
                            <Box key={`pcie-${index}`} sx={{
                              p: 1.5,
                              borderRadius: 1,
                              backgroundColor: theme => theme.palette.mode === 'dark' 
                                ? 'rgba(33,150,243,0.1)' 
                                : 'rgba(33,150,243,0.05)',
                              border: theme => `1px solid ${theme.palette.mode === 'dark' 
                                ? 'rgba(33,150,243,0.2)' 
                                : 'rgba(33,150,243,0.15)'}`,
                              minWidth: 180,
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                PCIe {slot.type} {slot.version}
                              </Typography>
                              {(slot.full_height !== undefined || slot.length) && (
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  {slot.full_height ? 'Full-height' : 'Low-profile'} 
                                  {slot.length && `, ${slot.length}`}
                                </Typography>
                              )}
                            </Box>
                          ))}

                          {/* OCuLink Ports */}
                          {detailDevice?.expansion?.oculink_ports?.map((port, index) => (
                            <Box key={`oculink-${index}`} sx={{
                              p: 1.5,
                              borderRadius: 1,
                              backgroundColor: theme => theme.palette.mode === 'dark' 
                                ? 'rgba(76,175,80,0.1)' 
                                : 'rgba(76,175,80,0.05)',
                              border: theme => `1px solid ${theme.palette.mode === 'dark' 
                                ? 'rgba(76,175,80,0.2)' 
                                : 'rgba(76,175,80,0.15)'}`,
                              minWidth: 180,
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                OCuLink {port.version}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                PCIe x4 interface
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                        {detailDevice?.expansion?.additional_info && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Note: {detailDevice?.expansion?.additional_info}
                          </Typography>
                        )}
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                {/* Ethernet section */}
                <Grid
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                    color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      display: 'block',
                      width: 3,
                      height: 16,
                      backgroundColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                      marginRight: 1,
                      borderRadius: 1,
                    }
                  }}>Ethernet</Typography>
                  
                  {(() => {
                    interface EthernetGroup {
                      count: number;
                      chipset: string;
                      interface: string;
                      speed: string;
                    }
                    
                    const ethernetGroups: Record<string, EthernetGroup> = {};
                    
                    detailDevice?.networking?.ethernet?.forEach(eth => {
                      const key = `${eth.speed}_${eth.interface}_${eth.chipset}`;
                      if (!ethernetGroups[key]) {
                        ethernetGroups[key] = { count: eth.ports, chipset: eth.chipset, interface: eth.interface, speed: eth.speed };
                      } else {
                        ethernetGroups[key].count += eth.ports;
                      }
                    });
                    
                    return (
                      <>
                        {Object.entries(ethernetGroups).map(([, info]: [string, EthernetGroup], index: number) => (
                          <Box key={index} sx={{ mb: 0.5 }}>
                            <Box sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', gap: 1 }}>
                              {info.count > 1 && (
                                <Chip 
                                  label={`${info.count}×`} 
                                  size="small" 
                                  sx={{ 
                                    height: 20, 
                                    fontSize: '0.7rem',
                                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.1)',
                                    color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                                    fontWeight: 600,
                                  }} 
                                />
                              )}
                              {info.speed}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {info.interface} • {info.chipset}
                            </Typography>
                          </Box>
                        ))}
                      </>
                    );
                  })()}
                </Grid>
                
                {/* WiFi section */}
                {detailDevice?.networking?.wifi && (
                  <Grid
                    size={{
                      xs: 12,
                      md: 6
                    }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
                      display: 'flex',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        width: 3,
                        height: 16,
                        backgroundColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                        marginRight: 1,
                        borderRadius: 1,
                      }
                    }}>WiFi</Typography>
                    <Box>
                      <Typography variant="body2">
                        {detailDevice.networking.wifi.chipset} ({detailDevice.networking.wifi.standard})
                      </Typography>
                      {detailDevice.networking.wifi.bluetooth && (
                        <Typography variant="body2" color="text.secondary">
                          Bluetooth {detailDevice.networking.wifi.bluetooth}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}

                {/* Ports section */}
                {detailDevice?.ports && (
                  <Grid
                    sx={{ 
                      pt: 2, 
                      mt: 2, 
                      borderTop: theme => `1px solid ${theme.palette.divider}`,
                      width: '100%' 
                    }}
                    size={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
                      display: 'flex',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        width: 3,
                        height: 16,
                        backgroundColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                        marginRight: 1,
                        borderRadius: 1,
                      }
                    }}>Ports</Typography>

                    <Grid container spacing={3} sx={{ width: '100%' }}>
                      {/* USB Ports Section */}
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <Box sx={{ mb: 2, width: '100%' }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                            borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.2)' : 'rgba(25,118,210,0.2)'}`,
                            pb: 0.5
                          }}>
                            USB Ports
                          </Typography>
                          
                          {/* USB-A Ports */}
                          {detailDevice?.ports?.usb_a && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>USB Type-A:</Typography>
                              {Array.isArray(detailDevice?.ports?.usb_a) ? (
                                detailDevice?.ports?.usb_a.map((port, index) => (
                                  <Box key={index} sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 0.5,
                                    ml: 2
                                  }}>
                                    {port.count > 1 && (
                                      <Chip 
                                        label={`${port.count}×`} 
                                        size="small" 
                                        sx={{ 
                                          height: 20, 
                                          fontSize: '0.7rem',
                                          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.1)',
                                          color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                                          fontWeight: 600,
                                        }} 
                                      />
                                    )}
                                    <Typography variant="body2">
                                      {port.type}
                                      {port.speed && ` (${port.speed})`}
                                    </Typography>
                                  </Box>
                                ))
                              ) : (
                                <Typography variant="body2" sx={{ ml: 2 }}>{detailDevice?.ports?.usb_a}x ports</Typography>
                              )}
                            </Box>
                          )}

                          {/* USB-C Ports */}
                          {detailDevice?.ports?.usb_c && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>USB-C:</Typography>
                              {Array.isArray(detailDevice?.ports?.usb_c) ? (
                                detailDevice?.ports?.usb_c.map((port, index) => (
                                  <Box key={index} sx={{ ml: 2, mb: 0.5 }}>
                                    <Typography variant="body2">
                                      {port.count && port.count > 1 && (
                                        <Chip 
                                          label={`${port.count}×`} 
                                          size="small" 
                                          sx={{ 
                                            height: 20,
                                            mr: 0.5,
                                            fontSize: '0.7rem',
                                            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.1)',
                                            color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                                            fontWeight: 600,
                                          }} 
                                        />
                                      )}
                                      {port.type}
                                      {port.speed && ` (${port.speed})`}
                                    </Typography>
                                    {(port.alt_mode || port.max_resolution || port.thunderbolt_compatible) && (
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        {port.thunderbolt_compatible && (
                                          <>
                                            Thunderbolt{port.thunderbolt_version ? ` ${port.thunderbolt_version}` : ' compatible'}
                                            {(port.alt_mode || port.max_resolution) && ' • '}
                                          </>
                                        )}
                                        {port.alt_mode}
                                        {port.max_resolution && ` (${port.max_resolution})`}
                                      </Typography>
                                    )}
                                  </Box>
                                ))
                              ) : (
                                <Typography variant="body2" sx={{ ml: 2 }}>{detailDevice?.ports?.usb_c}x ports</Typography>
                              )}
                            </Box>
                          )}

                          {/* Thunderbolt Ports */}
                          {detailDevice?.ports?.usb_c_thunderbolt !== undefined && detailDevice?.ports?.usb_c_thunderbolt > 0 && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>Thunderbolt:</Typography>
                              <Typography variant="body2" sx={{ ml: 2 }}>
                                {detailDevice?.ports?.usb_c_thunderbolt}× ports
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>

                      {/* Display Outputs Section */}
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <Box sx={{ mb: 2, width: '100%' }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                            borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.2)' : 'rgba(25,118,210,0.2)'}`,
                            pb: 0.5
                          }}>
                            Display Outputs
                          </Typography>

                          {/* HDMI */}
                          {detailDevice?.ports?.hdmi && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>HDMI:</Typography>
                              {typeof detailDevice?.ports?.hdmi === 'object' ? (
                                <Box sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  ml: 2
                                }}>
                                  {detailDevice?.ports?.hdmi.count > 1 && (
                                    <Chip 
                                      label={`${detailDevice?.ports?.hdmi.count}×`} 
                                      size="small" 
                                      sx={{ 
                                        height: 20, 
                                        fontSize: '0.7rem',
                                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.1)',
                                        color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                                        fontWeight: 600,
                                      }} 
                                    />
                                  )}
                                  <Typography variant="body2">
                                    {detailDevice?.ports?.hdmi.version}
                                    {detailDevice?.ports?.hdmi.max_resolution && ` (${detailDevice?.ports?.hdmi.max_resolution})`}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" sx={{ ml: 2 }}>{detailDevice?.ports?.hdmi}x ports</Typography>
                              )}
                            </Box>
                          )}

                          {/* DisplayPort */}
                          {detailDevice?.ports?.displayport && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>DisplayPort:</Typography>
                              {typeof detailDevice?.ports?.displayport === 'object' ? (
                                <Box sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  ml: 2
                                }}>
                                  {detailDevice?.ports?.displayport.count > 1 && (
                                    <Chip 
                                      label={`${detailDevice?.ports?.displayport.count}×`} 
                                      size="small" 
                                      sx={{ 
                                        height: 20, 
                                        fontSize: '0.7rem',
                                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.1)',
                                        color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                                        fontWeight: 600,
                                      }} 
                                    />
                                  )}
                                  <Typography variant="body2">
                                    {detailDevice?.ports?.displayport.version}
                                    {detailDevice?.ports?.displayport.max_resolution && ` (${detailDevice?.ports?.displayport.max_resolution})`}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="body2" sx={{ ml: 2 }}>{detailDevice?.ports?.displayport}x ports</Typography>
                              )}
                              {typeof detailDevice?.ports?.displayport === 'object' && detailDevice?.ports?.displayport.form_factor && (
                                <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                                  Form factor: {detailDevice?.ports?.displayport.form_factor}
                                </Typography>
                              )}
                            </Box>
                          )}

                          {/* USB-C Display Outputs */}
                          {Array.isArray(detailDevice?.ports?.usb_c) && detailDevice.ports.usb_c.some(port => port.alt_mode || port.max_resolution) && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>USB-C Display Output:</Typography>
                              {detailDevice.ports.usb_c
                                .filter(port => port.alt_mode || port.max_resolution)
                                .map((port, index) => (
                                  <Box key={index} sx={{ ml: 2, mb: 0.5 }}>
                                    <Typography variant="body2">
                                      {port.alt_mode}
                                      {port.max_resolution && ` (${port.max_resolution})`}
                                    </Typography>
                                  </Box>
                                ))}
                            </Box>
                          )}
                        </Box>
                      </Grid>

                      {/* Other Ports Section */}
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <Box sx={{ mb: 2, width: '100%' }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                            borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.2)' : 'rgba(25,118,210,0.2)'}`,
                            pb: 0.5
                          }}>
                            Other Ports
                          </Typography>

                          {/* Audio Jack */}
                          {detailDevice?.ports?.audio_jack !== undefined && (
                            <Box sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 0.5
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>Audio Jack:</Typography>
                              <Typography variant="body2">{detailDevice?.ports?.audio_jack}x</Typography>
                            </Box>
                          )}

                          {/* IR Receiver */}
                          {detailDevice?.ports?.ir_receiver !== undefined && (
                            <Box sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 0.5
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>IR Receiver:</Typography>
                              <Typography variant="body2">{detailDevice?.ports?.ir_receiver ? 'Yes' : 'No'}</Typography>
                            </Box>
                          )}

                          {/* SD Card Reader */}
                          {detailDevice?.ports?.sd_card_reader !== undefined && (
                            <Box sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 0.5
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>SD Card Reader:</Typography>
                              <Typography variant="body2">{detailDevice?.ports?.sd_card_reader ? 'Yes' : 'No'}</Typography>
                            </Box>
                          )}

                          {/* Micro SD Card Reader */}
                          {detailDevice?.ports?.micro_sd_card_reader !== undefined && (
                            <Box sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 0.5
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>Micro SD Card Reader:</Typography>
                              <Typography variant="body2">{detailDevice?.ports?.micro_sd_card_reader ? 'Yes' : 'No'}</Typography>
                            </Box>
                          )}

                          {/* OCuLink */}
                          {detailDevice?.ports?.oculink !== undefined && (
                            <Box sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 0.5
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>OCuLink:</Typography>
                              <Typography variant="body2">{detailDevice?.ports?.oculink}x</Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                {/* Dimensions and Power sections at the bottom */}
                <Grid
                  sx={{ 
                    pt: 2, 
                    mt: 2, 
                    borderTop: theme => `1px solid ${theme.palette.divider}`
                  }}
                  size={12}>
                  <Grid container spacing={3}>
                    {detailDevice.dimensions && (
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                          color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
                          display: 'flex',
                          alignItems: 'center',
                          '&::before': {
                            content: '""',
                            display: 'block',
                            width: 3,
                            height: 16,
                            backgroundColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                            marginRight: 1,
                            borderRadius: 1,
                          }
                        }}>Dimensions</Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {detailDevice.dimensions.width} × {detailDevice.dimensions.depth} × {detailDevice.dimensions.height} mm
                        </Typography>
                        {detailDevice.dimensions.volume && (
                          <Box sx={{ mt: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              mb: 0.5,
                              color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                              borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.2)' : 'rgba(25,118,210,0.2)'}`,
                              pb: 0.5
                            }}>
                              Volume
                            </Typography>
                            <Typography variant="body2">
                              {detailDevice.dimensions.volume.toFixed(2)}L
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    )}
                    
                    {detailDevice.power && (
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                          color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
                          display: 'flex',
                          alignItems: 'center',
                          '&::before': {
                            content: '""',
                            display: 'block',
                            width: 3,
                            height: 16,
                            backgroundColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                            marginRight: 1,
                            borderRadius: 1,
                          }
                        }}>Power</Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Adapter: {detailDevice.power.adapter_wattage}W
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Input: {detailDevice.power.dc_input}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                {/* Notes section - moved to end and styled like other sections */}
                {detailDevice.notes && (
                  <Grid
                    sx={{ 
                      pt: 2, 
                      mt: 2, 
                      borderTop: theme => `1px solid ${theme.palette.divider}`
                    }}
                    size={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                      color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
                      display: 'flex',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        width: 3,
                        height: 16,
                        backgroundColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                        marginRight: 1,
                        borderRadius: 1,
                      }
                    }}>Notes</Typography>
                    <Typography variant="body2" component="div">
                      {detailDevice.notes.split('\n').map((note, index) => (
                        note.trim() && (
                          <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                            {note}
                          </Typography>
                        )
                      ))}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button 
                onClick={handleCloseDetails}
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: theme => theme.palette.mode === 'dark'
                    ? '0 4px 6px rgba(0,0,0,0.1)'
                    : '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: theme => theme.palette.mode === 'dark'
                      ? '0 6px 10px rgba(0,0,0,0.2)'
                      : '0 4px 8px rgba(0,0,0,0.1)',
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
} 