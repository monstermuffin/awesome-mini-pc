import type { MiniPC } from '../types/minipc';

export interface DeviceFamily {
  id: string; // family ID
  brand: string;
  baseModel: string;
  representative: MiniPC; // the device to show by default
  variants: MiniPC[]; // all devices in this family
  variantCount: number;
}

/**
 * Extract base model name from a device ID
 */
function extractBaseModel(deviceId: string): string {
  const parts = deviceId.split('-');
  
  // CPU patterns
  const cpuPatterns = [
    /^i[3579]$/i,                  // Intel: i3, i5, i7, i9 (first part of compound)
    /^\d{4,5}[a-z]*$/i,            // CPU model numbers: 12100, 1235u, 5557u, 9700t
    /^[nr]\d+[a-z]*$/i,            // Intel N-series: n100, n150, etc.
    /^\d{2,4}[a-z]+$/i,            // Various: 125h, 185h, etc.
    /^ryzen.*$/i,                  // AMD Ryzen patterns
    /^athlon.*$/i,                 // AMD Athlon patterns
    /^core.*$/i,                   // Intel Core patterns
    /^\d+ge$/i,                    // GE suffix patterns: 200ge, 2400ge
    /^\d+[ht]$/i,                  // T/H suffix patterns: 6700t, 12900h
  ];
  
  let splitIndex = parts.length;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const currentPart = parts[i];
    const nextPart = parts[i + 1];
    
    if (/^i[3579]$/i.test(currentPart) && /^\d{4,5}[a-z]*$/i.test(nextPart)) {
      splitIndex = i;
      break;
    }
  }
  
  if (splitIndex === parts.length) {
    for (let i = parts.length - 1; i >= 1; i--) {
      const part = parts[i];
      const isVariant = cpuPatterns.some(pattern => pattern.test(part));
      if (isVariant) {
        splitIndex = i;
        break;
      }
    }
  }
  
  return parts.slice(0, splitIndex).join('-');
}

/**
 * Groups devices by their base model
 */
export function groupDevicesByFamily(devices: MiniPC[]): DeviceFamily[] {
  const familyMap = new Map<string, { brand: string; baseModel: string; devices: MiniPC[] }>();
  
  devices.forEach(device => {
    const baseModel = extractBaseModel(device.id);
    const familyKey = `${device.brand}-${baseModel}`;
    
    if (!familyMap.has(familyKey)) {
      familyMap.set(familyKey, {
        brand: device.brand,
        baseModel: baseModel,
        devices: []
      });
    }
    
    familyMap.get(familyKey)!.devices.push(device);
  });
  
  const families: DeviceFamily[] = [];
  
  familyMap.forEach(({ brand, baseModel, devices }, familyKey) => {
    // Choose representative device (first one alphabetically for now? - mebbe dont do that in the future idk)
    const sortedDevices = [...devices].sort((a, b) => a.id.localeCompare(b.id));
    const representative = sortedDevices[0];
    
    families.push({
      id: familyKey,
      brand,
      baseModel,
      representative,
      variants: sortedDevices,
      variantCount: sortedDevices.length
    });
  });
  
  return families.sort((a, b) => {
    // Sort by brand first, then by base model
    if (a.brand !== b.brand) {
      return a.brand.localeCompare(b.brand);
    }
    return a.baseModel.localeCompare(b.baseModel);
  });
}

export function flattenDeviceFamilies(families: DeviceFamily[]): MiniPC[] {
  const devices: MiniPC[] = [];
  
  families.forEach(family => {
    devices.push(...family.variants);
  });
  
  return devices;
} 