export interface MiniPC {
  id: string;
  brand: string;
  model: string;
  release_date: string;
  cpu: {
    brand: string;
    model: string;
    cores: number;
    threads: number;
    base_clock: number;
    boost_clock: number;
    tdp: number;
    chipset?: string; // Optional chipset information
    architecture?: string; // Optional architecture information
  };
  memory: {
    max_capacity: number;
    slots: number;
    type: string;
    speed: number;
    module_type: string; // SODIMM or DIMM
  };
  storage: Array<{
    type: string;
    form_factor: string;
    interface: string;
    max_capacity: number;
  }>;
  networking: {
    ethernet: Array<{
      chipset: string;
      speed: string;
      ports: number;
    }>;
    wifi: {
      chipset: string;
      standard: string;
      bluetooth: string;
    };
  };
  expansion?: {
    pcie_slots?: Array<{
      type: string; // e.g., "x1", "x4", "x16"
      version: string; // e.g., "PCIe 3.0", "PCIe 4.0"
      full_height?: boolean; // Whether it supports full-height cards
      length?: string; // e.g., "half-length", "full-length"
    }>;
    additional_info?: string;
  };
  ports?: {
    usb_a?: number;
    usb_c?: number;
    usb_c_thunderbolt?: number;
    hdmi?: number;
    displayport?: number;
    audio_jack?: number;
    sd_card_reader?: boolean;
    serial?: number;
    other?: string[];
  };
  dimensions?: {
    width: number; // in mm
    depth: number; // in mm
    height: number; // in mm
  };
  power?: {
    adapter_wattage: number; // in watts
    dc_input: string; // voltage specification
  };
  _sourcePath?: string; // Optional field for debugging
  _vendor?: string;
  _device?: string;
} 