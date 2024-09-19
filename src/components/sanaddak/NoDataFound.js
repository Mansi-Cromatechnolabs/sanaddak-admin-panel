/* eslint-disable react/prop-types */
/* eslint-disable arrow-body-style */
import React from 'react';
import Image from 'next/image';

import { Card, Typography, CardContent } from '@mui/material';

import imageUrl from '../../../public/assets/images/general/no-data-found.png';

const NoResultFound = () => {
  return (
    <Card className="mx-auto" sx={{ mt: 20 }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Image src={imageUrl} alt="No Result Found" height={250} width={250} />
        <Typography variant="h2" fontWeight={600} color={(theme) => theme.palette.text.gray500}>
          No Data Found
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NoResultFound;
