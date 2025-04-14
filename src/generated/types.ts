// Generated by build-data.cjs - DO NOT EDIT MANUALLY
export const BRANDS = ["GMKTec","Intel","Minisforum"] as const;
export const CPU_BRANDS = ["AMD","Intel"] as const;
export const MEMORY_TYPES = ["DDR3L","DDR4","DDR5"] as const;
export const MEMORY_MODULE_TYPES = ["SO-DIMM","SODIMM"] as const;
export const WIFI_STANDARDS = ["None","WiFi 5","WiFi 6","WiFi 6E"] as const;
export const ETHERNET_SPEEDS = ["10GbE","1GbE","2.5GbE"] as const;
export const STORAGE_TYPES = ["M.2","SATA"] as const;
export const STORAGE_INTERFACES = ["PCIe 2.0 x4","PCIe 3.0","PCIe 3.0 x2","PCIe 3.0 x4","PCIe 4.0","PCIe 4.0 x1","PCIe 4.0 x4","SATA"] as const;

export type Brand = typeof BRANDS[number];
export type CpuBrand = typeof CPU_BRANDS[number];
export type MemoryType = typeof MEMORY_TYPES[number];
export type MemoryModuleType = typeof MEMORY_MODULE_TYPES[number];
export type WifiStandard = typeof WIFI_STANDARDS[number];
export type EthernetSpeed = typeof ETHERNET_SPEEDS[number];
export type StorageType = typeof STORAGE_TYPES[number];
export type StorageInterface = typeof STORAGE_INTERFACES[number];

export const RANGES = {
  "tdp": {
    "min": 15,
    "max": 105
  },
  "cores": {
    "min": 2,
    "max": 14
  },
  "memorySpeed": {
    "min": 1866,
    "max": 5200
  },
  "volume": {
    "min": 0.53,
    "max": 1.78
  }
} as const;
