// @ts-check
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Define known valid values
const VALID_CPU_BRANDS = ['Intel', 'AMD', 'ARM', 'Qualcomm', 'Apple'];
const VALID_MEMORY_TYPES = ['DDR3', 'DDR3L', 'DDR4', 'DDR5', 'LPDDR4', 'LPDDR4X', 'LPDDR5'];
const VALID_MEMORY_MODULE_TYPES = ['SODIMM', 'DIMM', 'Soldered', 'SO-DIMM'];
const VALID_STORAGE_TYPES = ['M.2', 'SATA', 'NVMe', '2.5"', 'mSATA', 'eMMC', 'microSD', 'U.2'];
const VALID_WIFI_STANDARDS = ['WiFi 4', 'WiFi 5', 'WiFi 6', 'WiFi 6E', 'WiFi 7', 'None'];
const VALID_ETHERNET_SPEEDS = ['100Mbps', '1GbE', '2.5GbE', '5GbE', '10GbE'];
const VALID_PCIE_TYPES = ['x1', 'x4', 'x8', 'x16', 'Mini PCIe', 'M.2'];
const VALID_PCIE_VERSIONS = ['PCIe 2.0', 'PCIe 3.0', 'PCIe 4.0', 'PCIe 5.0', '2.0', '3.0', '4.0', '5.0'];
const VALID_CPU_SOCKETS = ['AM4', 'AM5', 'LGA 1700', 'LGA 1200', 'LGA 1151', 'SP3', 'sTRX4', 'sWRX8'];
const VALID_OCULINK_VERSIONS = ['OCuLink 1.0', 'OCuLink 2.0'];
const VALID_ETHERNET_INTERFACES = ['RJ45', 'SFP', 'SFP+', 'SFP28', '10GBASE-T'];

/**
 * @typedef {Object} ValidationError
 * @property {string} deviceId - The ID of the device with the error
 * @property {string} file - The file path with the error
 * @property {string} message - Error message
 * @property {string} path - Path to the erroneous property
 * @property {boolean} critical - Whether this is a critical error
 */

/**
 * Validates required fields in the device data
 * @param {any} data - The device data
 * @param {string} path - Current path
 * @param {ValidationError[]} errors - Array to append errors to
 * @param {string} deviceFile - File being validated
 */
