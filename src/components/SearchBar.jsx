import React, { useState, useMemo } from 'react';
import { Autocomplete, Paper, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { services } from '../data/services';
import { locationUtils } from '../utils/routes';
import { format } from '../utils/format';
import { generatePath } from '../utils/routes';
import { MAX_SUGGESTIONS } from '../constants';

export default function SearchBar() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  // 生成搜尋建議
  const suggestions = useMemo(() => {
    const result = [];
    
    // 遍歷所有商家類型
    Object.entries(services.types).forEach(([type, typeInfo]) => {
      // 1. 添加商家類型建議
      result.push({
        value: typeInfo.displayName,
        type,
        action: () => navigate(generatePath.type(type))
      });

      // 2. 添加商家類型 + 城市建議
      locationUtils.getAllCities().forEach(city => {
        result.push({
          value: `${typeInfo.displayName} in ${format.toDisplay(city)}`,
          type,
          city,
          action: () => navigate(generatePath.city(type, city))
        });

        // 3. 添加服務 + 商家類型 + 城市建議
        typeInfo.services.forEach(service => {
          result.push({
            value: `${format.toDisplay(service)} at ${typeInfo.displayName} in ${format.toDisplay(city)}`,
            type,
            service,
            city,
            action: () => navigate(generatePath.serviceCity(type, service, city))
          });
        });
      });
    });

    return result;
  }, [navigate]);

  // 過濾並排序建議
  const getFilteredSuggestions = (input) => {
    if (!input) return [];

    const normalizedInput = input.toLowerCase();
    return suggestions
      .filter(suggestion => 
        suggestion.value.toLowerCase().includes(normalizedInput)
      )
      .sort((a, b) => {
        // 完全匹配優先
        const aExact = a.value.toLowerCase() === normalizedInput;
        const bExact = b.value.toLowerCase() === normalizedInput;
        if (aExact !== bExact) return bExact - aExact;

        // 開頭匹配次之
        const aStarts = a.value.toLowerCase().startsWith(normalizedInput);
        const bStarts = b.value.toLowerCase().startsWith(normalizedInput);
        if (aStarts !== bStarts) return bStarts - aStarts;

        // 最後按長度排序，較短的優先
        return a.value.length - b.value.length;
      })
      .slice(0, MAX_SUGGESTIONS);
  };

  const handleSearch = (selectedValue) => {
    const suggestion = suggestions.find(s => s.value === selectedValue);
    if (suggestion) {
      suggestion.action();
    } else {
      // 如果沒有匹配的建議，返回首頁
      navigate('/');
    }
  };

  return (
    <Paper shadow="xs" p="md" mb="xl">
      <Group spacing={8} noWrap>
        <Autocomplete
          value={value}
          onChange={setValue}
          data={getFilteredSuggestions(value).map(s => s.value)}
          placeholder="Try 'Hair Salon in Taipei' or 'Haircut at Beauty Salon'"
          sx={{ flex: 1 }}
          onOptionSubmit={(selectedValue) => {
            setValue(selectedValue);
            handleSearch(selectedValue);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(value);
            }
          }}
        />
        <Button onClick={() => handleSearch(value)}>
          Search
        </Button>
      </Group>
    </Paper>
  );
}
