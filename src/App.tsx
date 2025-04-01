import { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
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
import FilterListIcon from '@mui/icons-material/FilterList';
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
        main: '#2196f3',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '8px 16px',
          },
          head: {
            fontWeight: 600,
            whiteSpace: 'nowrap',
          },
        },
      },
    },
  });

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    brands: new Set<string>(),
    cpuBrands: new Set<string>(),
    cpuArchitectures: new Set<string>(),
    cpuChipsets: new Set<string>(),
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
  });

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
          category === 'memoryCapacity' || category === 'deviceAge') {
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

    return true;
  });

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const filterDrawer = (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={isMobile ? drawerOpen : drawerOpen}
      onClose={handleDrawerToggle}
      sx={{
        width: drawerOpen ? 280 : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
          height: 'calc(100% - 64px)',
          top: 64,
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <Typography variant="h6" sx={{ pl: 1 }}>Filters</Typography>
        <IconButton onClick={handleDrawerToggle}>
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
      <Box sx={{ 
        display: 'flex',
        overflow: 'hidden',
        width: '100%',
        height: '100vh',
      }}>
        <AppBar position="fixed" elevation={0} sx={{ 
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
            : 'linear-gradient(45deg, #42a5f5 30%, #1976d2 90%)',
          zIndex: theme.zIndex.drawer + 1,
        }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="toggle filters"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <FilterListIcon />
            </IconButton>
            <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Awesome Mini PCs
            </Typography>
            <Tooltip title="View on GitHub">
              <IconButton 
                color="inherit" 
                component={Link}
                href="https://github.com/monstermuffin/awesome-mini-pc"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mr: 1 }}
              >
                <GitHubIcon />
              </IconButton>
            </Tooltip>
            <IconButton 
              color="inherit" 
              onClick={() => setDarkMode(!darkMode)}
              sx={{ ml: 1 }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
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
          overflowX: 'hidden',
        }}>
          <Toolbar />
          <Box sx={{ 
            p: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - 64px)',
          }}>
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                flex: 1
              }}>
                <Typography variant="h6">Loading...</Typography>
              </Box>
            ) : (
              <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                width: '100%',
              }}>
                <MiniPCTable devices={filteredDevices} />
              </Box>
            )}

            <Box component="footer" sx={{ 
              py: 3, 
              px: 2,
              mt: 3,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)'
            }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Bigups the mini pc massive
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App; 