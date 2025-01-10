import React from 'react';
import { Container, Title, Button, Group, Text, Box } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import UnifiedSearchBar from '../components/UnifiedSearchBar';
import Breadcrumbs from '../components/Breadcrumbs';
import BusinessGrid from '../components/BusinessGrid';
import { businesses } from '../data/businesses';
import { generatePath, locationUtils } from '../utils/routes';
import { format } from '../utils/format';
import { services } from '../data/services';

export default function CityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [, , type, city] = location.pathname.split('/');
  
  const formattedCity = format.toDisplayFormat(city);
  const typeInfo = services.types[type];

  if (!locationUtils.isCityValid(formattedCity)) {
    return (
      <Container size="md" py="xl">
        <Title order={1} align="center" mb="xl">
          City Not Found
        </Title>
        <Text align="center" mb="xl">
          The city "{formattedCity}" does not exist in our directory.
        </Text>
        <Group position="center">
          <Button onClick={() => navigate(generatePath.type(type))}>
            Back to {typeInfo?.displayName}
          </Button>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Group>
      </Container>
    );
  }

  const country = locationUtils.getCountryForCity(formattedCity);

  // 過濾符合條件的商家
  const filteredBusinesses = [];
  Object.entries(businesses[country][formattedCity]).forEach(([district, businessList]) => {
    businessList
      .filter(business => business.type === type)
      .forEach(business => {
        filteredBusinesses.push({
          ...business,
          location: {
            country,
            city: formattedCity,
            district
          }
        });
      });
  });

  const breadcrumbItems = [
    {
      label: typeInfo?.displayName,
      path: generatePath.type(type)
    },
    {
      label: formattedCity,
      path: generatePath.city(type, city)
    }
  ];

  return (
    <Container size="md" py="xl">
      <Breadcrumbs items={breadcrumbItems} />
      <Title order={1} align="center" mb="md">
        {typeInfo?.displayName} in {formattedCity}
      </Title>
      <UnifiedSearchBar />
      
      <Box 
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          marginBottom: 'xl',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          '-ms-overflow-style': 'none',
          'scrollbarWidth': 'none'
        }}
      >
        <Group 
          spacing="sm" 
          noWrap
          sx={{
            padding: '4px',
          }}
        >
          {/* 主要類型按鈕 - 使用 filled 變體表示選中狀態 */}
          <Button
            variant="filled"
            color={typeInfo?.color || 'blue'}
            onClick={() => navigate(generatePath.type(type))}
            sx={{ flexShrink: 0 }}
          >
            {typeInfo?.displayName}
          </Button>

          {/* 服務細項按鈕 */}
          {typeInfo?.services.map((service) => (
            <Button
              key={service}
              variant="light"
              onClick={() => navigate(generatePath.serviceCity(
                type,
                format.toStorageFormat(service),
                city
              ))}
              sx={{ flexShrink: 0 }}
            >
              {format.toDisplayFormat(service)}
            </Button>
          ))}
        </Group>
      </Box>

      <BusinessGrid businesses={filteredBusinesses} />
    </Container>
  );
}
