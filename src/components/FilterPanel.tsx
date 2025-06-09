import {
  Paper,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Divider,
} from '@mui/material';
import React from 'react';
import { FilterOptions } from '../utils/dataLoader';
import type { MiniPC } from '../types/minipc';

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
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  options,
  selected,
  onSelect,
}) => {
  return (
    <Box sx={{ 
      mb: 2, 
      px: 2, 
      pt: 1,
      pb: 1
    }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          mb: 1, 
          fontWeight: 500,
          color: 'text.secondary'
        }}
        component="h3"
        id={`filter-group-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {title}
      </Typography>
      <FormGroup
        aria-labelledby={`filter-group-${title.replace(/\s+/g, '-').toLowerCase()}`}
        role="group"
      >
        {Array.from(options).sort().map((option) => {
          return (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  checked={selected.has(option)}
                  onChange={(e) => onSelect(option, e.target.checked)}
                  size="small"
                  sx={{
                    '&:hover': {
                      backgroundColor: (theme: any) => theme.palette.action.hover,
                    }
                  }}
                />
              }
              label={<Typography variant="body2">{option}</Typography>}
              sx={{
                '&:hover': {
                  backgroundColor: (theme: any) => theme.palette.action.hover,
                  borderRadius: 1,
                },
                transition: 'background-color 0.2s ease',
                margin: 0,
                padding: '2px 4px',
              }}
            />
          );
        })}
      </FormGroup>
    </Box>
  );
};

const RangeFilter: React.FC<{
  title: string;
  range: { min: number; max: number };
  value: { min: number; max: number } | null;
  onChange: (value: { min: number; max: number } | null) => void;
  step?: number;
  unit?: string;
}> = ({ title, range, value, onChange, step = 1, unit = '' }) => {
  const sliderId = `range-filter-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <Box sx={{ 
      mb: 2, 
      px: 2, 
      pt: 1,
      pb: 1
    }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          mb: 1, 
          fontWeight: 500,
          color: 'text.secondary'
        }}
        component="h3"
        id={`${sliderId}-label`}
      >
        {title}
      </Typography>
      <Box sx={{ px: 1 }}>
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
          valueLabelFormat={(val) => {
            if (val === range.min && value?.min === range.min) {
              return 'Any';
            }
            return `${val}${unit}`;
          }}
          aria-labelledby={`${sliderId}-label`}
          aria-label={`${title} range`}
          sx={{
            color: (theme: any) => theme.palette.primary.main,
            '& .MuiSlider-thumb': {
              '&:hover, &.Mui-focusVisible': {
                boxShadow: (theme: any) => `0px 0px 0px 8px ${theme.palette.primary.main}1F`,
              },
            },
            '& .MuiSlider-track': {
              border: 'none',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Any
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {range.max}{unit}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filterOptions,
  devices,
  selectedFilters,
  onFilterChange,
}) => {
  const cpuArchitectures = React.useMemo(() => {
    const architectures = new Set<string>();
    devices.forEach(device => {
      if (device.cpu.architecture) architectures.add(device.cpu.architecture);
    });
    return architectures;
  }, [devices]);

  const cpuChipsets = React.useMemo(() => {
    const chipsets = new Set<string>();
    devices.forEach(device => {
      if (device.cpu.chipset) chipsets.add(device.cpu.chipset);
    });
    return chipsets;
  }, [devices]);

  const memorySlotsCount = React.useMemo(() => {
    const slotsCount = new Set<string>();
    devices.forEach(device => {
      slotsCount.add(device.memory.slots.toString());
    });
    return slotsCount;
  }, [devices]);

  const wifiChipsets = React.useMemo(() => {
    const chipsets = new Set<string>();
    devices.forEach(device => {
      if (device.networking?.wifi?.chipset) {
        chipsets.add(device.networking.wifi.chipset);
      }
    });
    return chipsets;
  }, [devices]);

  const ethernetChipsets = React.useMemo(() => {
    const chipsets = new Set<string>();
    devices.forEach(device => {
      if (device.networking?.ethernet) {
        device.networking.ethernet.forEach(eth => {
          if (eth.chipset) {
            chipsets.add(eth.chipset);
          }
        });
      }
    });
    return chipsets;
  }, [devices]);

  const releaseYears = React.useMemo(() => {
    const years = new Set<string>();
    devices.forEach(device => {
      if (device.release_date) years.add(device.release_date);
    });
    return years;
  }, [devices]);

  const memoryCapacityRange = React.useMemo(() => ({
    min: 0,
    max: Math.max(...devices.map(d => d.memory.max_capacity), 64)
  }), [devices]);

  const ageRange = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const oldestDeviceYear = Math.min(...Array.from(releaseYears)
      .map(year => parseInt(year, 10))
      .filter(year => !isNaN(year)));
    
    return {
      min: 0,
      max: currentYear - oldestDeviceYear
    };
  }, [releaseYears]);

  const pcieSlotTypes = React.useMemo(() => {
    const slotTypes = new Set<string>();
    devices.forEach(device => {
      if (device.expansion?.pcie_slots) {
        device.expansion.pcie_slots.forEach(slot => {
          if (slot.type) slotTypes.add(slot.type);
        });
      }
    });
    return slotTypes;
  }, [devices]);

  const cpuSockets = React.useMemo(() => {
    const sockets = new Set<string>();
    devices.forEach(device => {
      if (device.cpu.socket?.type) sockets.add(device.cpu.socket.type);
    });
    return sockets;
  }, [devices]);

  const hasExpansionDevices = React.useMemo(() => 
    devices.some(device => 
      device.expansion?.pcie_slots && device.expansion.pcie_slots.length > 0
    ), [devices]);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        overflow: 'auto',
        borderRadius: 0,
      }}
    >
      {/* General Filters */}
      <Typography variant="subtitle1" sx={{ px: 2, pt: 2, pb: 1, fontWeight: 600 }}>
        General
      </Typography>
      
      <FilterGroup
        title="Brands"
        options={new Set(filterOptions.brands)}
        selected={selectedFilters.brands}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('brands', value, checked)}
      />

      <RangeFilter
        title="Volume (Liters)"
        range={filterOptions.volumeRange}
        value={selectedFilters.volume}
        onChange={(value) => onFilterChange('volume', value)}
        step={0.1}
        unit="L"
      />

      <FilterGroup
        title="Release Year"
        options={releaseYears}
        selected={selectedFilters.releaseYears}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('releaseYears', value, checked)}
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

      <Divider sx={{ mx: 2, my: 2 }} />

      {/* CPU Filters */}
      <Typography variant="subtitle1" sx={{ px: 2, pt: 1, pb: 1, fontWeight: 600 }}>
        CPU
      </Typography>

      {cpuSockets.size > 0 && (
        <FilterGroup
          title="CPU Socket (Socketable CPUs)"
          options={cpuSockets}
          selected={selectedFilters.cpuSockets}
          devices={devices}
          onSelect={(value, checked) => onFilterChange('cpuSockets', value, checked)}
        />
      )}

      <FilterGroup
        title="CPU Brands"
        options={new Set(filterOptions.cpuBrands)}
        selected={selectedFilters.cpuBrands}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('cpuBrands', value, checked)}
      />

      {cpuArchitectures.size > 0 && (
        <FilterGroup
          title="CPU Architecture"
          options={cpuArchitectures}
          selected={selectedFilters.cpuArchitectures}
          devices={devices}
          onSelect={(value, checked) => onFilterChange('cpuArchitectures', value, checked)}
        />
      )}

      {cpuChipsets.size > 0 && (
        <FilterGroup
          title="CPU Chipset"
          options={cpuChipsets}
          selected={selectedFilters.cpuChipsets}
          devices={devices}
          onSelect={(value, checked) => onFilterChange('cpuChipsets', value, checked)}
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

      <Divider sx={{ mx: 2, my: 2 }} />

      {/* Memory Filters */}
      <Typography variant="subtitle1" sx={{ px: 2, pt: 1, pb: 1, fontWeight: 600 }}>
        Memory
      </Typography>

      <FilterGroup
        title="Memory Type"
        options={new Set(filterOptions.memoryTypes)}
        selected={selectedFilters.memoryTypes}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('memoryTypes', value, checked)}
      />

      <FilterGroup
        title="Memory Module Type"
        options={new Set(filterOptions.memoryModuleTypes)}
        selected={selectedFilters.memoryModuleTypes}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('memoryModuleTypes', value, checked)}
      />

      <FilterGroup
        title="Memory Slots"
        options={memorySlotsCount}
        selected={selectedFilters.memorySlotsCount}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('memorySlotsCount', value, checked)}
      />

      <RangeFilter
        title="Memory Speed (MT/s)"
        range={filterOptions.memorySpeedRange}
        value={selectedFilters.memorySpeed}
        onChange={(value) => onFilterChange('memorySpeed', value)}
        step={100}
        unit="MT/s"
      />

      <RangeFilter
        title="Max Memory Capacity (GB)"
        range={memoryCapacityRange}
        value={selectedFilters.memoryCapacity}
        onChange={(value) => onFilterChange('memoryCapacity', value)}
        step={8}
        unit="GB"
      />

      <Divider sx={{ mx: 2, my: 2 }} />

      {/* Networking Filters */}
      <Typography variant="subtitle1" sx={{ px: 2, pt: 1, pb: 1, fontWeight: 600 }}>
        Networking
      </Typography>

      <FilterGroup
        title="WiFi Standard"
        options={new Set(filterOptions.wifiStandards)}
        selected={selectedFilters.wifiStandards}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('wifiStandards', value, checked)}
      />

      <FilterGroup
        title="WiFi Chipset"
        options={wifiChipsets}
        selected={selectedFilters.wifiChipsets}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('wifiChipsets', value, checked)}
      />

      <FilterGroup
        title="Ethernet Speed"
        options={new Set(filterOptions.ethernetSpeeds)}
        selected={selectedFilters.ethernetSpeeds}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('ethernetSpeeds', value, checked)}
      />

      <FilterGroup
        title="Ethernet Chipset"
        options={ethernetChipsets}
        selected={selectedFilters.ethernetChipsets}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('ethernetChipsets', value, checked)}
      />

      {/* PCIe Expansion Filters - only show if any device has expansion slots */}
      {hasExpansionDevices && (
        <>
          <Divider sx={{ mx: 2, my: 2 }} />
          <Typography variant="subtitle1" sx={{ px: 2, pt: 1, pb: 1, fontWeight: 600 }}>
            Expansion
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFilters.hasExpansionSlots}
                onChange={(e) => onFilterChange('hasExpansionSlots', null, e.target.checked)}
                size="small"
              />
            }
            label={<Typography variant="body2">Has PCIe expansion slots</Typography>}
            sx={{ px: 2, py: 1 }}
          />
          
          {pcieSlotTypes.size > 0 && (
            <FilterGroup
              title="PCIe Slot Types"
              options={pcieSlotTypes}
              selected={selectedFilters.pcieSlotTypes}
              devices={devices}
              onSelect={(value, checked) => onFilterChange('pcieSlotTypes', value, checked)}
            />
          )}
        </>
      )}

      <Divider sx={{ mx: 2, my: 2 }} />

      {/* Storage-related filters */}
      <Typography variant="subtitle1" sx={{ px: 2, pt: 1, pb: 1, fontWeight: 600 }}>
        Storage
      </Typography>
      
      <FilterGroup
        title="Storage Type"
        options={new Set(filterOptions.storageTypes)}
        selected={selectedFilters.storageTypes}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('storageTypes', value, checked)}
      />

      <FilterGroup
        title="Storage Interface"
        options={new Set(filterOptions.storageInterfaces)}
        selected={selectedFilters.storageInterfaces}
        devices={devices}
        onSelect={(value, checked) => onFilterChange('storageInterfaces', value, checked)}
      />
    </Paper>
  );
}; 