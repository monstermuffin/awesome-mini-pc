#!/bin/bash

# gather-system-info.sh
# Script to collect hardware information for Awesome Mini PC submissions
# This script automatically gathers hardware details on Linux systems

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}=========================================================${NC}"
echo -e "${BLUE}    Awesome Mini PC - System Information Gatherer${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo
echo -e "${YELLOW}This script will collect hardware information for your mini PC.${NC}"
echo -e "${YELLOW}Some commands require sudo privileges.${NC}"
echo

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}This script should be run with sudo for full information gathering.${NC}"
    echo -e "${YELLOW}Attempting to continue, but some information may be incomplete.${NC}"
    echo
    SUDO_AVAILABLE=false
else
    SUDO_AVAILABLE=true
fi

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

PACKAGES=(
    "pciutils:lspci:PCI device information"
    "usbutils:lsusb:USB device information"
    "lshw:lshw:hardware listing"
    "dmidecode:dmidecode:BIOS information"
    "inxi:inxi:comprehensive system info"
)

install_if_needed() {
    local package=$1
    local command=$2
    local description=$3
    if ! command_exists "$command"; then
        missing_packages+=("$package ($description)")
        if [ "$install_mode" = "auto" ] && [ "$SUDO_AVAILABLE" = true ]; then
            echo -e "${YELLOW}Installing $package...${NC}"
            if command_exists apt-get; then
                sudo apt-get update >/dev/null 2>&1 && sudo apt-get install -y "$package" >/dev/null 2>&1
            elif command_exists dnf; then
                sudo dnf install -y "$package" >/dev/null 2>&1
            elif command_exists yum; then
                sudo yum install -y "$package" >/dev/null 2>&1
            elif command_exists pacman; then
                sudo pacman -Sy --noconfirm "$package" >/dev/null 2>&1
            elif command_exists zypper; then
                sudo zypper install -y "$package" >/dev/null 2>&1
            else
                echo -e "${RED}Could not install $package automatically. Please install it manually.${NC}"
                return 1
            fi
            if [ $? -eq 0 ]; then
                installed_packages+=("$package")
            fi
        else
            return 1
        fi
    fi
    return 0
}

echo -e "${CYAN}This script requires the following packages:${NC}"
for pkg_info in "${PACKAGES[@]}"; do
    IFS=':' read -r package command description <<< "$pkg_info"
    if ! command_exists "$command"; then
        echo -e "  - ${YELLOW}$package${NC} ($description) - ${RED}Not installed${NC}"
    else
        echo -e "  - ${GREEN}$package${NC} ($description) - ${GREEN}Installed${NC}"
    fi
done
echo

if [ "$SUDO_AVAILABLE" = true ]; then
    echo -n -e "${YELLOW}Would you like to automatically install missing packages? [Y/n] ${NC}"
    read -r response
    response=${response:-Y}
    if [[ "$response" =~ ^[Yy]$ ]]; then
        install_mode="auto"
    else
        install_mode="manual"
        echo -e "${YELLOW}Please install missing packages manually and run the script again.${NC}"
    fi
else
    install_mode="manual"
    echo -e "${RED}Cannot install packages without sudo privileges.${NC}"
fi

missing_packages=()
installed_packages=()

echo -e "${CYAN}Checking required tools...${NC}"
for pkg_info in "${PACKAGES[@]}"; do
    IFS=':' read -r package command description <<< "$pkg_info"
    install_if_needed "$package" "$command" "$description" || true
done

