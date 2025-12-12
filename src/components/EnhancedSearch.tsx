import { useState, useEffect, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Popper,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import type { MiniPC } from '../types/minipc';

interface EnhancedSearchProps {
  devices: MiniPC[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

interface SearchSuggestion {
  text: string;
  type: 'brand' | 'model' | 'cpu' | 'gpu' | 'recent';
  device?: MiniPC;
}

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'awesome-mini-pc-recent-searches';

export function EnhancedSearch({
  devices,
  searchQuery,
  onSearchChange,
  placeholder = "Search mini PCs..."
}: EnhancedSearchProps) {
  const theme = useTheme();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== query);
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save recent search:', error);
      }
      return updated;
    });
  };

  // Generate search suggestions
  const suggestions = useMemo((): SearchSuggestion[] => {
    const suggs: SearchSuggestion[] = [];

    // Add recent searches first
    recentSearches.forEach(search => {
      suggs.push({
        text: search,
        type: 'recent',
      });
    });

    // Add unique brands
    const brands = [...new Set(devices.map(d => d.brand))].sort();
    brands.forEach(brand => {
      if (!suggs.some(s => s.text.toLowerCase() === brand.toLowerCase())) {
        suggs.push({
          text: brand,
          type: 'brand',
        });
      }
    });

    // Add popular models (limit to avoid overwhelming)
    const models = devices
      .map(d => `${d.brand} ${d.model}`)
      .filter((model, index, arr) => arr.indexOf(model) === index)
      .slice(0, 20);
    models.forEach(model => {
      suggs.push({
        text: model,
        type: 'model',
      });
    });

    // Add CPU models
    const cpus = [...new Set(devices.map(d => d.cpu.model))].slice(0, 15);
    cpus.forEach(cpu => {
      suggs.push({
        text: cpu,
        type: 'cpu',
      });
    });

    // Add GPU models
    const gpus = [...new Set(
      devices
        .flatMap(d => d.gpu || [])
        .map(g => g.model)
    )].slice(0, 15);
    gpus.forEach(gpu => {
      suggs.push({
        text: gpu,
        type: 'gpu',
      });
    });

    return suggs;
  }, [devices, recentSearches]);

  // Filter suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return suggestions.slice(0, 8); // Show first 8 when no query
    }

    const query = searchQuery.toLowerCase();
    return suggestions
      .filter(sugg =>
        sugg.text.toLowerCase().includes(query) ||
        sugg.text.toLowerCase().startsWith(query)
      )
      .slice(0, 10); // Limit results
  }, [suggestions, searchQuery]);

  const handleInputChange = (_: any, value: string) => {
    onSearchChange(value);
  };

  const handleOptionSelect = (_: any, option: SearchSuggestion | string | null) => {
    if (option === null) return;
    const query = typeof option === 'string' ? option : option.text;
    onSearchChange(query);
    saveRecentSearch(query);
    setIsOpen(false);
  };

  const handleClearSearch = () => {
    onSearchChange('');
    setIsOpen(false);
  };

  const getSuggestionIcon = (type: SearchSuggestion['type'] | 'custom') => {
    switch (type) {
      case 'brand': return '🏢';
      case 'model': return '💻';
      case 'cpu': return '🧠';
      case 'gpu': return '🎮';
      case 'recent': return '🕒';
      case 'custom':
      default: return '🔍';
    }
  };

  const CustomPopper = (props: any) => (
    <Popper
      {...props}
      sx={{
        '& .MuiAutocomplete-paper': {
          borderRadius: 2,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(8px)',
        },
      }}
    />
  );

  return (
    <Autocomplete
      freeSolo
      open={isOpen && filteredSuggestions.length > 0}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      options={filteredSuggestions}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.text}
      inputValue={searchQuery}
      onInputChange={handleInputChange}
      onChange={handleOptionSelect}
      PopperComponent={CustomPopper}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 0 0 1px rgba(33, 150, 243, 0.2)'
                  : '0 0 0 1px rgba(33, 150, 243, 0.1)',
              },
              '&.Mui-focused': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 0 0 2px rgba(33, 150, 243, 0.3)'
                  : '0 0 0 2px rgba(33, 150, 243, 0.2)',
              },
            },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ mr: -0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      )}
      renderOption={(props, option) => {
        const suggestion = typeof option === 'string' ? { text: option, type: 'custom' as const } : option;
        return (
          <Box component="li" {...props} sx={{ py: 1.5, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" sx={{ fontSize: '1.1em' }}>
                {getSuggestionIcon(suggestion.type)}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {suggestion.text}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {suggestion.type}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      }}
      PaperComponent={({ children, ...props }) => (
        <Paper {...props} sx={{ mt: 1 }}>
          {children}
        </Paper>
      )}
      noOptionsText="No suggestions found"
    />
  );
}