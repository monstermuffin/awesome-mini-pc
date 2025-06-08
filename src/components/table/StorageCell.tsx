import { Box, Typography, Chip } from '@mui/material';
import type { MiniPC } from '../../types/minipc';

interface StorageCellProps {
  device: MiniPC;
  showDetails?: boolean;
}

export function StorageCell({ device, showDetails = false }: StorageCellProps) {
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
} 