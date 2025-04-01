import {
  Paper,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FilterOptions } from '../utils/dataLoader';
import type { MiniPC } from '../types/minipc';

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

interface FilterPanelProps {
  filterOptions: FilterOptions;
  devices: MiniPC[];
  selectedFilters: FilterState;
  onFilterChange: (category: keyof FilterState, value: string | { min: number; max: number } | null, checked?: boolean) => void;
}

interface FilterGroupProps {
  title: string;
  options: Set<string>;
  selected: Set<string>;
  devices: MiniPC[];
  onSelect: (value: string, checked: boolean) => void;
  getCount: (option: string) => number;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  options,
  selected,
  devices,
  onSelect,
  getCount,
}) => (
  <Accordion defaultExpanded>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <FormGroup>
        {Array.from(options).sort().map((option) => {
          const count = getCount(option);
          return (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  checked={selected.has(option)}
                  onChange={(e) => onSelect(option, e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">{option}</Typography>}
            />
          );
        })}
      </FormGroup>
    </AccordionDetails>
  </Accordion>
);

const RangeFilter: React.FC<{
  title: string;
  range: { min: number; max: number };
  value: { min: number; max: number } | null;
  onChange: (value: { min: number; max: number } | null) => void;
  step?: number;
  unit?: string;
}> = ({ title, range, value, onChange, step = 1, unit = '' }) => (
  <Accordion defaultExpanded>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Box sx={{ px: 2 }}>
        <Slider
          value={[
            value?.min ?? range.min,
            value?.max ?? range.max,
          ]}
          onChange={(_, newValue) => {
            const [min, max] = newValue as number[];
            onChange({ min, max });
          }}
          valueLabelDisplay="auto"
          min={range.min}
          max={range.max}
          step={step}
          valueLabelFormat={(val) => `${val}${unit}`}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {range.min}{unit}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {range.max}{unit}
          </Typography>
        </Box>
      </Box>
    </AccordionDetails>
  </Accordion>
);

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filterOptions,
  devices,
  selectedFilters,
  onFilterChange,
}) => {
  // Helper function to count matching devices for a filter option
  const getFilterCount = (category: keyof FilterOptions, value: string) => {
    return devices.filter(device => {
      // Skip this filter if checking its own category
      const skipCategory = category;
      
      // Apply all other selected filters
      const matchesOtherFilters = Object.entries(selectedFilters).every(([filterCat, selected]) => {
        if (filterCat === skipCategory) return true;
        if (filterCat === 'tdp' || filterCat === 'cores' || filterCat === 'memorySpeed') {
          const range = selected as { min: number; max: number } | null;
          if (!range) return true;
          
          if (filterCat === 'tdp') {
            return device.cpu.tdp >= range.min && device.cpu.tdp <= range.max;
          } else if (filterCat === 'cores') {
            return device.cpu.cores >= range.min && device.cpu.cores <= range.max;
          } else {
            return device.memory.speed >= range.min && device.memory.speed <= range.max;
          }
        }
        
        const selectedSet = selected as Set<string>;
        if (selectedSet.size === 0) return true;
        
        switch (filterCat) {
          case 'brands':
            return selectedSet.has(device.brand);
          case 'cpuBrands':
            return selectedSet.has(device.cpu.brand);
          case 'memoryTypes':
            return selectedSet.has(device.memory.type);
          case 'wifiStandards':
            return selectedSet.has(device.networking.wifi.standard);
          case 'ethernetSpeeds':
            return device.networking.ethernet.some(eth => selectedSet.has(eth.speed));
          case 'storageTypes':
            return device.storage.some(s => selectedSet.has(s.type));
          case 'storageInterfaces':
            return device.storage.some(s => selectedSet.has(s.interface));
          default:
            return true;
        }
      });

      // Check if the device matches the current filter value
      let matchesCurrentFilter = false;
      switch (category) {
        case 'brands':
          matchesCurrentFilter = device.brand === value;
          break;
        case 'cpuBrands':
          matchesCurrentFilter = device.cpu.brand === value;
          break;
        case 'memoryTypes':
          matchesCurrentFilter = device.memory.type === value;
          break;
        case 'wifiStandards':
          matchesCurrentFilter = device.networking.wifi.standard === value;
          break;
        case 'ethernetSpeeds':
          matchesCurrentFilter = device.networking.ethernet.some(eth => eth.speed === value);
          break;
        case 'storageTypes':
          matchesCurrentFilter = device.storage.some(s => s.type === value);
          break;
        case 'storageInterfaces':
          matchesCurrentFilter = device.storage.some(s => s.interface === value);
          break;
      }

      return matchesOtherFilters && matchesCurrentFilter;
    }).length;
  };

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Filters
      </Typography>

      {FilterGroup({
        title: 'Brand',
        options: filterOptions.brands,
        selected: selectedFilters.brands,
        devices,
        onSelect: (value, checked) => onFilterChange('brands', value, checked),
        getCount: (option) => getFilterCount('brands', option)
      })}

      {FilterGroup({
        title: 'CPU Brand',
        options: filterOptions.cpuBrands,
        selected: selectedFilters.cpuBrands,
        devices,
        onSelect: (value, checked) => onFilterChange('cpuBrands', value, checked),
        getCount: (option) => getFilterCount('cpuBrands', option)
      })}

      <Divider sx={{ my: 2 }} />
      
      {RangeFilter({
        title: 'TDP',
        range: filterOptions.tdpRange,
        value: selectedFilters.tdp,
        onChange: (value) => onFilterChange('tdp', value),
        unit: 'W'
      })}
      {RangeFilter({
        title: 'CPU Cores',
        range: filterOptions.coreRange,
        value: selectedFilters.cores,
        onChange: (value) => onFilterChange('cores', value)
      })}
      
      <Divider sx={{ my: 2 }} />
      
      {FilterGroup({
        title: 'Memory Type',
        options: filterOptions.memoryTypes,
        selected: selectedFilters.memoryTypes,
        devices,
        onSelect: (value, checked) => onFilterChange('memoryTypes', value, checked),
        getCount: (option) => getFilterCount('memoryTypes', option)
      })}
      {RangeFilter({
        title: 'Memory Speed',
        range: filterOptions.memorySpeedRange,
        value: selectedFilters.memorySpeed,
        onChange: (value) => onFilterChange('memorySpeed', value),
        step: 100,
        unit: 'MHz'
      })}
      
      <Divider sx={{ my: 2 }} />
      
      {FilterGroup({
        title: 'WiFi Standard',
        options: filterOptions.wifiStandards,
        selected: selectedFilters.wifiStandards,
        devices,
        onSelect: (value, checked) => onFilterChange('wifiStandards', value, checked),
        getCount: (option) => getFilterCount('wifiStandards', option)
      })}
      {FilterGroup({
        title: 'Ethernet Speed',
        options: filterOptions.ethernetSpeeds,
        selected: selectedFilters.ethernetSpeeds,
        devices,
        onSelect: (value, checked) => onFilterChange('ethernetSpeeds', value, checked),
        getCount: (option) => getFilterCount('ethernetSpeeds', option)
      })}
      
      <Divider sx={{ my: 2 }} />
      
      {FilterGroup({
        title: 'Storage Type',
        options: filterOptions.storageTypes,
        selected: selectedFilters.storageTypes,
        devices,
        onSelect: (value, checked) => onFilterChange('storageTypes', value, checked),
        getCount: (option) => getFilterCount('storageTypes', option)
      })}
      {FilterGroup({
        title: 'Storage Interface',
        options: filterOptions.storageInterfaces,
        selected: selectedFilters.storageInterfaces,
        devices,
        onSelect: (value, checked) => onFilterChange('storageInterfaces', value, checked),
        getCount: (option) => getFilterCount('storageInterfaces', option)
      })}
    </Paper>
  );
}; 