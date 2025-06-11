#!/usr/bin/env python3
import argparse
import os
import re
import sys
import yaml


def normalize_cpu_model(cpu_brand, cpu_model):
    if not cpu_model:
        return cpu_model
    
    if cpu_brand == "Intel":
        intel_core_regex = r'^i[3579]-\d+'
        if re.match(intel_core_regex, cpu_model) and not cpu_model.startswith("Core"):
            return f"Core {cpu_model}"
    
    return cpu_model


def parse_core_config(core_config):
    if not core_config or core_config == 'No response':
        return None
    
    types = []
    lines = [line.strip() for line in core_config.split('\n') if line.strip()]
    
    for line in lines:
        core_data = {}
        parts = [p.strip() for p in line.split(',')]
        
        for part in parts:
            if not part or ':' not in part:
                continue
                
            key, value = [x.strip() for x in part.split(':', 1)]
            key_lower = key.lower()
            
            if key_lower == 'type':
                core_data['type'] = value
            elif key_lower == 'count':
                try:
                    core_data['count'] = int(value)
                except ValueError:
                    continue
            elif key_lower == 'boost clock':
                try:
                    core_data['boost_clock'] = float(value)
                except ValueError:
                    continue
        
        if 'type' in core_data and 'count' in core_data and 'boost_clock' in core_data:
            types.append(core_data)
    
    return {"types": types} if types else None


def parse_issue_form(issue_body):
    if not issue_body:
        raise ValueError('Issue body is empty')

    lines = issue_body.split('\n')
    extracted_data = {}
    
    field_mapping = {
        'Device ID': 'id',
        'Brand': 'brand',
        'Model': 'model',
        'Release Date': 'release_date',
        'CPU Brand': 'cpu_brand',
        'CPU Model': 'cpu_model',
        'CPU TDP (Watts)': 'cpu_tdp',
        'CPU Cores': 'cpu_cores',
        'CPU Threads': 'cpu_threads',
        'Base Clock (GHz)': 'base_clock',
        'Boost Clock (GHz)': 'boost_clock',
        'CPU Architecture': 'cpu_architecture',
        'CPU Socket Type': 'cpu_socket_type',
        'Core Configuration': 'cpu_core_config',
        'GPU Models': 'gpu_models',
        'Memory Type': 'memory_type',
        'Memory Module Type': 'memory_module_type',
        'Memory Slots': 'memory_slots',
        'Maximum Memory Capacity (GB)': 'memory_max',
        'Memory Speed (MT/s)': 'memory_speed',
        'Storage Details': 'storage_details',
        'WiFi Standard': 'wifi_standard',
        'WiFi Chipset': 'wifi_chipset',
        'Bluetooth Version': 'bluetooth_version',
        'Ethernet Ports': 'ethernet_ports',
        'PCIe Slots': 'pcie_slots',
        'OCuLink Ports': 'oculink_ports',
        'SIM Card Slots': 'sim_slots',
        'mPCIe Slots': 'mpcie_slots',
        'USB Ports': 'usb_ports',
        'Display Ports': 'display_ports',
        'Audio Jacks': 'audio_jacks',
        'SD Card Reader': 'sd_card_reader',
        'Micro SD Card Reader': 'micro_sd_card_reader',
        'Serial Ports': 'serial_ports',
        'IR Receiver': 'ir_receiver',
        'Dimensions (mm)': 'dimensions',
        'Power Adapter': 'power_adapter',
        'Additional Information': 'additional_info'
    }

    current_field = None
    current_value = []

    for line in lines:
        line = line.strip()
        
        if not line or line == 'Description' or line == 'Submission Confirmation':
            continue

        if line.startswith('### '):
            if current_field and current_value:
                field_name = field_mapping.get(current_field)
                if field_name:
                    extracted_data[field_name] = '\n'.join(current_value).strip()
            
            current_field = line[4:]
            current_value = []
            continue

        if line == '_No response_':
            continue

        if current_field and not line.startswith('- [x]'):
            current_value.append(line)

    if current_field and current_value:
        field_name = field_mapping.get(current_field)
        if field_name:
            extracted_data[field_name] = '\n'.join(current_value).strip()

    return extracted_data


