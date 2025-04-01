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
          sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}
        >
          <Chip
            icon={<ExpandIcon />}
            label="PCIe"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        </Badge>
      </Tooltip>
    );
  };

  return (
    <>
      <Paper 
        elevation={0} 
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          background: 'transparent',
          transition: 'all 0.3s ease',
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
            ? 'linear-gradient(to right, rgba(26,35,126,0.15), rgba(13,71,161,0.15))'
            : 'linear-gradient(to right, rgba(66,165,245,0.15), rgba(25,118,210,0.15))',
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1976d2',
          }}>
            {devices.length} {devices.length === 1 ? 'result' : 'results'}
          </Typography>
        </Box>
        
        <TableContainer 
          sx={{
            maxHeight: 'calc(100vh - 200px)',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme => theme.palette.mode === 'dark' ? '#555' : '#ccc',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme => theme.palette.mode === 'dark' ? '#666' : '#aaa',
            }
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',  
                  }}
                >{renderSortLabel('Brand', 'brand')}</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',
                  }}
                >{renderSortLabel('Model', 'model')}</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',
                  }}
                >{renderSortLabel('CPU', 'cpu.model')}</TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',
                  }}
                >{renderSortLabel('Cores', 'cpu.cores')}</TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',
                  }}
                >{renderSortLabel('TDP', 'cpu.tdp')}</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',
                  }}
                >{renderSortLabel('Memory', 'memory.type')}</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',
                  }}
                >{renderSortLabel('Module', 'memory.module_type')}</TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',
                  }}
                >{renderSortLabel('Speed', 'memory.speed')}</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',
                  }}
                >Storage</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',
                  }}
                >Ethernet</TableCell>
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',
                  }}
                >WiFi</TableCell>
                {hasAnyExpansionSlots && (
                  <TableCell
                    sx={{ 
                      background: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(26,35,126,0.4)' 
                        : 'rgba(33,150,243,0.1)',
                      fontWeight: 'bold',
                    }}
                  >{renderSortLabel('Expansion', 'has_expansion')}</TableCell>
                )}
                <TableCell
                  sx={{ 
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(26,35,126,0.4)' 
                      : 'rgba(33,150,243,0.1)',
                    fontWeight: 'bold',
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
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(33,150,243,0.05)',
                    }
                  }}
                >
                  <TableCell>{device.brand}</TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div">
                      {device.model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {device.release_date} - {getDeviceAge(device.release_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div">
                      {device.cpu.brand} {device.cpu.model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {device.cpu.base_clock}GHz - {device.cpu.boost_clock}GHz
                    </Typography>
                    {device.cpu.chipset && (
                      <Typography variant="caption" color="text.secondary" component="div">
                        {device.cpu.chipset}
                      </Typography>
                    )}
                    {device.cpu.architecture && (
                      <Chip 
                        label={device.cpu.architecture} 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.7rem', height: 20, mt: 0.5 }} 
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">{device.cpu.cores}</TableCell>
                  <TableCell align="right">{device.cpu.tdp}W</TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div">
                      {device.memory.type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {device.memory.slots}x slots, Max {device.memory.max_capacity}GB
                    </Typography>
                  </TableCell>
                  <TableCell>{device.memory.module_type}</TableCell>
                  <TableCell align="right">{device.memory.speed}MHz</TableCell>
                  <TableCell>
                    {device.storage.map((storage, index) => (
                      <Typography key={index} variant="body2" component="div">
                        {storage.type} ({storage.interface})
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>
                    {device.networking.ethernet.map((eth, index) => (
                      <Box key={index}>
                        {Array.from({ length: eth.ports }).map((_, portIndex) => (
                          <Typography key={portIndex} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <span>{eth.speed}</span>
                            <Typography variant="caption" color="text.secondary" component="span">
                              ({eth.chipset})
                            </Typography>
                          </Typography>
                        ))}
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{device.networking.wifi.standard}</span>
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
                          ? 'rgba(33,150,243,0.15)'
                          : 'rgba(33,150,243,0.1)',
                        '&:hover': {
                          backgroundColor: theme => theme.palette.mode === 'dark'
                            ? 'rgba(33,150,243,0.25)'
                            : 'rgba(33,150,243,0.2)',
                          transform: 'scale(1.1)',
                        }
                      }}
                    >
                      <InfoIcon fontSize="small" color="primary" />
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
      >
        {detailDevice && (
          <>
            <DialogTitle>
              {detailDevice.brand} {detailDevice.model}
              <Typography variant="caption" display="block" color="text.secondary">
                Released: {detailDevice.release_date}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>CPU</Typography>
                  <Typography variant="body2">
                    {detailDevice.cpu.brand} {detailDevice.cpu.model}
                  </Typography>
                  <Typography variant="body2">
                    Cores: {detailDevice.cpu.cores} (Threads: {detailDevice.cpu.threads})
                  </Typography>
                  <Typography variant="body2">
                    Clock: {detailDevice.cpu.base_clock}GHz - {detailDevice.cpu.boost_clock}GHz
                  </Typography>
                  <Typography variant="body2">TDP: {detailDevice.cpu.tdp}W</Typography>
                  {detailDevice.cpu.chipset && (
                    <Typography variant="body2">Chipset: {detailDevice.cpu.chipset}</Typography>
                  )}
                  {detailDevice.cpu.architecture && (
                    <Typography variant="body2">Architecture: {detailDevice.cpu.architecture}</Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Memory</Typography>
                  <Typography variant="body2">
                    Type: {detailDevice.memory.type} {detailDevice.memory.module_type}
                  </Typography>
                  <Typography variant="body2">
                    Speed: {detailDevice.memory.speed}MHz
                  </Typography>
                  <Typography variant="body2">
                    Slots: {detailDevice.memory.slots} ({detailDevice.memory.module_type})
                  </Typography>
                  <Typography variant="body2">
                    Max Capacity: {detailDevice.memory.max_capacity}GB
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Storage</Typography>
                  {detailDevice.storage.map((storage, index) => (
                    <Box key={index} mb={1}>
                      <Typography variant="body2">
                        {storage.type} {storage.form_factor} ({storage.interface})
                      </Typography>
                      <Typography variant="body2">
                        Max Capacity: {storage.max_capacity}GB
                      </Typography>
                    </Box>
                  ))}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>WiFi</Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <span>{detailDevice.networking.wifi.standard}</span>
                    <Typography variant="caption" color="text.secondary" component="span">
                      ({detailDevice.networking.wifi.chipset})
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    Bluetooth: {detailDevice.networking.wifi.bluetooth}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Ethernet</Typography>
                  {detailDevice.networking.ethernet.map((eth, index) => (
                    <Box key={index} mb={1}>
                      {Array.from({ length: eth.ports }).map((_, portIndex) => (
                        <Typography key={portIndex} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <span>{eth.speed}</span>
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
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Ports</Typography>
                    {detailDevice.ports.usb_a !== undefined && (
                      <Typography variant="body2">USB-A: {detailDevice.ports.usb_a}</Typography>
                    )}
                    {detailDevice.ports.usb_c !== undefined && (
                      <Typography variant="body2">USB-C: {detailDevice.ports.usb_c}</Typography>
                    )}
                    {detailDevice.ports.usb_c_thunderbolt !== undefined && (
                      <Typography variant="body2">USB-C Thunderbolt: {detailDevice.ports.usb_c_thunderbolt}</Typography>
                    )}
                    {detailDevice.ports.hdmi !== undefined && (
                      <Typography variant="body2">HDMI: {detailDevice.ports.hdmi}</Typography>
                    )}
                    {detailDevice.ports.displayport !== undefined && (
                      <Typography variant="body2">DisplayPort: {detailDevice.ports.displayport}</Typography>
                    )}
                    {detailDevice.ports.audio_jack !== undefined && (
                      <Typography variant="body2">Audio Jack: {detailDevice.ports.audio_jack}</Typography>
                    )}
                    {detailDevice.ports.sd_card_reader !== undefined && (
                      <Typography variant="body2">SD Card Reader: {detailDevice.ports.sd_card_reader ? 'Yes' : 'No'}</Typography>
                    )}
                    {detailDevice.ports.serial !== undefined && (
                      <Typography variant="body2">Serial: {detailDevice.ports.serial}</Typography>
                    )}
                    {detailDevice.ports.other && detailDevice.ports.other.length > 0 && (
                      <Typography variant="body2">Other: {detailDevice.ports.other.join(', ')}</Typography>
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
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Expansion Slots</Typography>
                    {detailDevice.expansion.pcie_slots.map((slot, index) => (
                      <Box key={index} mb={1}>
                        <Typography variant="body2">
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
                    {detailDevice.expansion.additional_info && (
                      <Typography variant="body2" color="text.secondary">
                        Note: {detailDevice.expansion.additional_info}
                      </Typography>
                    )}
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
} 