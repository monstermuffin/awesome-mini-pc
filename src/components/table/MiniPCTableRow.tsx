import {
  TableRow,
  TableCell,
  Typography,
  Box,
  Chip,
  Tooltip,
  IconButton,
  Badge,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import type { MiniPC } from '../../types/minipc';
import { StorageCell } from './StorageCell';
import { getDeviceAge, formatMemoryCapacity, formatVolume } from './tableUtils';

interface MiniPCTableRowProps {
  device: MiniPC;
  isSelected: boolean;
  isCompareMode: boolean;
  onDeviceSelect: (deviceId: string) => void;
  onOpenDetails: (device: MiniPC, event: React.MouseEvent) => void;
}

export function MiniPCTableRow({ 
  device, 
  isSelected, 
  isCompareMode, 
  onDeviceSelect, 
  onOpenDetails 
}: MiniPCTableRowProps) {
  return (
    <TableRow
      key={device.id}
      hover
      onClick={() => !isCompareMode && onDeviceSelect(device.id)}
      sx={{
        cursor: isCompareMode ? 'default' : 'pointer',
        bgcolor: isSelected 
          ? theme => theme.palette.mode === 'dark'
            ? 'rgba(33, 150, 243, 0.15)'
            : 'rgba(33, 150, 243, 0.08)'
          : 'inherit',
        '&:hover': {
          bgcolor: theme => {
            if (isSelected) {
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
          {device.memory.module_type === 'Soldered' || device.memory.module_type === 'Embedded'
            ? formatMemoryCapacity(device.memory.max_capacity)
            : `${device.memory.slots}x slots, Max ${formatMemoryCapacity(device.memory.max_capacity)}`
          }
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
        {device.dimensions?.volume !== undefined && (
          <Box sx={{ 
            fontWeight: 'medium'
          }}>
            {formatVolume(device.dimensions.volume)}
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
                onClick={(event) => onOpenDetails(device, event)}
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
  );
} 