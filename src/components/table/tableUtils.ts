import type { MiniPC } from '../../types/minipc';

export type SortKey = keyof MiniPC | 'cpu.cores' | 'cpu.tdp' | 'memory.speed' | 'cpu.model' | 'memory.type' | 'memory.module_type' | 'cpu.chipset' | 'release_date' | 'has_expansion' | 'dimensions.volume';

export type SortConfig = {
  key: SortKey;
  direction: 'asc' | 'desc';
};

export const getSortValue = (device: MiniPC, key: SortKey): string | number | boolean => {
  switch (key) {
    case 'cpu.cores':
      return device.cpu.cores;
    case 'cpu.tdp':
      return device.cpu.tdp;
    case 'memory.speed':
      return device.memory.speed;
    case 'cpu.model':
      return device.cpu.model;
    case 'memory.type':
      return device.memory.type;
    case 'memory.module_type':
      return device.memory.module_type || '';
    case 'cpu.chipset':
      return device.cpu.chipset || '';
    case 'release_date':
      return device.release_date || '';
    case 'has_expansion':
      return !!device.expansion?.pcie_slots && device.expansion.pcie_slots.length > 0;
    case 'dimensions.volume':
      return device.dimensions?.volume || 0;
    default:
      return device[key] as string;
  }
};

export const getDeviceAge = (releaseYear: string): string => {
  if (!releaseYear) return 'Unknown';
  const currentYear = new Date().getFullYear();
  const deviceYear = parseInt(releaseYear, 10);
  if (isNaN(deviceYear)) return 'Unknown';
  
  const age = currentYear - deviceYear;
  if (age === 0) return 'This year';
  if (age === 1) return '1 year old';
  return `${age} years old`;
};

export const formatMemoryCapacity = (capacityGB: number): string => {
  if (capacityGB < 0.001) {
    // Less than 1MB, show as KB
    const capacityKB = capacityGB * 1024 * 1024;
    return `${Math.round(capacityKB)}KB`;
  } else if (capacityGB < 1) {
    // Less than 1GB, show as MB
    const capacityMB = capacityGB * 1024;
    return `${capacityMB % 1 === 0 ? Math.round(capacityMB) : capacityMB.toFixed(1)}MB`;
  } else {
    // 1GB or more, show as GB
    return `${capacityGB % 1 === 0 ? Math.round(capacityGB) : capacityGB.toFixed(1)}GB`;
  }
};

export const formatVolume = (volume: number): string => {
  if (volume < 0.01) {
    return '<0.01L';
  }
  return `${volume.toFixed(2)}L`;
}; 