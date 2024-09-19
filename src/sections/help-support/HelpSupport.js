'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { Container } from '@mui/system';
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableFooter,
  TableContainer,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import ApiCalling from 'src/ApiCalling/ApiCalling';
import { localStorageGet } from 'src/localStorageUtils/localStorageUtils';

import Loader from 'src/components/loader/Loader';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

const HelpSupport = () => {
  const settings = useSettingsContext();
  const [inquiryList, setInquiryList] = useState([]);
  const storeId = localStorageGet('loginData')?.store_id;
  const [loading, setLoading] = useState(true);

  const getInquiryList = useCallback(() => {
    const apiData = {
      store_id: storeId,
    };
    ApiCalling.apiCallPost('contactus/ContactDetails', apiData)
      .then((res) => {
        if (res.data) {
          setInquiryList(res.data.data);
        }
      })
      .catch((error) => {
        console.log('error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [storeId]);

  useEffect(() => {
    getInquiryList();
  }, [getInquiryList]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Help Support"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {loading ? (
        <Loader />
      ) : (
        <TableContainer sx={{ position: 'relative' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell> Full Name</TableCell>
                <TableCell> Email</TableCell>
                <TableCell> Subject</TableCell>
                <TableCell> Contact</TableCell>
              </TableRow>
            </TableHead>
            {inquiryList.length > 0 ? (
              <TableBody>
                {inquiryList.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>John Peer</TableCell>
                    <TableCell>{item.email} </TableCell>
                    <TableCell>Test</TableCell>
                    <TableCell>{item.mobile_number ? item.mobile_number : '-'} </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                    No Data Found
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default HelpSupport;