def create_device_yaml(extracted_data):
    device_id = f"{extracted_data['brand'].lower()}-{extracted_data['id'].lower()}"
    
    structured_data = {
        "id": device_id,
        "brand": extracted_data['brand'],
        "model": extracted_data['model'],
        "release_date": extracted_data['release_date'],

        "cpu": {
            "brand": extracted_data['cpu_brand'],
            "model": normalize_cpu_model(extracted_data['cpu_brand'], extracted_data['cpu_model']),
            "tdp": float(extracted_data['cpu_tdp']) if extracted_data.get('cpu_tdp') else None,
            "cores": int(extracted_data['cpu_cores']),
            "threads": int(extracted_data['cpu_threads']),
            "base_clock": float(extracted_data['base_clock']),
            "architecture": extracted_data['cpu_architecture']
        }
    }
    
    if extracted_data.get('boost_clock') and extracted_data['boost_clock'] != 'No response':
        structured_data['cpu']['boost_clock'] = float(extracted_data['boost_clock'])
    
    if 'cpu_socket_type' in extracted_data and extracted_data['cpu_socket_type'] != 'None':
        structured_data['cpu']['socket'] = {
            "type": extracted_data['cpu_socket_type'],
            "supports_cpu_swap": False
        }
    
    if 'cpu_core_config' in extracted_data and extracted_data['cpu_core_config'] != 'No response':
        core_config = parse_core_config(extracted_data['cpu_core_config'])
        if core_config:
            structured_data['cpu']['core_config'] = core_config
    
    if 'gpu_models' in extracted_data:
        gpu_data = []
        for line in extracted_data['gpu_models'].split('\n'):
            if line.strip().startswith('Type:'):
                gpu = {}
                parts = [p.strip() for p in line.split(',')]
                for part in parts:
                    if not part.strip():
                        continue
                    key, value = [x.strip() for x in part.split(':', 1)]
                    key_lower = key.lower()
                    if key_lower == 'type':
                        gpu['type'] = value
                    elif key_lower == 'model':
                        gpu['model'] = value
                    elif key_lower == 'vram':
                        gpu['vram'] = value
                gpu_data.append(gpu)
        
        if gpu_data:
            structured_data['gpu'] = gpu_data
    
    structured_data['memory'] = {
        "slots": int(extracted_data['memory_slots']),
        "type": extracted_data['memory_type'],
        "speed": float(extracted_data['memory_speed']),
        "module_type": extracted_data['memory_module_type'],
        "max_capacity": int(extracted_data['memory_max'])
    }
    
    if 'storage_details' in extracted_data:
        storage_data = []
        for line in extracted_data['storage_details'].split('\n'):
            if line.strip().startswith('Type:'):
                storage = {}
                parts = [p.strip() for p in line.split(',')]
                for part in parts:
                    if not part.strip():
                        continue
                    key, value = [x.strip() for x in part.split(':', 1)]
                    key_lower = key.lower()
                    if key_lower == 'type':
                        storage['type'] = value
                    elif key_lower == 'form factor':
                        storage['form_factor'] = value
                    elif key_lower == 'interface':
                        storage['interface'] = value
                    elif key_lower == 'alt interface':
                        storage['alt_interface'] = value
                
                if storage.get('type') == 'SATA' and 'interface' not in storage:
                    storage['interface'] = 'SATA'
                
                storage_data.append(storage)
        
        if storage_data:
            structured_data['storage'] = storage_data
    
    networking = {"ethernet": [], "wifi": {"standard": "None", "chipset": "None", "bluetooth": "None"}}
    
    if 'ethernet_ports' in extracted_data:
        for line in extracted_data['ethernet_ports'].split('\n'):
            if line.strip().startswith('Type:'):
                eth = {"ports": 1}
                parts = [p.strip() for p in line.split(',')]
                for part in parts:
                    if not part.strip():
                        continue
                    key, value = [x.strip() for x in part.split(':', 1)]
                    key_lower = key.lower()
                    if key_lower == 'type':
                        eth['speed'] = value
                    elif key_lower == 'chipset':
                        eth['chipset'] = value
                    elif key_lower == 'interface':
                        eth['interface'] = value
                networking['ethernet'].append(eth)
    
    if 'wifi_standard' in extracted_data and extracted_data['wifi_standard'] != 'No response':
        networking['wifi']['standard'] = extracted_data['wifi_standard'].replace("Wi-Fi ", "WiFi ")
        
    if 'wifi_chipset' in extracted_data and extracted_data['wifi_chipset'] != 'No response':
        networking['wifi']['chipset'] = extracted_data['wifi_chipset'] 
        
    if 'bluetooth_version' in extracted_data and extracted_data['bluetooth_version'] != 'No response':
        networking['wifi']['bluetooth'] = extracted_data['bluetooth_version']
    
    structured_data['networking'] = networking
    
    ports = {}
    
    if 'usb_ports' in extracted_data:
        usb_a = []
        usb_c = []
        
        for line in extracted_data['usb_ports'].split('\n'):
            if line.strip().startswith('Type:'):
                port = {}
                parts = [p.strip() for p in line.split(',')]
                for part in parts:
                    if not part.strip():
                        continue
                    key, value = [x.strip() for x in part.split(':', 1)]
                    key_lower = key.lower()
                    if key_lower == 'type':
                        port['type'] = value
                    elif key_lower == 'speed':
                        port['speed'] = value
                    elif key_lower == 'count':
                        port['count'] = int(value)
                    elif key_lower == 'alt mode':
                        port['alt_mode'] = value
                    elif key_lower == 'max resolution':
                        port['max_resolution'] = value
                    elif key_lower == 'thunderbolt':
                        port['thunderbolt_version'] = value
                
                if port.get('type') and ('type-c' in port['type'].lower() or 'usb-c' in port['type'].lower() or 'usb4' in port['type'].lower()):
                    usb_c.append(port)
                else:
                    usb_a.append(port)
        
        if usb_a:
            ports['usb_a'] = usb_a
        if usb_c:
            ports['usb_c'] = usb_c
    
    if 'display_ports' in extracted_data:
        hdmi_ports = []
        dp_ports = []
        
        for line in extracted_data['display_ports'].split('\n'):
            if line.strip().startswith('Type:'):
                port = {}
                parts = [p.strip() for p in line.split(',')]
                for part in parts:
                    if not part.strip():
                        continue
                    key, value = [x.strip() for x in part.split(':', 1)]
                    key_lower = key.lower()
                    if key_lower == 'type':
                        port['type'] = value
                    elif key_lower == 'count':
                        port['count'] = int(value)
                    elif key_lower == 'version':
                        port['version'] = value
                    elif key_lower == 'form factor':
                        port['form_factor'] = value
                    elif key_lower == 'max resolution':
                        port['max_resolution'] = value
                
                if port.get('type') and 'hdmi' in port['type'].lower():
                    hdmi_ports.append(port)
                elif port.get('type') and 'displayport' in port['type'].lower():
                    dp_ports.append(port)
        
        if hdmi_ports:
            ports['hdmi'] = hdmi_ports[0]
        if dp_ports:
            ports['displayport'] = dp_ports[0]
    
    if 'audio_jacks' in extracted_data and extracted_data['audio_jacks'] != 'None':
        ports['audio_jack'] = int(extracted_data['audio_jacks'])
    
    if 'sd_card_reader' in extracted_data and extracted_data['sd_card_reader'] != 'None':
        ports['sd_card_reader'] = extracted_data['sd_card_reader'] == 'Yes'
    
    if 'micro_sd_card_reader' in extracted_data and extracted_data['micro_sd_card_reader'] != 'None':
        ports['micro_sd_card_reader'] = extracted_data['micro_sd_card_reader'] == 'Yes'
    
    if 'ir_receiver' in extracted_data and extracted_data['ir_receiver'] != 'None':
        ports['ir_receiver'] = extracted_data['ir_receiver'] == 'Yes'
    
    # Process serial ports
    if 'serial_ports' in extracted_data and extracted_data['serial_ports'] and extracted_data['serial_ports'] != 'No response':
        for line in extracted_data['serial_ports'].split('\n'):
            if line.strip().startswith('Count:') or line.strip().startswith('- Count:'):
                serial_info = {}
                parts = [p.strip() for p in line.replace('- ', '').split(',')]
                for part in parts:
                    if not part.strip():
                        continue
                    key, value = [x.strip() for x in part.split(':', 1)]
                    key_lower = key.lower()
                    if key_lower == 'count':
                        serial_info['count'] = int(value)
                    elif key_lower == 'type':
                        serial_info['type'] = value
                
                if 'count' in serial_info and 'type' in serial_info:
                    ports['serial'] = serial_info
                    break
    
    structured_data['ports'] = ports
    
    # Process expansion features
    expansion = {}
    
    # Process SIM slots
    if 'sim_slots' in extracted_data and extracted_data['sim_slots'] and extracted_data['sim_slots'] != 'No response':
        sim_slots = []
        for line in extracted_data['sim_slots'].split('\n'):
            if line.strip().startswith('Type:') or line.strip().startswith('- Type:'):
                sim_slot = {}
                parts = [p.strip() for p in line.replace('- ', '').split(',')]
                for part in parts:
                    if not part.strip():
                        continue
                    key, value = [x.strip() for x in part.split(':', 1)]
                    key_lower = key.lower()
                    if key_lower == 'type':
                        sim_slot['type'] = value
                    elif key_lower == 'count':
                        sim_slot['count'] = int(value)
                
                if 'type' in sim_slot and 'count' in sim_slot:
                    sim_slots.append(sim_slot)
        
        if sim_slots:
            expansion['sim_slots'] = sim_slots
    
    # Process mPCIe slots
    if 'mpcie_slots' in extracted_data and extracted_data['mpcie_slots'] and extracted_data['mpcie_slots'] != 'No response':
        mpcie_slots = []
        for line in extracted_data['mpcie_slots'].split('\n'):
            if line.strip().startswith('Count:') or line.strip().startswith('- Count:'):
                mpcie_slot = {}
                parts = [p.strip() for p in line.replace('- ', '').split(',')]
                for part in parts:
                    if not part.strip():
                        continue
                    key, value = [x.strip() for x in part.split(':', 1)]
                    key_lower = key.lower()
                    if key_lower == 'count':
                        mpcie_slot['count'] = int(value)
                    elif key_lower == 'type':
                        mpcie_slot['type'] = value
                    elif key_lower == 'note':
                        mpcie_slot['note'] = value
                
                if 'count' in mpcie_slot and 'type' in mpcie_slot:
                    mpcie_slots.append(mpcie_slot)
        
        if mpcie_slots:
            expansion['mpcie_slots'] = mpcie_slots
    
    # Process existing expansion features (PCIe slots, OCuLink ports)
    if 'pcie_slots' in extracted_data and extracted_data['pcie_slots'] and extracted_data['pcie_slots'] != 'No response':
        pcie_slots = []
        for line in extracted_data['pcie_slots'].split('\n'):
            if line.strip().startswith('Type:') or line.strip().startswith('- Type:'):
                pcie_slot = {}
                parts = [p.strip() for p in line.replace('- ', '').split(',')]
                for part in parts:
                    if not part.strip():
                        continue
                    key, value = [x.strip() for x in part.split(':', 1)]
                    key_lower = key.lower()
                    if key_lower == 'type':
                        pcie_slot['type'] = value
                        pcie_slot['version'] = value.split()[-1] if 'PCIe' in value else '3.0'
                    elif key_lower == 'form factor':
                        pcie_slot['form_factor'] = value
                
                if 'type' in pcie_slot:
                    pcie_slots.append(pcie_slot)
        
        if pcie_slots:
            expansion['pcie_slots'] = pcie_slots
    
    if 'oculink_ports' in extracted_data and extracted_data['oculink_ports'] and extracted_data['oculink_ports'] != 'No response':
        # Parse OCuLink format like "1x OCuLink 2.0"
        match = re.search(r'(\d+)x?\s*(OCuLink\s*\d+\.\d+)', extracted_data['oculink_ports'])
        if match:
            count = int(match.group(1))
            version = match.group(2)
            expansion['oculink_ports'] = [{'version': version} for _ in range(count)]
    
    if expansion:
        structured_data['expansion'] = expansion
    
    if 'dimensions' in extracted_data:
        try:
            width, depth, height = [float(d.strip()) for d in extracted_data['dimensions'].split('x')]
            structured_data['dimensions'] = {
                "width": width,
                "depth": depth,
                "height": height
            }
        except ValueError:
            pass
    
    if 'power_adapter' in extracted_data:
        match = re.match(r'(\d+(?:\.\d+)?)W.*?(\d+(?:\.\d+)?)[vV].*?(\d+(?:\.\d+)?)A', extracted_data['power_adapter'])
        power_data = {"adapter_wattage": float(match.group(1)) if match else float(re.search(r'\d+', extracted_data['power_adapter']).group())}
        
        if match:
            power_data['dc_input'] = f"{match.group(2)}V/{match.group(3)}A"
        
        structured_data['power'] = power_data
    
    return {k: v for k, v in structured_data.items() if v is not None}


def write_yaml_file(data, output_directory):
    brand_dir = os.path.join(output_directory, data['brand'].lower())
    os.makedirs(brand_dir, exist_ok=True)
    file_path = os.path.join(brand_dir, f"{data['id'].split('-', 1)[1]}.yaml")
    
    with open(file_path, 'w') as f:
        yaml.dump(data, f, default_flow_style=False, sort_keys=False, width=120)
    
    return file_path


def main():
    parser = argparse.ArgumentParser(description='Process GitHub issue form into a device YAML file')
    parser.add_argument('input_file', help='Input file containing the issue body')
    parser.add_argument('--output-dir', default='data/devices', help='Output directory for the YAML file')
    args = parser.parse_args()
    
    try:
        with open(args.input_file, 'r') as f:
            issue_body = f.read()
        
        extracted_data = parse_issue_form(issue_body)
        structured_data = create_device_yaml(extracted_data)
        file_path = write_yaml_file(structured_data, args.output_dir)
        
        print(f"Successfully created YAML file: {file_path}")
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main()) 