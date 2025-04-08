# Contributing to Awesome Mini PC
Thank you for your interest in contributing to Awesome Mini PC! Contributing a device means the device will be added to the [Awesome Mini PC](https://awesomeminipc.com) database once it has been validated.

## Contributing a New Device via GitHub Issues (Recommended)
1. **Create a new issue** using the [New Device](https://github.com/monstermuffin/awesome-mini-pc/issues/new?template=1-new-machine.yml) template.
2. **Fill out the form** with as much accurate information as possible. More about this is below.
3. **Submit the issue**.
4. Automations will generate a properly formatted YAML file for the repository.
5. The data will be validated automatically.
6. If validation succeeds, a PR will be created.
7. After review, your device will be added to the database.

## Understanding the Issue Template Fields
When submitting a new device, you'll need to fill out the following information:

### Device Identification Guidelines
- **Device ID**: A lowercase identifier using hyphens:
  - For a standard model: Use a simple identifier (e.g., `intel-nuc12pro`).
  - For a variant of an existing model: Use the parent ID with a suffix describing the variant (e.g., `minisforum-hx90-5950x`).
  - For a barebones/DIY system: Append `-diy` to the ID (e.g., `asrock-deskmini-b660-diy`).
- **Brand**: The manufacturer (Intel, Beelink, Minisforum, etc.).
- **Model**: The specific model number/name.
- **Release Date**: The year the device was released.

### CPU Information
- **CPU Brand**: Manufacturer of the CPU (Intel, AMD, ARM, etc.).
- **CPU Model**: The specific model of the CPU.
  - For DIY/configurable systems, you can enter "DIY" or specify the range of supported processors
- **CPU TDP**: Thermal Design Power in watts (not required for DIY systems).
- **CPU Cores/Threads**: Number of physical cores and threads (not required for DIY systems).
- **Base/Boost Clock**: CPU frequencies in GHz (not required for DIY systems).
- **CPU Architecture**: Architecture name (Alder Lake, Zen 4, etc.).
- **CPU Socket Type**: For upgradeable systems, what socket is used (LGA1700, AM5, etc.).
  - This is required only for DIY/configurable systems.

### Graphics Information
- **GPU Models**: List each GPU using the format "Type: Integrated/Discrete, Model: GPU Model, VRAM: Amount" (one per line).
  - Example: `Type: Integrated, Model: Intel Iris Pro Graphics 580`
  - Example: `Type: Discrete, Model: NVIDIA RTX 3060, VRAM: 6GB`

### Memory Information
- **Memory Type**: DDR4, DDR5, LPDDR4X, etc.
- **Memory Module Type**: SODIMM, DIMM, or Soldered.
- **Memory Slots**: Number of accessible memory slots (0 if soldered only).
- **Maximum Memory Capacity**: Maximum supported RAM in GB.
- **Memory Speed**: Maximum supported memory speed in MHz.

### Storage Information
- **Storage Details**: List each storage option using the following format (one per line).
  - `Type: M.2, Form Factor: 2280, Interface: PCIe 4.0 x4`
  - `Type: M.2, Form Factor: 2280, Interface: PCIe 3.0 x4, Alt Interface: SATA`
  - `Type: SATA, Form Factor: 2.5"`
  - Use the `Alt Interface` field when a storage slot supports multiple interfaces (e.g., many M.2 slots can operate in either PCIe mode or SATA mode). This helps users understand the full flexibility of the storage options.

### Networking Information
- **Wi-Fi Standard**: Wi-Fi 6, Wi-Fi 6E, etc. (or "None").
- **Wi-Fi Chipset**: Model of the Wi-Fi controller.
- **Bluetooth Version**: Bluetooth version supported.
- **Ethernet Ports**: List each port with format (one per line):
  - `Type: 2.5GbE, Chipset: Intel I225-V, Interface: RJ45`
  - `Type: 10GbE, Chipset: Intel X550-AT2, Interface: SFP+`

### Expansion Information
- **PCIe Slots**: Details about PCIe expansion slots using format (one per line):
  - `Type: PCIe 4.0 x16, Form Factor: Full Height`
  - `Type: PCIe 3.0 x4, Form Factor: M.2 2280`
  - `Type: Mini PCIe, Form Factor: Half Height`
- **OCuLink Ports**: Number and version of OCuLink ports if present (e.g., `1x OCuLink 2.0`).

### Ports Information
- **USB Ports**: List with detailed format (one per line):
  - `Type: USB 3.2 Gen2, Speed: 10Gbps, Count: 2`
  - `Type: USB4, Count: 2, Alt Mode: DisplayPort, Max Resolution: 8K@30Hz, Thunderbolt: 3`
  - `Type: USB-C, Count: 1, Alt Mode: DisplayPort 2.0, Power Delivery: 100W`
- **Display Ports**: List video outputs with format (one per line):
  - `Type: HDMI, Count: 1, Version: 2.1, Form Factor: Full-size, Max Resolution: 8K@60Hz`
  - `Type: DisplayPort, Count: 1, Version: 2.0, Form Factor: Mini, Max Resolution: 4K@144Hz`
- **Audio Jacks**: Number of audio jacks.
- **SD Card Reader**: Whether it has an SD card reader ("Yes"/"No").

### Physical Information
- **Dimensions**: Width x Depth x Height in millimeters (e.g., `211 x 116 x 28`).
- **Power Adapter**: Wattage and voltage information (e.g., `120W (19V/6.32A)`).

### Additional Information
- **Notes**: Notable comments, observations, or special considerations users should be aware of (e.g., "Requires specific riser for PCIE use, SKU: 1234567890"). One per line.

## Contributing a New Device Directly (Advanced)
If you are comfortable with Git and YAML, you can submit devices directly via pull requests:

1. **Fork the repository** to your GitHub account.
2. **Create a new YAML file** in the appropriate manufacturer directory under `data/devices/`. For example, if adding a Dell device, create it in `data/devices/dell/`.
3. **Name the file** using the device ID with `.yaml` extension (e.g., `precision3260.yaml`).
4. **Follow the exact YAML structure**. Use an existing file as a template, and ensure your new device follows the same format, ensuring all required fields are present. (Required fields are marked with a `*` in the issue template.)
5. **Test your YAML** using an online YAML validator before submitting.
6. **Test your device** if you are comfortable with npm, attempt to build the site with your new device using `npm run build`. If this builds successfully, you're _probably_ good to go.
7. **Create a pull request** with a clear title and description of the device you're adding.

### Important Notes for Direct Submissions
- The validation process will reject PRs with incorrect formatting.
- Pay special attention to indentation and data types (strings vs. numbers).
- String values that might be interpreted as numbers or booleans should be quoted.
- Reference existing YAML files in the repository as templates.
- Nested lists and objects must follow the exact structure of the existing device files.

