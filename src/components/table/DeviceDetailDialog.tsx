import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
} from '@mui/material';
import React from 'react';

import type { MiniPC } from '../../types/minipc';
import { StorageCell } from './StorageCell';
import { formatMemoryCapacity, formatVolume } from './tableUtils';

interface DeviceDetailDialogProps {
  device: MiniPC | null;
  open: boolean;
  onClose: () => void;
}

export function DeviceDetailDialog({ device, open, onClose }: DeviceDetailDialogProps) {
  const ethernetGroups = React.useMemo(() => {
    if (!device?.networking?.ethernet?.length) return {};
    
    interface EthernetGroup {
      count: number;
      chipset: string;
      interface: string;
      speed: string;
    }

    const groups: Record<string, EthernetGroup> = {};
    
    device.networking.ethernet.forEach(eth => {
      const key = `${eth.speed}_${eth.interface}_${eth.chipset}`;
      if (!groups[key]) {
        groups[key] = { count: eth.ports, chipset: eth.chipset, interface: eth.interface, speed: eth.speed };
      } else {
        groups[key].count += eth.ports;
      }
    });

    return groups;
  }, [device?.networking?.ethernet]);

  if (!device) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="device-detail-title"
      aria-describedby="device-detail-content"
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundImage: (theme: any) => theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, rgba(24,24,24,1) 0%, rgba(33,33,33,1) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,250,250,1) 100%)',
          boxShadow: (theme: any) => theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle 
        id="device-detail-title"
        sx={{ 
          borderBottom: (theme: any) => `1px solid ${theme.palette.divider}`,
          background: (theme: any) => theme.palette.mode === 'dark'
            ? 'linear-gradient(90deg, rgba(21,101,192,0.1) 0%, rgba(30,136,229,0.1) 100%)'
            : 'linear-gradient(90deg, rgba(33,150,243,0.05) 0%, rgba(66,165,245,0.05) 100%)',
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ 
          fontWeight: 600,
          color: (theme: any) => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
        }}>
          {device.brand} {device.model}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          Released: {device.release_date}
        </Typography>
      </DialogTitle>
      <DialogContent id="device-detail-content" dividers sx={{ px: 3, py: 2 }}>
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
              {device.cpu.brand} {device.cpu.model}
            </Typography>
            {device.cpu.model !== 'DIY' && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Cores: {device.cpu.cores} (Threads: {device.cpu.threads})
              </Typography>
            )}
            {device.cpu.core_config && (
              <Box sx={{ mb: 1, pl: 1.5 }}>
                <Typography variant="body2" fontStyle="italic" sx={{ mb: 0.5 }}>
                  Core Configuration:
                </Typography>
                {device.cpu.core_config.types.map((coreType, idx) => (
                  <Typography key={idx} variant="body2" sx={{ pl: 1, mb: 0.5 }}>
                    • {coreType.count}× {coreType.type}: {coreType.boost_clock}GHz
                  </Typography>
                ))}
              </Box>
            )}
            <Typography variant="body2" sx={{ mb: 0.5 }}>TDP: {device.cpu.tdp}W</Typography>
            {device.cpu.chipset && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>Chipset: {device.cpu.chipset}</Typography>
            )}
            {device.cpu.architecture && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>Architecture: {device.cpu.architecture}</Typography>
            )}
            {device.cpu.socket && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Socket: {device.cpu.socket.type}
                {device.cpu.socket.supports_cpu_swap ? ' (Socketable)' : ''}
              </Typography>
            )}
          </Grid>
          
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
            }}>Memory</Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Type: {device.memory.type} ({device.memory.module_type})
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Speed: {device.memory.speed}MT/s
            </Typography>
            {device.memory.module_type === 'Soldered' || device.memory.module_type === 'Embedded' ? (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Installed RAM: {formatMemoryCapacity(device.memory.max_capacity)}
              </Typography>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Slots: {device.memory.slots}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Max Capacity: {formatMemoryCapacity(device.memory.max_capacity)}
                </Typography>
              </>
            )}
          </Grid>
          
          {device?.gpu && (
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
              }}>Graphics</Typography>
              {device.gpu.map((gpu, index) => (
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
                }}>Storage</Typography>
                
                <StorageCell device={device} showDetails={true} />
              </Grid>

              {((device?.expansion?.pcie_slots?.length ?? 0) > 0 || (device?.expansion?.oculink_ports?.length ?? 0) > 0 || (device?.expansion?.sim_slots?.length ?? 0) > 0 || (device?.expansion?.mpcie_slots?.length ?? 0) > 0 || device?.expansion?.egpu_support) && (
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
                  }}>Expansion</Typography>
                  <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}>
                    {/* PCIe Slots */}
                    {device?.expansion?.pcie_slots?.map((slot, index) => (
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
                    {device?.expansion?.oculink_ports?.map((port, index) => (
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

                    {/* SIM Slots */}
                    {device?.expansion?.sim_slots?.map((slot, index) => (
                      <Box key={`sim-${index}`} sx={{
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(156,39,176,0.1)' 
                          : 'rgba(156,39,176,0.05)',
                        border: theme => `1px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(156,39,176,0.2)' 
                          : 'rgba(156,39,176,0.15)'}`,
                        minWidth: 180,
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                          {slot.count}x {slot.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cellular connectivity
                        </Typography>
                      </Box>
                    ))}

                    {/* mPCIe Slots */}
                    {device?.expansion?.mpcie_slots?.map((slot, index) => (
                      <Box key={`mpcie-${index}`} sx={{
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(103,58,183,0.1)' 
                          : 'rgba(103,58,183,0.05)',
                        border: theme => `1px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(103,58,183,0.2)' 
                          : 'rgba(103,58,183,0.15)'}`,
                        minWidth: 180,
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                          {slot.count}x {slot.type}
                        </Typography>
                        {slot.note && (
                          <Typography variant="body2" color="text.secondary">
                            {slot.note}
                          </Typography>
                        )}
                      </Box>
                    ))}

                    {/* eGPU Support */}
                    {device?.expansion?.egpu_support && (
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(255,152,0,0.1)' 
                          : 'rgba(255,152,0,0.05)',
                        border: theme => `1px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(255,152,0,0.2)' 
                          : 'rgba(255,152,0,0.15)'}`,
                        minWidth: 180,
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                          eGPU Support
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          External GPU compatible
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {device?.expansion?.additional_info && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Note: {device?.expansion?.additional_info}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Ethernet section */}
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
            }}>Ethernet</Typography>
            
            <>
              {Object.entries(ethernetGroups).map(([, info], index) => (
                <Box key={index} sx={{ mb: 1 }}>
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
          </Grid>
          
          {/* WiFi section */}
          {device?.networking?.wifi && (
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
              }}>WiFi</Typography>
              <Box>
                <Typography variant="body2">
                  {device.networking.wifi.chipset} ({device.networking.wifi.standard})
                </Typography>
                {device.networking.wifi.bluetooth && (
                  <Typography variant="body2" color="text.secondary">
                    Bluetooth {device.networking.wifi.bluetooth}
                  </Typography>
                )}
              </Box>
            </Grid>
          )}

          {/* Ports section */}
          {device?.ports && (
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
                <Grid size={{ xs: 12, md: 6 }}>
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
                    {device?.ports?.usb_a && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>USB Type-A:</Typography>
                        {Array.isArray(device?.ports?.usb_a) ? (
                          device?.ports?.usb_a.map((port, index) => (
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
                          <Typography variant="body2" sx={{ ml: 2 }}>{device?.ports?.usb_a}x ports</Typography>
                        )}
                      </Box>
                    )}

                    {/* USB-C Ports */}
                    {device?.ports?.usb_c && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>USB-C:</Typography>
                        {Array.isArray(device?.ports?.usb_c) ? (
                          device?.ports?.usb_c.map((port, index) => (
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
                          <Typography variant="body2" sx={{ ml: 2 }}>{device?.ports?.usb_c}x ports</Typography>
                        )}
                      </Box>
                    )}

                    {/* Thunderbolt Ports */}
                    {device?.ports?.usb_c_thunderbolt !== undefined && device?.ports?.usb_c_thunderbolt > 0 && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>Thunderbolt:</Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          {device?.ports?.usb_c_thunderbolt}× ports
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Display Outputs Section */}
                <Grid size={{ xs: 12, md: 6 }}>
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
                    {device?.ports?.hdmi && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>HDMI:</Typography>
                        {typeof device?.ports?.hdmi === 'object' ? (
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            ml: 2
                          }}>
                            {device?.ports?.hdmi.count > 1 && (
                              <Chip 
                                label={`${device?.ports?.hdmi.count}×`} 
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
                              {device?.ports?.hdmi.version}
                              {device?.ports?.hdmi.max_resolution && ` (${device?.ports?.hdmi.max_resolution})`}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ ml: 2 }}>{device?.ports?.hdmi}x ports</Typography>
                        )}
                      </Box>
                    )}

                    {/* DisplayPort */}
                    {device?.ports?.displayport && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>DisplayPort:</Typography>
                        {typeof device?.ports?.displayport === 'object' ? (
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            ml: 2
                          }}>
                            {device?.ports?.displayport.count > 1 && (
                              <Chip 
                                label={`${device?.ports?.displayport.count}×`} 
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
                              {device?.ports?.displayport.version}
                              {device?.ports?.displayport.max_resolution && ` (${device?.ports?.displayport.max_resolution})`}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ ml: 2 }}>{device?.ports?.displayport}x ports</Typography>
                        )}
                        {typeof device?.ports?.displayport === 'object' && device?.ports?.displayport.form_factor && (
                          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                            Form factor: {device?.ports?.displayport.form_factor}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* USB-C Display Outputs */}
                    {Array.isArray(device?.ports?.usb_c) && device.ports.usb_c.some(port => port.alt_mode || port.max_resolution) && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, color: 'text.secondary' }}>USB-C Display Output:</Typography>
                        {device.ports.usb_c
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
                <Grid size={{ xs: 12, md: 6 }}>
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
                    {device?.ports?.audio_jack !== undefined && (
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>Audio Jack:</Typography>
                        <Typography variant="body2">{device?.ports?.audio_jack}x</Typography>
                      </Box>
                    )}

                    {/* IR Receiver */}
                    {device?.ports?.ir_receiver !== undefined && (
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>IR Receiver:</Typography>
                        <Typography variant="body2">{device?.ports?.ir_receiver ? 'Yes' : 'No'}</Typography>
                      </Box>
                    )}

                    {/* SD Card Reader */}
                    {device?.ports?.sd_card_reader !== undefined && (
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>SD Card Reader:</Typography>
                        <Typography variant="body2">{device?.ports?.sd_card_reader ? 'Yes' : 'No'}</Typography>
                      </Box>
                    )}

                    {/* Micro SD Card Reader */}
                    {device?.ports?.micro_sd_card_reader !== undefined && (
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>Micro SD Card Reader:</Typography>
                        <Typography variant="body2">{device?.ports?.micro_sd_card_reader ? 'Yes' : 'No'}</Typography>
                      </Box>
                    )}

                    {/* Serial Ports */}
                    {device?.ports?.serial !== undefined && (
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>Serial:</Typography>
                        <Typography variant="body2">
                          {typeof device?.ports?.serial === 'object' 
                            ? `${device.ports.serial.count}x ${device.ports.serial.type}` 
                            : `${device?.ports?.serial}x`}
                        </Typography>
                      </Box>
                    )}

                    {/* OCuLink */}
                    {device?.ports?.oculink !== undefined && (
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>OCuLink:</Typography>
                        <Typography variant="body2">{device?.ports?.oculink}x</Typography>
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
              {device.dimensions && (
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
                  }}>Dimensions</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {device.dimensions.width} × {device.dimensions.depth} × {device.dimensions.height} mm
                  </Typography>
                  {device.dimensions.volume !== undefined && (
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
                        {formatVolume(device.dimensions.volume)}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              )}
              
              {device.power && (
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
                  }}>Power</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Adapter: {device.power.adapter_wattage}W
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Input: {device.power.dc_input}
                  </Typography>
                  {device.power.usb_pd_input !== undefined && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      USB-C PD Input: {device.power.usb_pd_input ? 'Yes' : 'No'}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Notes section - moved to end and styled like other sections */}
          {device.notes && (
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
                {device.notes.split('\n').map((note, index) => (
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
      <DialogActions sx={{ 
        px: 3, 
        py: 2,
        borderTop: (theme: any) => `1px solid ${theme.palette.divider}`,
        background: (theme: any) => theme.palette.mode === 'dark'
          ? 'rgba(41,98,255,0.05)'
          : 'rgba(41,98,255,0.03)',
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            minWidth: 80,
            '&:focus-visible': {
              outline: (theme: any) => `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            }
          }}
          aria-label="Close device details dialog"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
} 