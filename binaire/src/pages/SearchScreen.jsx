import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Flex, View, Heading, SearchField, Text, Grid, ProgressCircle, Divider, Picker, Item, RangeSlider, Badge, ActionButton, IllustratedMessage, Content, StatusLight } from '@adobe/react-spectrum';
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
    <View>
      {/* Premium Hero Section */}
      <View 
        paddingX="size-600" 
        paddingY="size-800" 
        UNSAFE_style={{ 
          background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)', 
          borderBottomRightRadius: '32px', 
          borderBottomLeftRadius: '32px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}
      >
        <Heading level={1} margin={0} UNSAFE_style={{ color: 'white', fontSize: '2.5rem' }}>AI Model Explorer</Heading>
        <Text UNSAFE_style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginTop: '8px', display: 'block' }}>
          Search, filter, and discover the perfect AI model for your next architecture.
        </Text>
      </View>
      
      {loading ? (
        <Flex alignItems="center" justifyContent="center" height="50vh">
          <ProgressCircle aria-label="Loading models…" isIndeterminate size="L" />
        </Flex>
      ) : error ? (
        <View backgroundColor="negative" padding="size-400" margin="size-600" borderRadius="large">
          <Text color="static-white">{error}</Text>
        </View>
      ) : (
        <Flex direction="row" gap="size-600" padding="size-600" wrap="wrap">
          
          {/* Glassmorphic Sidebar for Filters */}
          <View 
            width={{ base: '100%', L: '320px' }}
            padding="size-400" 
            backgroundColor="gray-50" 
            borderRadius="large" 
            borderWidth="thin" 
            borderColor="gray-200"
            UNSAFE_style={{ 
              position: 'sticky', 
              top: '100px', 
              alignSelf: 'flex-start',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <Flex direction="row" alignItems="center" justifyContent="space-between" marginBottom="size-200">
              <Heading level={3} margin={0}>Refine Results</Heading>
              <StatusLight variant="info">{filteredModels.length} Found</StatusLight>
            </Flex>
            <Divider size="S" marginBottom="size-400" />
            
            <Flex direction="column" gap="size-400">
              <Picker label="Sort Logic" selectedKey={sortBy} onSelectionChange={setSortBy} width="100%">
                <Item key="nameAsc">Alphabetical (A-Z)</Item>
                <Item key="nameDesc">Alphabetical (Z-A)</Item>
                <Item key="safetensorAsc">Safetensor Files: Low to High</Item>
                <Item key="safetensorDesc">Safetensor Files: High to Low</Item>
              </Picker>

              <RangeSlider
                label="Safetensor Density"
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
              backgroundColor="gray-50" 
              padding="size-300" 
              borderRadius="large" 
              borderWidth="thin" 
              borderColor="gray-200"
              UNSAFE_style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
            >
              <SearchField 
                label="Search by Model Name, ID, or Family" 
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
                L: 'repeat(2, 1fr)',
                XL: 'repeat(3, 1fr)',
              }}
              gap="size-400"
            >
              {filteredModels.map((model) => (
                <View 
                  key={model.id} 
                  backgroundColor="gray-50"
                  borderWidth="thin" 
                  borderColor="gray-200" 
                  padding="size-300" 
                  borderRadius="large"
                  UNSAFE_style={{ 
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', 
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  UNSAFE_className="model-card"
                >
                  <Heading level={3} margin={0} marginBottom="size-100" UNSAFE_style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {model.display_name || model.id}
                  </Heading>
                  
                  <Flex gap="size-100" wrap marginBottom="size-200">
                    {model.family && <Badge variant="info">{model.family}</Badge>}
                    {model.architecture_category && <Badge variant="neutral">{model.architecture_category}</Badge>}
                    {model.hf_tags?.pipeline_tag && <Badge variant="positive">{model.hf_tags.pipeline_tag}</Badge>}
                  </Flex>
                  
                  <Divider size="S" marginY="size-200" />
                  
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text size="S" color="gray-600" UNSAFE_style={{ fontWeight: '500' }}>
                      ⚙️ {model.safetensor_file_count} Safetensors
                    </Text>
                  </Flex>
                  
                  <Flex marginTop="size-300" justifyContent="end">
                    <ActionButton onPress={() => window.open(model.repo_url, '_blank')} variant="secondary">
                      View Repository
                    </ActionButton>
                  </Flex>
                </View>
              ))}
            </Grid>
            
            {filteredModels.length === 0 && (
              <Flex justifyContent="center" marginTop="size-800">
                <IllustratedMessage>
                  <Heading>No Models Found</Heading>
                  <Content>Try adjusting your search parameters to find what you're looking for.</Content>
                </IllustratedMessage>
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
      
      <style>{`
        .model-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(0,0,0,0.1) !important;
          border-color: #6366f1 !important;
        }
      `}</style>
    </View>
  );
}
