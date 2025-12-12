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
  Badge,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  hasEgpuSupport: boolean;
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
  columns?: number;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  options,
  selected,
  onSelect,
  columns = 1,
}) => {
  const sortedOptions = Array.from(options).sort();

  if (columns === 1) {
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
          {sortedOptions.map((option) => {
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
  }

  // Multi-column layout
  const itemsPerColumn = Math.ceil(sortedOptions.length / columns);
  const columnsData = [];
  for (let i = 0; i < columns; i++) {
    columnsData.push(sortedOptions.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
  }

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
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        width: '100%',
        '& > *': {
          flex: `1 1 ${Math.floor(100 / columns) - 1}%`,
          minWidth: '120px',
        },
        '@media (max-width: 600px)': {
          flexDirection: 'column',
          '& > *': {
            flex: '1 1 100%',
            minWidth: 'auto',
          },
        },
      }}>
        {columnsData.map((columnOptions, columnIndex) => (
          <FormGroup
            key={columnIndex}
            aria-labelledby={`filter-group-${title.replace(/\s+/g, '-').toLowerCase()}`}
            role="group"
            sx={{ m: 0 }}
          >
            {columnOptions.map((option) => {
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
                  label={<Typography variant="body2" sx={{ fontSize: '0.8rem', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{option}</Typography>}
                  sx={{
                    '&:hover': {
                      backgroundColor: (theme: any) => theme.palette.action.hover,
                      borderRadius: 1,
                    },
                    transition: 'background-color 0.2s ease',
                    margin: 0,
                    padding: '1px 2px',
                    maxWidth: '100%',
                    '& .MuiFormControlLabel-label': {
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    },
                  }}
                />
              );
            })}
          </FormGroup>
        ))}
      </Box>
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

const CollapsibleSection: React.FC<{
  title: string;
  defaultExpanded?: boolean;
  activeFilterCount?: number;
  children: React.ReactNode;
}> = ({ title, defaultExpanded = false, activeFilterCount = 0, children }) => {
  const theme = useTheme();
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      elevation={0}
      disableGutters
      sx={{
        backgroundColor: 'transparent',
        '&:before': {
          display: 'none',
        },
        '& .MuiAccordionSummary-root': {
          minHeight: 48,
          paddingX: 2,
          paddingY: 1,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
        '& .MuiAccordionSummary-content': {
          margin: 0,
        },
        '& .MuiAccordionDetails-root': {
          padding: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${title.toLowerCase().replace(/\s+/g, '-')}-content`}
        id={`${title.toLowerCase().replace(/\s+/g, '-')}-header`}
        sx={{
          '& .MuiAccordionSummary-expandIconWrapper': {
            color: hasActiveFilters ? theme.palette.primary.main : theme.palette.text.secondary,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: hasActiveFilters ? 700 : 600,
              color: hasActiveFilters ? theme.palette.primary.main : 'inherit',
            }}
          >
            {title}
          </Typography>
          {hasActiveFilters && (
            <Badge
              badgeContent={activeFilterCount}
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  minWidth: '20px',
                  height: '20px',
                  fontWeight: 600,
                },
                '& .MuiBadge-root': {
                  marginLeft: 0.5,
                },
              }}
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
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

  const hasEgpuDevices = React.useMemo(() =>
    devices.some(device => device.expansion?.egpu_support), [devices]);

  // Calculate active filter counts for each section
  const activeFilterCounts = React.useMemo(() => {
    return {
      general: selectedFilters.brands.size + selectedFilters.releaseYears.size +
               (selectedFilters.volume ? 1 : 0) + (selectedFilters.deviceAge ? 1 : 0),
      cpu: selectedFilters.cpuBrands.size + selectedFilters.cpuArchitectures.size +
           selectedFilters.cpuChipsets.size + selectedFilters.cpuSockets.size +
           (selectedFilters.cores ? 1 : 0) + (selectedFilters.tdp ? 1 : 0),
      memory: selectedFilters.memoryTypes.size + selectedFilters.memoryModuleTypes.size +
              selectedFilters.memorySlotsCount.size +
              (selectedFilters.memorySpeed ? 1 : 0) + (selectedFilters.memoryCapacity ? 1 : 0),
      networking: selectedFilters.wifiStandards.size + selectedFilters.wifiChipsets.size +
                  selectedFilters.ethernetSpeeds.size + selectedFilters.ethernetChipsets.size,
      expansion: (selectedFilters.hasExpansionSlots ? 1 : 0) + (selectedFilters.hasEgpuSupport ? 1 : 0) +
                 selectedFilters.pcieSlotTypes.size,
      storage: selectedFilters.storageTypes.size + selectedFilters.storageInterfaces.size,
    };
  }, [selectedFilters]);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        borderRadius: 0,
      }}
    >
      {/* General Filters */}
      <CollapsibleSection
        title="General"
        activeFilterCount={activeFilterCounts.general}
      >
        <FilterGroup
          title="Brands"
          options={new Set(filterOptions.brands)}
          selected={selectedFilters.brands}
          devices={devices}
          onSelect={(value, checked) => onFilterChange('brands', value, checked)}
          columns={2}
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
          columns={3}
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
      </CollapsibleSection>

      {/* CPU Filters */}
      <CollapsibleSection
        title="CPU"
        activeFilterCount={activeFilterCounts.cpu}
      >
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
      </CollapsibleSection>

      {/* Memory Filters */}
      <CollapsibleSection
        title="Memory"
        activeFilterCount={activeFilterCounts.memory}
      >
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
      </CollapsibleSection>

      {/* Networking Filters */}
      <CollapsibleSection
        title="Networking"
        activeFilterCount={activeFilterCounts.networking}
      >
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
          columns={2}
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
          columns={2}
        />
      </CollapsibleSection>

      {/* PCIe Expansion Filters - only show if any device has expansion slots or eGPU support */}
      {(hasExpansionDevices || hasEgpuDevices) && (
        <CollapsibleSection
          title="Expansion"
          activeFilterCount={activeFilterCounts.expansion}
        >
          <Box sx={{ px: 2, pt: 1, pb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedFilters.hasExpansionSlots}
                  onChange={(e) => onFilterChange('hasExpansionSlots', null, e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Has PCIe expansion slots</Typography>}
              sx={{ py: 1 }}
            />

            {hasEgpuDevices && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedFilters.hasEgpuSupport}
                    onChange={(e) => onFilterChange('hasEgpuSupport', null, e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Has eGPU support</Typography>}
                sx={{ py: 1 }}
              />
            )}

            {pcieSlotTypes.size > 0 && (
              <FilterGroup
                title="PCIe Slot Types"
                options={pcieSlotTypes}
                selected={selectedFilters.pcieSlotTypes}
                devices={devices}
                onSelect={(value, checked) => onFilterChange('pcieSlotTypes', value, checked)}
              />
            )}
          </Box>
        </CollapsibleSection>
      )}

      {/* Storage-related filters */}
      <CollapsibleSection
        title="Storage"
        activeFilterCount={activeFilterCounts.storage}
      >
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
      </CollapsibleSection>
    </Paper>
  );
}; 