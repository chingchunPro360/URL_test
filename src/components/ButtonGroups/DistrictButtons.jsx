import React from 'react';
import { Group, Button, Box, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { locationUtils, generatePath } from '../../utils/routes';
import { format } from '../../utils/format';
import { services } from '../../data/services';

export function DistrictButtons({ 
  type,
  city,
  currentDistrict,
  service = null
}) {
  const navigate = useNavigate();
  const typeInfo = services.types[type];
  const districts = locationUtils.getDistrictsForCity(city);

  const availableDistricts = districts.filter(district => 
    district !== currentDistrict
  );

  if (availableDistricts.length === 0) return null;

  const handleClick = (district) => {
    if (service) {
      navigate(generatePath.actual.serviceDistrict(type, service, city, district));
    } else {
      navigate(generatePath.actual.district(type, city, district));
    }
  };

  return (
    <Box mb="xl">
      <Text size="sm" weight={500} color="dimmed" mb="xs">
        {service 
          ? `${format.toDisplay(service)} in Other Districts`
          : `${typeInfo.displayName} in Other Districts`
        }
      </Text>
      <Group spacing="sm" noWrap sx={{ padding: '4px', overflowX: 'auto' }}>
        {availableDistricts.map((district) => (
          <Button
            key={district}
            variant="light"
            onClick={() => handleClick(district)}
            sx={{ flexShrink: 0 }}
          >
            {format.toDisplay(district)}
          </Button>
        ))}
      </Group>
    </Box>
  );
}
