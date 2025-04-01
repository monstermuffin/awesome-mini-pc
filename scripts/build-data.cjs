// @ts-check
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

/**
 * Validates a Mini PC object
 * @param {any} data - The data to validate
 * @returns {boolean} - Whether the data is valid
 */
function validateMiniPC(data) {
  // Basic validation of required fields
  if (!data.id || !data.brand || !data.model) {
    throw new Error('Missing required fields: id, brand, or model');
  }

  if (!data.cpu || !data.cpu.brand || !data.cpu.model || !data.cpu.cores || !data.cpu.tdp) {
    throw new Error('Missing or invalid CPU information');
  }

  if (!data.memory || !data.memory.type || !data.memory.speed || !data.memory.slots) {
    throw new Error('Missing or invalid memory information');
  }

  if (!data.memory.module_type) {
    console.warn(`Warning: ${data.id} is missing memory.module_type (SODIMM/DIMM)`);
  }

  if (!Array.isArray(data.storage)) {
    throw new Error('Storage must be an array');
  }

  if (!data.networking || !data.networking.wifi || !data.networking.ethernet) {
    throw new Error('Missing or invalid networking information');
  }

  // Check if wifi has chipset
  if (!data.networking.wifi.chipset) {
    throw new Error('WiFi chipset is required');
  }

  // Validate ethernet entries
  for (const eth of data.networking.ethernet) {
    if (!eth.chipset || !eth.speed) {
      throw new Error('Ethernet entries must include chipset and speed');
    }
  }

  return true;
}

/**
 * Extracts metadata from device list
 * @param {Array<any>} devices - List of devices
 * @returns {object} - Metadata object
 */
function extractMetadata(devices) {
  const metadata = {
    brands: new Set(),
    cpuBrands: new Set(),
    memoryTypes: new Set(),
    memoryModuleTypes: new Set(),
    wifiStandards: new Set(),
    ethernetSpeeds: new Set(),
    storageTypes: new Set(),
    storageInterfaces: new Set(),
    tdpRange: { min: Infinity, max: -Infinity },
    coreRange: { min: Infinity, max: -Infinity },
    memorySpeedRange: { min: Infinity, max: -Infinity },
  };

  for (const pc of devices) {
    metadata.brands.add(pc.brand);
    metadata.cpuBrands.add(pc.cpu.brand);
    metadata.memoryTypes.add(pc.memory.type);
    if (pc.memory.module_type) {
      metadata.memoryModuleTypes.add(pc.memory.module_type);
    }
    metadata.wifiStandards.add(pc.networking.wifi.standard);
    
    pc.networking.ethernet.forEach(eth => {
      metadata.ethernetSpeeds.add(eth.speed);
    });

    pc.storage.forEach(storage => {
      metadata.storageTypes.add(storage.type);
      metadata.storageInterfaces.add(storage.interface);
    });

    metadata.tdpRange.min = Math.min(metadata.tdpRange.min, pc.cpu.tdp);
    metadata.tdpRange.max = Math.max(metadata.tdpRange.max, pc.cpu.tdp);
    
    metadata.coreRange.min = Math.min(metadata.coreRange.min, pc.cpu.cores);
    metadata.coreRange.max = Math.max(metadata.coreRange.max, pc.cpu.cores);
    
    metadata.memorySpeedRange.min = Math.min(metadata.memorySpeedRange.min, pc.memory.speed);
    metadata.memorySpeedRange.max = Math.max(metadata.memorySpeedRange.max, pc.memory.speed);
  }

  return {
    brands: [...metadata.brands].sort(),
    cpuBrands: [...metadata.cpuBrands].sort(),
    memoryTypes: [...metadata.memoryTypes].sort(),
    memoryModuleTypes: [...metadata.memoryModuleTypes].sort(),
    wifiStandards: [...metadata.wifiStandards].sort(),
    ethernetSpeeds: [...metadata.ethernetSpeeds].sort(),
    storageTypes: [...metadata.storageTypes].sort(),
    storageInterfaces: [...metadata.storageInterfaces].sort(),
    tdpRange: metadata.tdpRange,
    coreRange: metadata.coreRange,
    memorySpeedRange: metadata.memorySpeedRange,
  };
}

