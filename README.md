# Awesome Mini PC - This project is very much a work in progress.

[![Build Status](https://github.com/monstermuffin/awesome-mini-pcs/actions/workflows/build-deploy.yml/badge.svg)](https://github.com/monstermuffin/awesome-mini-pcs/actions/workflows/build-deploy.yml)
[![Device Count](https://img.shields.io/endpoint?url=https://monstermuffin.github.io/awesome-mini-pcs/stats.json&label=devices&color=blue)](https://github.com/monstermuffin/awesome-mini-pcs/tree/main/data/devices)

This repository contains the data and code for [Awesome Mini PC](https://awesomeminipc.com), an attempt to catalog all the mini PCs, SBCs and egnerally useful homelab/self-hosting machines.

## Why?
I am so fucking fed up of having to search the entire fucking internet just to find out what fucking network controller a manufacturer have used in their own fucking machine. 

Most of the time I end up having to scour Reddit to find this information from people that already have the machine. So, there has to be a better way I keep telling myself, so here we are.

## How It Works
The project consists of:

1. **Data**: Structured YAML files in `data/devices/` containing detailed specifications for each device, organized by manufacturer.
2. **Frontend**: A React-based web application with powerful filtering capabilities to browse and compare devices.
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

## Contributing
Anyone can contribute new device information, I am counting on it for this to be a definitive resource. I've attempted to make the process as simple as possible:

1. Open an issue using the "New Device" template.
2. Fill out the device specifications.
3. Submit the issue.
4. Our automation will handle the rest.

For more detailed contribution guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md).
