// @ts-check
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} CPUSocket
 * @property {string} type - The socket type (e.g., "AM5", "LGA 1700")
 * @property {boolean} supports_cpu_swap - Whether the CPU can be swapped
 */

/**
 * @typedef {Object} CPU
 * @property {string} brand - CPU brand
 * @property {string} model - CPU model
 * @property {number} cores - Number of cores
 * @property {number} threads - Number of threads
 * @property {number} base_clock - Base clock speed in GHz
 * @property {number} boost_clock - Boost clock speed in GHz
 * @property {number} tdp - TDP in watts
 * @property {string} [chipset] - Optional chipset information
 * @property {string} [architecture] - Optional architecture information
 * @property {CPUSocket} [socket] - Optional socket information
 */

/**
 * @typedef {Object} Memory
 * @property {number} slots - Number of memory slots
 * @property {string} type - Memory type (e.g., "DDR4", "DDR5")
 * @property {number} speed - Memory speed in MHz
 * @property {string} [module_type] - Module type (e.g., "SODIMM", "DIMM")
 * @property {number} max_capacity - Maximum memory capacity in GB
 */

/**
 * @typedef {Object} Storage
 * @property {string} type - Storage type
 * @property {string} form_factor - Form factor
 * @property {string} interface - Interface type
 * @property {number} max_capacity - Maximum capacity in GB
 */

/**
 * @typedef {Object} NetworkingEthernet
 * @property {string} chipset - Ethernet chipset
 * @property {string} speed - Ethernet speed
 * @property {number} ports - Number of ports
 * @property {string} interface - Interface type (e.g., "RJ45", "SFP+")
 */

/**
 * @typedef {Object} NetworkingWifi
 * @property {string} chipset - WiFi chipset
 * @property {string} standard - WiFi standard
 * @property {string} bluetooth - Bluetooth version
 */

/**
 * @typedef {Object} Networking
 * @property {NetworkingEthernet[]} ethernet - Ethernet configurations
 * @property {NetworkingWifi} wifi - WiFi configuration
 */

/**
 * @typedef {Object} Dimensions
 * @property {number} width - Width in mm
 * @property {number} depth - Depth in mm
 * @property {number} height - Height in mm
 * @property {number} [volume] - Volume in liters (calculated)
 */

/**
 * @typedef {Object} GPU
 * @property {string} model - GPU model name
 */

/**
 * @typedef {Object} Expansion
 * @property {Object[]} [pcie_slots] - PCIe slot configurations
 * @property {Object[]} [oculink_ports] - OCuLink port configurations
 */

/**
 * @typedef {Object} MiniPCData
 * @property {string} id - Device ID
 * @property {string} brand - Device brand
 * @property {string} model - Device model
 * @property {string} release_date - Release year
 * @property {CPU} cpu - CPU information
 * @property {GPU} [gpu] - GPU information
 * @property {Memory} memory - Memory information
 * @property {Storage[]} storage - Storage configurations
 * @property {Networking} networking - Networking information
 * @property {Expansion} [expansion] - Expansion options
 * @property {Dimensions} [dimensions] - Physical dimensions
 * @property {string} [_sourcePath] - Source file path
 * @property {string} [_vendor] - Vendor directory name
 * @property {string} [_device] - Device file name without extension
 */

/**
 * Validates a Mini PC object
 * @param {MiniPCData} data - The data to validate
 * @returns {boolean} - Whether the data is valid
 */
function validateMiniPC(data) {
  // Basic validation of required fields
  if (!data.id || !data.brand || !data.model) {
    throw new Error('Missing required fields: id, brand, or model');
  }

  // Check if this is a DIY/barebones machine
  const isDIYMachine = data.cpu?.socket?.supports_cpu_swap === true;

  // CPU validation
  if (!data.cpu || !data.cpu.brand || !data.cpu.model || !data.cpu.tdp) {
    throw new Error('Missing required CPU fields: brand, model, or tdp');
  }

  // For DIY machines, require socket information
  if (isDIYMachine) {
    if (!data.cpu.socket?.type) {
      throw new Error('DIY machine must specify CPU socket type');
    }
  } else {
    // For non-DIY machines, require full CPU specs
    if (data.cpu.cores === undefined || data.cpu.threads === undefined || 
        data.cpu.base_clock === undefined || data.cpu.boost_clock === undefined) {
      throw new Error('Missing required CPU performance specifications');
    }
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

  // Calculate volume if dimensions are present
  if (data.dimensions?.width && data.dimensions?.depth && data.dimensions?.height) {
    const calculatedVolume = (data.dimensions.width * data.dimensions.depth * data.dimensions.height) / 1000000; // Convert from mm³ to liters
    data.dimensions.volume = Math.round(calculatedVolume * 100) / 100; // Round to 2 decimal places
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
    volumeRange: { min: Infinity, max: -Infinity },
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
    
    // Only include core counts from non-DIY machines
    if (!pc.cpu.socket?.supports_cpu_swap) {
      metadata.coreRange.min = Math.min(metadata.coreRange.min, pc.cpu.cores);
      metadata.coreRange.max = Math.max(metadata.coreRange.max, pc.cpu.cores);
    }
    
    metadata.memorySpeedRange.min = Math.min(metadata.memorySpeedRange.min, pc.memory.speed);
    metadata.memorySpeedRange.max = Math.max(metadata.memorySpeedRange.max, pc.memory.speed);

    if (pc.dimensions?.volume) {
      metadata.volumeRange.min = Math.min(metadata.volumeRange.min, pc.dimensions.volume);
      metadata.volumeRange.max = Math.max(metadata.volumeRange.max, pc.dimensions.volume);
    }
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
    volumeRange: metadata.volumeRange,
  };
}

/**
 * Generates TypeScript type definitions
 * @param {object} data - Processed data
 * @returns {string} - Type definitions as string
 */
function generateTypeDefinitions(data) {
  return `// Generated by build-data.cjs - DO NOT EDIT MANUALLY
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
    volume: data.metadata.volumeRange,
  }, null, 2)} as const;
`;
}

/**
 * Main function
 */
async function main() {
  const dataDir = path.resolve(__dirname, '../data/devices');
  const outputDir = path.resolve(__dirname, '../src/generated');
  /** @type {MiniPCData[]} */
  const devices = [];

  // Process each vendor directory
  for (const vendor of fs.readdirSync(dataDir)) {
    const vendorDir = path.join(dataDir, vendor);
    if (!vendorDir.includes('.') && fs.statSync(vendorDir).isDirectory()) { // Skip files, only process directories
      for (const file of fs.readdirSync(vendorDir)) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          console.log(`Processing ${vendor}/${file}...`);
          const filePath = path.join(vendorDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          try {
            const rawData = yaml.load(content);
            // Type check the loaded data
            if (typeof rawData === 'object' && rawData !== null) {
              /** @type {MiniPCData} */
              const data = rawData;
              if (validateMiniPC(data)) {
                // Add metadata
                data._sourcePath = `${vendor}/${file}`;
                data._vendor = vendor;
                data._device = file.replace(/\.ya?ml$/, '');
                devices.push(data);
              }
            } else {
              throw new Error('Invalid YAML: expected an object');
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
  await fs.promises.mkdir(outputDir, { recursive: true });

  // Write processed data
  fs.writeFileSync(
    path.join(outputDir, 'data.json'),
    JSON.stringify(processedData, null, 2)
  );

  // Write type definitions
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