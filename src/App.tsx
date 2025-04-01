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
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { loadMiniPCData } from './utils/dataLoader';
import type { MiniPC } from './types/minipc';
import type { FilterOptions } from './utils/dataLoader';
import { FilterPanel } from './components/FilterPanel';
import { MiniPCTable } from './components/MiniPCTable';

type FilterState = {
  brands: Set<string>;
  cpuBrands: Set<string>;
  memoryTypes: Set<string>;
  wifiStandards: Set<string>;
  ethernetSpeeds: Set<string>;
  storageTypes: Set<string>;
  storageInterfaces: Set<string>;
  tdp: { min: number; max: number } | null;
  cores: { min: number; max: number } | null;
  memorySpeed: { min: number; max: number } | null;
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [devices, setDevices] = useState<MiniPC[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    brands: new Set<string>(),
    cpuBrands: new Set<string>(),
    memoryTypes: new Set<string>(),
    wifiStandards: new Set<string>(),
    ethernetSpeeds: new Set<string>(),
    storageTypes: new Set<string>(),
    storageInterfaces: new Set<string>(),
    tdp: null,
    cores: null,
    memorySpeed: null,
  });

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
      
      if (category === 'tdp' || category === 'cores' || category === 'memorySpeed') {
        newFilters[category] = value as { min: number; max: number } | null;
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
    if (selectedFilters.memoryTypes.size > 0 && !selectedFilters.memoryTypes.has(device.memory.type)) {
      return false;
    }
    if (selectedFilters.wifiStandards.size > 0 && !selectedFilters.wifiStandards.has(device.networking.wifi.standard)) {
      return false;
    }
    if (selectedFilters.ethernetSpeeds.size > 0 && !device.networking.ethernet.some(eth => selectedFilters.ethernetSpeeds.has(eth.speed))) {
      return false;
    }
    if (selectedFilters.storageTypes.size > 0 && !device.storage.some(s => selectedFilters.storageTypes.has(s.type))) {
      return false;
    }
    if (selectedFilters.storageInterfaces.size > 0 && !device.storage.some(s => selectedFilters.storageInterfaces.has(s.interface))) {
      return false;
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

    return true;
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="sticky" elevation={0} sx={{ 
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
            : 'linear-gradient(45deg, #42a5f5 30%, #1976d2 90%)'
        }}>
          <Toolbar>
            <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Awesome Mini PCs
            </Typography>
            <IconButton 
              color="inherit" 
              onClick={() => setDarkMode(!darkMode)}
              sx={{ ml: 1 }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '50vh' 
            }}>
              <Typography variant="h6">Loading...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ width: 280, flexShrink: 0 }}>
                {filterOptions && (
                  <FilterPanel
                    filterOptions={filterOptions}
                    devices={devices}
                    selectedFilters={selectedFilters}
                    onFilterChange={handleFilterChange}
                  />
                )}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <MiniPCTable devices={filteredDevices} />
              </Box>
            </Box>
          )}
        </Container>

        <Box component="footer" sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)'
        }}>
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              Data is community-maintained. Want to add a Mini PC? Check out our GitHub repository.
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App; 