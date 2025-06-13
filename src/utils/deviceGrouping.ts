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
  
  // 'Enhanced' patterns for different variant types
  const variantPatterns = [
    // Memory variants (created for pis)
    /^\d+gb$/i,                    // gbs
    /^\d+mb$/i,                    // mbs
    
    // Feature variants
    /^w$/i,                        // wireless
    /^plus$/i,                     // plus
    /^diy$/i,                      // diy
    
    // CPU variants (Intel)
    /^i[3579]$/i,                  // Intel: i3, i5, i7, i9
    /^\d{4,5}[a-z]*$/i,            // CPU model numbers
    /^[nr]\d+[a-z]*$/i,            // Intel N-series
    
    // CPU variants (AMD)
    /^ryzen.*$/i,                  // AMD Ryzen
    /^athlon.*$/i,                 // AMD Athlon
    /^\d+[ghe]$/i,                 // AMD
    
    // CPU variants (general)
    /^core.*$/i,                   // Intel Core
    /^\d{2,4}[a-z]+$/i,            // Various
    /^\d+[ht]$/i,                  // T/H suffix
  ];
  
  let splitIndex = parts.length;
  
  // Special handling for Intel compound CPU names
  for (let i = 0; i < parts.length - 1; i++) {
    const currentPart = parts[i];
    const nextPart = parts[i + 1];
    
    if (/^i[3579]$/i.test(currentPart) && /^\d{4,5}[a-z]*$/i.test(nextPart)) {
      splitIndex = i;
      break;
    }
  }
  
  // If no Intel compound pattern found, look for any variant patterns from the end (for pis but prolly other stuff eventually)
  if (splitIndex === parts.length) {
    for (let i = parts.length - 1; i >= 1; i--) {
      const part = parts[i];
      const isVariant = variantPatterns.some(pattern => pattern.test(part));
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