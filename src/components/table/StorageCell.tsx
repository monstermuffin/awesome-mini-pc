import { Box, Typography, Chip } from '@mui/material';
import React from 'react';
import type { MiniPC } from '../../types/minipc';

interface StorageCellProps {
  device: MiniPC;
  showDetails?: boolean;
  compact?: boolean;
}

export function StorageCell({ device, showDetails = false, compact = false }: StorageCellProps) {
  const storageGroups = React.useMemo(() => {
    const groups: Record<string, Array<{ interface: string; form_factor?: string; alt_interface?: string }>> = {};

    device.storage.forEach(storage => {
      const type = storage.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push({
        interface: storage.interface,
        form_factor: storage.form_factor,
        alt_interface: storage.alt_interface
      });
    });

    return groups;
  }, [device.storage]);

  const chipStyle = React.useMemo(() => ({
    height: 20, 
    fontSize: '0.7rem',
    fontWeight: 600,
    bgcolor: (theme: any) => theme.palette.mode === 'dark' 
      ? 'rgba(33,150,243,0.15)' 
      : 'rgba(33,150,243,0.1)',
    color: (theme: any) => theme.palette.mode === 'dark' 
      ? '#90caf9' 
      : '#1976d2',
  }), []);

  if (compact) {
    // Compact mode for mobile cards
    const storageSummary = Object.entries(storageGroups).map(([type, details]) => {
      const interfaces = [...new Set(details.map(d => d.interface))];
      const count = details.length > 1 ? `${details.length}×` : '';
      return `${count}${type} (${interfaces.join('/')})`;
    }).join(', ');

    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
        {storageSummary || 'None'}
      </Typography>
    );
  }

  return (
    <>
      {Object.entries(storageGroups).map(([type, details], index) => (
        <Box key={index} sx={{ mb: 0.5 }}>
          <Box sx={{
            fontWeight: 'medium',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minHeight: 20,
          }}>
            {details.length > 1 && (
              <Chip
                label={`${details.length}×`}
                size="small"
                sx={chipStyle}
                aria-label={`${details.length} ${type} storage slots`}
              />
            )}
            <Typography variant="body2" component="span" sx={{ fontWeight: 'medium' }}>
              {type}
            </Typography>
          </Box>
          {details.map((detail, detailIndex) => (
            <Typography
              key={detailIndex}
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                lineHeight: 1.2,
                mt: 0.25
              }}
            >
              {detail.interface}
              {showDetails && detail.alt_interface && (
                <Box component="span" sx={{ opacity: 0.8 }}>
                  {detail.alt_interface === 'U.2' ? ' (supports U.2 via adapter)' :
                  detail.alt_interface === 'SATA' ? ' (supports SATA)' :
                  ` (supports ${detail.alt_interface})`}
                </Box>
              )}
            </Typography>
          ))}
        </Box>
      ))}
    </>
  );
} 