function validateRequiredFields(data, path, errors, deviceFile) {
  // Basic required fields
  const requiredTopLevel = ['id', 'brand', 'model', 'release_date', 'cpu', 'memory', 'storage', 'networking'];
  for (const field of requiredTopLevel) {
    if (!data[field]) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `Missing required top-level field: ${field}`,
        path: `${path}.${field}`,
        critical: true
      });
    }
  }
  
  // CPU required fields
  if (data.cpu) {
    const requiredCpuFields = ['brand', 'model', 'cores', 'threads', 'base_clock', 'boost_clock', 'tdp', 'architecture'];
    const isDIYMachine = data.cpu.socket?.supports_cpu_swap === true;

    // For DIY machines, only brand, model, tdp and architecture are required
    const fieldsToCheck = isDIYMachine ? ['brand', 'model', 'tdp', 'architecture'] : requiredCpuFields;

    for (const field of fieldsToCheck) {
      if (data.cpu[field] === undefined) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Missing required CPU field: ${field}`,
          path: `${path}.cpu.${field}`,
          critical: true
        });
      }
    }

    // For DIY machines, socket information is required
    if (isDIYMachine) {
      if (!data.cpu.socket?.type) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `DIY machine must specify CPU socket type`,
          path: `${path}.cpu.socket.type`,
          critical: true
        });
      }
    }
  }
  
  // Memory required fields
  if (data.memory) {
    const requiredMemoryFields = ['max_capacity', 'slots', 'type', 'speed'];
    for (const field of requiredMemoryFields) {
      if (data.memory[field] === undefined) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Missing required memory field: ${field}`,
          path: `${path}.memory.${field}`,
          critical: true
        });
      }
    }
    
    if (!data.memory.module_type) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `Missing memory.module_type (SODIMM/DIMM)`,
        path: `${path}.memory.module_type`,
        critical: false
      });
    }
  }
  
  // Networking required fields
  if (data.networking) {
    if (!data.networking.ethernet || !Array.isArray(data.networking.ethernet)) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `Networking.ethernet must be an array`,
        path: `${path}.networking.ethernet`,
        critical: true
      });
    } else {
      data.networking.ethernet.forEach((eth, index) => {
        const requiredEthernetFields = ['chipset', 'speed', 'ports', 'interface'];
        for (const field of requiredEthernetFields) {
          if (eth[field] === undefined) {
            errors.push({
              deviceId: data.id || 'unknown',
              file: deviceFile,
              message: `Missing required ethernet[${index}] field: ${field}`,
              path: `${path}.networking.ethernet[${index}].${field}`,
              critical: true
            });
          }
        }
      });
    }
    
    if (!data.networking.wifi) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `Missing networking.wifi object`,
        path: `${path}.networking.wifi`,
        critical: true
      });
    } else {
      const requiredWifiFields = ['chipset', 'standard', 'bluetooth'];
      for (const field of requiredWifiFields) {
        if (data.networking.wifi[field] === undefined) {
          errors.push({
            deviceId: data.id || 'unknown',
            file: deviceFile,
            message: `Missing required wifi field: ${field}`,
            path: `${path}.networking.wifi.${field}`,
            critical: true
          });
        }
      }
    }
  }
  
  // Storage
  if (data.storage && Array.isArray(data.storage)) {
    data.storage.forEach((storage, index) => {
      const requiredStorageFields = ['type', 'form_factor', 'interface'];
      for (const field of requiredStorageFields) {
        if (storage[field] === undefined) {
          errors.push({
            deviceId: data.id || 'unknown',
            file: deviceFile,
            message: `Missing required storage[${index}] field: ${field}`,
            path: `${path}.storage[${index}].${field}`,
            critical: true
          });
        }
      }
    });
  } else {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Storage must be an array`,
      path: `${path}.storage`,
      critical: true
    });
  }

  // GPU validation
  if (data.gpu) {
    if (Array.isArray(data.gpu)) {
      data.gpu.forEach((gpu, index) => {
        if (!gpu.model || !gpu.type) {
          errors.push({
            deviceId: data.id || 'unknown',
            file: deviceFile,
            message: `Missing required GPU[${index}] fields: model or type`,
            path: `${path}.gpu[${index}]`,
            critical: true
          });
        }
        // Validate GPU type
        if (gpu.type && !['Integrated', 'Discrete'].includes(gpu.type)) {
          errors.push({
            deviceId: data.id || 'unknown',
            file: deviceFile,
            message: `Invalid GPU type: ${gpu.type}. Must be either 'Integrated' or 'Discrete'`,
            path: `${path}.gpu[${index}].type`,
            critical: true
          });
        }
        // Require VRAM for discrete GPUs
        if (gpu.type === 'Discrete' && !gpu.vram) {
          errors.push({
            deviceId: data.id || 'unknown',
            file: deviceFile,
            message: `Discrete GPU[${index}] must specify VRAM amount`,
            path: `${path}.gpu[${index}].vram`,
            critical: true
          });
        }
      });
    } else {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `GPU must be an array`,
        path: `${path}.gpu`,
        critical: true
      });
    }
  }

  // Expansion validation
  if (data.expansion) {
    if (data.expansion.oculink_ports && Array.isArray(data.expansion.oculink_ports)) {
      data.expansion.oculink_ports.forEach((port, index) => {
        if (!port.version) {
          errors.push({
            deviceId: data.id || 'unknown',
            file: deviceFile,
            message: `Missing required OCuLink port[${index}] field: version`,
            path: `${path}.expansion.oculink_ports[${index}].version`,
            critical: true
          });
        }
      });
    }
  }
}

/**
 * Validates data types
 * @param {any} data - The device data
 * @param {string} path - Current path
 * @param {ValidationError[]} errors - Array to append errors to
 * @param {string} deviceFile - File being validated
 */
function validateDataTypes(data, path, errors, deviceFile) {
  // Check ID format
  if (data.id && typeof data.id !== 'string') {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `id must be a string`,
      path: `${path}.id`,
      critical: true
    });
  }
  
  // Check brand and model are strings
  if (data.brand && typeof data.brand !== 'string') {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `brand must be a string`,
      path: `${path}.brand`,
      critical: true
    });
  }
  if (data.model && typeof data.model !== 'string') {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `model must be a string`,
      path: `${path}.model`,
      critical: true
    });
  }
  
  // Check release_date format
  if (data.release_date) {
    const yearRegex = /^[0-9]{4}$/;
    if (typeof data.release_date !== 'string' || !yearRegex.test(data.release_date)) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `release_date must be a 4-digit year string (e.g., "2023")`,
        path: `${path}.release_date`,
        critical: false
      });
    }
  }
  
  // CPU numeric values
  if (data.cpu) {
    const isDIYMachine = data.cpu.socket?.supports_cpu_swap === true;

    // Only validate CPU specs for non-DIY machines
    if (!isDIYMachine) {
      if (data.cpu.cores !== undefined && (!Number.isInteger(data.cpu.cores) || data.cpu.cores <= 0)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `cpu.cores must be a positive integer`,
          path: `${path}.cpu.cores`,
          critical: true
        });
      }
      
      if (data.cpu.threads !== undefined && (!Number.isInteger(data.cpu.threads) || data.cpu.threads <= 0)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `cpu.threads must be a positive integer`,
          path: `${path}.cpu.threads`,
          critical: true
        });
      }
      
      if (data.cpu.base_clock !== undefined && (typeof data.cpu.base_clock !== 'number' || data.cpu.base_clock <= 0)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `cpu.base_clock must be a positive number`,
          path: `${path}.cpu.base_clock`,
          critical: true
        });
      }
      
      if (data.cpu.boost_clock !== undefined && (typeof data.cpu.boost_clock !== 'number' || data.cpu.boost_clock <= 0)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `cpu.boost_clock must be a positive number`,
          path: `${path}.cpu.boost_clock`,
          critical: true
        });
      }
    }

    // TDP is always required and must be positive
    if (data.cpu.tdp !== undefined && (typeof data.cpu.tdp !== 'number' || data.cpu.tdp <= 0)) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `cpu.tdp must be a positive number`,
        path: `${path}.cpu.tdp`,
        critical: true
      });
    }
  }
  
  // Memory numeric values
  if (data.memory) {
    if (data.memory.max_capacity !== undefined && (!Number.isInteger(data.memory.max_capacity) || data.memory.max_capacity <= 0)) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `memory.max_capacity must be a positive integer`,
        path: `${path}.memory.max_capacity`,
        critical: true
      });
    }
    
    if (data.memory.slots !== undefined && (!Number.isInteger(data.memory.slots) || data.memory.slots < 0)) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `memory.slots must be a non-negative integer`,
        path: `${path}.memory.slots`,
        critical: true
      });
    }
    
    if (data.memory.speed !== undefined && (!Number.isInteger(data.memory.speed) || data.memory.speed <= 0)) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `memory.speed must be a positive integer`,
        path: `${path}.memory.speed`,
        critical: true
      });
    }
  }

  // Validate CPU socket if present
  if (data.cpu?.socket) {
    if (typeof data.cpu.socket.type !== 'string') {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `cpu.socket.type must be a string`,
        path: `${path}.cpu.socket.type`,
        critical: true
      });
    }
    if (typeof data.cpu.socket.supports_cpu_swap !== 'boolean') {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `cpu.socket.supports_cpu_swap must be a boolean`,
        path: `${path}.cpu.socket.supports_cpu_swap`,
        critical: true
      });
    }
  }
}

/**
 * Validates enumerated values
 * @param {any} data - The device data
 * @param {string} path - Current path
 * @param {ValidationError[]} errors - Array to append errors to
 * @param {string} deviceFile - File being validated
 */
function validateEnumValues(data, path, errors, deviceFile) {
  // CPU brand
  if (data.cpu && data.cpu.brand && !VALID_CPU_BRANDS.includes(data.cpu.brand)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Unknown cpu.brand: ${data.cpu.brand}. Known values: ${VALID_CPU_BRANDS.join(', ')}`,
      path: `${path}.cpu.brand`,
      critical: false
    });
  }
  
  // Memory type
  if (data.memory && data.memory.type && !VALID_MEMORY_TYPES.includes(data.memory.type)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Unknown memory.type: ${data.memory.type}. Known values: ${VALID_MEMORY_TYPES.join(', ')}`,
      path: `${path}.memory.type`,
      critical: false
    });
  }
  
  // Memory module type
  if (data.memory && data.memory.module_type && !VALID_MEMORY_MODULE_TYPES.includes(data.memory.module_type)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Unknown memory.module_type: ${data.memory.module_type}. Known values: ${VALID_MEMORY_MODULE_TYPES.join(', ')}`,
      path: `${path}.memory.module_type`,
      critical: false
    });
  }
  
  // Storage type
  if (data.storage && Array.isArray(data.storage)) {
    data.storage.forEach((storage, index) => {
      if (storage.type && !VALID_STORAGE_TYPES.includes(storage.type)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Unknown storage[${index}].type: ${storage.type}. Known values: ${VALID_STORAGE_TYPES.join(', ')}`,
          path: `${path}.storage[${index}].type`,
          critical: false
        });
      }
    });
  }
  
  // WiFi standard
  if (data.networking && data.networking.wifi && data.networking.wifi.standard && 
     !VALID_WIFI_STANDARDS.includes(data.networking.wifi.standard)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Unknown wifi.standard: ${data.networking.wifi.standard}. Known values: ${VALID_WIFI_STANDARDS.join(', ')}`,
      path: `${path}.networking.wifi.standard`,
      critical: false
    });
  }
  
  // Ethernet speed
  if (data.networking && data.networking.ethernet && Array.isArray(data.networking.ethernet)) {
    data.networking.ethernet.forEach((eth, index) => {
      if (eth.speed && !VALID_ETHERNET_SPEEDS.includes(eth.speed)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Unknown ethernet[${index}].speed: ${eth.speed}. Known values: ${VALID_ETHERNET_SPEEDS.join(', ')}`,
          path: `${path}.networking.ethernet[${index}].speed`,
          critical: false
        });
      }
    });
  }
  
  // PCIe slots
  if (data.expansion && data.expansion.pcie_slots && Array.isArray(data.expansion.pcie_slots)) {
    data.expansion.pcie_slots.forEach((slot, index) => {
      if (slot.type && !VALID_PCIE_TYPES.includes(slot.type)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Unknown pcie_slots[${index}].type: ${slot.type}. Known values: ${VALID_PCIE_TYPES.join(', ')}`,
          path: `${path}.expansion.pcie_slots[${index}].type`,
          critical: false
        });
      }
      
      if (slot.version && !VALID_PCIE_VERSIONS.includes(slot.version)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Unknown pcie_slots[${index}].version: ${slot.version}. Known values: ${VALID_PCIE_VERSIONS.join(', ')}`,
          path: `${path}.expansion.pcie_slots[${index}].version`,
          critical: false
        });
      }
    });
  }

  // CPU socket type
  if (data.cpu?.socket?.type && !VALID_CPU_SOCKETS.includes(data.cpu.socket.type)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Unknown cpu.socket.type: ${data.cpu.socket.type}. Known values: ${VALID_CPU_SOCKETS.join(', ')}`,
      path: `${path}.cpu.socket.type`,
      critical: false
    });
  }

  // OCuLink version validation
  if (data.expansion?.oculink_ports) {
    data.expansion.oculink_ports.forEach((port, index) => {
      if (port.version && !VALID_OCULINK_VERSIONS.includes(port.version)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Unknown oculink_ports[${index}].version: ${port.version}. Known values: ${VALID_OCULINK_VERSIONS.join(', ')}`,
          path: `${path}.expansion.oculink_ports[${index}].version`,
          critical: false
        });
      }
    });
  }
}

/**
 * Validates logical constraints
 * @param {any} data - The device data
 * @param {string} path - Current path
 * @param {ValidationError[]} errors - Array to append errors to
 * @param {string} deviceFile - File being validated
 */
function validateLogicalConstraints(data, path, errors, deviceFile) {
  // CPU base_clock should be less than or equal to boost_clock
  if (data.cpu && data.cpu.base_clock !== undefined && data.cpu.boost_clock !== undefined) {
    if (data.cpu.base_clock > data.cpu.boost_clock) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `CPU base_clock (${data.cpu.base_clock}) cannot be greater than boost_clock (${data.cpu.boost_clock})`,
        path: `${path}.cpu`,
        critical: true
      });
    }
  }
  
  // CPU threads should be greater than or equal to cores
  if (data.cpu && data.cpu.cores !== undefined && data.cpu.threads !== undefined) {
    if (data.cpu.threads < data.cpu.cores) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `CPU threads (${data.cpu.threads}) cannot be less than cores (${data.cpu.cores})`,
        path: `${path}.cpu`,
        critical: true
      });
    }
  }
  
  // Memory slots should match the module type
  if (data.memory && data.memory.slots !== undefined && data.memory.module_type) {
    if (data.memory.module_type === 'Soldered' && data.memory.slots > 0) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `Soldered memory should have 0 slots, but got ${data.memory.slots}`,
        path: `${path}.memory`,
        critical: false
      });
    }
  }
  
  // ID should match the expected format
  if (data.id && data.brand) {
    const expectedPrefix = data.brand.toLowerCase().replace(/\s+/g, '-');
    if (!data.id.startsWith(expectedPrefix)) {
      errors.push({
        deviceId: data.id,
        file: deviceFile,
        message: `ID should start with brand name in lowercase with dashes (${expectedPrefix}-*)`,
        path: `${path}.id`,
        critical: false
      });
    }
  }

  // Validate Thunderbolt compatibility and version
  if (data.ports?.usb_c && Array.isArray(data.ports.usb_c)) {
    data.ports.usb_c.forEach((port, index) => {
      if (port.thunderbolt_compatible === true && !port.thunderbolt_version) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `USB-C port with Thunderbolt compatibility must specify thunderbolt_version`,
          path: `${path}.ports.usb_c[${index}]`,
          critical: true
        });
      }
    });
  }
}

/**
 * Validates a device file
 * @param {string} filePath - Path to the file
 * @param {string} deviceFile - Device file name
 * @returns {ValidationError[]} - Array of validation errors
 */
function validateDevice(filePath, deviceFile) {
  const errors = [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = yaml.load(content);
    
    // Run all validations
    validateRequiredFields(data, '', errors, deviceFile);
    validateDataTypes(data, '', errors, deviceFile);
    validateEnumValues(data, '', errors, deviceFile);
    validateLogicalConstraints(data, '', errors, deviceFile);
    
    return errors;
  } catch (error) {
    // Handle YAML parsing errors
    return [{
      deviceId: 'unknown',
      file: deviceFile,
      message: `Error parsing YAML: ${error.message}`,
      path: '',
      critical: true
    }];
  }
}

/**
 * Main function
 */
async function main() {
  const dataDir = path.resolve(__dirname, '../data/devices');
  
  if (!fs.existsSync(dataDir)) {
    console.error(`Data directory does not exist: ${dataDir}`);
    process.exit(1);
  }
  
  const allErrors = [];
  let fileCount = 0;
  let validFileCount = 0;
  
  // Process each vendor directory
  for (const vendor of fs.readdirSync(dataDir)) {
    const vendorDir = path.join(dataDir, vendor);
    
    // Skip files, only process directories
    if (vendor.includes('.') || !fs.existsSync(vendorDir) || !fs.statSync(vendorDir).isDirectory()) continue;
    
    for (const file of fs.readdirSync(vendorDir)) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        fileCount++;
        const filePath = path.join(vendorDir, file);
        const deviceFile = `${vendor}/${file}`;
        
        console.log(`Validating ${deviceFile}...`);
        const errors = validateDevice(filePath, deviceFile);
        
        if (errors.length === 0) {
          validFileCount++;
          console.log(`✓ ${deviceFile} is valid`);
        } else {
          const criticalErrors = errors.filter(e => e.critical);
          const warnings = errors.filter(e => !e.critical);
          
          if (criticalErrors.length > 0) {
            console.error(`✗ ${deviceFile} has ${criticalErrors.length} critical errors`);
          }
          
          if (warnings.length > 0) {
            console.warn(`⚠ ${deviceFile} has ${warnings.length} warnings`);
          }
          
          allErrors.push(...errors);
        }
      }
    }
  }
  
  // Print summary
  const criticalErrorCount = allErrors.filter(e => e.critical).length;
  const warningCount = allErrors.filter(e => !e.critical).length;
  
  console.log('\n=== Validation Summary ===');
  console.log(`Total files processed: ${fileCount}`);
  console.log(`Valid files: ${validFileCount}`);
  console.log(`Files with issues: ${fileCount - validFileCount}`);
  console.log(`Critical errors: ${criticalErrorCount}`);
  console.log(`Warnings: ${warningCount}`);
  
  // Print detailed errors
  if (allErrors.length > 0) {
    console.log('\n=== Detailed Error Report ===');
    
    // Group errors by file
    const errorsByFile = {};
    for (const error of allErrors) {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    }
    
    // Print errors for each file
    for (const [file, errors] of Object.entries(errorsByFile)) {
      console.log(`\nFile: ${file}`);
      
      // Sort critical errors first
      errors.sort((a, b) => {
        if (a.critical && !b.critical) return -1;
        if (!a.critical && b.critical) return 1;
        return 0;
      });
      
      for (const error of errors) {
        const prefix = error.critical ? '✗ ERROR:' : '⚠ WARNING:';
        console.log(`  ${prefix} ${error.message}`);
        if (error.path) {
          console.log(`    at: ${error.path}`);
        }
      }
    }
    
    // Exit with error code if there are critical errors
    if (criticalErrorCount > 0) {
      console.error('\nValidation failed due to critical errors.');
      process.exit(1);
    } else {
      console.warn('\nValidation complete with warnings only.');
    }
  } else {
    console.log('\nAll files passed validation. ✓');
  }
}

main().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
}); 