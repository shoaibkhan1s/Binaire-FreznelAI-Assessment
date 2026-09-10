import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Flex, View, Heading, SearchField, Text, Grid, ProgressCircle, Divider, Picker, Item, RangeSlider, Badge, ActionButton, IllustratedMessage, Content } from '@adobe/react-spectrum';
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
        const data = await apiService.fetchModels(apiService.baseUrl);
        if (data && data.models) {
          searchEngine.setData(data.models);
          setModels(data.models);
          setFilteredModels(data.models);
        }
      } catch (err) {
        console.error(err);
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

  const handleSafetensorChange = (val) => {
    setFilters(prev => ({ ...prev, safetensorMin: val.start, safetensorMax: val.end }));
  };

  return (
    <View paddingX="size-800" paddingY="size-400">
      
      {loading ? (
        <Flex alignItems="center" justifyContent="center" height="50vh">
          <ProgressCircle aria-label="Loading models…" isIndeterminate />
        </Flex>
      ) : error ? (
        <View backgroundColor="negative" padding="size-400" borderRadius="medium">
          <Text color="static-white">{error}</Text>
        </View>
      ) : (
        <Flex direction="column" gap="size-400">
          <Heading level={1} margin={0}>Search Models</Heading>
          
          <Flex direction="row" gap="size-400" wrap="wrap" alignItems="end" backgroundColor="gray-100" padding="size-300" borderRadius="medium">
            <SearchField 
              label="Model Name or Family" 
              value={query} 
              onChange={setQuery} 
              width="size-3600"
            />
            <Picker label="Sort Results" selectedKey={sortBy} onSelectionChange={setSortBy} width="size-2400">
              <Item key="nameAsc">A-Z</Item>
              <Item key="nameDesc">Z-A</Item>
              <Item key="safetensorAsc">Safetensors (Low-High)</Item>
              <Item key="safetensorDesc">Safetensors (High-Low)</Item>
            </Picker>
            <RangeSlider
              label="Safetensor File Count"
              value={{ start: filters.safetensorMin, end: filters.safetensorMax }}
              onChange={handleSafetensorChange}
              minValue={0}
              maxValue={500}
              width="size-3600"
            />
          </Flex>

          <Text>{filteredModels.length} models found</Text>

          <Grid
            columns={{
              base: '1fr',
              M: 'repeat(2, 1fr)',
              L: 'repeat(3, 1fr)',
            }}
            gap="size-300"
          >
            {filteredModels.map((model) => (
              <View 
                key={model.id} 
                backgroundColor="gray-50"
                borderWidth="thin" 
                borderColor="gray-300" 
                padding="size-300" 
                borderRadius="medium"
              >
                <Flex direction="column" gap="size-100" height="100%">
                  <Heading level={4} margin={0}>{model.display_name || model.id}</Heading>
                  <Text size="S" color="gray-600">{model.family || 'Unknown Family'}</Text>
                  
                  <Flex gap="size-100" wrap marginY="size-100">
                    {model.architecture_category && <Badge variant="neutral">{model.architecture_category}</Badge>}
                    {model.hf_tags?.pipeline_tag && <Badge variant="positive">{model.hf_tags.pipeline_tag}</Badge>}
                  </Flex>
                  
                  <View flex />
                  
                  <Divider size="S" marginY="size-100" />
                  
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text size="S">Files: {model.safetensor_file_count}</Text>
                    <ActionButton onPress={() => window.open(model.repo_url, '_blank')} isQuiet>
                      View
                    </ActionButton>
                  </Flex>
                </Flex>
              </View>
            ))}
          </Grid>
          
          {filteredModels.length === 0 && (
            <Flex justifyContent="center" marginY="size-800">
              <IllustratedMessage>
                <Heading>No Results</Heading>
                <Content>No models match your filters.</Content>
              </IllustratedMessage>
            </Flex>
          )}
        </Flex>
      )}
    </View>
  );
}
