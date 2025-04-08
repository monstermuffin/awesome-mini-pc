const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

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
  
  if (data.notes) {
    const notes = data.notes.trim().split('\n');
    for (const note of notes) {
      if (!note.trim().startsWith('-')) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Each note line must start with a dash (-). Invalid line: "${note.trim()}"`,
          path: `${path}.notes`,
          critical: false
        });
      }
    }
  }
  
  if (data.cpu) {
    const requiredCpuFields = ['brand', 'model', 'cores', 'threads', 'base_clock', 'architecture'];
    const isDIYMachine = data.cpu.socket?.supports_cpu_swap === true;

    const fieldsToCheck = isDIYMachine ? ['brand', 'model', 'architecture'] : requiredCpuFields;

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
    
    if (data.cpu.core_config) {
      if (!Array.isArray(data.cpu.core_config.types)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `CPU core_config.types must be an array`,
          path: `${path}.cpu.core_config.types`,
          critical: true
        });
      } else {
        let totalCores = 0;
        data.cpu.core_config.types.forEach((coreType, index) => {
          if (!coreType.type) {
            errors.push({
              deviceId: data.id || 'unknown',
              file: deviceFile,
              message: `Missing core type name in core_config.types[${index}]`,
              path: `${path}.cpu.core_config.types[${index}].type`,
              critical: true
            });
          }
          
          if (coreType.count === undefined || typeof coreType.count !== 'number') {
            errors.push({
              deviceId: data.id || 'unknown',
              file: deviceFile,
              message: `Missing or invalid core count in core_config.types[${index}]`,
              path: `${path}.cpu.core_config.types[${index}].count`,
              critical: true
            });
          } else {
            totalCores += coreType.count;
          }
          
          if (coreType.boost_clock === undefined || typeof coreType.boost_clock !== 'number' || coreType.boost_clock <= 0) {
            errors.push({
              deviceId: data.id || 'unknown',
              file: deviceFile,
              message: `Missing or invalid boost_clock in core_config.types[${index}]`,
              path: `${path}.cpu.core_config.types[${index}].boost_clock`,
              critical: true
            });
          }
        });
        
        if (totalCores !== data.cpu.cores) {
          errors.push({
            deviceId: data.id || 'unknown',
            file: deviceFile,
            message: `Sum of core counts in core_config (${totalCores}) does not match total cores (${data.cpu.cores})`,
            path: `${path}.cpu.core_config`,
            critical: true
          });
        }
      }
    }
  }
  
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
        if (gpu.type && !['Integrated', 'Discrete'].includes(gpu.type)) {
          errors.push({
            deviceId: data.id || 'unknown',
            file: deviceFile,
            message: `Invalid GPU type: ${gpu.type}. Must be either 'Integrated' or 'Discrete'`,
            path: `${path}.gpu[${index}].type`,
            critical: true
          });
        }
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
  if (data.id && typeof data.id !== 'string') {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `id must be a string`,
      path: `${path}.id`,
      critical: true
    });
  }
  
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
  
  if (data.cpu) {
    const isDIYMachine = data.cpu.socket?.supports_cpu_swap === true;

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

    if (data.cpu.tdp !== undefined && (typeof data.cpu.tdp !== 'number' || data.cpu.tdp <= 0)) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `If provided, cpu.tdp must be a positive number`,
        path: `${path}.cpu.tdp`,
        critical: true
      });
    }
  }
  
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
    
    if (data.memory.speed !== undefined && (typeof data.memory.speed !== 'number' || data.memory.speed <= 0)) {
      errors.push({
        deviceId: data.id || 'unknown',
        file: deviceFile,
        message: `memory.speed must be a positive number`,
        path: `${path}.memory.speed`,
        critical: true
      });
    }
  }

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
  if (data.cpu && data.cpu.brand && !VALID_CPU_BRANDS.includes(data.cpu.brand)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Unknown cpu.brand: ${data.cpu.brand}. Known values: ${VALID_CPU_BRANDS.join(', ')}`,
      path: `${path}.cpu.brand`,
      critical: false
    });
  }
  
  if (data.memory && data.memory.type && !VALID_MEMORY_TYPES.includes(data.memory.type)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Unknown memory.type: ${data.memory.type}. Known values: ${VALID_MEMORY_TYPES.join(', ')}`,
      path: `${path}.memory.type`,
      critical: false
    });
  }
  
  if (data.memory && data.memory.module_type && !VALID_MEMORY_MODULE_TYPES.includes(data.memory.module_type)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Unknown memory.module_type: ${data.memory.module_type}. Known values: ${VALID_MEMORY_MODULE_TYPES.join(', ')}`,
      path: `${path}.memory.module_type`,
      critical: false
    });
  }
  
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

  if (data.cpu?.socket?.type && !VALID_CPU_SOCKETS.includes(data.cpu.socket.type)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Unknown cpu.socket.type: ${data.cpu.socket.type}. Known values: ${VALID_CPU_SOCKETS.join(', ')}`,
      path: `${path}.cpu.socket.type`,
      critical: false
    });
  }

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
 * Validates field values against known valid options
 * @param {any} data - The device data
 * @param {string} path - Current path
 * @param {ValidationError[]} errors - Array to append errors to
 * @param {string} deviceFile - File being validated
 */
function validateFieldValues(data, path, errors, deviceFile) {
  if (data.cpu?.brand && !VALID_CPU_BRANDS.includes(data.cpu.brand)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Invalid CPU brand: ${data.cpu.brand}. Must be one of: ${VALID_CPU_BRANDS.join(', ')}`,
      path: `${path}.cpu.brand`,
      critical: true
    });
  }

  if (data.memory?.type && !VALID_MEMORY_TYPES.includes(data.memory.type)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Invalid memory type: ${data.memory.type}. Must be one of: ${VALID_MEMORY_TYPES.join(', ')}`,
      path: `${path}.memory.type`,
      critical: true
    });
  }

  if (data.memory?.module_type && !VALID_MEMORY_MODULE_TYPES.includes(data.memory.module_type)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Invalid memory module type: ${data.memory.module_type}. Must be one of: ${VALID_MEMORY_MODULE_TYPES.join(', ')}`,
      path: `${path}.memory.module_type`,
      critical: true
    });
  }

  if (data.storage && Array.isArray(data.storage)) {
    data.storage.forEach((storage, index) => {
      if (storage.type && !VALID_STORAGE_TYPES.includes(storage.type)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Invalid storage type: ${storage.type}. Must be one of: ${VALID_STORAGE_TYPES.join(', ')}`,
          path: `${path}.storage[${index}].type`,
          critical: true
        });
      }
    });
  }

  if (data.networking?.wifi?.standard && !VALID_WIFI_STANDARDS.includes(data.networking.wifi.standard)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Invalid WiFi standard: ${data.networking.wifi.standard}. Must be one of: ${VALID_WIFI_STANDARDS.join(', ')}`,
      path: `${path}.networking.wifi.standard`,
      critical: true
    });
  }

  if (data.networking?.ethernet && Array.isArray(data.networking.ethernet)) {
    data.networking.ethernet.forEach((eth, index) => {
      if (eth.speed && !VALID_ETHERNET_SPEEDS.includes(eth.speed)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Invalid ethernet speed: ${eth.speed}. Must be one of: ${VALID_ETHERNET_SPEEDS.join(', ')}`,
          path: `${path}.networking.ethernet[${index}].speed`,
          critical: true
        });
      }
      if (eth.interface && !VALID_ETHERNET_INTERFACES.includes(eth.interface)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Invalid ethernet interface: ${eth.interface}. Must be one of: ${VALID_ETHERNET_INTERFACES.join(', ')}`,
          path: `${path}.networking.ethernet[${index}].interface`,
          critical: true
        });
      }
    });
  }

  if (data.cpu?.socket?.type && !VALID_CPU_SOCKETS.includes(data.cpu.socket.type)) {
    errors.push({
      deviceId: data.id || 'unknown',
      file: deviceFile,
      message: `Invalid CPU socket type: ${data.cpu.socket.type}. Must be one of: ${VALID_CPU_SOCKETS.join(', ')}`,
      path: `${path}.cpu.socket.type`,
      critical: true
    });
  }

  if (data.expansion?.oculink_ports && Array.isArray(data.expansion.oculink_ports)) {
    data.expansion.oculink_ports.forEach((port, index) => {
      if (port.version && !VALID_OCULINK_VERSIONS.includes(port.version)) {
        errors.push({
          deviceId: data.id || 'unknown',
          file: deviceFile,
          message: `Invalid OCuLink version: ${port.version}. Must be one of: ${VALID_OCULINK_VERSIONS.join(', ')}`,
          path: `${path}.expansion.oculink_ports[${index}].version`,
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
    
    validateRequiredFields(data, '', errors, deviceFile);
    validateDataTypes(data, '', errors, deviceFile);
    validateEnumValues(data, '', errors, deviceFile);
    validateLogicalConstraints(data, '', errors, deviceFile);
    validateFieldValues(data, '', errors, deviceFile);
    
    return errors;
  } catch (error) {
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
 * Main validation function that processes all device files
 * @returns {Promise<ValidationError[]>}
 */
async function validateAllDevices() {
  const errors = [];
  const deviceDirs = ['intel', 'asrock', 'beelink', 'minisforum'];
  
  for (const brand of deviceDirs) {
    const brandPath = path.join(__dirname, '..', 'data', 'devices', brand);
    if (!fs.existsSync(brandPath)) continue;
    
    const files = fs.readdirSync(brandPath)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
      
    for (const file of files) {
      const filePath = path.join(brandPath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = yaml.load(content);
        
        validateRequiredFields(data, '', errors, filePath);
        validateFieldValues(data, '', errors, filePath);
        
      } catch (error) {
        errors.push({
          deviceId: path.basename(file, path.extname(file)),
          file: filePath,
          message: `Failed to parse YAML: ${error.message}`,
          path: '',
          critical: true
        });
      }
    }
  }
  
  return errors;
}

if (require.main === module) {
  validateAllDevices().then(errors => {
    if (errors.length > 0) {
      console.log(JSON.stringify(errors, null, 2));
      process.exit(1);
    } else {
      console.log('No validation errors found.');
      process.exit(0);
    }
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = {
  validateAllDevices,
  validateRequiredFields,
  validateFieldValues
}; 