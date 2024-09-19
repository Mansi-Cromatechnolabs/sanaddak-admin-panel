'use client';

/* eslint-disable no-nested-ternary */
import dynamic from 'next/dynamic';
/* eslint-disable prefer-template */
import React, { useState, useEffect } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  TableFooter,
  TableContainer,
} from '@mui/material';

import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import Loader from 'src/components/loader/Loader';
import NoResultFound from 'src/components/sanaddak/NoDataFound';

const EditStore = dynamic(() => import('./Editstore/EditStore'), { ssr: false });
const ViewStoreDetails = dynamic(() => import('./ViewStore/ViewStoreDetails'), { ssr: false });

function StoreList() {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isViewStoreDrawerOpen, setIsViewStoreDrawerOpen] = useState(false);
  const [data, setData] = useState(null);
  const [editValue, setEditValue] = useState(null);
  const [storeList, setStoreList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  const getStoreList = () => {
    ApiCalling.apiCallGet('branch/branch_list')
      .then((res) => {
        if (res.data) {
          if (res.data) {
            setStoreList(res.data.data);
            setHasData(true);
          } else {
            setHasData(false);
          }
        } else {
          console.log('error', res);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getStoreList();
  }, []);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : hasData ? (
        <>
          <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Store code</TableCell>
                  <TableCell> Name</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}> Owner Name</TableCell>
                  <TableCell>city</TableCell>
                  <TableCell>state</TableCell>
                  <TableCell>country</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              {storeList.length > 0 ? (
                <TableBody>
                  {storeList.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{s.branch_key}</TableCell>
                      <TableCell>{s.name} </TableCell>
                      <TableCell>{s.owner.first_name + ' ' + s.owner.last_name} </TableCell>
                      <TableCell>{s.location.city} </TableCell>
                      <TableCell>{s.location.region} </TableCell>
                      <TableCell>{s.location.country} </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }} align="center">
                        {hasPermission('store.update') && (
                          <IconButton
                            onClick={() => {
                              setIsEditDrawerOpen(true);
                              setEditValue(s);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        )}

                        <IconButton
                          onClick={() => {
                            setIsViewStoreDrawerOpen(true);
                            setData(s);
                          }}
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary' }}>
                      No Data Found
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </TableContainer>
          <EditStore
            open={isEditDrawerOpen}
            onClose={() => {
              setIsEditDrawerOpen(false);
            }}
            editValue={editValue}
            onEdit={() => getStoreList()}
          />
          <ViewStoreDetails
            open={isViewStoreDrawerOpen}
            onClose={() => {
              setIsViewStoreDrawerOpen(false);
            }}
            getData={data}
          />
        </>
      ) : (
        <NoResultFound />
      )}
    </div>
  );
}
export default StoreList;
