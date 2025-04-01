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
  deviceAge: { min: number; max: number } | null;
  tdp: { min: number; max: number } | null;
  cores: { min: number; max: number } | null;
  memorySpeed: { min: number; max: number } | null;
  memoryCapacity: { min: number; max: number } | null;
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
  const getFilterCount = (category: keyof FilterOptions | string, value: string) => {
    return devices.filter(device => {
      // Skip this filter if checking its own category
      const skipCategory = category;
      
      // Apply all other selected filters
      const matchesOtherFilters = Object.entries(selectedFilters).every(([filterCat, selected]) => {
        if (filterCat === skipCategory) return true;
        if (filterCat === 'tdp' || filterCat === 'cores' || filterCat === 'memorySpeed' || 
            filterCat === 'memoryCapacity' || filterCat === 'deviceAge') {
          const range = selected as { min: number; max: number } | null;
          if (!range) return true;
          
          if (filterCat === 'tdp') {
            return device.cpu.tdp >= range.min && device.cpu.tdp <= range.max;
          } else if (filterCat === 'cores') {
            return device.cpu.cores >= range.min && device.cpu.cores <= range.max;
          } else if (filterCat === 'memorySpeed') {
            return device.memory.speed >= range.min && device.memory.speed <= range.max;
          } else if (filterCat === 'memoryCapacity') {
            return device.memory.max_capacity >= range.min && device.memory.max_capacity <= range.max;
          } else if (filterCat === 'deviceAge') {
            const currentYear = new Date().getFullYear();
            const deviceYear = parseInt(device.release_date, 10);
            if (isNaN(deviceYear)) return false;
            
            const age = currentYear - deviceYear;
            return age >= range.min && age <= range.max;
          }
        }
        
        const selectedSet = selected as Set<string>;
        if (selectedSet.size === 0) return true;
        
        switch (filterCat) {
          case 'brands':
            return selectedSet.has(device.brand);
          case 'cpuBrands':
            return selectedSet.has(device.cpu.brand);
          case 'cpuArchitectures':
            return !device.cpu.architecture || selectedSet.has(device.cpu.architecture);
          case 'cpuChipsets':
            return !device.cpu.chipset || selectedSet.has(device.cpu.chipset);
          case 'memoryTypes':
            return selectedSet.has(device.memory.type);
          case 'memoryModuleTypes':
            return selectedSet.has(device.memory.module_type);
          case 'memorySlotsCount':
            return selectedSet.has(device.memory.slots.toString());
          case 'wifiStandards':
            return selectedSet.has(device.networking.wifi.standard);
          case 'wifiChipsets':
            return selectedSet.has(device.networking.wifi.chipset);
          case 'ethernetSpeeds':
            return device.networking.ethernet.some(eth => selectedSet.has(eth.speed));
          case 'ethernetChipsets':
            return device.networking.ethernet.some(eth => selectedSet.has(eth.chipset));
          case 'storageTypes':
            return device.storage.some(s => selectedSet.has(s.type));
          case 'storageInterfaces':
            return device.storage.some(s => selectedSet.has(s.interface));
          case 'releaseYears':
            return selectedSet.has(device.release_date);
          default:
            return true;
        }
      });

      // Check if the device matches the current filter value
      let matchesCurrentFilter = false;
      switch (category) {
        case 'brands':
        case 'cpuBrands':
        case 'memoryTypes':
        case 'wifiStandards':
        case 'ethernetSpeeds':
        case 'storageTypes':
        case 'storageInterfaces':
          // For categories already in FilterOptions, use the old logic
          return getStandardFilterMatch(device, category as keyof FilterOptions, value);
        case 'cpuArchitectures':
          matchesCurrentFilter = device.cpu.architecture === value;
          break;
        case 'cpuChipsets':
          matchesCurrentFilter = device.cpu.chipset === value;
          break;
        case 'memoryModuleTypes':
          matchesCurrentFilter = device.memory.module_type === value;
          break;
        case 'memorySlotsCount':
          matchesCurrentFilter = device.memory.slots.toString() === value;
          break;
        case 'wifiChipsets':
          matchesCurrentFilter = device.networking.wifi.chipset === value;
          break;
        case 'ethernetChipsets':
          matchesCurrentFilter = device.networking.ethernet.some(eth => eth.chipset === value);
          break;
        case 'releaseYears':
          matchesCurrentFilter = device.release_date === value;
          break;
        default:
          matchesCurrentFilter = false;
      }

      return matchesOtherFilters && matchesCurrentFilter;
    }).length;
  };

  // Helper function to get standard filter matches
  const getStandardFilterMatch = (device: MiniPC, category: keyof FilterOptions, value: string): boolean => {
    switch (category) {
      case 'brands':
        return device.brand === value;
      case 'cpuBrands':
        return device.cpu.brand === value;
      case 'memoryTypes':
        return device.memory.type === value;
      case 'wifiStandards':
        return device.networking.wifi.standard === value;
      case 'ethernetSpeeds':
        return device.networking.ethernet.some(eth => eth.speed === value);
      case 'storageTypes':
        return device.storage.some(s => s.type === value);
      case 'storageInterfaces':
        return device.storage.some(s => s.interface === value);
      default:
        return false;
    }
  };

  // Extract all available CPU architectures from devices
  const cpuArchitectures = new Set<string>();
  devices.forEach(device => {
    if (device.cpu.architecture) cpuArchitectures.add(device.cpu.architecture);
  });

  // Extract all available CPU chipsets from devices
  const cpuChipsets = new Set<string>();
  devices.forEach(device => {
    if (device.cpu.chipset) cpuChipsets.add(device.cpu.chipset);
  });

  // Extract all available memory slot counts from devices
  const memorySlotsCount = new Set<string>();
  devices.forEach(device => {
    memorySlotsCount.add(device.memory.slots.toString());
  });

  // Extract all available WiFi chipsets from devices
  const wifiChipsets = new Set<string>();
  devices.forEach(device => {
    wifiChipsets.add(device.networking.wifi.chipset);
  });

  // Extract all available Ethernet chipsets from devices
  const ethernetChipsets = new Set<string>();
  devices.forEach(device => {
    device.networking.ethernet.forEach(eth => {
      ethernetChipsets.add(eth.chipset);
    });
  });

  // Extract all available release years from devices
  const releaseYears = new Set<string>();
  devices.forEach(device => {
    if (device.release_date) releaseYears.add(device.release_date);
  });

  // Calculate the memory capacity range
  const memoryCapacityRange = {
    min: 0,
    max: Math.max(...devices.map(d => d.memory.max_capacity), 64) // Default to 64 if no devices
  };

  // Calculate the age range
  const currentYear = new Date().getFullYear();
  const oldestDeviceYear = Math.min(...Array.from(releaseYears)
    .map(year => parseInt(year, 10))
    .filter(year => !isNaN(year)));
  
  const ageRange = {
    min: 0,
    max: currentYear - oldestDeviceYear
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        overflow: 'auto',
        borderRadius: 0,
      }}
    >
      <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
        Filters
      </Typography>
      <Divider />

      <FilterGroup
        title="Brands"
        options={new Set(filterOptions.brands)}
        selected={selectedFilters.brands}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('brands', value, checked)}
        getCount={(option) => getFilterCount('brands', option)}
      />

      <FilterGroup
        title="Release Year"
        options={releaseYears}
        selected={selectedFilters.releaseYears}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('releaseYears', value, checked)}
        getCount={(option) => getFilterCount('releaseYears', option)}
      />

      {ageRange.max > 0 && (
        <RangeFilter
          title="Device Age (Years)"
          range={ageRange}
          value={selectedFilters.deviceAge}
          onChange={(value) => onFilterChange('deviceAge', value)}
          step={1}
          unit=" yr"
        />
      )}

      <FilterGroup
        title="CPU Brands"
        options={new Set(filterOptions.cpuBrands)}
        selected={selectedFilters.cpuBrands}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('cpuBrands', value, checked)}
        getCount={(option) => getFilterCount('cpuBrands', option)}
      />

      {cpuArchitectures.size > 0 && (
        <FilterGroup
          title="CPU Architecture"
          options={cpuArchitectures}
          selected={selectedFilters.cpuArchitectures}
          devices={devices}
          onSelect={(value, checked) => onFilterChange('cpuArchitectures', value, checked)}
          getCount={(option) => getFilterCount('cpuArchitectures', option)}
        />
      )}

      {cpuChipsets.size > 0 && (
        <FilterGroup
          title="CPU Chipset"
          options={cpuChipsets}
          selected={selectedFilters.cpuChipsets}
          devices={devices}
          onSelect={(value, checked) => onFilterChange('cpuChipsets', value, checked)}
          getCount={(option) => getFilterCount('cpuChipsets', option)}
        />
      )}

      <RangeFilter
        title="CPU Cores"
        range={filterOptions.coreRange}
        value={selectedFilters.cores}
        onChange={(value) => onFilterChange('cores', value)}
      />

      <RangeFilter
        title="TDP (Watts)"
        range={filterOptions.tdpRange}
        value={selectedFilters.tdp}
        onChange={(value) => onFilterChange('tdp', value)}
        unit="W"
      />

      <FilterGroup
        title="Memory Type"
        options={new Set(filterOptions.memoryTypes)}
        selected={selectedFilters.memoryTypes}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('memoryTypes', value, checked)}
        getCount={(option) => getFilterCount('memoryTypes', option)}
      />

      <FilterGroup
        title="Memory Module Type"
        options={new Set(filterOptions.memoryModuleTypes)}
        selected={selectedFilters.memoryModuleTypes}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('memoryModuleTypes', value, checked)}
        getCount={(option) => getFilterCount('memoryModuleTypes', option)}
      />

      <FilterGroup
        title="Memory Slots"
        options={memorySlotsCount}
        selected={selectedFilters.memorySlotsCount}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('memorySlotsCount', value, checked)}
        getCount={(option) => getFilterCount('memorySlotsCount', option)}
      />

      <RangeFilter
        title="Memory Speed (MHz)"
        range={filterOptions.memorySpeedRange}
        value={selectedFilters.memorySpeed}
        onChange={(value) => onFilterChange('memorySpeed', value)}
        step={100}
        unit="MHz"
      />

      <RangeFilter
        title="Max Memory Capacity (GB)"
        range={memoryCapacityRange}
        value={selectedFilters.memoryCapacity}
        onChange={(value) => onFilterChange('memoryCapacity', value)}
        step={8}
        unit="GB"
      />

      <FilterGroup
        title="WiFi Standard"
        options={new Set(filterOptions.wifiStandards)}
        selected={selectedFilters.wifiStandards}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('wifiStandards', value, checked)}
        getCount={(option) => getFilterCount('wifiStandards', option)}
      />

      <FilterGroup
        title="WiFi Chipset"
        options={wifiChipsets}
        selected={selectedFilters.wifiChipsets}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('wifiChipsets', value, checked)}
        getCount={(option) => getFilterCount('wifiChipsets', option)}
      />

      <FilterGroup
        title="Ethernet Speed"
        options={new Set(filterOptions.ethernetSpeeds)}
        selected={selectedFilters.ethernetSpeeds}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('ethernetSpeeds', value, checked)}
        getCount={(option) => getFilterCount('ethernetSpeeds', option)}
      />

      <FilterGroup
        title="Ethernet Chipset"
        options={ethernetChipsets}
        selected={selectedFilters.ethernetChipsets}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('ethernetChipsets', value, checked)}
        getCount={(option) => getFilterCount('ethernetChipsets', option)}
      />

      <FilterGroup
        title="Storage Type"
        options={new Set(filterOptions.storageTypes)}
        selected={selectedFilters.storageTypes}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('storageTypes', value, checked)}
        getCount={(option) => getFilterCount('storageTypes', option)}
      />

      <FilterGroup
        title="Storage Interface"
        options={new Set(filterOptions.storageInterfaces)}
        selected={selectedFilters.storageInterfaces}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('storageInterfaces', value, checked)}
        getCount={(option) => getFilterCount('storageInterfaces', option)}
      />
    </Paper>
  );
}; 