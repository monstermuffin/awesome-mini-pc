import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Box,
} from '@mui/material';
import { useState } from 'react';
import type { MiniPC } from '../types/minipc';

interface MiniPCTableProps {
  devices: MiniPC[];
}

type SortKey = keyof MiniPC | 'cpu.cores' | 'cpu.tdp' | 'memory.speed' | 'cpu.model' | 'memory.type';

type SortConfig = {
  key: SortKey;
  direction: 'asc' | 'desc';
};

export function MiniPCTable({ devices }: MiniPCTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'brand',
    direction: 'asc',
  });

  const getSortValue = (device: MiniPC, key: SortKey): string | number => {
    switch (key) {
      case 'cpu.cores':
        return device.cpu.cores;
      case 'cpu.tdp':
        return device.cpu.tdp;
      case 'memory.speed':
        return device.memory.speed;
      case 'cpu.model':
        return device.cpu.model;
      case 'memory.type':
        return device.memory.type;
      default:
        return device[key] as string;
    }
  };

  const sortedDevices = [...devices].sort((a, b) => {
    const aValue = getSortValue(a, sortConfig.key);
    const bValue = getSortValue(b, sortConfig.key);
    
    if (aValue === bValue) return 0;
    
    const modifier = sortConfig.direction === 'asc' ? 1 : -1;
    return aValue > bValue ? modifier : -modifier;
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const renderSortLabel = (label: string, key: SortKey) => (
    <TableSortLabel
      active={sortConfig.key === key}
      direction={sortConfig.key === key ? sortConfig.direction : 'asc'}
      onClick={() => handleSort(key)}
    >
      {label}
    </TableSortLabel>
  );

  return (
    <Paper elevation={0}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {devices.length} {devices.length === 1 ? 'result' : 'results'}
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{renderSortLabel('Brand', 'brand')}</TableCell>
              <TableCell>{renderSortLabel('Model', 'model')}</TableCell>
              <TableCell>{renderSortLabel('CPU', 'cpu.model')}</TableCell>
              <TableCell align="right">{renderSortLabel('Cores', 'cpu.cores')}</TableCell>
              <TableCell align="right">{renderSortLabel('TDP', 'cpu.tdp')}</TableCell>
              <TableCell>{renderSortLabel('Memory', 'memory.type')}</TableCell>
              <TableCell align="right">{renderSortLabel('Speed', 'memory.speed')}</TableCell>
              <TableCell>Storage</TableCell>
              <TableCell>Networking</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDevices.map((device) => (
              <TableRow key={device.id} hover>
                <TableCell>{device.brand}</TableCell>
                <TableCell>{device.model}</TableCell>
                <TableCell>
                  <Typography variant="body2" component="div">
                    {device.cpu.brand} {device.cpu.model}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {device.cpu.base_clock}GHz - {device.cpu.boost_clock}GHz
                  </Typography>
                </TableCell>
                <TableCell align="right">{device.cpu.cores}</TableCell>
                <TableCell align="right">{device.cpu.tdp}W</TableCell>
                <TableCell>
                  <Typography variant="body2" component="div">
                    {device.memory.type}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max {device.memory.max_capacity}GB
                  </Typography>
                </TableCell>
                <TableCell align="right">{device.memory.speed}MHz</TableCell>
                <TableCell>
                  {device.storage.map((storage, index) => (
                    <Typography key={index} variant="body2" component="div">
                      {storage.type} ({storage.interface})
                      <Typography variant="caption" color="text.secondary" component="div">
                        Max {storage.max_capacity}GB
                      </Typography>
                    </Typography>
                  ))}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" component="div">
                    {device.networking.wifi.standard}
                  </Typography>
                  {device.networking.ethernet.map((eth, index) => (
                    <Typography key={index} variant="caption" color="text.secondary" component="div">
                      {eth.speed} ({eth.ports}x)
                    </Typography>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
} 