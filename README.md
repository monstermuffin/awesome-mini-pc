# Awesome Mini PC
[![Build Status](https://github.com/monstermuffin/awesome-mini-pcs/actions/workflows/build-deploy.yml/badge.svg)](https://github.com/monstermuffin/awesome-mini-pcs/actions/workflows/build-deploy.yml)
[![Device Count](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fawesomeminipc.com%2Fstats.json&query=%24.deviceCount&label=devices&color=blue)](https://github.com/monstermuffin/awesome-mini-pcs/tree/main/data/devices)

> [!IMPORTANT]  
> This project is actively under development.

This repository contains the data and code for [Awesome Mini PC](https://awesomeminipc.com), an attempt to catalog all the mini PCs, SBCs and egnerally useful homelab/self-hosting machines.

## Why?
I am so fed up of having to search the entire internet just to find out what network controller a manufacturer have used in their own machine.

Most of the time I end up having to scour Reddit to find this information from people that already have the machine. There has to be a better way, so here we are.

## How It Works
The project consists of:

1. **Data**: Structured YAML files in `data/devices/` containing detailed specifications for each device, organized by manufacturer.
2. **Frontend**: A React-based web application with filtering/comparison capabilities to browse and compare devices.
3. **Contribution Workflow**: GitHub Actions workflows to make contributing new devices easy.

### Data Structure
Each device is stored as a YAML file in its manufacturer's directory with comprehensive specifications including:
- CPU details (model, cores, clock speeds, etc.).
- Memory specifications.
- Storage options.
- Networking capabilities (Ethernet, Wi-Fi, Bluetooth).
- Ports and expansion options.
- Physical dimensions.
- Power requirements.

<!-- WIP_DEVICES_START -->
## Work In Progress / Need Help

*3 devices pending verification. Contributions welcome!*

| Device | CPU | File | Missing Information |
|--------|-----|------|--------------------|
| Topton D14 Gaming Mini PC | Core i5-13500H | `topton/d14-i5-13500h.WIP.yaml` | • Ethernet chipsets: Need exact chipset models for 1GbE port and 2.5GbE port<br>• WiFi chipset: Need exact chipset model for WiFi 6E + BT 5.3 |
| Topton D14 Gaming Mini PC | Core i7-13700H | `topton/d14-i7-13700h.WIP.yaml` | • Ethernet chipsets: Need exact chipset models for 1GbE port and 2.5GbE port<br>• WiFi chipset: Need exact chipset model for WiFi 6E + BT 5.3 |
| Topton D14 Gaming Mini PC | Core i9-13900H | `topton/d14-i9-13900h.WIP.yaml` | • Ethernet chipsets: Need exact chipset models for 1GbE port and 2.5GbE port<br>• WiFi chipset: Need exact chipset model for WiFi 6E + BT 5.3 |

**How to contribute:** If you have detailed specs for any of these devices:
1. Find the exact chipset models from official sources
2. Update the device file with confirmed specifications  
3. Rename from `.WIP.yaml` to `.yaml` to include in the database

<!-- WIP_DEVICES_END -->

## Contributing
Anyone can contribute new device information, I am counting on it for this to be a definitive resource. I've attempted to make the process as simple as possible:

1. Open an issue using the "New Device" template.
2. Fill out the device specifications.
3. Submit the issue.
4. Automations will handle the rest.

> [!TIP]
> For more detailed contribution guidelines, including how to gather information and submit updates, please see [CONTRIBUTING.md](CONTRIBUTING.md).
