import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Flex, View, Heading, SearchField, Text, Grid, ProgressCircle, Divider, Picker, Item, RangeSlider } from '@adobe/react-spectrum';
import apiService from '../api/ApiService';
import SearchEngine from '../search/SearchEngine';

export default function SearchScreen() {
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    safetensorMin: 0,
    safetensorMax: 500,
  });
  const [sortBy, setSortBy] = useState('nameAsc');

  const searchEngine = useMemo(() => new SearchEngine([]), []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await apiService.fetchModels('https://binaire.app/hf-models-api.json');
        if (data && data.models) {
          searchEngine.setData(data.models);
          setModels(data.models);
          setFilteredModels(data.models);
        }
      } catch (err) {
        console.error(err);
        // Fallback to cache if network fails
        const cached = await apiService.getCachedModels();
        if (cached && cached.models) {
          searchEngine.setData(cached.models);
          setModels(cached.models);
          setFilteredModels(cached.models);
        } else {
          setError('Failed to load data and no offline cache available.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchEngine]);

  const applyFilters = useCallback(() => {
    const result = searchEngine.execute(query, 'middle', filters, sortBy);
    setFilteredModels(result);
  }, [searchEngine, query, filters, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearchChange = (val) => {
    setQuery(val);
  };

  const handleSafetensorChange = (val) => {
    setFilters(prev => ({ ...prev, safetensorMin: val.start, safetensorMax: val.end }));
  };

  return (
    <View padding="size-400">
      <Heading level={1}>Model Search Utility</Heading>
      
      {loading ? (
        <Flex alignItems="center" justifyContent="center" height="50vh">
          <ProgressCircle aria-label="Loading…" isIndeterminate />
        </Flex>
      ) : error ? (
        <Text color="negative">{error}</Text>
      ) : (
        <Flex direction="column" gap="size-300">
          <Flex direction="row" gap="size-200" alignItems="end" wrap>
            <SearchField 
              label="Search Models" 
              value={query} 
              onChange={handleSearchChange} 
              width="size-3600"
            />
            <Picker label="Sort By" selectedKey={sortBy} onSelectionChange={setSortBy}>
              <Item key="nameAsc">Alphabetical (A-Z)</Item>
              <Item key="nameDesc">Alphabetical (Z-A)</Item>
              <Item key="safetensorAsc">Safetensor Count (Low to High)</Item>
              <Item key="safetensorDesc">Safetensor Count (High to Low)</Item>
            </Picker>
            <RangeSlider
              label="Safetensor Files"
              value={{ start: filters.safetensorMin, end: filters.safetensorMax }}
              onChange={handleSafetensorChange}
              minValue={0}
              maxValue={500}
              width="size-3600"
            />
          </Flex>

          <Divider size="S" />

          <Grid
            columns={{
              base: '1fr',
              M: 'repeat(2, 1fr)',
              L: 'repeat(3, 1fr)',
            }}
            gap="size-200"
          >
            {filteredModels.map((model) => (
              <View key={model.id} borderWidth="thin" borderColor="dark" padding="size-200" borderRadius="medium">
                <Heading level={3} margin={0}>{model.display_name || model.id}</Heading>
                <Text marginEnd="size-200">Family: {model.family}</Text>
                <Text>Arch: {model.architecture_category}</Text>
                <br />
                <Text>Safetensors: {model.safetensor_file_count}</Text>
              </View>
            ))}
          </Grid>
          
          {filteredModels.length === 0 && (
            <Text>No models found.</Text>
          )}
        </Flex>
      )}
    </View>
  );
}
