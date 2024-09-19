/* eslint-disable no-nested-ternary */
/* eslint-disable no-lonely-if */

'use client';

import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { hasPermission } from 'src/utils/permissionUtils';

import ApiCalling from 'src/ApiCalling/ApiCalling';

import Iconify from 'src/components/iconify';
import Loader from 'src/components/loader/Loader';
import { useSettingsContext } from 'src/components/settings';
import NoResultFound from 'src/components/sanaddak/NoDataFound';
import ToasteMessage from 'src/components/toaste-message/ToasteMessage';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import TagList from './tagList';
import TagModel from './tagModel';

export default function TagView() {
  const settings = useSettingsContext();
  const [isShowTagModel, setIsShowTagModel] = useState(false);
  const [tagList, setTagList] = useState([]);
  const [editValue, setEditValue] = useState(null);
  const [isShowDeleteModel, setIsShowDeleteModel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  const handleAddTag = () => {
    setEditValue(null);
    setIsShowTagModel(true);
  };

  const handleEditTag = (val) => {
    setEditValue(val);
    setIsShowTagModel(true);
  };

  const handleDeleteTag = (id) => {
    const apiData = {
      tag_id: id,
    };
    ApiCalling.apiCallDelete('gold_loan/tag', apiData)
      .then((res) => {
        if (res.data) {
          setIsShowDeleteModel(false);
          ToasteMessage(res.data.message, 'success');
          getTagList();
        } else {
          if (res?.response?.data) {
            console.log(res?.response?.data?.message);
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const getTagList = () => {
    ApiCalling.apiCallGet('gold_loan/tag')
      .then((res) => {
        if (res.data.status === 200) {
          setTagList(res.data.data);
          setHasData(true);
        } else {
          setHasData(false);
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
    getTagList();
  }, []);
  return (
    <div>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Price Tag"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          action={
            hasPermission('priceTag.maker') && (
              <Button
                onClick={handleAddTag}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Add Tag
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        {loading ? (
          <Loader />
        ) : hasData ? (
          <TagList
            isShowDeleteModel={isShowDeleteModel}
            setIsShowDeleteModel={setIsShowDeleteModel}
            list={tagList}
            onEdit={(val) => {
              if (val) {
                handleEditTag(val);
              }
            }}
            onDelete={(id) => {
              if (id) {
                handleDeleteTag(id);
              }
            }}
            onDeleteClose={() => {}}
          />
        ) : (
          <NoResultFound />
        )}
        <TagModel
          open={isShowTagModel}
          onClose={() => {
            setIsShowTagModel(false);
          }}
          onSave={() => {
            setIsShowTagModel(false);
            setEditValue(null);
            getTagList();
          }}
          editValue={editValue}
        />
      </Container>
    </div>
  );
}
