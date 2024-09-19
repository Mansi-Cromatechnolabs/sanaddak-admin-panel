/* eslint-disable no-shadow */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */

'use client';

// import Draggable from 'react-draggable';
/* eslint-disable react/self-closing-comp */
import React, { useEffect } from 'react';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';

import { Box } from '@mui/system';
import {
  Card,
  Grid,
  Chip,
  Avatar,
  Select,
  Divider,
  MenuItem,
  Typography,
  CardContent,
  FormControl,
} from '@mui/material';

import ApiCalling from 'src/ApiCalling/ApiCalling';

export default function CustomerProfileCard({ customerData, tagsData, id }) {
  const s3URL = process.env.NEXT_PUBLIC_S3_URL;
  const [category, setCategory] = React.useState([]);

  const [tagList, setTagList] = React.useState([]);

  const [tags, setTags] = React.useState(tagsData);

  const handleDelete = (tagToDelete) => {
    const data = {
      tag_id: tagToDelete.tag_id,
      customer__id: id,
    };
    ApiCalling.apiCallDelete('customer/customer_tag', data)
      .then((res) => {
        if (res.data) {
          const newTags = tags.filter((tag) => tag.tag_id !== tagToDelete.tag_id);

          setTags(newTags);

          const newCategory = category.filter((categoryId) => categoryId !== tagToDelete.tag_id);

          setCategory(newCategory);
        }
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }
    const reorderedTags = Array.from(tags);
    const [removed] = reorderedTags.splice(source.index, 1);
    reorderedTags.splice(destination.index, 0, removed);
    setTags(reorderedTags);
  };

  const handleChange = (event) => {
    const { value } = event.target;
    setCategory(value);
    const newSelectedTags = tagList.filter((tag) => value.includes(tag._id));
    const uniqueNewTags = newSelectedTags.filter(
      (newTag) => !tags.some((existingTag) => existingTag.tag_id === newTag._id)
    );
    setTags((prevTags) => [
      ...prevTags,
      ...uniqueNewTags.map((tag) => ({ tag_id: tag._id, tag: tag.name, customer_id: id })),
    ]);
  };

  const getTagList = () => {
    ApiCalling.apiCallGet('gold_loan/tag')
      .then((res) => {
        if (res.data) {
          setTagList(res.data.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    getTagList();
  }, []);

  useEffect(() => {
    if (tagsData && tagsData.length > 0) {
      const defaultSelectedCategories = tagsData.map((tag) => tag.tag_id);
      setCategory(defaultSelectedCategories);
    }
  }, [tagsData]);
  useEffect(() => {
    if (tags?.length > 0) {
      const data = tags.map((tag, index) => ({
        ...tag,
        priority: index + 1,
      }));
      ApiCalling.apiCallPost('customer/customer_tag', data)
        .then((res) => {
          if (res.data) {
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [tags]);
  return (
    <Card className="h-100" sx={{ mx: 'auto', borderRadius: 3, boxShadow: 3 }}>
      <Box
        sx={{
          backgroundImage: "url('/assets/images/general/customer background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 150,
          borderRadius: '3px 3px 0 0',
        }}
      ></Box>
      <Avatar
        src={customerData?.profile_image ? `${s3URL}/${id}/${customerData?.profile_image}` : ''}
        alt={customerData?.full_name.charAt(0).toUpperCase()}
        sx={{
          width: 130,
          height: 130,
          border: '3px solid white',
          mx: 'auto',
          mt: -7,
        }}
      />
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h2" fontWeight="bold">
          {customerData.full_name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {customerData.email}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body1" fontWeight="bold" align="left">
              Personal Info
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="h3" align="left" fontWeight="600">
              Full Name
            </Typography>
          </Grid>
          <Grid item xs={7}>
            <Typography variant="h3" align="left">
              : {customerData.full_name}
            </Typography>
          </Grid>
          {customerData.email && (
            <>
              <Grid item xs={5}>
                <Typography variant="h3" align="left" fontWeight="600">
                  Email
                </Typography>
              </Grid>
              <Grid item xs={7}>
                <Typography variant="h3" align="left">
                  : {customerData.email}
                </Typography>
              </Grid>
            </>
          )}
          <Grid item xs={5}>
            <Typography variant="h3" align="left" fontWeight="600">
              Phone Number
            </Typography>
          </Grid>
          <Grid item xs={7}>
            <Typography variant="h3" align="left">
              : {customerData.mobile_number}
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="h3" align="left" fontWeight="600">
              Address
            </Typography>
          </Grid>
          <Grid item xs={7}>
            <Typography variant="h3" align="left">
              : {customerData.address ? customerData.address : '-'}
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={1}>
          <Grid item xs={5} mt={4}>
            <Typography variant="body1" fontWeight="bold" align="left">
              Tags
            </Typography>
          </Grid>
          <Grid item xs={7} mt={1}>
            <FormControl sx={{ width: '100%' }}>
              <Select
                labelId="demo-multiple-select-label"
                id="demo-multiple-select"
                multiple
                sx={{ textAlign: 'left' }}
                value={category}
                onChange={handleChange}
              >
                {tagList.map((n, i) => (
                  <MenuItem key={i} value={n._id}>
                    {n.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} mt={2}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId={`droppable-${tags?.length}`} direction="horizontal">
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      border: 1,
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-start',
                      borderColor: '#eaeaea',
                      borderRadius: 1,
                      p: 1,
                      minHeight: 50,
                      gap: 0,
                      position: 'relative',
                    }}
                  >
                    {tags?.map((value, index) => (
                      <Draggable
                        key={value.tag_id}
                        draggableId={String(value.tag_id)}
                        index={index}
                      >
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ display: 'inline-block', margin: '2px', cursor: 'move' }}
                          >
                            <Chip
                              label={value.tag}
                              onDelete={!value.is_default ? () => handleDelete(value) : undefined}
                              sx={{ margin: '2px' }}
                            />
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