/**
 * Generates TypeScript type definitions
 * @param {object} data - Processed data
 * @returns {string} - Type definitions as string
 */
function generateTypeDefinitions(data) {
  return `// Generated by build-data.js - DO NOT EDIT MANUALLY
export const BRANDS = ${JSON.stringify(data.metadata.brands)} as const;
export const CPU_BRANDS = ${JSON.stringify(data.metadata.cpuBrands)} as const;
export const MEMORY_TYPES = ${JSON.stringify(data.metadata.memoryTypes)} as const;
export const MEMORY_MODULE_TYPES = ${JSON.stringify(data.metadata.memoryModuleTypes)} as const;
export const WIFI_STANDARDS = ${JSON.stringify(data.metadata.wifiStandards)} as const;
export const ETHERNET_SPEEDS = ${JSON.stringify(data.metadata.ethernetSpeeds)} as const;
export const STORAGE_TYPES = ${JSON.stringify(data.metadata.storageTypes)} as const;
export const STORAGE_INTERFACES = ${JSON.stringify(data.metadata.storageInterfaces)} as const;

export type Brand = typeof BRANDS[number];
export type CpuBrand = typeof CPU_BRANDS[number];
export type MemoryType = typeof MEMORY_TYPES[number];
export type MemoryModuleType = typeof MEMORY_MODULE_TYPES[number];
export type WifiStandard = typeof WIFI_STANDARDS[number];
export type EthernetSpeed = typeof ETHERNET_SPEEDS[number];
export type StorageType = typeof STORAGE_TYPES[number];
export type StorageInterface = typeof STORAGE_INTERFACES[number];

export const RANGES = ${JSON.stringify({
    tdp: data.metadata.tdpRange,
    cores: data.metadata.coreRange,
    memorySpeed: data.metadata.memorySpeedRange,
  }, null, 2)} as const;
`;
}

/**
 * Main function
 */
async function main() {
  const dataDir = path.resolve(__dirname, '../data/devices');
  const outputDir = path.resolve(__dirname, '../src/generated');
  const devices = [];

  // Process each vendor directory
  for (const vendor of fs.readdirSync(dataDir)) {
    const vendorDir = path.join(dataDir, vendor);
    if (!vendor.includes('.') && fs.statSync(vendorDir).isDirectory()) { // Skip files, only process directories
      for (const file of fs.readdirSync(vendorDir)) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          console.log(`Processing ${vendor}/${file}...`);
          const filePath = path.join(vendorDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          try {
            const data = yaml.load(content);
            if (validateMiniPC(data)) {
              // Add metadata
              data._sourcePath = `${vendor}/${file}`;
              data._vendor = vendor;
              data._device = file.replace(/\.ya?ml$/, '');
              devices.push(data);
            }
          } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
            process.exit(1);
          }
        }
      }
    }
  }

  // Extract metadata and create processed data
  const processedData = {
    devices,
    metadata: extractMetadata(devices),
  };

  // Create output directory if it doesn't exist
  try {
    fs.mkdirSync(outputDir, { recursive: true });
  } catch (err) {
    // Directory already exists or can't be created
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }

  // Write processed data
  fs.writeFileSync(
    path.join(outputDir, 'data.json'),
    JSON.stringify(processedData, null, 2)
  );

  // Generate and write type definitions
  fs.writeFileSync(
    path.join(outputDir, 'types.ts'),
    generateTypeDefinitions(processedData)
  );

  console.log(`Successfully processed ${devices.length} devices`);
  console.log('Generated files:');
  console.log('- src/generated/data.json');
  console.log('- src/generated/types.ts');
}

main().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
}); 