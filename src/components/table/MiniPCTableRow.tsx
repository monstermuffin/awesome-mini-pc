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
import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { MiniPC } from '../../types/minipc';
import type { DeviceFamily } from '../../utils/deviceGrouping';
import { StorageCell } from './StorageCell';
import { getDeviceAge, formatMemoryCapacity, formatVolume } from './tableUtils';

interface MiniPCTableRowProps {
  device?: MiniPC;
  family?: DeviceFamily;
  isSelected: boolean;
  isCompareMode: boolean;
  isExpanded?: boolean;
  isVariant?: boolean; // true if this is a sub-row variant
  onDeviceSelect: (deviceId: string) => void;
  onOpenDetails: (device: MiniPC, event: React.MouseEvent) => void;
  onToggleExpand?: (familyId: string) => void;
}

export function MiniPCTableRow({ 
  device, 
  family,
  isSelected, 
  isCompareMode, 
  isExpanded = false,
  isVariant = false,
  onDeviceSelect, 
  onOpenDetails,
  onToggleExpand
}: MiniPCTableRowProps) {
  const displayDevice = device || family?.representative;
  if (!displayDevice) return null;

  const isFamily = !!family && family.variantCount > 1;

  // Check if this row should be highlighted:
  const shouldHighlight = React.useMemo(() => {
    return isSelected;
  }, [isSelected]);

  const handleRowClick = () => {
    if (isCompareMode) return;
    
    if (isFamily && !isVariant) {
      // Click on family row - toggle expansion
      onToggleExpand?.(family.id);
    } else {
      // Click on individual device or variant - select it
      onDeviceSelect(displayDevice.id);
    }
  };

  const ethernetGroups = React.useMemo(() => {
    if (!displayDevice.networking?.ethernet?.length) return {};
    
    interface EthernetGroup {
      count: number;
      chipsets: string[];
      interface: string;
      speed: string;
    }
    
    const groups: Record<string, EthernetGroup> = {};
    
    displayDevice.networking.ethernet.forEach(eth => {
      const key = `${eth.speed}_${eth.interface}`;
      if (!groups[key]) {
        groups[key] = { count: eth.ports, chipsets: [eth.chipset], interface: eth.interface, speed: eth.speed };
      } else {
        groups[key].count += eth.ports;
        if (!groups[key].chipsets.includes(eth.chipset)) {
          groups[key].chipsets.push(eth.chipset);
        }
      }
    });
    
    return groups;
  }, [displayDevice.networking?.ethernet]);

  const rowStyles = {
    cursor: isCompareMode ? 'default' : 'pointer',
    bgcolor: shouldHighlight 
      ? (theme: any) => theme.palette.mode === 'dark'
        ? 'rgba(33, 150, 243, 0.15)'
        : 'rgba(33, 150, 243, 0.08)'
      : 'inherit',
    boxShadow: isVariant 
      ? 'inset 3px 0 0 #9c27b0'
      : shouldHighlight
        ? (theme: any) => `inset 2px 0 0 ${theme.palette.primary.main}`
        : 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      bgcolor: (theme: any) => {
        if (shouldHighlight) {
          return theme.palette.mode === 'dark'
            ? 'rgba(33, 150, 243, 0.2)'
            : 'rgba(33, 150, 243, 0.12)';
        }
        if (isCompareMode) {
          return 'inherit';
        }
        if (isVariant) {
          return theme.palette.mode === 'dark'
            ? 'rgba(156, 39, 176, 0.1)'
            : 'rgba(156, 39, 176, 0.08)';
        }
        return theme.palette.action.hover;
      },
      boxShadow: isVariant 
        ? 'inset 3px 0 0 #e91eaa'
        : shouldHighlight
          ? (theme: any) => `inset 2px 0 0 ${theme.palette.primary.dark}`
          : (theme: any) => `inset 2px 0 0 ${theme.palette.primary.main}`,
    },
  };

  const chipStyles = {
    height: 16, 
    fontSize: '0.65rem',
    fontWeight: 600,
    minWidth: 16,
  };

  const variantCountChipStyles = {
    ...chipStyles,
    bgcolor: (theme: any) => theme.palette.mode === 'dark' 
      ? 'rgba(156, 39, 176, 0.15)' 
      : 'rgba(156, 39, 176, 0.1)',
    color: (theme: any) => theme.palette.mode === 'dark' 
      ? '#ce93d8' 
      : '#7b1fa2',
  };

  const infoChipStyles = {
    ...chipStyles,
    bgcolor: (theme: any) => theme.palette.mode === 'dark' 
      ? 'rgba(33,150,243,0.15)' 
      : 'rgba(33,150,243,0.1)',
    color: (theme: any) => theme.palette.mode === 'dark' 
      ? '#90caf9' 
      : '#1976d2',
  };

  return (
    <TableRow
      key={displayDevice.id}
      hover={!isVariant}
      onClick={handleRowClick}
      sx={rowStyles}
      role={isFamily && !isVariant ? "button" : "row"}
      tabIndex={isCompareMode ? -1 : 0}
      aria-selected={shouldHighlight}
      aria-expanded={isFamily && !isVariant ? isExpanded : undefined}
      aria-label={
        isFamily && !isVariant 
          ? `${displayDevice.brand} ${displayDevice.model} family with ${family.variantCount} variants. ${isExpanded ? 'Expanded' : 'Collapsed'}.`
          : `${displayDevice.brand} ${displayDevice.model} ${isVariant ? 'variant' : 'device'}`
      }
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleRowClick();
        }
      }}
    >
             <TableCell sx={{ pl: isVariant ? 6 : 2 }}>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           {/* Hide brand for variant rows since they're the same brand */}
           {!isVariant && displayDevice.brand}
           
           {/* Variant count badge for family rows - moved here */}
           {isFamily && !isVariant && (
             <Chip 
               label={`${family.variantCount}`}
               size="small" 
               sx={variantCountChipStyles} 
             />
           )}
           
           {/* Add a subtle variant indicator for variant rows */}
           {isVariant && (
             <Box sx={{ 
               display: 'flex', 
               alignItems: 'center',
               color: (theme: any) => theme.palette.mode === 'dark' ? '#ce93d8' : '#7b1fa2',
               fontSize: '0.75rem',
               fontWeight: 500,
               opacity: 0.8
             }}>
               ↳ variant
             </Box>
           )}
         </Box>
       </TableCell>
      
             <TableCell sx={{ pl: isVariant ? 4 : 2 }}>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           {/* Expansion toggle for family rows */}
           {isFamily && !isVariant && (
             <IconButton 
               size="small" 
               onClick={(e) => {
                 e.stopPropagation();
                 onToggleExpand?.(family.id);
               }}
               sx={{ 
                 p: 0.5,
                 color: 'text.secondary'
               }}
               aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${displayDevice.model} variants`}
               aria-expanded={isExpanded}
             >
               {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
             </IconButton>
           )}
           
           <Box sx={{ flex: 1 }}>
             {/* Model name */}
             <Typography variant="body2" component="div" sx={{ 
               fontWeight: isVariant ? 400 : 500,
               whiteSpace: 'normal',
               overflow: 'visible',
               lineHeight: 1.3,
               mb: 0.3
             }}>
               {displayDevice.model}
             </Typography>
             
             {/* Release date and age info */}
             <Typography variant="caption" color="text.secondary" sx={{ 
               display: 'flex', 
               alignItems: 'flex-start', 
               gap: 0.5,
               flexWrap: 'wrap',
             }}>
               {displayDevice.release_date} 
               <Box component="span" sx={{ 
                 display: 'inline-flex', 
                 px: 0.7, 
                 py: 0.1, 
                 bgcolor: (theme: any) => theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.1)', 
                 borderRadius: 1,
                 fontSize: '0.7rem',
                 color: (theme: any) => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
               }}>
                 {getDeviceAge(displayDevice.release_date)}
               </Box>
             </Typography>
           </Box>
         </Box>
       </TableCell>

             {/* CPU */}
       <TableCell>
         <Typography variant="body2" component="div" sx={{ 
           fontWeight: 500,
           whiteSpace: 'normal',
           overflow: 'visible',
           lineHeight: 1.3,
           mb: 0.3
         }}>
           {displayDevice.cpu.brand} {displayDevice.cpu.model}
         </Typography>
         {displayDevice.cpu.model !== 'DIY' && (
           <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
             {displayDevice.cpu.cores} cores ({displayDevice.cpu.threads} threads) • {displayDevice.cpu.base_clock}GHz - {displayDevice.cpu.boost_clock}GHz
             {displayDevice.cpu.core_config && (
               <Tooltip 
                 title={
                   <Box>
                     <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                       Core Configuration:
                     </Typography>
                     {displayDevice.cpu.core_config.types.map((coreType, index) => (
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
                     backgroundColor: (theme: any) => theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.15)' : 'rgba(33,150,243,0.1)',
                     color: (theme: any) => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
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
           TDP: {displayDevice.cpu.tdp}W
         </Typography>
         {displayDevice.cpu.chipset && (
           <Typography variant="caption" color="text.secondary" component="div" sx={{
             whiteSpace: 'normal',
             overflow: 'visible',
             lineHeight: 1.3,
           }}>
             {displayDevice.cpu.chipset}
           </Typography>
         )}
         {displayDevice.cpu.architecture && (
           <Chip 
             label={displayDevice.cpu.architecture} 
             size="small" 
             variant="outlined" 
             sx={{ 
               fontSize: '0.7rem', 
               height: 20, 
               mt: 0.5,
               borderColor: (theme: any) => theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.5)' : 'rgba(25,118,210,0.5)',
               color: (theme: any) => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2', 
             }} 
           />
         )}
         {displayDevice.cpu.socket && (
           <Chip 
             label={`${displayDevice.cpu.socket.type}${displayDevice.cpu.socket.supports_cpu_swap ? ' (Socketable)' : ''}`}
             size="small"
             variant="outlined"
             sx={{ 
               fontSize: '0.7rem',
               height: 20,
               mt: 0.5,
               ml: displayDevice.cpu.architecture ? 0.5 : 0,
               borderColor: (theme: any) => theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.5)' : 'rgba(56,142,60,0.5)',
               color: (theme: any) => theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32',
             }}
           />
         )}
       </TableCell>

             {/* GPU */}
       <TableCell>
         {displayDevice.gpu && displayDevice.gpu.length > 0 ? (
           displayDevice.gpu.map((gpu, index) => (
             <Box key={index} sx={{ mb: index < displayDevice.gpu!.length - 1 ? 1 : 0 }}>
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

             {/* Cores */}
       <TableCell align="center">
         <Box sx={{ 
           fontWeight: 'medium', 
           color: (theme: any) => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2' 
         }}>
           {displayDevice.cpu.model === 'DIY' ? 'N/A' : displayDevice.cpu.cores}
         </Box>
       </TableCell>

             {/* Memory */}
       <TableCell>
         <Typography variant="body2" component="div" sx={{ 
           fontWeight: 500,
           whiteSpace: 'normal',
           overflow: 'visible',
           lineHeight: 1.3,
           mb: 0.3
         }}>
           {displayDevice.memory.type}
         </Typography>
         <Typography variant="caption" color="text.secondary" sx={{
           whiteSpace: 'normal',
           overflow: 'visible',
           lineHeight: 1.3,
           mb: 0.2
         }}>
           {displayDevice.memory.module_type === 'Soldered' || displayDevice.memory.module_type === 'Embedded'
             ? formatMemoryCapacity(displayDevice.memory.max_capacity)
             : `${displayDevice.memory.slots}x slots, Max ${formatMemoryCapacity(displayDevice.memory.max_capacity)}`
           }
         </Typography>
         <Typography variant="caption" color="text.secondary" sx={{
           whiteSpace: 'normal',
           overflow: 'visible',
           lineHeight: 1.3,
           display: 'flex',
           alignItems: 'center',
           gap: 1
         }}>
           <Box component="span">
             {displayDevice.memory.module_type}
           </Box>
           <Box component="span" sx={{ 
             fontWeight: 'medium', 
             color: (theme: any) => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2'
           }}>
             {displayDevice.memory.speed}MT/s
           </Box>
         </Typography>
       </TableCell>

             {/* Storage */}
       <TableCell>
         <StorageCell device={displayDevice} showDetails={false} />
       </TableCell>

             {/* Ethernet */}
       <TableCell>
         {displayDevice.networking?.ethernet && displayDevice.networking.ethernet.length > 0 ? (
           (() => {
             return (
               <>
                 {Object.entries(ethernetGroups).map(([, info], index: number) => (
                   <Box key={index} sx={{ mb: 0.5 }}>
                     <Box sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', gap: 1 }}>
                       {info.count > 1 && (
                         <Chip 
                           label={`${info.count}×`} 
                           size="small" 
                           sx={infoChipStyles} 
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

             {/* WiFi */}
       <TableCell>
         {displayDevice.networking?.wifi ? (
           <>
             <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
               <Box component="span" sx={{ 
                 fontWeight: 'medium',
                 display: 'flex', 
                 alignItems: 'center',
                 gap: 1 
               }}>
                 {displayDevice.networking.wifi.standard}
               </Box>
               <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                 {displayDevice.networking.wifi.chipset}
               </Typography>
             </Typography>
             {displayDevice.networking.wifi.bluetooth && (
               <Box sx={{ 
                 display: 'flex',
                 alignItems: 'center',
                 gap: 0.5,
                 mt: 0.3
               }}>
                 <Typography variant="caption" color="text.secondary" component="div">
                   BT {displayDevice.networking.wifi.bluetooth}
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

             {/* Volume */}
       <TableCell>
         {displayDevice.dimensions?.volume !== undefined && (
           <Box sx={{ 
             fontWeight: 'medium'
           }}>
             {formatVolume(displayDevice.dimensions.volume)}
           </Box>
         )}
       </TableCell>

             {/* Details */}
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
               (displayDevice?.expansion?.pcie_slots?.length ?? 0) + 
               (displayDevice?.expansion?.oculink_ports?.length ?? 0) +
               (displayDevice?.expansion?.mpcie_slots?.length ?? 0) +
               (displayDevice?.expansion?.egpu_support ? 1 : 0)
             }
             color="primary"
                            sx={{ 
                 '& .MuiBadge-badge': { 
                   display: (!displayDevice?.expansion?.pcie_slots?.length && !displayDevice?.expansion?.oculink_ports?.length && !displayDevice?.expansion?.mpcie_slots?.length && !displayDevice?.expansion?.egpu_support) ? 'none' : 'flex',
                 fontSize: '0.6rem',
                 fontWeight: 'bold',
                 backgroundColor: (theme: any) => theme.palette.mode === 'dark' ? '#2196f3' : '#1976d2',
                 minWidth: '16px',
                 height: '16px',
                 padding: '0 4px',
               }
             }}
           >
             <Tooltip title={
               ((displayDevice?.expansion?.pcie_slots?.length ?? 0) + (displayDevice?.expansion?.oculink_ports?.length ?? 0) + (displayDevice?.expansion?.mpcie_slots?.length ?? 0)) > 0 || displayDevice?.expansion?.egpu_support
                 ? `${displayDevice?.expansion?.pcie_slots?.length ?? 0} PCIe slot(s)${displayDevice?.expansion?.oculink_ports?.length ? `, ${displayDevice.expansion.oculink_ports.length} OCuLink port(s)` : ''}${displayDevice?.expansion?.mpcie_slots?.length ? `, ${displayDevice.expansion.mpcie_slots.length} mPCIe slot(s)` : ''}${displayDevice?.expansion?.egpu_support ? ', eGPU support' : ''} available`
                 : "View details"
             }>
               <IconButton 
                 size="small" 
                 onClick={(event) => onOpenDetails(displayDevice, event)}
                 sx={{
                   padding: 0.75,
                   transition: theme => theme.transitions.create(['background-color', 'box-shadow', 'transform'], {
                     duration: theme.transitions.duration.short,
                   }),
                   backgroundColor: 'transparent',
                   color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                   borderRadius: '50%',
                   border: 'none',
                   '&:hover': {
                     backgroundColor: theme => theme.palette.mode === 'dark' 
                       ? 'rgba(33,150,243,0.2)' 
                       : 'rgba(33,150,243,0.1)',
                     transform: 'scale(1.1)',
                     boxShadow: 'none',
                   },
                   '&:focus-visible': {
                     outline: theme => `2px solid ${theme.palette.primary.main}`,
                     outlineOffset: 2,
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