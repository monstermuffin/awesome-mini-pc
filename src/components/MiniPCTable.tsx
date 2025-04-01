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
import ExpandIcon from '@mui/icons-material/ExpandMore';
import type { MiniPC } from '../types/minipc';

interface MiniPCTableProps {
  devices: MiniPC[];
}

type SortKey = keyof MiniPC | 'cpu.cores' | 'cpu.tdp' | 'memory.speed' | 'cpu.model' | 'memory.type' | 'memory.module_type' | 'cpu.chipset' | 'release_date' | 'has_expansion';

type SortConfig = {
  key: SortKey;
  direction: 'asc' | 'desc';
};

export function MiniPCTable({ devices }: MiniPCTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'brand',
    direction: 'asc',
  });
  const [detailDevice, setDetailDevice] = useState<MiniPC | null>(null);

  // Check if any device has PCIe expansion slots
  const hasAnyExpansionSlots = devices.some(device => 
    device.expansion?.pcie_slots && device.expansion.pcie_slots.length > 0
  );

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
    >
      {label}
    </TableSortLabel>
  );

  const handleOpenDetails = (device: MiniPC) => {
    setDetailDevice(device);
  };

  const handleCloseDetails = () => {
    setDetailDevice(null);
  };

  // Calculate device age in years
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

  // Function to render expansion slots indicator
  const renderExpansionIndicator = (device: MiniPC) => {
    if (!device.expansion?.pcie_slots || device.expansion.pcie_slots.length === 0) {
      return null;
    }

    return (
      <Tooltip title={`${device.expansion.pcie_slots.length} PCIe slot(s) available`}>
        <Badge 
          badgeContent={device.expansion.pcie_slots.length} 
          color="primary" 
          sx={{ 
            '& .MuiBadge-badge': { 
              fontSize: '0.6rem',
              fontWeight: 'bold',
              backgroundColor: theme => theme.palette.mode === 'dark' ? '#2196f3' : '#1976d2',
            } 
          }}
        >
          <Chip
            icon={<ExpandIcon sx={{ fontSize: '1rem' }} />}
            label="PCIe"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ 
              fontSize: '0.7rem', 
              height: 20,
              borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.5)' : 'rgba(25,118,210,0.5)',
              color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
              fontWeight: 500,
              px: 0.5,
            }}
          />
        </Badge>
      </Tooltip>
    );
  };

  return (
    <>
      <Paper 
        elevation={3} 
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          background: 'transparent',
          transition: 'all 0.3s ease',
          height: 'calc(100vh - 100px)', // Take full height minus some padding
          display: 'flex',
          flexDirection: 'column',
          boxShadow: theme => theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.1)',
          position: 'relative', // Important for positioning
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
          <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
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
                  align="right"
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 70,
                    minWidth: 60,
                  }}
                >{renderSortLabel('Cores', 'cpu.cores')}</TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'linear-gradient(180deg, rgba(41,98,255,0.4) 0%, rgba(25,78,210,0.4) 100%)' 
                      : 'linear-gradient(180deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.1) 100%)',
                    fontWeight: 'bold',
                    color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1565c0',
                    borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    width: 70,
                    minWidth: 60,
                  }}
                >{renderSortLabel('TDP', 'cpu.tdp')}</TableCell>
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
                    minWidth: 80,
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
                    width: 70,
                    minWidth: 60,
                  }}
                >{renderSortLabel('Speed', 'memory.speed')}</TableCell>
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
                >Storage</TableCell>
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
                >Ethernet</TableCell>
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
                >WiFi</TableCell>
                {hasAnyExpansionSlots && (
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
                  >{renderSortLabel('Expansion', 'has_expansion')}</TableCell>
                )}
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
                >Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedDevices.map((device, index) => (
                <TableRow 
                  key={device.id} 
                  hover
                  sx={{ 
                    transition: 'all 0.2s ease',
                    animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
                    '@keyframes fadeIn': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(10px)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    },
                    '&:hover': {
                      backgroundColor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(66,165,245,0.1)' 
                        : 'rgba(33,150,243,0.05)',
                      boxShadow: 'inset 0 0 0 1px rgba(66,165,245,0.1)',
                    },
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.02)' 
                        : 'rgba(0,0,0,0.02)',
                    }
                  }}
                >
                  <TableCell>{device.brand}</TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div" sx={{ fontWeight: 500 }}>
                      {device.model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      flexWrap: 'nowrap',
                      whiteSpace: 'nowrap'
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
                        whiteSpace: 'nowrap',
                      }}>
                        {getDeviceAge(device.release_date)}
                      </Box>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div" sx={{ 
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {device.cpu.brand} {device.cpu.model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block'
                    }}>
                      {device.cpu.base_clock}GHz - {device.cpu.boost_clock}GHz
                    </Typography>
                    {device.cpu.chipset && (
                      <Typography variant="caption" color="text.secondary" component="div" sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
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
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ 
                      fontWeight: 'medium', 
                      color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2' 
                    }}>
                      {device.cpu.cores}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ 
                      fontWeight: 'medium', 
                      color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2' 
                    }}>
                      {device.cpu.tdp}W
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div" sx={{ 
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {device.memory.type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {device.memory.slots}x slots, Max {device.memory.max_capacity}GB
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{device.memory.module_type}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ 
                      fontWeight: 'medium', 
                      color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2' 
                    }}>
                      {device.memory.speed}MHz
                    </Box>
                  </TableCell>
                  <TableCell>
                    {device.storage.map((storage, index) => (
                      <Typography key={index} variant="body2" component="div" sx={{ 
                        mb: index < device.storage.length - 1 ? 0.5 : 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {storage.type} ({storage.interface})
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>
                    {device.networking.ethernet.map((eth, index) => (
                      <Box key={index}>
                        {Array.from({ length: eth.ports }).map((_, portIndex) => (
                          <Typography key={portIndex} variant="body2" sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5, 
                            mb: portIndex < eth.ports - 1 ? 0.5 : 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            <Box component="span" sx={{ fontWeight: 'medium' }}>{eth.speed}</Box>
                            <Typography variant="caption" color="text.secondary" component="span">
                              ({eth.chipset})
                            </Typography>
                          </Typography>
                        ))}
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      <Box component="span" sx={{ fontWeight: 'medium' }}>{device.networking.wifi.standard}</Box>
                      <Typography variant="caption" color="text.secondary" component="span">
                        ({device.networking.wifi.chipset})
                      </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      BT {device.networking.wifi.bluetooth}
                    </Typography>
                  </TableCell>
                  {hasAnyExpansionSlots && (
                    <TableCell>
                      {renderExpansionIndicator(device)}
                    </TableCell>
                  )}
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDetails(device)}
                      sx={{
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
                      <InfoIcon fontSize="small" />
                    </IconButton>
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
                <Grid item xs={12} md={6}>
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
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Cores: {detailDevice.cpu.cores} (Threads: {detailDevice.cpu.threads})
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Clock: {detailDevice.cpu.base_clock}GHz - {detailDevice.cpu.boost_clock}GHz
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>TDP: {detailDevice.cpu.tdp}W</Typography>
                  {detailDevice.cpu.chipset && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>Chipset: {detailDevice.cpu.chipset}</Typography>
                  )}
                  {detailDevice.cpu.architecture && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>Architecture: {detailDevice.cpu.architecture}</Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
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
                    Speed: {detailDevice.memory.speed}MHz
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Slots: {detailDevice.memory.slots} ({detailDevice.memory.module_type})
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Max Capacity: {detailDevice.memory.max_capacity}GB
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sx={{ 
                  pt: 2, 
                  mt: 2, 
                  borderTop: theme => `1px solid ${theme.palette.divider}`
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
                  {detailDevice.storage.map((storage, index) => (
                    <Box key={index} mb={1} sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.03)' 
                        : 'rgba(0,0,0,0.02)',
                    }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {storage.type} {storage.form_factor} ({storage.interface})
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Max Capacity: {storage.max_capacity}GB
                      </Typography>
                    </Box>
                  ))}
                </Grid>
                
                <Grid item xs={12} md={6}>
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
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <span>{detailDevice.networking.wifi.standard}</span>
                    <Typography variant="caption" color="text.secondary" component="span">
                      ({detailDevice.networking.wifi.chipset})
                    </Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Bluetooth: {detailDevice.networking.wifi.bluetooth}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
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
                  {detailDevice.networking.ethernet.map((eth, index) => (
                    <Box key={index} mb={1}>
                      {Array.from({ length: eth.ports }).map((_, portIndex) => (
                        <Typography key={portIndex} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: portIndex < eth.ports - 1 ? 0.5 : 0 }}>
                          <Box component="span" sx={{ fontWeight: 'medium' }}>{eth.speed}</Box>
                          <Typography variant="caption" color="text.secondary" component="span">
                            ({eth.chipset})
                          </Typography>
                        </Typography>
                      ))}
                    </Box>
                  ))}
                </Grid>
                
                {detailDevice.ports && (
                  <Grid item xs={12} md={6}>
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
                    {detailDevice.ports.usb_a !== undefined && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>USB-A: {detailDevice.ports.usb_a}</Typography>
                    )}
                    {detailDevice.ports.usb_c !== undefined && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>USB-C: {detailDevice.ports.usb_c}</Typography>
                    )}
                    {detailDevice.ports.usb_c_thunderbolt !== undefined && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>USB-C Thunderbolt: {detailDevice.ports.usb_c_thunderbolt}</Typography>
                    )}
                    {detailDevice.ports.hdmi !== undefined && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>HDMI: {detailDevice.ports.hdmi}</Typography>
                    )}
                    {detailDevice.ports.displayport !== undefined && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>DisplayPort: {detailDevice.ports.displayport}</Typography>
                    )}
                    {detailDevice.ports.audio_jack !== undefined && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>Audio Jack: {detailDevice.ports.audio_jack}</Typography>
                    )}
                    {detailDevice.ports.sd_card_reader !== undefined && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>SD Card Reader: {detailDevice.ports.sd_card_reader ? 'Yes' : 'No'}</Typography>
                    )}
                    {detailDevice.ports.serial !== undefined && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>Serial: {detailDevice.ports.serial}</Typography>
                    )}
                    {detailDevice.ports.other && detailDevice.ports.other.length > 0 && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>Other: {detailDevice.ports.other.join(', ')}</Typography>
                    )}
                  </Grid>
                )}
                
                {detailDevice.dimensions && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Dimensions</Typography>
                    <Typography variant="body2">
                      {detailDevice.dimensions.width} × {detailDevice.dimensions.depth} × {detailDevice.dimensions.height} mm
                    </Typography>
                  </Grid>
                )}
                
                {detailDevice.power && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Power</Typography>
                    <Typography variant="body2">
                      Adapter: {detailDevice.power.adapter_wattage}W
                    </Typography>
                    <Typography variant="body2">
                      Input: {detailDevice.power.dc_input}
                    </Typography>
                  </Grid>
                )}

                {/* Expansion Slots section */}
                {detailDevice.expansion?.pcie_slots && detailDevice.expansion.pcie_slots.length > 0 && (
                  <Grid item xs={12} sx={{ 
                    pt: 2, 
                    mt: 2, 
                    borderTop: theme => `1px solid ${theme.palette.divider}`
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
                    }}>Expansion Slots</Typography>
                    <Box sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}>
                      {detailDevice.expansion.pcie_slots.map((slot, index) => (
                        <Box key={index} sx={{
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
                            <Typography variant="body2">
                              {slot.full_height ? 'Full-height' : 'Low-profile'} 
                              {slot.length && `, ${slot.length}`}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                    {detailDevice.expansion.additional_info && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Note: {detailDevice.expansion.additional_info}
                      </Typography>
                    )}
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