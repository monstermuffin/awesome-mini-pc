import {
  Box,
  Skeleton,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
// React is not needed for this component

interface SkeletonLoaderProps {
  count?: number;
}

export function SkeletonLoader({ count = 10 }: SkeletonLoaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Box sx={{ p: 2 }}>
        {Array.from({ length: count }, (_, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              {/* Header skeleton */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
                <Skeleton variant="circular" width={32} height={32} />
              </Box>

              {/* Specs skeleton */}
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={16} />
              </Box>

              {/* Storage skeleton */}
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width="90%" height={16} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={16} />
              </Box>

              {/* Networking skeleton */}
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width="75%" height={16} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="65%" height={16} />
              </Box>

              {/* Volume skeleton */}
              <Skeleton variant="text" width="50%" height={16} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // Desktop table skeleton
  return (
    <Box>
      {/* Header skeleton */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Skeleton variant="text" width={120} height={24} />
      </Box>

      {/* Table skeleton */}
      <Box sx={{ overflow: 'auto' }}>
        {/* Table header skeleton */}
        <Box
          sx={{
            display: 'flex',
            p: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === 'dark'
              ? 'rgba(41,98,255,0.4)'
              : 'rgba(33,150,243,0.2)',
          }}
        >
          <Skeleton variant="text" width={100} height={20} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={140} height={20} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={170} height={20} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={120} height={20} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={55} height={20} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={150} height={20} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={120} height={20} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={120} height={20} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={120} height={20} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={80} height={20} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={70} height={20} />
        </Box>

        {/* Table rows skeleton */}
        {Array.from({ length: count }, (_, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              p: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              '&:nth-of-type(even)': {
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.02)'
                  : 'rgba(0,0,0,0.02)',
              },
            }}
          >
            <Skeleton variant="text" width={100} height={16} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={140} height={16} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={170} height={16} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={120} height={16} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={55} height={16} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={150} height={16} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={120} height={16} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={120} height={16} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={120} height={16} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={80} height={16} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={70} height={16} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}