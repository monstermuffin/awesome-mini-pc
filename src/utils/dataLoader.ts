import type { MiniPC } from '../types/minipc';
import generatedData from '../generated/data.json';

export interface FilterOptions {
  brands: Set<string>;
  cpuBrands: Set<string>;
  memoryTypes: Set<string>;
  wifiStandards: Set<string>;
  ethernetSpeeds: Set<string>;
  storageTypes: Set<string>;
  storageInterfaces: Set<string>;
  tdpRange: { min: number; max: number };
  coreRange: { min: number; max: number };
  memorySpeedRange: { min: number; max: number };
}

// Function to convert arrays to Sets in the filter options
function convertToFilterOptions(metadata: typeof generatedData.metadata): FilterOptions {
  return {
    brands: new Set(metadata.brands),
    cpuBrands: new Set(metadata.cpuBrands),
    memoryTypes: new Set(metadata.memoryTypes),
    wifiStandards: new Set(metadata.wifiStandards),
    ethernetSpeeds: new Set(metadata.ethernetSpeeds),
    storageTypes: new Set(metadata.storageTypes),
    storageInterfaces: new Set(metadata.storageInterfaces),
    tdpRange: metadata.tdpRange,
    coreRange: metadata.coreRange,
    memorySpeedRange: metadata.memorySpeedRange,
  };
}

// Function to load all Mini PC data
export async function loadMiniPCData(): Promise<{ devices: MiniPC[]; filterOptions: FilterOptions }> {
  try {
    console.log('Loading Mini PC data from generated file...');
    
    return {
      devices: generatedData.devices,
      filterOptions: convertToFilterOptions(generatedData.metadata),
    };
  } catch (error) {
    console.error('Error loading Mini PC data:', error);
    return {
      devices: [],
      filterOptions: {
        brands: new Set(),
        cpuBrands: new Set(),
        memoryTypes: new Set(),
        wifiStandards: new Set(),
        ethernetSpeeds: new Set(),
        storageTypes: new Set(),
        storageInterfaces: new Set(),
        tdpRange: { min: 0, max: 0 },
        coreRange: { min: 0, max: 0 },
        memorySpeedRange: { min: 0, max: 0 },
      },
    };
  }
} 