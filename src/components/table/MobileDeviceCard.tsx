import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import type { MiniPC } from '../../types/minipc';
import { StorageCell } from './StorageCell';
import { formatMemoryCapacity, formatVolume } from './tableUtils';

interface MobileDeviceCardProps {
  device: MiniPC;
  isSelected: boolean;
  isCompareMode: boolean;
  onDeviceSelect: (deviceId: string) => void;
  onOpenDetails: (device: MiniPC, event: React.MouseEvent) => void;
}

export function MobileDeviceCard({
  device,
  isSelected,
  isCompareMode,
  onDeviceSelect,
  onOpenDetails,
}: MobileDeviceCardProps) {
  const theme = useTheme();

  const handleCardClick = () => {
    if (!isCompareMode) {
      onDeviceSelect(device.id);
    }
  };

  const handleDetailsClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onOpenDetails(device, event);
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: isCompareMode ? 'default' : 'pointer',
        border: isSelected
          ? `2px solid ${theme.palette.primary.main}`
          : `1px solid ${theme.palette.divider}`,
        bgcolor: isSelected
          ? theme.palette.mode === 'dark'
            ? 'rgba(33, 150, 243, 0.08)'
            : 'rgba(33, 150, 243, 0.04)'
          : 'inherit',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateY(0)',
        '&:hover': {
          transform: isCompareMode ? 'none' : 'translateY(-4px)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 25px rgba(0,0,0,0.3)'
            : '0 8px 25px rgba(0,0,0,0.12)',
          borderColor: isSelected ? theme.palette.primary.main : theme.palette.primary.light,
        },
        '&:active': {
          transform: isCompareMode ? 'none' : 'translateY(-1px)',
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header with brand, model and selection indicator */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 }}>
              {device.brand} {device.model}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {device.release_date}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isCompareMode && (
              isSelected ? (
                <CheckCircleIcon color="primary" />
              ) : (
                <RadioButtonUncheckedIcon color="action" />
              )
            )}
            <IconButton
              size="small"
              onClick={handleDetailsClick}
              sx={{ ml: 1 }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* CPU and GPU */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip
              label={`${device.cpu.cores} cores`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
            {device.cpu.tdp && (
              <Chip
                label={`${device.cpu.tdp}W TDP`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
            CPU: {device.cpu.brand} {device.cpu.model}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            GPU: {device.gpu && device.gpu.length > 0
              ? device.gpu.map(gpu => `${gpu.type === 'Integrated' ? 'Integrated' : 'Discrete'} ${gpu.model}${gpu.vram ? ` (${gpu.vram})` : ''}`).join(', ')
              : 'None'}
          </Typography>
        </Box>

        {/* Memory and Storage */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
            Memory: {device.memory.type} {formatMemoryCapacity(device.memory.max_capacity)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Storage:
            </Typography>
            <StorageCell device={device} compact />
          </Box>
        </Box>

        {/* Networking */}
        <Box sx={{ mb: 2 }}>
          {device.networking?.ethernet && device.networking.ethernet.length > 0 && (
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Ethernet: {device.networking.ethernet.map(eth => `${eth.speed} (${eth.ports})`).join(', ')}
            </Typography>
          )}
          {device.networking?.wifi && (
            <Typography variant="body2">
              WiFi: {device.networking.wifi.standard}
            </Typography>
          )}
        </Box>

        {/* Dimensions */}
        {device.dimensions?.volume && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Volume:
            </Typography>
            <Chip
              label={formatVolume(device.dimensions.volume)}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}