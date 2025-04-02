import { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
  Drawer,
  Link,
  Tooltip,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GitHubIcon from '@mui/icons-material/GitHub';
import { loadMiniPCData } from './utils/dataLoader';
import type { MiniPC } from './types/minipc';
import type { FilterOptions } from './utils/dataLoader';
import { FilterPanel } from './components/FilterPanel';
import { MiniPCTable } from './components/MiniPCTable';

type FilterState = {
  brands: Set<string>;
  cpuBrands: Set<string>;
  cpuArchitectures: Set<string>;
  cpuChipsets: Set<string>;
  cpuSockets: Set<string>;
  memoryTypes: Set<string>;
  memoryModuleTypes: Set<string>;
  memorySlotsCount: Set<string>;
  wifiStandards: Set<string>;
  wifiChipsets: Set<string>;
  ethernetSpeeds: Set<string>;
  ethernetChipsets: Set<string>;
  storageTypes: Set<string>;
  storageInterfaces: Set<string>;
  releaseYears: Set<string>;
  pcieSlotTypes: Set<string>;
  hasExpansionSlots: boolean;
  deviceAge: { min: number; max: number } | null;
  tdp: { min: number; max: number } | null;
  cores: { min: number; max: number } | null;
  memorySpeed: { min: number; max: number } | null;
  memoryCapacity: { min: number; max: number } | null;
  volume: { min: number; max: number } | null;
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [devices, setDevices] = useState<MiniPC[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Create theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#424242',
        light: '#616161',
        dark: '#212121',
      },
      background: {
        default: darkMode ? '#1a1f2b' : '#f0f2f5',
        paper: darkMode ? '#242935' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#e3e8ef' : '#1a1f2b',
        secondary: darkMode ? '#b0b7c5' : '#4b5563',
      },
    },
    shape: {
      borderRadius: 0,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: darkMode 
              ? '#1e1e1e'
              : '#ffffff',
            borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: darkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 0,
            '&.MuiButton-contained': {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: darkMode ? '#e3e8ef' : '#4b5563',
            '&:hover': {
              backgroundColor: darkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.08)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundImage: 'none',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'}`,
            boxShadow: darkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'}`,
          },
          head: {
            fontWeight: 600,
            color: darkMode ? '#e3e8ef' : '#1a1f2b',
            backgroundColor: darkMode ? '#242935' : '#f8fafc',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: darkMode 
                ? 'rgba(255, 255, 255, 0.03)' 
                : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: {
        fontSize: '1.75rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      body1: {
        fontSize: '0.875rem',
        letterSpacing: '0.01em',
      },
      body2: {
        fontSize: '0.8125rem',
        letterSpacing: '0.01em',
      },
    },
  });

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const initialFilterState: FilterState = {
    brands: new Set<string>(),
    cpuBrands: new Set<string>(),
    cpuArchitectures: new Set<string>(),
    cpuChipsets: new Set<string>(),
    cpuSockets: new Set<string>(),
    memoryTypes: new Set<string>(),
    memoryModuleTypes: new Set<string>(),
    memorySlotsCount: new Set<string>(),
    wifiStandards: new Set<string>(),
    wifiChipsets: new Set<string>(),
    ethernetSpeeds: new Set<string>(),
    ethernetChipsets: new Set<string>(),
    storageTypes: new Set<string>(),
    storageInterfaces: new Set<string>(),
    releaseYears: new Set<string>(),
    pcieSlotTypes: new Set<string>(),
    hasExpansionSlots: false,
    deviceAge: null,
    tdp: null,
    cores: null,
    memorySpeed: null,
    memoryCapacity: null,
    volume: null,
  };

  const [selectedFilters, setSelectedFilters] = useState<FilterState>(initialFilterState);

  // Load data on mount
  useEffect(() => {
    loadMiniPCData().then(({ devices, filterOptions }) => {
      setDevices(devices);
      setFilterOptions(filterOptions);
      setLoading(false);
    });
  }, []);

  // Initialize dark mode based on system preference
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  // Handle filter changes
  const handleFilterChange = (
    category: keyof FilterState,
    value: string | { min: number; max: number } | null,
    checked?: boolean
  ) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (category === 'tdp' || category === 'cores' || category === 'memorySpeed' || 
          category === 'memoryCapacity' || category === 'deviceAge' || category === 'volume') {
        newFilters[category] = value as { min: number; max: number } | null;
      } else if (category === 'hasExpansionSlots') {
        newFilters[category] = checked as boolean;
      } else {
        const filterSet = new Set(prev[category] as Set<string>);
        if (checked) {
          filterSet.add(value as string);
        } else {
          filterSet.delete(value as string);
        }
        newFilters[category] = filterSet;
      }
      
      return newFilters;
    });
  };

  // Filter devices based on selected filters
  const filteredDevices = devices.filter(device => {
    // Skip filtering if filterOptions is not loaded yet
    if (!filterOptions) return true;

    if (selectedFilters.brands.size > 0 && !selectedFilters.brands.has(device.brand)) {
      return false;
    }
    if (selectedFilters.cpuBrands.size > 0 && !selectedFilters.cpuBrands.has(device.cpu.brand)) {
      return false;
    }
    if (selectedFilters.cpuArchitectures.size > 0 && 
        (!device.cpu.architecture || !selectedFilters.cpuArchitectures.has(device.cpu.architecture))) {
      return false;
    }
    if (selectedFilters.cpuChipsets.size > 0 && 
        (!device.cpu.chipset || !selectedFilters.cpuChipsets.has(device.cpu.chipset))) {
      return false;
    }
    if (selectedFilters.cpuSockets.size > 0 && 
        (!device.cpu.socket?.type || !selectedFilters.cpuSockets.has(device.cpu.socket.type))) {
      return false;
    }
    if (selectedFilters.memoryTypes.size > 0 && !selectedFilters.memoryTypes.has(device.memory.type)) {
      return false;
    }
    if (selectedFilters.memoryModuleTypes.size > 0 && !selectedFilters.memoryModuleTypes.has(device.memory.module_type)) {
      return false;
    }
    if (selectedFilters.memorySlotsCount.size > 0 && !selectedFilters.memorySlotsCount.has(device.memory.slots.toString())) {
      return false;
    }
    if (selectedFilters.wifiStandards.size > 0 && !selectedFilters.wifiStandards.has(device.networking.wifi.standard)) {
      return false;
    }
    if (selectedFilters.wifiChipsets.size > 0 && !selectedFilters.wifiChipsets.has(device.networking.wifi.chipset)) {
      return false;
    }
    if (selectedFilters.ethernetSpeeds.size > 0 && !device.networking.ethernet.some(eth => selectedFilters.ethernetSpeeds.has(eth.speed))) {
      return false;
    }
    if (selectedFilters.ethernetChipsets.size > 0 && !device.networking.ethernet.some(eth => selectedFilters.ethernetChipsets.has(eth.chipset))) {
      return false;
    }
    if (selectedFilters.storageTypes.size > 0 && !device.storage.some(s => selectedFilters.storageTypes.has(s.type))) {
      return false;
    }
    if (selectedFilters.storageInterfaces.size > 0 && !device.storage.some(s => selectedFilters.storageInterfaces.has(s.interface))) {
      return false;
    }
    if (selectedFilters.releaseYears.size > 0 && !selectedFilters.releaseYears.has(device.release_date)) {
      return false;
    }

    // PCIe expansion filters
    if (selectedFilters.hasExpansionSlots && 
        (!device.expansion?.pcie_slots || device.expansion.pcie_slots.length === 0)) {
      return false;
    }

    if (selectedFilters.pcieSlotTypes.size > 0) {
      // If we're filtering by PCIe slot types, device must have matching slots
      if (!device.expansion?.pcie_slots || 
          !device.expansion.pcie_slots.some(slot => 
            selectedFilters.pcieSlotTypes.has(slot.type))) {
        return false;
      }
    }

    if (selectedFilters.deviceAge) {
      const currentYear = new Date().getFullYear();
      const deviceYear = parseInt(device.release_date, 10);
      if (isNaN(deviceYear)) {
        return false;
      }
      const age = currentYear - deviceYear;
      if (age < selectedFilters.deviceAge.min || age > selectedFilters.deviceAge.max) {
        return false;
      }
    }

    if (selectedFilters.tdp) {
      if (device.cpu.tdp < selectedFilters.tdp.min || device.cpu.tdp > selectedFilters.tdp.max) {
        return false;
      }
    }
    if (selectedFilters.cores) {
      if (device.cpu.cores < selectedFilters.cores.min || device.cpu.cores > selectedFilters.cores.max) {
        return false;
      }
    }
    if (selectedFilters.memorySpeed) {
      if (device.memory.speed < selectedFilters.memorySpeed.min || device.memory.speed > selectedFilters.memorySpeed.max) {
        return false;
      }
    }
    if (selectedFilters.memoryCapacity) {
      if (device.memory.max_capacity < selectedFilters.memoryCapacity.min || 
          device.memory.max_capacity > selectedFilters.memoryCapacity.max) {
        return false;
      }
    }

    if (selectedFilters.volume) {
      if (!device.dimensions?.volume || 
          device.dimensions.volume < selectedFilters.volume.min || 
          device.dimensions.volume > selectedFilters.volume.max) {
        // Only filter if the user has changed the volume range from the default
        const volumeRange = filterOptions?.volumeRange;
        if (!volumeRange || 
            selectedFilters.volume.min !== volumeRange.min || 
            selectedFilters.volume.max !== volumeRange.max) {
          return false;
        }
      }
    }

    return true;
  });

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const filterDrawer = (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={drawerOpen}
      onClose={handleDrawerToggle}
      sx={{
        width: drawerOpen ? 280 : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
          height: '100%',
          transition: theme.transitions.create(['width', 'transform'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          boxShadow: drawerOpen ? (darkMode 
            ? '4px 0 10px rgba(0,0,0,0.15)' 
            : '4px 0 10px rgba(0,0,0,0.08)') : 'none',
          overflowX: 'hidden',
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
        backgroundColor: theme.palette.background.paper,
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 500,
          color: theme.palette.text.primary,
        }}>
          Filters
        </Typography>
        <IconButton 
          onClick={handleDrawerToggle}
          sx={{
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      {filterOptions && (
        <FilterPanel
          filterOptions={filterOptions}
          devices={devices}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
        />
      )}
    </Drawer>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar 
          position="sticky" 
          elevation={0}
        >
          <Toolbar sx={{ 
            height: 64,
            px: { xs: 2, md: 3 },
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 2,
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography 
                variant="h1" 
                component="h1"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Awesome Mini PCs
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              ml: 'auto', // Push to right
            }}>
              <Tooltip title="Toggle dark mode">
                <IconButton 
                  onClick={() => setDarkMode(!darkMode)} 
                  color="inherit"
                  sx={{
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    },
                  }}
                >
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="View on GitHub">
                <IconButton
                  component={Link}
                  href="https://github.com/monstermuffin/awesome-mini-pc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  sx={{
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    },
                  }}
                >
                  <GitHubIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
        {filterDrawer}
        
        <Box component="main" sx={{ 
          flexGrow: 1,
          p: 0,
          position: 'absolute',
          right: 0,
          width: drawerOpen && !isMobile ? 'calc(100% - 280px)' : '100%',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: theme.palette.mode === 'dark' 
            ? 'radial-gradient(circle at 50% 50%, rgba(26,35,126,0.15) 0%, rgba(13,71,161,0) 70%), ' +
              'radial-gradient(circle at 80% 20%, rgba(30,60,175,0.1) 0%, rgba(13,71,161,0) 50%)'
            : 'radial-gradient(circle at 50% 50%, rgba(66,165,245,0.08) 0%, rgba(25,118,210,0) 70%), ' +
              'radial-gradient(circle at 80% 20%, rgba(66,165,245,0.05) 0%, rgba(25,118,210,0) 50%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: theme.palette.mode === 'dark'
              ? 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232a3968\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              : 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232196f3\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: -1,
          }
        }}>
          <Toolbar />
          <Box sx={{ 
            flex: 1,
            p: { xs: 1, sm: 2 },
            overflow: 'auto',
            height: 'calc(100vh - 64px)', // Height minus toolbar
          }}>
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%'
              }}>
                <Typography variant="h6">Loading...</Typography>
              </Box>
            ) : (
              <Box sx={{ height: '100%' }}>
                <MiniPCTable devices={filteredDevices} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App; 