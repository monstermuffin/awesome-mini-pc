import type { MiniPC, DeviceFamily, GroupedDeviceData } from '../types/minipc';
import generatedData from '../generated/data.json';

export interface FilterOptions {
  brands: Set<string>;
  cpuBrands: Set<string>;
  memoryTypes: Set<string>;
  memoryModuleTypes: Set<string>;
  wifiStandards: Set<string>;
  ethernetSpeeds: Set<string>;
  storageTypes: Set<string>;
  storageInterfaces: Set<string>;
  tdpRange: { min: number; max: number };
  coreRange: { min: number; max: number };
  memorySpeedRange: { min: number; max: number };
  volumeRange: { min: number; max: number };
}

function enhanceDataForCompat(devices: any[]): MiniPC[] {
  return devices.map(device => {
    if (!device.memory.module_type) {
      device.memory.module_type = device.memory.type === 'DDR4' || device.memory.type === 'DDR5' ? 'SO-DIMM' : 'DIMM';
    }
    
    if (device.cpu && !device.cpu.chipset) {
      device.cpu.chipset = undefined;
    }
    
    if (device.cpu && !device.cpu.architecture) {
      device.cpu.architecture = undefined;
    }
    
    return device as MiniPC;
  });
}

function groupDevicesByFamily(devices: MiniPC[]): GroupedDeviceData {
  const familyMap = new Map<string, MiniPC[]>();
  
  // Group devices by brand THEN model
  devices.forEach(device => {
    const familyKey = `${device.brand.toLowerCase()}-${device.model.toLowerCase()}`;
    if (!familyMap.has(familyKey)) {
      familyMap.set(familyKey, []);
    }
    familyMap.get(familyKey)!.push(device);
  });
  
  const families: DeviceFamily[] = [];
  
  familyMap.forEach((variants, familyKey) => {
    if (variants.length === 0) return;
    
    const sortedVariants = [...variants].sort((a, b) => {
      return a.cpu.model.localeCompare(b.cpu.model);
    });
    
    const baseDevice = sortedVariants[0];
    
    families.push({
      id: familyKey,
      brand: baseDevice.brand,
      model: baseDevice.model,
      baseDevice,
      variants: sortedVariants,
      variantCount: variants.length,
    });
  });
  
  families.sort((a, b) => {
    const brandCompare = a.brand.localeCompare(b.brand);
    if (brandCompare !== 0) return brandCompare;
    return a.model.localeCompare(b.model);
  });
  
  return {
    families,
    allDevices: devices,
  };
}

function convertToFilterOptions(metadata: typeof generatedData.metadata): FilterOptions {
  const memoryModuleTypes = new Set<string>();
  if (generatedData.devices) {
    generatedData.devices.forEach(device => {
      if ((device as any).memory?.module_type) {
        memoryModuleTypes.add((device as any).memory.module_type);
      }
    });
  }
  
  return {
    brands: new Set(metadata.brands),
    cpuBrands: new Set(metadata.cpuBrands),
    memoryTypes: new Set(metadata.memoryTypes),
    memoryModuleTypes,
    wifiStandards: new Set(metadata.wifiStandards),
    ethernetSpeeds: new Set(metadata.ethernetSpeeds),
    storageTypes: new Set(metadata.storageTypes),
    storageInterfaces: new Set(metadata.storageInterfaces),
    tdpRange: metadata.tdpRange,
    coreRange: metadata.coreRange,
    memorySpeedRange: metadata.memorySpeedRange,
    volumeRange: metadata.volumeRange,
  };
}

export async function loadMiniPCData(): Promise<{ 
  devices: MiniPC[]; 
  groupedData: GroupedDeviceData;
  filterOptions: FilterOptions 
}> {
  try {
    console.log('Loading Mini PC data from generated file...');
    
    const enhancedDevices = enhanceDataForCompat(generatedData.devices);
    const groupedData = groupDevicesByFamily(enhancedDevices);
    
    const metadata = { ...generatedData.metadata };
    if (metadata.coreRange.min === Infinity || metadata.coreRange.max === -Infinity) {
      metadata.coreRange = { min: 0, max: 0 };
    }
    
    return {
      devices: enhancedDevices,
      groupedData,
      filterOptions: convertToFilterOptions(metadata),
    };
  } catch (error) {
    console.error('Error loading Mini PC data:', error);
    return {
      devices: [],
      groupedData: { families: [], allDevices: [] },
      filterOptions: {
        brands: new Set(),
        cpuBrands: new Set(),
        memoryTypes: new Set(),
        memoryModuleTypes: new Set(),
        wifiStandards: new Set(),
        ethernetSpeeds: new Set(),
        storageTypes: new Set(),
        storageInterfaces: new Set(),
        tdpRange: { min: 0, max: 0 },
        coreRange: { min: 0, max: 0 },
        memorySpeedRange: { min: 0, max: 0 },
        volumeRange: { min: 0, max: 0 },
      },
    };
  }
} 