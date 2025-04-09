# Contributing to Awesome Mini PC
Thank you for your interest in contributing to Awesome Mini PC. Contributing a device means the device will be added to the [Awesome Mini PC](https://awesomeminipc.com) database once it has been validated.

## Finding Device Information
In order to add a device to the database, accurate information will need to be collected about your device, this includes things like chipset information, port numbers and types, power input etc. The following will help you gather this information.


### Tools for Windows Users:
> [!TIP]
> Using tools like Device Manager, System Information, HWiNFO, CPU-Z, and GPU-Z will simplify gathering accurate hardware details on Windows.

- **Device Manager**: For detailed hardware identification with chipset information.
   - Press `Win+X` and select "Device Manager".
   - Expand categories like "Network adapters", "Display adapters", etc.
   - Right-click on a device and select "Properties" > "Details" > "Hardware Ids" for model numbers.

- **System Information**: For general specifications.
   - Press `Win+R`, type `msinfo32` and press Enter.
   - Navigate through categories to find detailed hardware information.

- **HWiNFO**: A comprehensive hardware information tool.
   - Download from [hwinfo.com](https://www.hwinfo.com/).
   - Provides detailed information about every component.

- **CPU-Z and GPU-Z**: Specialized tools for CPU and GPU details.
   - Download from [cpuid.com](https://www.cpuid.com/softwares/cpu-z.html) and [techpowerup.com](https://www.techpowerup.com/gpuz/).

### Tools for Linux Users:
I've created a bash script that can automatically gather some of the information needed for your submission. To use it:

1. **Download the script**:
   ```bash
   wget https://raw.githubusercontent.com/monstermuffin/awesome-mini-pc/main/scripts/gather-system-info.sh
   ```

2. **Make it executable**:
   ```bash
   chmod +x gather-system-info.sh
   ```

3. **Run with sudo for full information**:
   ```bash
   sudo ./gather-system-info.sh
   ```

> [!IMPORTANT]
> Running the script with `sudo` is required for accessing detailed hardware information.

4. **Review the output**: The script saves all information to `awesome-mini-pc-info.txt` in the current directory.

> [!IMPORTANT]
> The script will attempt to install necessary packages (`pciutils`, `usbutils`, `lshw`, `dmidecode`, `inxi`) if they are missing. Ensure your system's package manager (apt, dnf, yum, pacman, zypper) is configured correctly.

The script will automatically detect:
- System manufacturer and model.
- CPU details (model, cores, architecture, socket).
- GPU information.
- Memory specifications (type, slots, speed).
- Storage devices and interfaces.
- Network controllers (Ethernet, WiFi, Bluetooth).
- Expansion slots.
- USB and port information.

Alternatively, you can manually run these commands:
- `lspci -v`: List PCI devices with detailed information.
- `lsusb -v`: List USB devices with detailed information.
- `lshw -C network`: List network hardware.
- `sudo dmidecode`: System information from BIOS.
- `inxi -Fxxxz`: Comprehensive system information.

Alternatively, alternatively, you can get this information yourself. You're a Linux user, you can figure it out.

### Physical Inspection:
For some details, physical inspection may/will be necessary:
- Count the number and type of ports visually.
- Open the case (if possible) to check memory slots, M.2 slots, etc.
- Look for model numbers printed on chips.
- Check labels on the power adapter for wattage and voltage.

### BIOS/UEFI Settings:
The BIOS/UEFI can provide information about:
- Memory speed and timing capabilities.
- Storage interface options.
- CPU power limits.

## Handling Different Variants of the Same Model
When submitting different variants of the same model:
- **Use the parent ID with a descriptor**: If adding a variant of an existing model, use the parent ID followed by a hyphen and the differentiating feature:
   - Example: For a Minisforum HX90 with a Ryzen 5950X: `hx90-5950x`.
   - Example: For an Intel NUC with a different CPU: `nuc12-i7`.
- **For Barebones/DIY versions**: 
   - Append `-diy` to indicate a configurable version: Example: `deskmini-b660-diy`.
   - Mark the CPU-specific fields as "DIY" or specify the range of supported processors. A DIY system in this context is a system that allows you to add/remove/change the CPU.

## Contributing a New Device via GitHub Issues (Recommended)
> [!TIP]
> Using the GitHub Issue template is the easiest way to contribute, as automation handles the YAML creation and initial validation.

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
> [!NOTE]
> For DIY/barebones systems where the CPU is user-provided, mark CPU-specific fields like TDP, Cores/Threads, and Clock speeds as "DIY" or specify the supported range if known. The `CPU Socket Type` becomes required for these systems.

- **CPU Brand**: Manufacturer of the CPU (Intel, AMD, ARM, etc.).
- **CPU Model**: The specific model of the CPU.
  - For DIY/configurable systems, you can enter "DIY" or specify the range of supported processors
- **CPU TDP**: Thermal Design Power in watts (not required for DIY systems).
- **CPU Cores/Threads**: Number of physical cores and threads (not required for DIY systems).
- **Base/Boost Clock**: CPU frequencies in GHz (not required for DIY systems).
- **CPU Architecture**: Architecture name (Alder Lake, Zen 4, etc.).
- **CPU Socket Type**: For upgradeable systems, what socket is used (LGA1700, AM5, etc.).
  - This is required only for DIY/configurable systems.
- **CPU Core Configuration** (Optional): For heterogeneous CPU architectures (like Intel's hybrid P-core/E-core designs). You can get this information from [Intel Ark.](https://www.intel.com/content/www/us/en/ark.html)
  - List each core type using the format "Type: [Core Type], Count: [Number], Boost Clock: [GHz]"
  - Example: `Type: P-core, Count: 6, Boost Clock: 5.0`
  - Example: `Type: E-core, Count: 8, Boost Clock: 3.6`
  - The total count of all core types should match the CPU Cores value.

### Graphics Information
> [!NOTE]
> List *all* graphics units present (integrated and discrete). Specify VRAM only for discrete GPUs.

- **GPU Models**: List each GPU using the format "Type: Integrated/Discrete, Model: GPU Model, VRAM: Amount" (one per line).
  - Example: `Type: Integrated, Model: Intel Iris Pro Graphics 580`
  - Example: `Type: Discrete, Model: NVIDIA RTX 3060, VRAM: 6GB`

### Memory Information
- **Memory Type**: DDR4, DDR5, LPDDR4X, etc.
- **Memory Module Type**: SODIMM, DIMM, or Soldered.
- **Memory Slots**: Number of accessible memory slots (0 if soldered only).
- **Maximum Memory Capacity**: Maximum supported RAM in GB.
- **Memory Speed**: Maximum supported memory speed in MT/s.

### Storage Information
- **Storage Details**: List each storage option using the following format (one per line).
  - `Type: M.2, Form Factor: 2280, Interface: PCIe 4.0 x4`
  - `Type: M.2, Form Factor: 2280, Interface: PCIe 3.0 x4, Alt Interface: SATA`
  - `Type: SATA, Form Factor: 2.5"`
  - Use the `Alt Interface` field when a storage slot supports multiple interfaces (e.g., many M.2 slots can operate in either PCIe mode or SATA mode). This helps users understand the full flexibility of the storage options.

### Networking Information
> [!NOTE]
> Be specific with WiFi standards (e.g., `WiFi 6E` not just `WiFi 6`) and include the chipset model for both WiFi and Ethernet controllers if known.

- **WiFi Standard**: WiFi 6, WiFi 6E, etc. (or "None"). Leave blank if not supported.
  - Example: `WiFi 6E` for 6GHz support
  - Example: `WiFi 5` for 802.11ac
- **WiFi Chipset**: Model of the WiFi controller.
  - Example: `Intel AX211`
  - Example: `MediaTek MT7921K`
  - Example: `Realtek RTL8852BE`
- **Bluetooth Version**: Bluetooth version supported. Leave blank if not supported.
  - Example: `5.2` for Bluetooth 5.2
  - Example: `4.2` for Bluetooth 4.2
  - You can add additional details in parentheses like `5.3 (LE Audio)` if the device supports specific Bluetooth features
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
> [!NOTE]
> For USB ports, specify the Type (e.g., USB 3.2 Gen2, USB4), Speed (if applicable), Count, and any Alternate Modes (DisplayPort, Power Delivery, Thunderbolt version).

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
- **Dimensions**: Width x Depth x Height in millimeters (e.g., `211 x 116 x 28`). Volume will be calculated automatically from this information.
- **Power Adapter**: Wattage and voltage information (e.g., `120W (19V/6.32A)`).

### Additional Information
- **Notes**: Notable comments, observations, or special considerations users should be aware of (e.g., "Requires specific riser for PCIE use, SKU: 1234567890"). One per line.

## Contributing a New Device Directly (Advanced)
> [!WARNING]
> This method requires familiarity with Git, GitHub Pull Requests, and YAML syntax. Errors in the YAML structure or missing required fields *will* cause the validation checks to fail.

If you are comfortable with Git and YAML, you can submit devices directly via pull requests:

1. **Fork the repository** to your GitHub account.
2. **Create a new YAML file** in the appropriate manufacturer directory under `data/devices/`. For example, if adding a Dell device, create it in `data/devices/dell/`.
3. **Name the file** using the device ID with `.yaml` extension (e.g., `precision3260.yaml`).
4. **Follow the exact YAML structure**. Use an existing file as a template, and ensure your new device follows the same format, ensuring all required fields are present. (Required fields are marked with a `*` in the issue template.)
5. **Test your YAML** using an online YAML validator before submitting.
6. **Test your device** if you are comfortable with npm, attempt to build the site with your new device using `npm run build`. If this builds successfully, you're _probably_ good to go.
7. **Create a pull request** with a clear title and description of the device you're adding.

### Important Notes for Direct Submissions
> [!IMPORTANT]
> - The validation process will reject PRs with incorrect formatting.
> - Pay special attention to indentation and data types (strings vs. numbers).
> - String values that might be interpreted as numbers or booleans should be quoted.
> - Reference existing YAML files in the repository as templates.
> - Nested lists and objects must follow the exact structure of the existing device files.

## Modifying Existing Devices or Correcting Information
If you need to update information for an existing device or correct errors in the database:

1. **Fork the repository** to your GitHub account.
2. **Find the device YAML file** you want to modify in the `data/devices/` directory.
3. **Make the necessary changes** while maintaining the correct YAML structure.
4. **Create a pull request** with:
   - A clear title describing the change (e.g., "Correct memory speed for Dell OptiPlex 7050").
   - A detailed description explaining:
     - What you are changing.
     - Why the change is needed.
     - Evidence supporting the correction (links to official documentation, screenshots, test results, etc.).
5. **Provide proof** whenever possible:
   - For hardware specs, links to manufacturer documentation or screenshots from system information tools.
   - For capabilities, test results or official specifications.
   - For corrections, explain why the current information is incorrect.

### Additional Guidelines for Corrections
> [!IMPORTANT]
> If possible, provide evidence for your corrections. Evidence can be in the form of links to manufacturer documentation, diagnostic tool output, images or outputs from devices you own etc.

- **Minor corrections** (typos, formatting) does not need extensive explanation.
- **Specification changes** require verifiable evidence (e.g., device manual, manufacturer website, diagnostic tool output).
- **Performance-related changes** (e.g., maximum RAM speed, maximum display resolution) should include test results or official documentation.

# Thank You!
Thank you for your contribution.