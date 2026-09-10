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
    <View padding="size-400" minHeight="100vh" backgroundColor="gray-75">
      <Heading level={1} marginStart="size-200">Model Explorer</Heading>
      
      {loading ? (
        <Flex alignItems="center" justifyContent="center" height="70vh">
          <ProgressCircle aria-label="Loading models…" isIndeterminate size="L" />
        </Flex>
      ) : error ? (
        <View backgroundColor="negative" padding="size-200" borderRadius="medium">
          <Text color="static-white">{error}</Text>
        </View>
      ) : (
        <Flex direction="row" gap="size-400" marginTop="size-200">
          
          {/* Sidebar for Filters */}
          <View 
            width="300px" 
            padding="size-300" 
            backgroundColor="gray-100" 
            borderRadius="large" 
            borderWidth="thin" 
            borderColor="gray-300"
            UNSAFE_style={{ position: 'sticky', top: '20px', alignSelf: 'flex-start' }}
          >
            <Heading level={3} marginTop={0}>Filters</Heading>
            <Divider size="S" marginBottom="size-300" />
            
            <Flex direction="column" gap="size-300">
              <Picker label="Sort By" selectedKey={sortBy} onSelectionChange={setSortBy} width="100%">
                <Item key="nameAsc">Alphabetical (A-Z)</Item>
                <Item key="nameDesc">Alphabetical (Z-A)</Item>
                <Item key="safetensorAsc">Safetensor Files: Low to High</Item>
                <Item key="safetensorDesc">Safetensor Files: High to Low</Item>
              </Picker>

              <RangeSlider
                label="Safetensor Files Count"
                value={{ start: filters.safetensorMin, end: filters.safetensorMax }}
                onChange={handleSafetensorChange}
                minValue={0}
                maxValue={500}
                width="100%"
              />
            </Flex>
          </View>

          {/* Main Content Area */}
          <Flex direction="column" gap="size-400" flex>
            <View 
              backgroundColor="gray-100" 
              padding="size-300" 
              borderRadius="large" 
              borderWidth="thin" 
              borderColor="gray-300"
            >
              <SearchField 
                label="Search by Model Name or Family" 
                value={query} 
                onChange={setQuery} 
                width="100%"
                autoFocus
              />
            </View>

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
                  backgroundColor="gray-100"
                  borderWidth="thin" 
                  borderColor="gray-400" 
                  padding="size-300" 
                  borderRadius="large"
                  UNSAFE_style={{ transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  UNSAFE_className="model-card"
                >
                  <Heading level={3} margin={0} marginBottom="size-100">{model.display_name || model.id}</Heading>
                  <Flex gap="size-100" wrap marginBottom="size-200">
                    <Badge variant="info">{model.family || 'Unknown Family'}</Badge>
                    <Badge variant="neutral">{model.architecture_category || 'N/A'}</Badge>
                    {model.hf_tags?.pipeline_tag && (
                      <Badge variant="positive">{model.hf_tags.pipeline_tag}</Badge>
                    )}
                  </Flex>
                  
                  <Divider size="S" marginY="size-200" />
                  
                  <Text size="S" color="gray-600">Safetensor files: {model.safetensor_file_count}</Text>
                  
                  <Flex marginTop="size-300" justifyContent="end">
                    <ActionButton onPress={() => window.open(model.repo_url, '_blank')}>
                      View Repo
                    </ActionButton>
                  </Flex>
                </View>
              ))}
            </Grid>
            
            {filteredModels.length === 0 && (
              <Flex justifyContent="center" marginTop="size-800">
                <IllustratedMessage>
                  <Heading>No Models Found</Heading>
                  <Content>Try adjusting your search query or filters.</Content>
                </IllustratedMessage>
              </Flex>
            )}
          </Flex>

        </Flex>
      )}
      
      <style>{`
        .model-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
          border-color: var(--spectrum-global-color-blue-500);
        }
      `}</style>
    </View>
  );
}