if [ ${#installed_packages[@]} -gt 0 ]; then
    echo -e "${GREEN}Installed packages:${NC}"
    for pkg in "${installed_packages[@]}"; do
        echo -e "  - $pkg"
    done
fi

if [ ${#missing_packages[@]} -gt 0 ]; then
    echo -e "${YELLOW}Missing packages (some information may be incomplete):${NC}"
    for pkg in "${missing_packages[@]}"; do
        echo -e "  - $pkg"
    done
fi
echo

get_system_info() {
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}               BASIC DEVICE INFORMATION${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    
    if command_exists dmidecode && [ "$SUDO_AVAILABLE" = true ]; then
        echo -e "${CYAN}System Manufacturer and Model:${NC}"
        sudo dmidecode -t system | grep -E "Manufacturer|Product Name|Version" | sed 's/^\s*//'
    else
        echo -e "${CYAN}System Manufacturer and Model (limited info):${NC}"
        if [ -f /sys/devices/virtual/dmi/id/sys_vendor ]; then
            echo "Manufacturer: $(cat /sys/devices/virtual/dmi/id/sys_vendor)"
        fi
        if [ -f /sys/devices/virtual/dmi/id/product_name ]; then
            echo "Product Name: $(cat /sys/devices/virtual/dmi/id/product_name)"
        fi
        if [ -f /sys/devices/virtual/dmi/id/product_version ]; then
            echo "Version: $(cat /sys/devices/virtual/dmi/id/product_version)"
        fi
    fi
    echo
    
    if command_exists dmidecode && [ "$SUDO_AVAILABLE" = true ]; then
        echo -e "${CYAN}BIOS/Firmware Release Date:${NC}"
        sudo dmidecode -t bios | grep "Release Date" | sed 's/^\s*//'
    fi
    echo
    
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}                   CPU INFORMATION${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    
    echo -e "${CYAN}CPU Information:${NC}"
    if command_exists lscpu; then
        echo "CPU Brand/Model:"
        lscpu | grep -E "Model name|Vendor ID" | sed 's/^\s*//'
        echo
        echo "CPU Architecture and Cores/Threads:"
        lscpu | grep -E "Architecture|CPU\(s\)|Thread|Core\(s\) per socket|Socket\(s\)|Model name" | sed 's/^\s*//'
        echo
        echo "CPU Frequencies:"
        lscpu | grep -E "CPU MHz|CPU max MHz|CPU min MHz" | sed 's/^\s*//'
    fi
    echo
    
    if command_exists dmidecode && [ "$SUDO_AVAILABLE" = true ]; then
        echo -e "${CYAN}CPU Socket:${NC}"
        sudo dmidecode -t processor | grep -E "Socket Designation|Upgrade" | sed 's/^\s*//'
    fi
    echo
    
    echo -e "${CYAN}CPU TDP (estimate):${NC}"
    if command_exists inxi; then
        inxi -C | grep "watts"
    else
        echo "TDP information not available. Please check the CPU specifications online."
    fi
    echo
    
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}                  GPU INFORMATION${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    
    echo -e "${CYAN}GPU Information:${NC}"
    if command_exists lspci; then
        lspci -v | grep -A 12 -E "VGA|3D|Display" | grep -v "Kernel driver" | sed 's/^\s*//'
    fi
    echo
    
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}                 MEMORY INFORMATION${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    
    echo -e "${CYAN}Memory Capacity and Type:${NC}"
    if command_exists dmidecode && [ "$SUDO_AVAILABLE" = true ]; then
        sudo dmidecode -t memory | grep -E "Size|Type:|Speed|Manufacturer|Form Factor|Locator|Configured Memory Speed" | grep -v "No Module Installed" | sed 's/^\s*//'
    else
        free -h | grep Mem
    fi
    echo
    
    echo -e "${CYAN}Memory Slots:${NC}"
    if command_exists dmidecode && [ "$SUDO_AVAILABLE" = true ]; then
        echo "Total slots: $(sudo dmidecode -t memory | grep -c "Memory Device")"
        echo "Used slots: $(sudo dmidecode -t memory | grep -A 16 "Memory Device" | grep -c "Size: [0-9]")"
    fi
    echo
    
    if command_exists dmidecode && [ "$SUDO_AVAILABLE" = true ]; then
        echo -e "${CYAN}Maximum Memory Supported:${NC}"
        sudo dmidecode -t memory | grep "Maximum Capacity" | sed 's/^\s*//'
    fi
    echo
    
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}                STORAGE INFORMATION${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    
    echo -e "${CYAN}Storage Devices:${NC}"
    if command_exists lshw && [ "$SUDO_AVAILABLE" = true ]; then
        sudo lshw -short -C disk,storage | grep -v "network"
        echo
        echo "Storage Details:"
        sudo lshw -class disk -class storage | grep -A 15 -E "disk|storage" | grep -v "network" | grep -E "description|product|vendor|logical name|serial|size|capabilities" | sed 's/^\s*//'
    else
        lsblk -d -o NAME,SIZE,MODEL,TRAN
    fi
    echo
    
    echo -e "${CYAN}Storage Interfaces:${NC}"
    if command_exists lspci; then
        lspci -v | grep -A 5 -E "SATA|AHCI|NVM|RAID" | grep -v "Kernel driver" | sed 's/^\s*//'
    fi
    echo
    
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}               NETWORKING INFORMATION${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    
    echo -e "${CYAN}WiFi and Bluetooth:${NC}"
    if command_exists lspci; then
        lspci -v | grep -A 10 -i "Network controller" | grep -v "Kernel driver" | sed 's/^\s*//'
    fi
    echo
    if command_exists lsusb; then
        lsusb | grep -i "bluetooth\|wireless\|wifi"
    fi
    
    if command_exists lspci; then
        echo
        echo -e "${CYAN}WiFi Standard (estimated):${NC}"
        wifi_chipset=$(lspci -v | grep -i "Network controller" | grep -i "Intel\|Realtek\|Broadcom\|Atheros\|MediaTek")
        
        if [[ $wifi_chipset =~ Intel.*AX ]]; then
            echo "Likely WiFi 6 (802.11ax) based on Intel AX chipset"
        elif [[ $wifi_chipset =~ Intel.*9260 ]]; then
            echo "Likely WiFi 5 (802.11ac) based on Intel 9260 chipset"
        elif [[ $wifi_chipset =~ Intel.*8265 ]]; then
            echo "Likely WiFi 5 (802.11ac) based on Intel 8265 chipset"
        elif [[ $wifi_chipset =~ Intel.*7265 ]]; then
            echo "Likely WiFi 5 (802.11ac) based on Intel 7265 chipset"
        elif [[ $wifi_chipset =~ Intel.*9560 ]]; then
            echo "Likely WiFi 5 (802.11ac) based on Intel 9560 chipset"
        elif [[ $wifi_chipset =~ Realtek.*RTL8822 ]]; then
            echo "Likely WiFi 5 (802.11ac) based on Realtek RTL8822 chipset"
        elif [[ $wifi_chipset =~ Realtek.*RTL8852 ]]; then
            echo "Likely WiFi 6 (802.11ax) based on Realtek RTL8852 chipset"
        elif [[ $wifi_chipset =~ MediaTek.*MT7921 ]]; then
            echo "Likely WiFi 6 (802.11ax) based on MediaTek MT7921 chipset"
        else
            echo "Unable to estimate WiFi standard. Please check manufacturer specifications."
        fi
    fi
    echo
    
    echo -e "${CYAN}Ethernet Controllers:${NC}"
    if command_exists lspci; then
        lspci -v | grep -A 10 -i "Ethernet controller" | grep -v "Kernel driver" | sed 's/^\s*//'
    fi
    echo

    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}              EXPANSION SLOT INFORMATION${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    
    echo -e "${CYAN}PCIe Slots and Expansion:${NC}"
    if command_exists lspci; then
        lspci -vv | grep -A 5 "PCI bridge" | grep -E "Capabilities|LnkCap|Bus:" | sed 's/^\s*//'
    fi
    echo
    if command_exists dmidecode && [ "$SUDO_AVAILABLE" = true ]; then
        echo "Expansion Slots from DMI:"
        sudo dmidecode -t slot | grep -A 8 "System Slot" | grep -v "handle" | sed 's/^\s*//'
    fi
    echo
    
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}                    USB INFORMATION${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    
    echo -e "${CYAN}USB Controllers:${NC}"
    if command_exists lspci; then
        lspci -v | grep -A 7 -i "USB controller" | grep -v "Kernel driver" | sed 's/^\s*//'
    fi
    echo
    
    echo -e "${CYAN}USB Devices:${NC}"
    if command_exists lsusb; then
        lsusb
    fi
    
    if [ "$SUDO_AVAILABLE" = true ] && command_exists lshw; then
        echo
        echo -e "${CYAN}USB Port Count (estimated):${NC}"
        usb2_count=$(sudo lshw -class bus | grep -c "usb@1")
        usb3_count=$(sudo lshw -class bus | grep -c "usb@2\|usb@3")
        echo "USB 2.0 ports: approximately $usb2_count"
        echo "USB 3.x ports: approximately $usb3_count"
        echo "Note: These counts are estimates. Please verify visually."
    fi
    echo
    
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}                  PORT INFORMATION${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    
    echo -e "${CYAN}Display Outputs:${NC}"
    
    if command_exists inxi; then
        inxi -G | grep "Display" -A 5
        echo
    fi
    
    if command_exists xrandr; then
        if [ -n "$DISPLAY" ]; then
            echo "Display outputs from xrandr:"
            xrandr | grep -E " connected|disconnected" | sed 's/\([A-Z0-9-]\+\).*/\1/' | sort
            echo
        fi
    fi
    
    echo "Display outputs from PCI (inferred):"
    if command_exists lspci; then
        vga_controllers=$(lspci | grep -i "VGA\|Display" | wc -l)
        if [ "$vga_controllers" -gt 0 ]; then
            gpu_info=$(lspci | grep -i "VGA\|Display")
            if [[ $gpu_info =~ Intel ]]; then
                if [[ $gpu_info =~ HD\ Graphics\ 6 ]]; then
                    echo "Intel HD Graphics 6xx series typically has: 1x HDMI, 1x DisplayPort"
                elif [[ $gpu_info =~ UHD\ Graphics\ 6 ]]; then
                    echo "Intel UHD Graphics 6xx series typically has: 1x HDMI, 1x DisplayPort"
                elif [[ $gpu_info =~ Iris ]]; then
                    echo "Intel Iris Graphics typically has: 1x HDMI, 1x DisplayPort"
                else
                    echo "Intel GPU detected. Typically has HDMI and DisplayPort outputs."
                fi
            elif [[ $gpu_info =~ NVIDIA ]]; then
                echo "NVIDIA GPU detected. Please check physically for outputs."
            elif [[ $gpu_info =~ AMD ]] || [[ $gpu_info =~ Radeon ]]; then
                echo "AMD GPU detected. Please check physically for outputs."
            else
                echo "Unknown GPU. Please check outputs physically."
            fi
        else
            echo "No dedicated graphics controller detected."
        fi
    fi
    echo "Note: Please verify display outputs visually as this is difficult to detect programmatically."
    echo
    
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}                PHYSICAL INFORMATION${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    
    # Physical dimensions
    echo -e "${CYAN}Physical Dimensions:${NC}"
    echo "Please measure the device manually (width x depth x height in mm)"
    echo
    
    # Power supply
    echo -e "${CYAN}Power Supply Information:${NC}"
    echo "Please check the power adapter label for wattage and voltage information"
    if command_exists inxi; then
        inxi -P
    fi
    echo
    
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}             COMPREHENSIVE SYSTEM REPORT${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    echo
    
    if command_exists inxi; then
        echo -e "${CYAN}Full System Report:${NC}"
        inxi -Fxxxz
    fi
    
    echo
    echo -e "${GREEN}=========================================================${NC}"
    echo -e "${BLUE}             TEMPLATE SUBMISSION SUMMARY${NC}"
    echo -e "${GREEN}=========================================================${NC}"
    echo
    echo -e "${CYAN}This section contains data formatted for easy copying into the submission template:${NC}"
    echo
    
    if command_exists dmidecode && [ "$SUDO_AVAILABLE" = true ]; then
        manufacturer=$(sudo dmidecode -t system | grep -E "Manufacturer" | sed 's/^\s*//' | sed 's/^Manufacturer: //')
        model=$(sudo dmidecode -t system | grep -E "Product Name" | sed 's/^\s*//' | sed 's/^Product Name: //')
    else
        if [ -f /sys/devices/virtual/dmi/id/sys_vendor ]; then
            manufacturer=$(cat /sys/devices/virtual/dmi/id/sys_vendor)
        else
            manufacturer="Unknown"
        fi
        if [ -f /sys/devices/virtual/dmi/id/product_name ]; then
            model=$(cat /sys/devices/virtual/dmi/id/product_name)
        else
            model="Unknown"
        fi
    fi
    
    if command_exists lscpu; then
        cpu_model=$(lscpu | grep "Model name" | sed 's/.*:\s*//')
        cpu_cores=$(lscpu | grep "^CPU(s):" | sed 's/.*:\s*//')
        cpu_threads=$(lscpu | grep "Thread(s) per core" | sed 's/.*:\s*//')
        cpu_threads=$((cpu_cores * cpu_threads))
        cpu_freq=$(lscpu | grep "CPU max MHz" | sed 's/.*:\s*//')
        cpu_freq=$(echo "scale=1; $cpu_freq/1000" | bc)
    else
        cpu_model="Unknown"
        cpu_cores="Unknown"
        cpu_threads="Unknown"
        cpu_freq="Unknown"
    fi
    
    if command_exists dmidecode && [ "$SUDO_AVAILABLE" = true ]; then
        memory_type=$(sudo dmidecode -t memory | grep -m1 "Type:" | grep -v "Unknown" | sed 's/.*: //')
        mem_slots=$(sudo dmidecode -t memory | grep -c "Memory Device")
        max_mem=$(sudo dmidecode -t memory | grep "Maximum Capacity" | sed 's/.*: //')
    else
        memory_type="Unknown"
        mem_slots="Unknown"
        max_mem="Unknown"
    fi
    
    if command_exists lspci; then
        gpu_model=$(lspci | grep -i "VGA\|3D\|Display" | sed 's/.*: //')
    else
        gpu_model="Unknown"
    fi
    
    if command_exists lspci; then
        eth_controller=$(lspci | grep -i "Ethernet controller" | sed 's/.*: //')
        wifi_controller=$(lspci | grep -i "Network controller" | sed 's/.*: //')
    else
        eth_controller="Unknown"
        wifi_controller="Unknown"
    fi
    
    echo "Brand: $manufacturer"
    echo "Model: $model"
    echo "Release Date: (Please check manufacturer's website)"
    echo 
    echo "CPU Brand: $(echo "$cpu_model" | grep -o -E '(Intel|AMD|ARM|Qualcomm)')"
    echo "CPU Model: $cpu_model"
    echo "CPU TDP: (Please check online specifications)"
    echo "CPU Cores: $cpu_cores"
    echo "CPU Threads: $cpu_threads"
    echo "Base/Boost Clock: $cpu_freq GHz"
    echo 
    echo "GPU: Type: Integrated, Model: $gpu_model"
    echo 
    echo "Memory Type: $memory_type"
    echo "Memory Slots: $mem_slots"
    echo "Maximum Memory: $max_mem"
    echo 
    echo "Storage Options: (Please check physical inspection or online specifications)"
    echo 
    echo "Ethernet: $eth_controller"
    echo "WiFi: $wifi_controller"
    echo 
    echo "USB Ports: (Please verify with physical inspection)"
    echo "Display Outputs: (Please verify with physical inspection)"
    echo 
    echo "Dimensions: (Please measure manually in mm)"
    echo "Power Adapter: (Please check label on power adapter)"
    echo
}

get_system_info | tee awesome-mini-pc-info.txt

echo
echo -e "${GREEN}=========================================================${NC}"
echo -e "${BLUE}                   REPORT COMPLETE${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo
echo -e "${YELLOW}Information has been saved to${NC} ${CYAN}awesome-mini-pc-info.txt${NC}"
echo -e "${YELLOW}Please review the information and add it to your Awesome Mini PC submission.${NC}"
echo -e "${YELLOW}Some information may need to be manually verified or measured.${NC}"
echo

if [ ${#installed_packages[@]} -gt 0 ]; then
    echo -e "${GREEN}The following packages were installed:${NC}"
    for pkg in "${installed_packages[@]}"; do
        echo -e "  - $pkg"
    done
    
    echo -n -e "${YELLOW}Would you like to remove these packages? [y/N] ${NC}"
    read -r remove_response
    if [[ "$remove_response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Removing installed packages...${NC}"
        for pkg in "${installed_packages[@]}"; do
            echo -e "Removing $pkg..."
            if command_exists apt-get; then
                sudo apt-get remove -y "$pkg" >/dev/null 2>&1
            elif command_exists dnf; then
                sudo dnf remove -y "$pkg" >/dev/null 2>&1
            elif command_exists yum; then
                sudo yum remove -y "$pkg" >/dev/null 2>&1
            elif command_exists pacman; then
                sudo pacman -R --noconfirm "$pkg" >/dev/null 2>&1
            elif command_exists zypper; then
                sudo zypper remove -y "$pkg" >/dev/null 2>&1
            fi
        done
        echo -e "${GREEN}Packages removed.${NC}"
    else
        echo -e "${GREEN}Packages will be kept installed.${NC}"
    fi
fi 