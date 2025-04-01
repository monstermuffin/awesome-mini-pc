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
  };
  memory: {
    max_capacity: number;
    slots: number;
    type: string;
    speed: number;
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
  _sourcePath?: string; // Optional field for debugging
  _vendor?: string;
  _device?: string;
} 